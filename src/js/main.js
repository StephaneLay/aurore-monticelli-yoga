(function () {
  var reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = document.querySelector('[data-header]');
  var burger = document.querySelector('[data-menu-toggle]');
  var nav = document.getElementById('site-nav');

  function basculerMenu(ouvert) {
    var libelle = burger.querySelector('[data-label-open]');
    header.classList.toggle('menu-ouvert', ouvert);
    document.body.classList.toggle('sans-defilement', ouvert);
    burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    libelle.textContent = libelle.getAttribute(ouvert ? 'data-label-close' : 'data-label-open');
  }

  function fermerMenu() {
    if (!header || !header.classList.contains('menu-ouvert')) return;
    basculerMenu(false);
  }

  if (header && burger && nav) {
    burger.addEventListener('click', function () {
      basculerMenu(!header.classList.contains('menu-ouvert'));
    });

    nav.addEventListener('click', function (evenement) {
      if (evenement.target.closest('a')) fermerMenu();
    });

    window.matchMedia('(min-width: 900px)').addEventListener('change', fermerMenu);
  }

  document.addEventListener('keydown', function (evenement) {
    if (evenement.key === 'Escape') fermerMenu();
  });

  var pageCourante = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a[href]').forEach(function (lien) {
    if (lien.getAttribute('href') === pageCourante) lien.setAttribute('aria-current', 'page');
  });

  document.querySelectorAll('[data-annee]').forEach(function (annee) {
    annee.textContent = String(new Date().getFullYear());
  });

  if (!reduireAnimations && 'IntersectionObserver' in window) {
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add('est-visible');
          observateur.unobserve(entree.target);
        }
      });
    }, { rootMargin: '0px 0px -60px', threshold: 0.08 });

    document.querySelectorAll('[data-reveal]').forEach(function (bloc) {
      var freres = Array.prototype.filter.call(bloc.parentElement.children, function (enfant) {
        return enfant.hasAttribute('data-reveal');
      });
      var rang = freres.indexOf(bloc);
      if (rang > 0) bloc.style.setProperty('--delai', Math.min(rang * 110, 440) + 'ms');
      bloc.classList.add('reveal');
      observateur.observe(bloc);
    });
  }

  var piste = document.querySelector('[data-defileur]');
  var precedent = document.querySelector('[data-defileur-precedent]');
  var suivant = document.querySelector('[data-defileur-suivant]');

  if (piste && precedent && suivant) {
    var pas = function () {
      var carte = piste.querySelector('[data-temoignage]');
      var ecart = parseFloat(window.getComputedStyle(piste).columnGap) || 0;
      return carte ? carte.getBoundingClientRect().width + ecart : piste.clientWidth;
    };

    var defiler = function (sens) {
      piste.scrollBy({ left: sens * pas(), behavior: reduireAnimations ? 'auto' : 'smooth' });
    };

    var majCommandes = function () {
      precedent.disabled = piste.scrollLeft <= 2;
      suivant.disabled = piste.scrollLeft >= piste.scrollWidth - piste.clientWidth - 2;
    };

    precedent.addEventListener('click', function () { defiler(-1); });
    suivant.addEventListener('click', function () { defiler(1); });
    piste.addEventListener('scroll', majCommandes, { passive: true });
    window.addEventListener('resize', majCommandes);
    majCommandes();
  }

  document.querySelectorAll('[data-temoignage]').forEach(function (temoignage) {
    var texte = temoignage.querySelector('[data-temoignage-texte]');
    var bouton = temoignage.querySelector('[data-temoignage-suite]');
    if (!texte || !bouton) return;

    var verifier = function () {
      if (temoignage.classList.contains('est-deplie')) return;
      bouton.hidden = texte.scrollHeight <= texte.clientHeight + 1;
    };

    bouton.addEventListener('click', function () {
      var deplie = !temoignage.classList.contains('est-deplie');
      temoignage.classList.toggle('est-deplie', deplie);
      bouton.setAttribute('aria-expanded', deplie ? 'true' : 'false');
      bouton.textContent = bouton.getAttribute(deplie ? 'data-libelle-fermer' : 'data-libelle-ouvrir');
      if (!deplie && piste) temoignage.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });

    verifier();
    window.addEventListener('resize', verifier);
    if (document.fonts) document.fonts.ready.then(verifier);
  });

  document.querySelectorAll('[data-formulaire]').forEach(function (formulaire) {
    formulaire.addEventListener('submit', function (evenement) {
      if (formulaire.getAttribute('action')) return;
      evenement.preventDefault();
      var statut = formulaire.querySelector('[data-formulaire-statut]');
      if (statut) statut.textContent = formulaire.getAttribute('data-apercu');
    });
  });

  var defilementPrevu = false;

  function majDefilement() {
    defilementPrevu = false;
    if (header) header.classList.toggle('is-compact', window.scrollY > 40);
  }

  window.addEventListener('scroll', function () {
    if (!defilementPrevu) {
      defilementPrevu = true;
      window.requestAnimationFrame(majDefilement);
    }
  }, { passive: true });
  majDefilement();
})();
