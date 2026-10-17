# Site vitrine — Aurore Monticelli Yoga

Refonte complète du design du site actuel (créé avec le CMS Hostinger). Le contenu, déjà validé, est repris tel quel. Le site est 100 % statique et utilise la même architecture que `memoria-experience` et `le-dome`. Le contexte projet est dans [PROJECT_BRIEF.md](PROJECT_BRIEF.md), les points en attente dans [QUESTIONS_CLIENT.md](QUESTIONS_CLIENT.md).

## Principe

```
src/  = les sources (ce qu'on édite)        ← jamais déployé
dist/ = le site généré (ce qu'on déploie)   ← jamais édité à la main
```

`node build.js` lit `src/`, assemble chaque page (en-tête et pied de page communs, textes, tarifs) et écrit le résultat dans `dist/`. **`dist/` est entièrement effacé et régénéré à chaque build.** Il ajoute aussi une empreinte aux liens vers `css/style.css` et `js/main.js` (`style.css?v=…`) : à chaque modification, les navigateurs (et le cache de 10 minutes de GitHub Pages) chargent forcément la nouvelle version.

Prérequis : Node.js 18 ou plus récent, aucune dépendance npm. Le serveur n'a besoin ni de Node ni de PHP : on lui envoie du HTML, du CSS et du JavaScript.

## Workflow quotidien

1. Modifier les fichiers dans `src/`
2. `node build.js`
3. Vérifier en local avec `python3 -m http.server --directory dist` (ou `npx serve dist`) : les polices ne se chargent pas toujours si on ouvre le fichier directement
4. `git add -A && git commit`, le push sur `main` déploie la préversion GitHub Pages (non indexée)

## Textes et langues

- Une page = un gabarit HTML dans `src/pages/`. Les textes partagés (navigation, pied de page, balises meta) sont dans `src/i18n/fr.json` et appelés par `{{t:nav.accueil}}`.
- Le site est en français pour l'instant (`languages: ["fr"]` dans `src/data/site.json`). Le mécanisme bilingue de memoria est en place : pour ajouter l'anglais, ajouter `"en"` à `languages`, créer `src/i18n/en.json` avec les mêmes clés, puis ajouter le sélecteur de langue dans l'en-tête (`{{HREF_FR}}` / `{{HREF_EN}}`). Les pages anglaises sont générées dans `en/`.
- **Le build s'arrête** si une clé manque dans une langue ou si un jeton `{{…}}` n'est pas remplacé.
- Jetons système :
  - `{{ROOT}}` : chemin vers la racine du site, pour les fichiers (`{{ROOT}}images/…`, `{{ROOT}}css/…`)
  - `{{LANG}}` : code de la langue
  - `{{HREF_FR}}`, `{{HREF_EN}}`… : la même page dans une autre langue
  - `{{HEAD_LINKS}}` : canonical, `og:url` et `hreflang`, générés seulement quand `siteUrl` est renseigné
- Les liens entre pages restent relatifs (`index.html#cours`, `contact.html`). C'est indispensable pour la préversion GitHub Pages, servie dans un sous-dossier.

## Tarifs

Les prix se modifient à **un seul endroit** : `tarifs` dans `src/data/site.json`, sous la forme d'un nom et d'un prix, par exemple `{ "cours-collectif": 15, "carnet-10": 130 }`. Dans les pages, on écrit `{{PRIX:cours-collectif}}`. Le build l'affiche au format de la langue (« 15 € », « 12,50 € ») et s'arrête si le nom est inconnu. Ne jamais écrire un prix en dur.

## Structure

- `src/pages/` : gabarits de pages (`index.html`, `404.html`)
- `src/partials/` : en-tête (navigation, menu mobile) et pied de page
- `src/i18n/` : textes
- `src/css/style.css`, `src/js/main.js` : style et comportements, sans dépendance. Le style actuel est une base neutre (variables, accessibilité, menu mobile) en attendant le nouveau design.
- `src/images/`, `src/videos/`, `src/fonts/` : médias et polices auto-hébergées (pas d'appel à Google Fonts, pour le RGPD et la vitesse)
- `src/data/site.json` : nom, URL publique, langues, tarifs
- `src/racine/` : fichiers copiés à la racine (`.htaccess`…)
- `legacy/` : sauvegarde et extraction du site actuel. **Ignoré par git.**
- `maquette/` : maquettes et captures de référence. **Ignoré par git.**

## Comportements disponibles

- **Menu mobile** : burger sous 900 px, fermeture par Échap, par un clic sur un lien ou en repassant en grand écran
- **Lien actif** : `aria-current="page"` posé automatiquement sur le lien de la page courante
- **En-tête compact** : classe `is-compact` dès 40 px de défilement
- **Apparition au défilement** : ajouter `data-reveal` à un bloc. Les blocs frères apparaissent en décalé. Rien ne s'anime si le visiteur a demandé à réduire les animations.
- **Année** : `<span data-annee>` est mis à jour automatiquement

## Mise en ligne

- **Préversion** : le workflow `.github/workflows/deploy-pages.yml` construit le site à chaque push sur `main` et le publie sur GitHub Pages (`https://stephanelay.github.io/aurore-monticelli-yoga/`), avec un `robots.txt` qui interdit l'indexation. Si le premier déploiement échoue sur l'étape `configure-pages`, activer Pages à la main : *Settings → Pages → Source : GitHub Actions*.
- **Hébergement définitif** : offre Hostinger *Single Web Hosting* du client (un seul site, PHP, gestionnaire de fichiers, FTP), sur le domaine `auroremonticelliyoga.com`. Avant la mise en ligne, renseigner `siteUrl` dans `src/data/site.json`. Cela active canonical, `og:url` et `sitemap.xml`. On publie ensuite **le contenu de `dist/`** dans `public_html`.
- `.htaccess` (Apache/LiteSpeed) : page 404, en-têtes de sécurité, redirection HTTPS. Les redirections 301 des anciennes adresses du site Hostinger y seront ajoutées pour conserver le référencement.

Le code source ne contient volontairement aucun commentaire : le suivi du projet se fait dans ce fichier, `PROJECT_BRIEF.md` et `QUESTIONS_CLIENT.md`.
