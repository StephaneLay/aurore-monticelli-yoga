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
- `src/scripts/` : script PHP du formulaire (`contact.php`) et sa protection (`.htaccess`)
- `src/racine/` : fichiers copiés à la racine (`.htaccess`…)
- `hebergement/` : modèle de configuration du formulaire, à copier sur le serveur hors de `public_html` (le vrai fichier est ignoré par git)
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
- **Formulaire de contact** : validation du navigateur, champ anti-spam invisible (`site_web`), bouton désactivé pendant l'envoi. Le formulaire poste vers `scripts/contact.php`, qui renvoie sur `contact.html?envoi=ok` ou `?envoi=erreur` (message affiché en haut du formulaire). Le PHP ne tourne pas sur GitHub Pages : sur la préversion, l'envoi échoue, c'est normal.
- **Carte** : OpenStreetMap intégrée (aucun cookie de suivi)
- **Année** : `<span data-annee>` est mis à jour automatiquement

## Mise en ligne

- **Préversion** : le workflow `.github/workflows/deploy-pages.yml` construit le site à chaque push sur `main` et le publie sur GitHub Pages (`https://stephanelay.github.io/aurore-monticelli-yoga/`), avec un `robots.txt` qui interdit l'indexation. Si le premier déploiement échoue sur l'étape `configure-pages`, activer Pages à la main : *Settings → Pages → Source : GitHub Actions*.
- **Production** : `https://www.auroremonticelliyoga.com`, sur l'offre Hostinger *Single Web Hosting* du client (un seul site, PHP, gestionnaire de fichiers). `siteUrl` est renseigné dans `src/data/site.json` : canonical, `og:url`, `og:image` et `sitemap.xml` sont générés.
- **`.htaccess`** (LiteSpeed) :
  - page 404, en-têtes de sécurité ;
  - mise en cache longue des fichiers à empreinte (CSS, JS, polices) ;
  - une seule redirection 301 vers `https://www.` ;
  - les adresses du site Builder redirigent (301) vers les nouvelles : `/infos` → `/infos.html`, `/contact` → `/contact.html`, `/les-cours` → `/#cours`.

  Ces règles ne s'appliquent pas sur GitHub Pages.
- **Formulaire** : `scripts/contact.php` lit sa configuration dans `config-formulaire.php`, **hors de `public_html`**, dans le dossier parent `domains/auroremonticelliyoga.com/`. Il cherche ensuite dans `public_html/scripts/`, où le fichier est protégé par `scripts/.htaccess`. Le modèle est `hebergement/config-formulaire.exemple.php`. Avec un mot de passe SMTP, l'envoi passe par `smtp.hostinger.com:465` depuis la boîte du domaine (meilleure délivrabilité chez Outlook). Sans mot de passe, l'envoi passe par la fonction `mail()` de PHP. **Le vrai fichier de configuration ne va jamais dans git** (il est ignoré).
- **Archive à envoyer** : `node build.js`, puis `python3 -c "import shutil; shutil.make_archive('site', 'zip', 'dist')"`. Cela produit `site.zip`, avec le contenu de `dist/` à la racine et les `.htaccess` compris (fichier ignoré par git).

### Bascule depuis le site Builder (à faire ensemble, jamais en autonomie)

L'offre Single n'accepte qu'un site, déjà occupé par le site Builder : il faut le **supprimer** (opération irréversible) avant de créer le nouveau. La coupure dure le temps des étapes 3 à 7, soit environ un quart d'heure : la durée de cache DNS n'est que de 60 s (300 s pour `www`).

**Avant le jour J**

1. hPanel → E-mails : vérifier qu'une boîte gratuite est proposée pour le domaine, **sans la créer** (la suppression du site Builder supprimerait aussi les e-mails du domaine).
2. Si Aurore veut garder les messages déjà reçus par le formulaire du Builder, les récupérer dans l'éditeur du Builder.
3. Choisir un créneau calme, en dehors des soirs de cours (lundi, mardi, mercredi).

**Le jour J**

1. Préparer `site.zip` (voir ci-dessus) et refaire une sauvegarde du site Builder dans `legacy/`.
2. hPanel → Sites web → site Builder → supprimer le site. Ne toucher ni à l'abonnement du domaine, ni à celui de l'hébergement.
3. Sites web → créer / ajouter un site → site vide « PHP/HTML personnalisé », sur le domaine existant `auroremonticelliyoga.com`.
4. Vérifier la zone DNS (hPanel → Domaines → DNS) : la racine et `www` pointent vers l'hébergement, MX et SPF sont intacts. Ne rien modifier à la main.
5. hPanel → E-mails : créer `site@auroremonticelliyoga.com`, avec un mot de passe fort conservé dans un gestionnaire de mots de passe.
6. Gestionnaire de fichiers → `public_html` : supprimer la page par défaut d'Hostinger, envoyer `site.zip`, l'extraire sur place, supprimer `site.zip`, vérifier que `.htaccess` est présent (afficher les fichiers cachés).
7. Dans le dossier parent de `public_html` : créer `config-formulaire.php` à partir du modèle et y saisir le mot de passe de la boîte.
8. hPanel → Sécurité → SSL : certificat actif (attendre s'il est en cours d'émission). En cas de boucle de redirection, retirer le premier bloc de redirection du `.htaccess` et activer « Forcer HTTPS » dans le hPanel.
9. Vérifications :
   - pages, images et favicon ;
   - redirections : `http://`, sans `www`, `/infos`, `/contact`, `/les-cours` ;
   - page 404, `robots.txt`, `sitemap.xml` ;
   - MX inchangés ;
   - envoi réel du formulaire : réception sur `aurore.monticelli@live.fr`, spams compris, et « Répondre » qui vise bien le visiteur.
10. Search Console, si Aurore l'utilise : soumettre `sitemap.xml`.

**Mises à jour ensuite** : rebâtir, refaire `site.zip`, l'envoyer et l'extraire par-dessus dans `public_html`. `config-formulaire.php` n'est pas touché, puisqu'il est hors de `public_html`. L'extraction écrase les fichiers sans supprimer les anciens : un fichier retiré du site doit être supprimé à la main sur le serveur.

Le code source ne contient volontairement aucun commentaire : le suivi du projet se fait dans ce fichier, `PROJECT_BRIEF.md` et `QUESTIONS_CLIENT.md`.
