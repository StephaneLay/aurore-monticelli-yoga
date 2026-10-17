const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function loadSiteConfig() {
  const configPath = path.join(SRC, 'data', 'site.json');
  const defaults = { name: 'Aurore Monticelli Yoga', siteUrl: '', image: '', defaultLanguage: 'fr', languages: ['fr'], tarifs: {} };
  if (!fs.existsSync(configPath)) return defaults;

  let config;
  try {
    config = { ...defaults, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
  } catch (error) {
    throw new Error(`Configuration invalide dans src/data/site.json : ${error.message}`);
  }

  if (!Array.isArray(config.languages) || config.languages.length === 0
    || !config.languages.every((language) => /^[a-z]{2}$/.test(language))) {
    throw new Error('languages doit être une liste de codes de langue, par exemple ["fr", "en"].');
  }
  if (!config.languages.includes(config.defaultLanguage)) {
    throw new Error('defaultLanguage doit faire partie de languages.');
  }

  for (const [cle, prix] of Object.entries(config.tarifs)) {
    if (!/^[a-z0-9-]+$/.test(cle) || typeof prix !== 'number' || prix <= 0) {
      throw new Error('tarifs doit associer un nom (minuscules, chiffres, tirets) à un prix, par exemple { "cours-collectif": 15 }.');
    }
  }

  if (config.image && !fs.existsSync(path.join(SRC, config.image))) {
    throw new Error(`Image de partage introuvable : src/${config.image}.`);
  }

  if (config.siteUrl) {
    let parsedUrl;
    try {
      parsedUrl = new URL(config.siteUrl);
    } catch {
      throw new Error('siteUrl doit être une URL absolue, par exemple https://exemple.fr.');
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('siteUrl doit utiliser le protocole HTTP ou HTTPS.');
    }
    config.siteUrl = parsedUrl.href.replace(/\/+$/, '');
  }

  return config;
}

function flatten(object, prefix = '') {
  return Object.entries(object).reduce((result, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
    return result;
  }, {});
}

function loadTranslations(languages) {
  const translations = {};
  for (const language of languages) {
    const file = path.join(SRC, 'i18n', `${language}.json`);
    if (!fs.existsSync(file)) throw new Error(`Traductions introuvables : src/i18n/${language}.json`);
    try {
      translations[language] = flatten(JSON.parse(fs.readFileSync(file, 'utf8')));
    } catch (error) {
      throw new Error(`Traductions invalides dans src/i18n/${language}.json : ${error.message}`);
    }
  }

  const [reference, ...others] = languages;
  const referenceKeys = Object.keys(translations[reference]);
  for (const language of others) {
    const keys = Object.keys(translations[language]);
    const missing = referenceKeys.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !referenceKeys.includes(key));
    if (missing.length || extra.length) {
      const details = [
        missing.length ? `absentes de ${language}.json : ${missing.join(', ')}` : '',
        extra.length ? `absentes de ${reference}.json : ${extra.join(', ')}` : '',
      ].filter(Boolean).join(' ; ');
      throw new Error(`Clés de traduction désynchronisées (${details}).`);
    }
  }

  return translations;
}

function assetVersions() {
  const versions = {};
  const versioned = { css: /\.css$/, js: /\.js$/, images: /^(favicon|apple-touch-icon)\.(svg|png)$/ };
  for (const [directory, pattern] of Object.entries(versioned)) {
    const sourceDirectory = path.join(SRC, directory);
    if (!fs.existsSync(sourceDirectory)) continue;
    for (const file of fs.readdirSync(sourceDirectory).filter((name) => pattern.test(name))) {
      const content = fs.readFileSync(path.join(sourceDirectory, file));
      versions[`${directory}/${file}`] = crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
    }
  }
  return versions;
}

function versionAssets(html, versions) {
  return html.replace(/(["'])((?:\.\.\/)*)((?:css|js|images)\/[\w.-]+\.(?:css|js|svg|png))\1/g,
    (match, quote, root, file) => (file in versions ? `${quote}${root}${file}?v=${versions[file]}${quote}` : match));
}

function listPages(directory, prefix = '') {
  const pages = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) pages.push(...listPages(path.join(directory, entry.name), relative));
    else if (entry.isFile() && entry.name.endsWith('.html')) pages.push(relative);
  }
  return pages.sort();
}

const partialCache = new Map();

function readPartial(partial, name) {
  if (!partialCache.has(partial)) {
    const file = path.join(SRC, 'partials', `${partial}.html`);
    if (!fs.existsSync(file)) throw new Error(`Partial introuvable « ${partial} » (src/partials/${partial}.html) dans src/pages/${name}.`);
    partialCache.set(partial, fs.readFileSync(file, 'utf8'));
  }
  return partialCache.get(partial);
}

function resolveIncludes(html, name, depth = 0) {
  if (depth > 10) throw new Error(`Inclusions imbriquées trop profondes dans src/pages/${name}.`);
  return html.replace(/\{\{INCLUDE:([a-z0-9/_-]+)((?:\s+[a-zA-Z0-9]+="[^"]*")*)\s*\}\}/g, (token, partial, rawParams) => {
    const params = Object.fromEntries([...rawParams.matchAll(/([a-zA-Z0-9]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
    const content = readPartial(partial, name).replace(/\{\{p:([a-zA-Z0-9]+)\}\}/g, (match, key) => {
      if (!(key in params)) throw new Error(`Paramètre « ${key} » manquant pour l’inclusion de ${partial} dans src/pages/${name}.`);
      return params[key];
    });
    return resolveIncludes(content, name, depth + 1);
  });
}

function outputPath(language, config, name) {
  return language === config.defaultLanguage ? name : `${language}/${name}`;
}

function publicUrl(config, relativePath) {
  return `${config.siteUrl}/${relativePath.replace(/(^|\/)index\.html$/, '$1')}`;
}

function headLinks(config, language, name) {
  if (!config.siteUrl) return '';
  const lines = [
    `<link rel="canonical" href="${publicUrl(config, outputPath(language, config, name))}">`,
    `<meta property="og:url" content="${publicUrl(config, outputPath(language, config, name))}">`,
  ];
  if (config.image) lines.push(`<meta property="og:image" content="${config.siteUrl}/${config.image}">`);
  if (config.languages.length > 1) {
    for (const alternate of config.languages) {
      lines.push(`<link rel="alternate" hreflang="${alternate}" href="${publicUrl(config, outputPath(alternate, config, name))}">`);
    }
    lines.push(`<link rel="alternate" hreflang="x-default" href="${publicUrl(config, outputPath(config.defaultLanguage, config, name))}">`);
  }
  return lines.join('\n  ');
}

function formatPrice(prix, language) {
  const locales = { fr: 'fr-FR', en: 'en-GB' };
  const decimales = Number.isInteger(prix) ? 0 : 2;
  return new Intl.NumberFormat(locales[language] || language, {
    style: 'currency', currency: 'EUR', minimumFractionDigits: decimales, maximumFractionDigits: decimales,
  }).format(prix);
}

function renderPage(template, { name, language, config, strings }) {
  const depth = name.split('/').length - 1;
  const root = (language === config.defaultLanguage ? '' : '../') + '../'.repeat(depth);
  let html = resolveIncludes(template, name);

  html = html.replace(/\{\{t:([a-zA-Z0-9_.-]+)\}\}/g, (token, key) => {
    if (!(key in strings)) throw new Error(`Traduction manquante « ${key} » (${language}) dans src/pages/${name}.`);
    return strings[key];
  });

  html = html.replace(/\{\{PRIX:([a-z0-9-]+)\}\}/g, (token, key) => {
    if (!(key in config.tarifs)) throw new Error(`Tarif inconnu « ${key} » dans src/pages/${name} : à ajouter dans src/data/site.json.`);
    return formatPrice(config.tarifs[key], language);
  });

  const systemTokens = {
    '{{ROOT}}': root,
    '{{LANG}}': language,
    '{{HEAD_LINKS}}': headLinks(config, language, name),
  };
  for (const alternate of config.languages) {
    systemTokens[`{{HREF_${alternate.toUpperCase()}}}`] = root + outputPath(alternate, config, name);
  }
  for (const [token, value] of Object.entries(systemTokens)) {
    html = html.replaceAll(token, () => value);
  }

  const unresolved = html.match(/\{\{[^{}]+\}\}/);
  if (unresolved) throw new Error(`Jeton non remplacé (${unresolved[0]}) dans src/pages/${name} (${language}).`);
  return html;
}

function buildSitemap(config, renderedPages) {
  const indexable = renderedPages.filter(({ html }) => !/name=["']robots["']\s+content=["']noindex["']/i.test(html));
  const names = [...new Set(indexable.map(({ name }) => name))];
  const multilingual = config.languages.length > 1;
  const entries = [];
  for (const name of names) {
    for (const language of config.languages) {
      if (!indexable.some((page) => page.name === name && page.language === language)) continue;
      const alternates = multilingual
        ? config.languages.map((alternate) => `\n    <xhtml:link rel="alternate" hreflang="${alternate}" href="${publicUrl(config, outputPath(alternate, config, name))}"/>`).join('')
        : '';
      entries.push(`  <url>\n    <loc>${publicUrl(config, outputPath(language, config, name))}</loc>${alternates}\n  </url>`);
    }
  }
  const namespaces = multilingual
    ? 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"'
    : 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  return ['<?xml version="1.0" encoding="UTF-8"?>', `<urlset ${namespaces}>`, ...entries, '</urlset>', ''].join('\n');
}

function build() {
  const pagesDirectory = path.join(SRC, 'pages');
  if (!fs.existsSync(pagesDirectory)) throw new Error('Répertoire src/pages introuvable.');

  const pageNames = listPages(pagesDirectory);
  if (pageNames.length === 0) throw new Error('Aucune page HTML trouvée dans src/pages.');

  const config = loadSiteConfig();
  const translations = loadTranslations(config.languages);

  const versions = assetVersions();
  const renderedPages = [];
  for (const name of pageNames) {
    const template = fs.readFileSync(path.join(pagesDirectory, name), 'utf8');
    for (const language of config.languages) {
      const html = versionAssets(renderPage(template, { name, language, config, strings: translations[language] }), versions);
      renderedPages.push({ name, language, file: outputPath(language, config, name), html });
    }
  }

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  for (const { file, html } of renderedPages) {
    fs.mkdirSync(path.dirname(path.join(DIST, file)), { recursive: true });
    fs.writeFileSync(path.join(DIST, file), html);
    console.log(`  ✓ ${file}`);
  }

  for (const directory of ['css', 'js', 'images', 'videos', 'fonts', 'scripts']) {
    const sourceDirectory = path.join(SRC, directory);
    if (fs.existsSync(sourceDirectory)) {
      copyDirectory(sourceDirectory, path.join(DIST, directory));
    }
  }

  const rootFiles = path.join(SRC, 'racine');
  if (fs.existsSync(rootFiles)) copyDirectory(rootFiles, DIST);

  const robotsLines = ['User-agent: *', 'Allow: /'];
  if (config.siteUrl) {
    fs.writeFileSync(path.join(DIST, 'sitemap.xml'), buildSitemap(config, renderedPages));
    robotsLines.push('', `Sitemap: ${config.siteUrl}/sitemap.xml`);
  }
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `${robotsLines.join('\n')}\n`);

  console.log(`\nBuild terminé → ${DIST}`);
}

try {
  build();
} catch (error) {
  console.error(`\nÉchec du build : ${error.message}`);
  process.exitCode = 1;
}
