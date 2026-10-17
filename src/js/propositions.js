(function () {
  var ambiances = [
    { id: 'argile', nom: 'Argile', detail: 'Terre cuite, crème et olive · Fraunces', couleurs: ['#f6efe6', '#b5532b', '#6c7147'] },
    { id: 'lilas', nom: 'Lilas', detail: 'Lavande, prune et pêche · Bricolage Grotesque', couleurs: ['#f7f3fb', '#7a4bb0', '#f3a88c'] },
    { id: 'sous-bois', nom: 'Sous-bois', detail: 'Version sombre, vert forêt et ambre · Instrument Serif', couleurs: ['#121e18', '#e3a74f', '#ebe2cd'] },
    { id: 'clairiere', nom: 'Clairière', detail: 'Version sombre, vert profond et menthe · Instrument Serif', couleurs: ['#0e1813', '#87e990', '#e8f3ea'] }
  ];

  var sectionsCompletes = ['accueil', 'approche', 'cours', 'vinyasa', 'yin', 'performance', 'temoignages', 'a-savoir'];

  var organisations = [
    {
      id: 'quatre-pages',
      nom: '4 pages',
      detail: 'Comme aujourd’hui : Accueil, Les cours, Infos, Contact',
      dossier: '',
      pages: {
        'index.html': ['accueil', 'apercu'],
        'les-cours.html': ['intro-cours', 'approche', 'cours', 'vinyasa', 'yin', 'performance', 'temoignages', 'a-savoir'],
        'infos.html': ['intro-infos', 'tarifs', 'essai', 'questions'],
        'contact.html': ['contact']
      }
    },
    {
      id: 'trois-pages',
      nom: '3 pages',
      detail: 'Les cours sur l’accueil, puis Infos et Contact',
      dossier: 'trois-pages/',
      pages: {
        'index.html': sectionsCompletes,
        'infos.html': ['intro-infos', 'tarifs', 'essai', 'questions'],
        'contact.html': ['contact']
      }
    },
    {
      id: 'page-unique',
      nom: 'Page unique',
      detail: 'Tout le site sur une seule page qui défile',
      dossier: 'page-unique/',
      pages: {
        'index.html': sectionsCompletes.concat(['tarifs', 'essai', 'questions', 'contact'])
      }
    }
  ];

  var equivalences = { 'intro-cours': 'approche', 'intro-infos': 'tarifs', apercu: 'cours' };
  var script = document.currentScript;
  var racine = new URL('../', script ? script.src : window.location.href);
  var racineDocument = document.documentElement;
  var organisationCourante = document.body.getAttribute('data-organisation');

  function lire(cle) {
    try { return window.localStorage.getItem(cle); } catch (erreur) { return null; }
  }

  function ecrire(cle, valeur) {
    try { window.localStorage.setItem(cle, valeur); } catch (erreur) { return; }
  }

  function trouver(liste, id) {
    for (var i = 0; i < liste.length; i++) if (liste[i].id === id) return liste[i];
    return null;
  }

  function ambianceCourante() {
    var demandee = new URLSearchParams(window.location.search).get('ambiance') || lire('ambiance');
    return trouver(ambiances, demandee) ? demandee : ambiances[0].id;
  }

  function appliquerAmbiance(id) {
    racineDocument.setAttribute('data-ambiance', id);
    ecrire('ambiance', id);
    var adresse = new URL(window.location.href);
    adresse.searchParams.set('ambiance', id);
    window.history.replaceState(null, '', adresse.href);
    panneau.querySelectorAll('[data-choix-ambiance]').forEach(function (bouton) {
      bouton.setAttribute('aria-pressed', bouton.getAttribute('data-choix-ambiance') === id ? 'true' : 'false');
    });
    precisionAmbiance.textContent = trouver(ambiances, id).detail;
  }

  function sectionVisible() {
    var seuil = window.innerHeight * 0.35;
    var visible = null;
    document.querySelectorAll('[data-section][id]').forEach(function (section) {
      if (section.getBoundingClientRect().top <= seuil) visible = section.id;
    });
    return visible;
  }

  function destination(organisation, id) {
    var candidats = [id, equivalences[id]];
    for (var c = 0; c < candidats.length; c++) {
      if (!candidats[c]) continue;
      for (var page in organisation.pages) {
        var liste = organisation.pages[page];
        var rang = liste.indexOf(candidats[c]);
        if (rang === -1) continue;
        var enHaut = rang === 0 || (rang === 1 && liste[0].indexOf('intro-') === 0);
        return { page: page, ancre: enHaut ? '' : candidats[c] };
      }
    }
    return { page: 'index.html', ancre: '' };
  }

  function changerOrganisation(id) {
    if (id === organisationCourante) return;
    var organisation = trouver(organisations, id);
    var cible = destination(organisation, sectionVisible() || 'accueil');
    var adresse = new URL(organisation.dossier + cible.page, racine);
    adresse.searchParams.set('ambiance', racineDocument.getAttribute('data-ambiance') || ambiances[0].id);
    if (cible.ancre) adresse.hash = cible.ancre;
    window.location.href = adresse.href;
  }

  function creer(balise, classe, texte) {
    var element = document.createElement(balise);
    if (classe) element.className = classe;
    if (texte) element.textContent = texte;
    return element;
  }

  function option(groupe, element, choisi) {
    var bouton = creer('button', 'propositions__option');
    bouton.type = 'button';
    bouton.setAttribute('data-choix-' + groupe, element.id);
    bouton.setAttribute('aria-pressed', choisi ? 'true' : 'false');
    bouton.title = element.detail;
    if (element.couleurs) {
      var pastilles = creer('span', 'propositions__pastilles');
      pastilles.setAttribute('aria-hidden', 'true');
      element.couleurs.forEach(function (couleur) {
        var pastille = creer('span', 'propositions__pastille');
        pastille.style.background = couleur;
        pastilles.appendChild(pastille);
      });
      bouton.appendChild(pastilles);
    }
    bouton.appendChild(creer('span', 'propositions__nom', element.nom));
    return bouton;
  }

  function groupe(titre, classe, liste, nomGroupe, idChoisi) {
    var bloc = creer('div', 'propositions__groupe');
    bloc.setAttribute('role', 'group');
    bloc.setAttribute('aria-label', titre);
    bloc.appendChild(creer('p', 'propositions__legende', titre));
    var options = creer('div', 'propositions__options ' + classe);
    liste.forEach(function (element) { options.appendChild(option(nomGroupe, element, element.id === idChoisi)); });
    bloc.appendChild(options);
    var precision = creer('p', 'propositions__precision', (trouver(liste, idChoisi) || liste[0]).detail);
    bloc.appendChild(precision);
    panneau.appendChild(bloc);
    return precision;
  }

  var ouvreur = creer('button', 'propositions-ouvreur', 'Propositions de design');
  ouvreur.type = 'button';
  ouvreur.setAttribute('aria-expanded', 'false');
  ouvreur.setAttribute('aria-controls', 'propositions');

  var panneau = creer('section', 'propositions');
  panneau.id = 'propositions';
  panneau.setAttribute('aria-label', 'Propositions de design');
  panneau.hidden = true;

  var entete = creer('div', 'propositions__entete');
  entete.appendChild(creer('p', 'propositions__titre', 'Propositions de design'));
  var fermer = creer('button', 'propositions__fermer', '×');
  fermer.type = 'button';
  fermer.setAttribute('aria-label', 'Réduire le panneau');
  entete.appendChild(fermer);
  panneau.appendChild(entete);
  panneau.appendChild(creer('p', 'propositions__aide', 'Testez toutes les combinaisons, la navigation dans le site reste normale.'));

  var ambiance = ambianceCourante();
  var precisionAmbiance = groupe('1. Ambiance', 'propositions__options--ambiances', ambiances, 'ambiance', ambiance);
  groupe('2. Organisation du contenu', 'propositions__options--organisations', organisations, 'organisation', organisationCourante);

  var partager = creer('button', 'propositions__partager', 'Copier le lien de cette combinaison');
  partager.type = 'button';
  panneau.appendChild(partager);

  document.body.appendChild(ouvreur);
  document.body.appendChild(panneau);

  function basculerPanneau(ouvert) {
    panneau.hidden = !ouvert;
    ouvreur.hidden = ouvert;
    ouvreur.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    ecrire('propositions-ouvert', ouvert ? '1' : '0');
  }

  ouvreur.addEventListener('click', function () {
    basculerPanneau(true);
    fermer.focus();
  });

  fermer.addEventListener('click', function () {
    basculerPanneau(false);
    ouvreur.focus();
  });

  document.addEventListener('keydown', function (evenement) {
    if (evenement.key === 'Escape' && !panneau.hidden) {
      basculerPanneau(false);
      ouvreur.focus();
    }
  });

  panneau.addEventListener('click', function (evenement) {
    var bouton = evenement.target.closest('[data-choix-ambiance], [data-choix-organisation]');
    if (!bouton) return;
    if (bouton.hasAttribute('data-choix-ambiance')) appliquerAmbiance(bouton.getAttribute('data-choix-ambiance'));
    else changerOrganisation(bouton.getAttribute('data-choix-organisation'));
  });

  partager.addEventListener('click', function () {
    var adresse = window.location.href;
    var confirmer = function () {
      partager.textContent = 'Lien copié';
      window.setTimeout(function () { partager.textContent = 'Copier le lien de cette combinaison'; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(adresse).then(confirmer, function () { window.prompt('Lien à copier :', adresse); });
    } else {
      window.prompt('Lien à copier :', adresse);
    }
  });

  appliquerAmbiance(ambiance);
  basculerPanneau(lire('propositions-ouvert') !== '0');
})();
