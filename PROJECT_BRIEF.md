# Brief projet — Aurore Monticelli Yoga

## Objectif

Refonte complète du design du site d'Aurore Monticelli, professeure de yoga à Lyon (pentes de la Croix-Rousse). **Le contenu est déjà validé** : textes, pages et informations sont repris du site actuel. Seule la présentation change.

Positionnement : yoga Vinyasa et Yin Yoga **en non-mixité choisie**, approche féministe, bienveillance, inclusivité et sororité. Groupes de 6 personnes au maximum, sans recherche de performance.

## Site actuel — https://www.auroremonticelliyoga.com/

- Fait avec le **Hostinger Website Builder** (anciennement Zyro). Les images sont servies par `assets.zyrosite.com`.
- Domaine `auroremonticelliyoga.com` enregistré **chez Hostinger** (créé le 26/10/2025, expire le 26/10/2027). Zone DNS gérée par Hostinger (`ns1/ns2.dns-parking.com`).
- Enregistrements e-mail sur le domaine : MX `mx1/mx2.hostinger.com` et SPF Hostinger. Ce sont les valeurs par défaut : **aucune boîte e-mail n'est activée** sur le domaine. Les messages du formulaire actuel arriveraient sur `aurore.monticelli@live.fr` (à confirmer).
- hPanel → Sites web : **un seul site**, `auroremonticelliyoga.com`, de type « Créateur IA » (Website Builder), qui occupe l'unique emplacement de l'offre Single.
- Abonnements Hostinger (relevés le 17/10/2026) :
  - **Single Web Hosting** : renouvellement automatique le 21/07/2028, 143,52 €. C'est un vrai hébergement web (gestionnaire de fichiers, FTP, PHP, SSL, `.htaccess`), limité à **un seul site**. Aucun domaine ne s'affiche sur la ligne de l'abonnement.
  - Domaine `auroremonticelliyoga.com` : renouvellement automatique le 29/09/2027, 16,99 €.
  - Domaine `louves-yoga.com` : ancien domaine abandonné. Il est affiché « Expire : 2027-08-04 », sans renouvellement automatique, donc il expirera seul. Créé le 04/08/2024, aucun enregistrement DNS. Rien à faire.
  - Aucun abonnement Website Builder ni e-mail séparé.
- Sauvegarde du 17/10/2026 dans `legacy/sauvegarde-2026-10-17/` (hors git) : HTML des 4 pages, sitemap, images originales, texte extrait (`contenu.txt`).

### Pages et adresses (à conserver pour le référencement)

| Adresse | Contenu |
|---|---|
| `/` | Accroche « Bouger. Respirer. Ressentir. », « Yoga en non-mixité à Lyon », « · Vinyasa · Yin Yoga · », lien « Découvrir les cours ». Pas d'image. |
| `/les-cours` | Présentation (non-mixité, 6 personnes max, pas de posture parfaite), Vinyasa (lundi 18h45–19h45, mardi 19h45–20h45), Yin (mercredi 19h30–20h45), « Une pratique sans recherche de performance », encart « À savoir », 5 témoignages (Clotilde, Manon, Raphaëlle, Clara F., Caroline), 2 photos |
| `/infos` | Tarifs 2026-2027 solidaires selon 3 tranches de revenu, cours d'essai à 10 €, validité des forfaits, paiement en plusieurs fois, FAQ tarifaire (5 questions), règle d'annulation 24 h |
| `/contact` | Formulaire (nom*, prénom, e-mail*, message*), adresse 11 rue Lemot 69001 Lyon, accès (métro Croix-Paquet ligne C, bus Colbert ligne 141, parking 1 rue Aimé Boussange), rez-de-chaussée sans ascenseur, carte Google Maps |

- Tous les boutons « Réserver un cours » et « Réserver mon cours d'essai » mènent à `/contact` : **pas d'outil de réservation**, la réservation passe par le formulaire.
- Le formulaire est celui du Website Builder (les messages arrivent dans Hostinger). Il faudra le remplacer.
- Aucun pied de page, aucune mention légale, aucun lien vers des réseaux sociaux.

### Identité visuelle actuelle (pour référence, pas une contrainte)

- Couleurs : taupe rosé `#a3887f` (fonds de section), vert sauge `#a9af97` (accueil, en dégradé), texte `#0d0d0d`, blanc
- Polices (Google Fonts) : Lora (titres), Anton SC, Oswald (texte), Oxygen, Beth Ellen (manuscrite, sur les liens d'appel)
- Pas de logo : le favicon est une fleur violette de 32 px
- Deux photos professionnelles en extérieur, lumière dorée de fin de journée (Vinyasa : posture latérale sur tapis de liège ; Yin : allongée sur un bolster), 3236 × 2160 et 3052 × 2160 px

## Principes techniques

- HTML, CSS et JavaScript sans dépendance, aucune exécution côté serveur. Base reprise de `memoria-experience`.
- Sources dans `src/`, site généré dans `dist/` par `node build.js` (partials, textes, tarifs centralisés, `robots.txt`, `sitemap.xml`).
- Préversion sur GitHub Pages (non indexée), hébergement définitif à décider.

## Design

Décisions du 17/10/2026 :

- **Contenu et images : tout est conservé**, mais réorganisé librement dans un design plus moderne (par exemple, enrichir l'accueil avec des éléments des autres pages).
- **Identité : entièrement nouvelle**, plus propre. La palette, les polices et le style actuels ne sont pas à reprendre.
- Ordre de travail : l'hébergement est réglé avant le design.

### Propositions soumises à la cliente (préversion du 17/10/2026)

Fil conducteur commun : « Aurore » = l'aube. Un motif de soleil levant revient sous des formes différentes, en écho à la lumière dorée des deux photos.

| Ambiance | Couleurs | Polices | Signature |
|---|---|---|---|
| **Argile** | crème, terre cuite, olive | Fraunces (titres), Manrope | photo en arche, soleil à anneaux, italiques éditoriales |
| **Lilas** | lavande, prune, pêche | Bricolage Grotesque | formes organiques, halo d'aurore flou, surlignage pêche |
| **Sous-bois** | vert forêt (sombre), ambre, parchemin | Instrument Serif, Instrument Sans | photo pleine page, lueur ambrée, élégance éditoriale |
| **Manifeste** | papier, encre, vermillon, rose | Archivo (capitales élargies) | graphique et engagé : disque vermillon, cadres noirs, ombres décalées |

| Organisation | Pages |
|---|---|
| **4 pages** | comme aujourd'hui, mêmes adresses : Accueil (accroche + photo, aperçu des deux cours, cours d'essai), Les cours, Infos, Contact |
| **3 pages** | Accueil (accroche, approche, cours, témoignages), Infos, Contact |
| **Page unique** | tout le contenu sur une page, menu par ancres |

Contenu identique dans toutes les combinaisons. Ajouts : un bandeau défilant qui reprend « Bouger · Respirer · Explorer / Rester · Ressentir · Relâcher », une sélection de la tranche de revenu dans les tarifs, une carte OpenStreetMap et un pied de page (adresse, contact).

Ne pas ajouter de vraies clés, mots de passe ou jetons au dépôt.
