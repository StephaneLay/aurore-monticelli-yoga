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

## Design retenu

Choix de la cliente le 17/10/2026, parmi 4 ambiances et 3 organisations : ambiance **Argile** et organisation en **3 pages**.

- **Couleurs** : crème `#f6efe6`, terre cuite `#b5532b`, brun `#3d2b20`, pêche `#f0a77a`. Toutes sont des variables de `:root` dans `src/css/style.css`.
- **Polices** : Fraunces pour les titres (italique sur le mot « Respirer »), Manrope pour le texte.
- **Motif** : un soleil levant à anneaux (élément `.soleil`), en écho au prénom Aurore.
- **Pages** :
  - `index.html` : accroche, approche, cours (ancre `#cours`), pratique sans performance, témoignages, « À savoir » ;
  - `infos.html` : tarifs, cours d'essai, questions ;
  - `contact.html` : formulaire, accès, Instagram, carte.
- **Favicon** : un croissant de lune crème (`#f6efe6`) sur un disque terre cuite (`#b5532b`). `src/images/favicon.svg` est la source. `favicon.png` (256 px, transparent autour du disque) et `apple-touch-icon.png` (180 px, fond terre cuite) en sont des exports PNG : il faut les régénérer si le SVG change.

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
- Chaque fichier de `css/` et `js/`, ainsi que les favicons (`favicon.svg`, `favicon.png`, `apple-touch-icon.png`), reçoit une empreinte (`style.css?v=…`). Une modification change donc l'adresse du fichier, et les navigateurs rechargent la nouvelle version au lieu de garder l'ancienne en cache (les favicons y restent sinon très longtemps).

## Tarifs

Les prix se modifient à **un seul endroit** : `tarifs` dans `src/data/site.json`. Les trois tranches de revenu sont suffixées `-1`, `-2`, `-3` (`unite-1`, `dix-3`…), et le cours d'essai s'appelle `essai`. Dans les pages, on écrit `{{PRIX:unite-1}}`. Le build l'affiche au format français (« 15 € », « 12,50 € ») et s'arrête si le nom est inconnu. Ne jamais écrire un prix en dur.

## Structure

- `src/pages/` : `index.html`, `infos.html`, `contact.html`, `404.html`
- `src/partials/` : `tete.html` (en-tête HTML commun : favicons, polices préchargées, CSS), `entete.html` (navigation), `pied.html`, `bandeau-page.html` (titre de page, paramètre `titre`), `icones/instagram.html` et `sections/` (un fragment par bloc de contenu : accueil, approche, cours, tarifs, cours d'essai, témoignages, questions, contact…)
- `src/i18n/fr.json` : textes
- `src/css/style.css`, `src/js/main.js` : style et comportements, sans dépendance
- `src/images/` : photos en WebP (800, 1400 et 2200 px, redimensionnées depuis les originaux du site actuel), image de partage `partage.jpg` (1200 × 630), favicons
- `src/fonts/` : polices auto-hébergées en woff2 variable, jeu latin (pas d'appel à Google Fonts, pour le RGPD et la vitesse)
- `src/data/site.json` : nom, URL publique, langues, tarifs
- `src/racine/` : fichiers copiés à la racine (`.htaccess`…)
- `legacy/` : sauvegarde et extraction du site actuel. **Ignoré par git.**
- `maquette/` : maquettes et captures de référence. **Ignoré par git.**

## Comportements disponibles

- **Menu mobile** : burger sous 900 px, fermeture par Échap, par un clic sur un lien ou en repassant en grand écran
- **Lien actif** : `aria-current="page"` posé automatiquement sur le lien de la page courante
- **En-tête** : collé en haut, filet sous l'en-tête dès 40 px de défilement
- **Apparition au défilement** : ajouter `data-reveal` à un bloc. Les blocs frères apparaissent en décalé. Rien ne s'anime si le visiteur a demandé à réduire les animations.
- **Témoignages** : cartes côte à côte qui défilent de gauche à droite (glisser au doigt, pavé tactile, flèches du clavier une fois la zone sélectionnée, ou boutons ← →, qui se désactivent en début et en fin de liste). Les textes de plus de 9 lignes sont repliés, avec un bouton « Lire la suite » / « Réduire ». Ajouter un avis : une paire `tN.texte` / `tN.nom` dans `fr.json` et un bloc `<figure>` dans `sections/temoignages.html`.
- **Instagram** : lien dans l'en-tête (icône, compte affiché dans le menu mobile), le pied de page et la page Contact. L'adresse est à un seul endroit : `instagram.url` dans `fr.json`.
- **Tarifs** : le choix de la tranche de revenu affiche les prix correspondants, en CSS seul (boutons radio et `:has()`)
- **Formulaire de contact** : validation du navigateur, champ anti-spam invisible (`site_web`). Tant que la balise `<form>` n'a pas d'attribut `action`, l'envoi affiche un message d'aperçu.
- **Carte** : OpenStreetMap intégrée (aucun cookie de suivi)
- **Année** : `<span data-annee>` est mis à jour automatiquement

## Mise en ligne

- **Préversion** : le workflow `.github/workflows/deploy-pages.yml` construit le site à chaque push sur `main` et le publie sur GitHub Pages (`https://stephanelay.github.io/aurore-monticelli-yoga/`), avec un `robots.txt` qui interdit l'indexation. Si le premier déploiement échoue sur l'étape `configure-pages`, activer Pages à la main : *Settings → Pages → Source : GitHub Actions*.
- **Hébergement définitif** : offre Hostinger *Single Web Hosting* du client (un seul site, PHP, gestionnaire de fichiers, FTP), sur le domaine `auroremonticelliyoga.com`. Avant la mise en ligne, renseigner `siteUrl` dans `src/data/site.json`. Cela active canonical, `og:url` et `sitemap.xml`. On publie ensuite **le contenu de `dist/`** dans `public_html`.
- `.htaccess` (Apache/LiteSpeed) : page 404, en-têtes de sécurité, redirection HTTPS. Pour conserver le référencement, les adresses du site actuel continuent de fonctionner : `/infos` et `/contact` servent `infos.html` et `contact.html`, et l'ancienne page `/les-cours` redirige (301) vers `/#cours`. Ces règles ne s'appliquent pas sur GitHub Pages : elles seront à tester après la bascule.

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
