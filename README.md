# Site vitrine — Aurore Monticelli Yoga

Refonte complète du design du site actuel (créé avec le CMS Hostinger). Le contenu, déjà validé, est repris mot pour mot et réorganisé. Le site est 100 % statique et utilise la même architecture que `memoria-experience` et `le-dome`. Le contexte projet est dans [PROJECT_BRIEF.md](PROJECT_BRIEF.md), les points en attente dans [QUESTIONS_CLIENT.md](QUESTIONS_CLIENT.md).

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

## Propositions de design (préversion)

En attendant le choix de la cliente, la préversion contient **4 ambiances × 3 organisations**. Un panneau « Propositions de design » (en bas à droite, créé par `src/js/propositions.js`) permet de passer de l'une à l'autre. Le lien « Copier le lien de cette combinaison » partage une combinaison précise.

- **Ambiances** (couleurs, polices, formes), toutes dans `src/css/style.css` : `:root` = Argile (Fraunces & Manrope), `[data-ambiance='lilas']` (Bricolage Grotesque), `[data-ambiance='sous-bois']` (Instrument Serif & Instrument Sans, version sombre), `[data-ambiance='clairiere']` (mêmes polices et même mise en page que Sous-bois, vert menthe `#87E990` dominant ; les règles communes aux deux sont écrites `:is([data-ambiance='sous-bois'], [data-ambiance='clairiere'])`). L'ambiance est mémorisée dans le navigateur et transmise par `?ambiance=…`.
- **Organisations** : `src/pages/` (4 pages, comme le site actuel, mêmes adresses), `src/pages/trois-pages/` (les cours sur l'accueil), `src/pages/page-unique/`. En changeant d'organisation, le panneau conduit à la même section dans l'autre version.

**Une fois le choix fait** :

1. Supprimer `src/js/propositions.js`, `src/css/propositions.css`, leurs deux balises (`partials/tete.html` et `partials/pied.html`) et le petit script `data-ambiance` de `partials/tete.html`
2. Placer les variables de l'ambiance retenue dans `:root`, supprimer les autres blocs `[data-ambiance=…]` et les polices inutilisées de `src/fonts/`
3. Garder les pages de l'organisation retenue à la racine de `src/pages/` et supprimer les autres dossiers et fragments inutilisés. Si l'organisation retenue n'est pas « 4 pages », prévoir les redirections 301 des anciennes adresses (`/les-cours`, `/infos`) dans `src/racine/.htaccess`.

## Textes, fragments et langues

- Une page = un gabarit HTML dans `src/pages/` (sous-dossiers acceptés). Elle assemble des fragments de `src/partials/` avec `{{INCLUDE:sections/cours contact="contact.html"}}`. Les paramètres sont repris dans le fragment par `{{p:contact}}`. Le build s'arrête si un fragment ou un paramètre manque.
- Les textes ne sont jamais écrits en dur : ils sont dans `src/i18n/fr.json` et appelés par `{{t:vinyasa.titre}}`. Ils reprennent mot pour mot le site actuel.
- Le site est en français (`languages: ["fr"]` dans `src/data/site.json`). Le mécanisme bilingue de memoria reste en place : pour ajouter l'anglais, ajouter `"en"` à `languages`, créer `src/i18n/en.json` avec les mêmes clés et ajouter un sélecteur de langue (`{{HREF_FR}}` / `{{HREF_EN}}`).
- **Le build s'arrête** si une clé manque dans une langue ou si un jeton `{{…}}` n'est pas remplacé.
- Jetons système :
  - `{{ROOT}}` : chemin vers la racine du site, pour les fichiers (`{{ROOT}}images/…`), calculé selon la profondeur de la page
  - `{{LANG}}` : code de la langue
  - `{{HREF_FR}}`, `{{HREF_EN}}`… : la même page dans une autre langue
  - `{{HEAD_LINKS}}` : canonical, `og:url` et `hreflang`, générés seulement quand `siteUrl` est renseigné
- Les liens entre pages restent relatifs (`les-cours.html#yin`, `contact.html`). C'est indispensable pour la préversion GitHub Pages, servie dans un sous-dossier.
- Chaque fichier de `css/` et `js/` reçoit une empreinte (`style.css?v=…`).

## Tarifs

Les prix se modifient à **un seul endroit** : `tarifs` dans `src/data/site.json`. Les trois tranches de revenu sont suffixées `-1`, `-2`, `-3` (`unite-1`, `dix-3`…), et le cours d'essai s'appelle `essai`. Dans les pages, on écrit `{{PRIX:unite-1}}`. Le build l'affiche au format français (« 15 € », « 12,50 € ») et s'arrête si le nom est inconnu. Ne jamais écrire un prix en dur.

## Structure

- `src/pages/` : pages (voir « Propositions de design »)
- `src/partials/` : `tete.html` (en-tête HTML commun), `entete.html` (navigation, paramètres `accueil`, `cours`, `infos`, `contact`), `pied.html`, `bandeau-page.html` et `sections/` (un fragment par bloc de contenu : accueil avec ou sans photo, approche, cours, tarifs, témoignages, contact…)
- `src/i18n/fr.json` : textes
- `src/css/style.css`, `src/js/main.js` : style et comportements, sans dépendance
- `src/images/` : photos en WebP (800, 1400 et 2200 px, redimensionnées depuis les originaux du site actuel), image de partage `partage.jpg` (1200 × 630), favicon
- `src/fonts/` : polices auto-hébergées en woff2 variable, jeu latin (pas d'appel à Google Fonts, pour le RGPD et la vitesse)
- `src/data/site.json` : nom, URL publique, langues, tarifs
- `src/racine/` : fichiers copiés à la racine (`.htaccess`…)
- `legacy/` : sauvegarde et extraction du site actuel. **Ignoré par git.**
- `maquette/` : maquettes et captures de référence. **Ignoré par git.**

## Comportements disponibles

- **Menu mobile** : burger sous 900 px, fermeture par Échap, par un clic sur un lien ou en repassant en grand écran
- **Lien actif** : `aria-current="page"` posé automatiquement sur le lien de la page courante
- **En-tête** : collé en haut, filet sous l'en-tête dès 40 px de défilement
- **Apparition au défilement** : ajouter `data-reveal` à un bloc. Les blocs frères apparaissent en décalé. Rien ne s'anime si le visiteur a demandé à réduire les animations (le bandeau défilant s'arrête aussi).
- **Tarifs** : le choix de la tranche de revenu affiche les prix correspondants, en CSS seul (boutons radio et `:has()`)
- **Formulaire de contact** : validation du navigateur, champ anti-spam invisible (`site_web`). Tant que la balise `<form>` n'a pas d'attribut `action`, l'envoi affiche un message d'aperçu.
- **Carte** : OpenStreetMap intégrée (aucun cookie de suivi)
- **Année** : `<span data-annee>` est mis à jour automatiquement

## Mise en ligne

- **Préversion** : le workflow `.github/workflows/deploy-pages.yml` construit le site à chaque push sur `main` et le publie sur GitHub Pages (`https://stephanelay.github.io/aurore-monticelli-yoga/`), avec un `robots.txt` qui interdit l'indexation. Si le premier déploiement échoue sur l'étape `configure-pages`, activer Pages à la main : *Settings → Pages → Source : GitHub Actions*.
- **Hébergement définitif** : offre Hostinger *Single Web Hosting* du client (un seul site, PHP, gestionnaire de fichiers, FTP), sur le domaine `auroremonticelliyoga.com`. Avant la mise en ligne, renseigner `siteUrl` dans `src/data/site.json`. Cela active canonical, `og:url` et `sitemap.xml`. On publie ensuite **le contenu de `dist/`** dans `public_html`.
- `.htaccess` (Apache/LiteSpeed) : page 404, en-têtes de sécurité, redirection HTTPS. Les adresses actuelles (`/les-cours`, `/infos`, `/contact`) doivent continuer à fonctionner, pour conserver le référencement.

### Bascule depuis le site Builder (à faire ensemble, jamais en autonomie)

L'offre Single n'accepte qu'un site, déjà occupé par le site Builder : il faut le **supprimer** (opération irréversible) avant de créer le nouveau. La coupure dure le temps des étapes 3 à 5.

1. Avant le jour J : le nouveau site est validé sur la préversion, `siteUrl` est renseigné, `dist/` est prêt (en `.zip` pour l'envoi).
2. Le jour J : refaire une sauvegarde du site Builder dans `legacy/` et récupérer les messages du formulaire stockés dans le Builder.
3. hPanel → Sites web → site Builder → supprimer le site. Hostinger prévient que cela supprime aussi les e-mails du domaine : il n'y en a aucun.
4. Créer un site → « PHP/HTML vide » sur `auroremonticelliyoga.com`.
   Activer la boîte e-mail gratuite du domaine, utilisée par le script du formulaire pour l'envoi SMTP. Ne pas toucher aux enregistrements MX.
5. Gestionnaire de fichiers → `public_html` : envoyer le `.zip` de `dist/`, l'extraire, vérifier que `.htaccess` est bien présent.
6. Vérifier le certificat SSL (avec et sans `www`), les pages et anciennes adresses, la page 404 et le formulaire en conditions réelles. Vérifier aussi que la zone DNS a gardé MX et SPF.

Le code source ne contient volontairement aucun commentaire : le suivi du projet se fait dans ce fichier, `PROJECT_BRIEF.md` et `QUESTIONS_CLIENT.md`.
