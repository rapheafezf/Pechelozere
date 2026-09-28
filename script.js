/* ==================================================================
   PÊCHE EN LOZÈRE — Scripts (JavaScript vanilla, sans dépendance)
   ------------------------------------------------------------------
   1. Configuration
   2. Utilitaires
   3. Header au scroll
   4. Menu mobile (hamburger)
   5. Lien de navigation actif
   6. Animations d'apparition (Intersection Observer)
   7. Compteurs animés
   8. Filtres des parcours
   9. Statut de saison en direct + repère « aujourd'hui »
   10. Formulaires (validation + envoi Netlify)
   11. Choix d'une formule de guide
   12. CTA flottant mobile
   13. Images manquantes → placeholder
   14. Boîte de dialogue mentions légales
   15. Année du footer
   ================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     1. CONFIGURATION
     ---------------------------------------------------------------- */
  const CONFIG = {
    // 🔧 À REMPLACER : e-mail affiché si l'envoi d'un formulaire échoue
    fallbackEmail: 'contact@votre-domaine.fr',
    // Dates de saison (mois de 0 à 11)
    season: {
      openMonth: 2, openDay: 14,   // 14 mars
      closeMonth: 8, closeDay: 20  // 20 septembre
    },
    charpal: {
      openMonth: 4, openDay: 1     // 1er mai → 31 décembre
    }
  };

  /* ----------------------------------------------------------------
     2. UTILITAIRES
     ---------------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
    'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  const formatDate = (d) => `${d.getDate() === 1 ? '1er' : d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);

  /* ----------------------------------------------------------------
     3. HEADER AU SCROLL
     ---------------------------------------------------------------- */
  const header = $('.site-header');
  const onScrollHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ----------------------------------------------------------------
     4. MENU MOBILE (hamburger animé + accessibilité clavier)
     ---------------------------------------------------------------- */
  const nav = $('#main-nav');
  const toggle = $('.nav-toggle');
  const toggleLabel = toggle ? $('.visually-hidden', toggle) : null;
  const desktopMQ = window.matchMedia('(min-width: 1100px)');

  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (toggleLabel) toggleLabel.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    document.body.classList.toggle('nav-open', open);
    // Force l'en-tête opaque quand le menu est ouvert
    if (open) {
      header.classList.add('is-scrolled');
      const firstLink = $('a', nav);
      if (firstLink) setTimeout(() => firstLink.focus(), 150);
    } else {
      onScrollHeader();
    }
  }

  if (nav && toggle) {
    toggle.addEventListener('click', () => {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Fermer après un clic sur un lien
    $$('a', nav).forEach((link) => {
      link.addEventListener('click', () => {
        if (!desktopMQ.matches) setNav(false);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (!nav.classList.contains('is-open')) return;

      // Échap : fermer et rendre le focus au bouton
      if (e.key === 'Escape') {
        setNav(false);
        toggle.focus();
      }

      // Tab : garder le focus dans le menu ouvert
      if (e.key === 'Tab') {
        const focusables = [toggle, ...$$('a', nav)];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Repasser en desktop ferme le menu mobile
    desktopMQ.addEventListener('change', (e) => {
      if (e.matches) setNav(false);
    });
  }

  /* ----------------------------------------------------------------
     5. LIEN DE NAVIGATION ACTIF selon la section visible
     ---------------------------------------------------------------- */
  const navLinks = $$('.main-nav__list a');
  if (hasIO && navLinks.length) {
    const sections = navLinks
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((a) => {
          const active = a.getAttribute('href') === id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* ----------------------------------------------------------------
     6. ANIMATIONS D'APPARITION AU SCROLL
     ---------------------------------------------------------------- */
  const revealEls = $$('[data-reveal]');
  if (hasIO && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ----------------------------------------------------------------
     7. COMPTEURS ANIMÉS (chiffres clés)
     ---------------------------------------------------------------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (Number.isNaN(target) || prefersReducedMotion || target < 2) {
      el.textContent = String(target);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = String(Math.round(easeOut(progress) * target));
      if (progress < 1) requestAnimationFrame(frame);
    }
    el.textContent = '0';
    requestAnimationFrame(frame);
  }

  const counters = $$('[data-count]');
  if (hasIO) {
    const countObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => countObserver.observe(c));
  }

  /* ----------------------------------------------------------------
     8. FILTRES DES PARCOURS (Tous / Rivières / Lacs)
     ---------------------------------------------------------------- */
  const filterButtons = $$('.filter');
  const spots = $$('.spot');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.filter;

      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      spots.forEach((spot) => {
        const show = type === 'all' || spot.dataset.type === type;
        spot.classList.toggle('is-hidden', !show);
        // Petite animation de réapparition
        if (show && !prefersReducedMotion) {
          spot.animate(
            [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
            { duration: 500, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
          );
        }
      });
    });
  });

  /* ----------------------------------------------------------------
     9. STATUT DE SAISON EN DIRECT + REPÈRE « AUJOURD'HUI »
     ---------------------------------------------------------------- */
  function updateSeason() {
    const today = startOfDay(new Date());
    const y = today.getFullYear();
    const { openMonth, openDay, closeMonth, closeDay } = CONFIG.season;

    const open = new Date(y, openMonth, openDay);
    const close = new Date(y, closeMonth, closeDay);
    const charpalOpen = new Date(y, CONFIG.charpal.openMonth, CONFIG.charpal.openDay);

    const isOpen = today >= open && today <= close;
    const nextOpen = today < open ? open : new Date(y + 1, openMonth, openDay);
    const charpalIsOpen = today >= charpalOpen;

    let longText;
    let shortText;

    if (isOpen) {
      const left = daysBetween(today, close);
      longText = `Ouvert : la truite se pêche en 1ère catégorie jusqu'au ${formatDate(close)}` +
        (left > 0 ? ` (encore ${left} jour${left > 1 ? 's' : ''}).` : ', dernier jour aujourd\'hui.');
      shortText = `Saison truite ouverte · jusqu'au ${closeDay} septembre`;
    } else {
      const wait = daysBetween(today, nextOpen);
      longText = `Fermé en 1ère catégorie. Réouverture de la truite le ${formatDate(nextOpen)} (dans ${wait} jour${wait > 1 ? 's' : ''}).`;
      if (charpalIsOpen) longText += ' Le lac de Charpal reste ouvert en no-kill jusqu\'au 31 décembre.';
      shortText = `Saison truite fermée · réouverture le ${openDay} mars ${nextOpen.getFullYear()}`;
    }

    const statusEl = $('[data-season-status]');
    if (statusEl) {
      statusEl.classList.toggle('is-open', isOpen);
      statusEl.classList.toggle('is-closed', !isOpen);
      const textEl = $('.season-status__text', statusEl);
      if (textEl) textEl.textContent = longText;
    }

    const shortEl = $('[data-season-status-short]');
    if (shortEl) shortEl.textContent = shortText;

    // Repère sur la timeline (fraction de l'année écoulée)
    const marker = $('[data-today-marker]');
    if (marker) {
      const startYear = new Date(y, 0, 1);
      const daysInYear = daysBetween(startYear, new Date(y + 1, 0, 1));
      const fraction = daysBetween(startYear, today) / daysInYear;
      marker.style.setProperty('--today', fraction.toFixed(4));
      marker.hidden = false;
      const label = $('.timeline__today-label', marker);
      if (label) label.textContent = `Aujourd'hui · ${today.getDate()} ${MONTHS[today.getMonth()].slice(0, 4)}.`;
    }
  }
  updateSeason();

  /* ----------------------------------------------------------------
     10. FORMULAIRES : validation accessible + envoi AJAX Netlify
     ---------------------------------------------------------------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Dates : impossible de réserver dans le passé, fin ≥ début
  const dateStart = $('#r-arrivee');
  const dateEnd = $('#r-depart');
  if (dateStart && dateEnd) {
    const t = new Date();
    const iso = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateStart.min = iso;
    dateEnd.min = iso;
    dateStart.addEventListener('change', () => {
      dateEnd.min = dateStart.value || iso;
      if (dateEnd.value && dateEnd.value < dateStart.value) dateEnd.value = dateStart.value;
    });
  }

  function setError(input, message) {
    const field = input.closest('.field');
    const errorEl = document.getElementById(`${input.id}-err`);
    if (field) field.classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) input.setAttribute('aria-describedby', errorEl.id);
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  function validateInput(input) {
    const value = (input.value || '').trim();

    if (input.type === 'checkbox') {
      if (input.required && !input.checked) return 'Merci de cocher cette case pour continuer.';
      return '';
    }
    if (input.required && !value) {
      if (input.tagName === 'SELECT') return 'Choisissez une option.';
      return 'Ce champ est obligatoire.';
    }
    if (value && input.type === 'email' && !EMAIL_RE.test(value)) {
      return 'Adresse e-mail invalide (ex. : prenom@exemple.fr).';
    }
    if (value && input.type === 'tel' && !/^[+\d][\d\s.\-()]{7,}$/.test(value)) {
      return 'Numéro de téléphone invalide.';
    }
    if (value && input.type === 'date' && input.min && value < input.min) {
      return 'Choisissez une date à venir.';
    }
    if (value && input.type === 'number') {
      const n = Number(value);
      if (Number.isNaN(n) || n < Number(input.min || 1) || n > Number(input.max || 99)) {
        return `Entre ${input.min} et ${input.max} pêcheurs.`;
      }
    }
    return '';
  }

  function encodeForm(form) {
    return new URLSearchParams(new FormData(form)).toString();
  }

  $$('form[data-ajax-form]').forEach((form) => {
    const inputs = $$('input:not([type="hidden"]):not([name="bot-field"]):not([type="radio"]), select, textarea', form);
    const feedback = $('.form__feedback', form);
    const submitBtn = $('button[type="submit"]', form);

    // Validation à la sortie du champ, puis en direct une fois l'erreur affichée
    inputs.forEach((input) => {
      input.addEventListener('blur', () => setError(input, validateInput(input)));
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') setError(input, validateInput(input));
      });
      input.addEventListener('change', () => {
        if (input.getAttribute('aria-invalid') === 'true') setError(input, validateInput(input));
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      feedback.className = 'form__feedback';
      feedback.textContent = '';

      let firstInvalid = null;
      inputs.forEach((input) => {
        const msg = validateInput(input);
        setError(input, msg);
        if (msg && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        feedback.classList.add('is-error');
        feedback.textContent = 'Merci de corriger les champs signalés.';
        return;
      }

      // En local (fichier ouvert directement), Netlify Forms n'est pas disponible
      if (location.protocol === 'file:') {
        feedback.classList.add('is-error');
        feedback.textContent = 'Le formulaire sera actif une fois le site en ligne sur Netlify.';
        return;
      }

      const originalLabel = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours…';

      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodeForm(form)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        form.reset();
        feedback.classList.add('is-success');
        feedback.textContent = form.name === 'reservation-guide'
          ? 'Merci, votre demande est bien partie. Réponse sous 48 h.'
          : 'Merci, votre message a bien été envoyé.';
      } catch (err) {
        feedback.classList.add('is-error');
        feedback.textContent = `L'envoi a échoué. Réessayez ou écrivez-nous à ${CONFIG.fallbackEmail}.`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
      }
    });
  });

  /* ----------------------------------------------------------------
     11. CHOIX D'UNE FORMULE → pré-remplit le formulaire de réservation
     ---------------------------------------------------------------- */
  const formuleSelect = $('#r-formule');
  $$('[data-pick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!formuleSelect) return;
      formuleSelect.value = btn.dataset.pick;
      setError(formuleSelect, '');

      const booking = $('#reservation');
      booking.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

      // Mise en évidence brève de la sélection, puis focus sur le premier champ
      if (!prefersReducedMotion) {
        formuleSelect.animate(
          [{ boxShadow: '0 0 0 0 rgba(201,161,91,0.8)' }, { boxShadow: '0 0 0 8px rgba(201,161,91,0)' }],
          { duration: 900, delay: 400 }
        );
      }
      setTimeout(() => $('#r-nom').focus({ preventScroll: true }), 600);
    });
  });

  /* ----------------------------------------------------------------
     12. CTA FLOTTANT MOBILE
     Visible après le hero, masqué quand le formulaire ou le footer est à l'écran.
     ---------------------------------------------------------------- */
  const floatingCta = $('[data-floating-cta]');
  if (floatingCta && hasIO) {
    const state = { hero: true, booking: false, footer: false };
    const update = () => {
      floatingCta.classList.toggle('is-visible', !state.hero && !state.booking && !state.footer);
    };
    const watch = (el, key) => {
      if (!el) return;
      new IntersectionObserver(([entry]) => {
        state[key] = entry.isIntersecting;
        update();
      }).observe(el);
    };
    watch($('.hero'), 'hero');
    watch($('#reservation'), 'booking');
    watch($('.site-footer'), 'footer');
  }

  /* ----------------------------------------------------------------
     13. IMAGES MANQUANTES → placeholder aux couleurs du site
     (utile tant que vos photos ne sont pas encore dans assets/images/)
     ---------------------------------------------------------------- */
  function markMissing(img) {
    img.classList.add('is-missing');
    const media = img.closest('.media');
    if (media) media.classList.add('is-missing');
  }
  $$('img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      markMissing(img);
    } else {
      img.addEventListener('error', () => markMissing(img), { once: true });
    }
  });

  /* ----------------------------------------------------------------
     14. BOÎTE DE DIALOGUE (mentions légales)
     ---------------------------------------------------------------- */
  $$('[data-open-dialog]').forEach((btn) => {
    const dialog = document.getElementById(btn.dataset.openDialog);
    if (!dialog || typeof dialog.showModal !== 'function') return;

    btn.addEventListener('click', () => dialog.showModal());

    // Fermeture : bouton ×, ou clic en dehors du contenu
    $$('[data-close-dialog]', dialog).forEach((c) => c.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  });

  /* ----------------------------------------------------------------
     15. ANNÉE DU FOOTER
     ---------------------------------------------------------------- */
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------------
     16. ANIMATIONS VECTORIELLES : lecture seulement quand elles sont visibles
     ---------------------------------------------------------------- */
  const animEls = $$('[data-anim]');
  if (hasIO) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-playing', entry.isIntersecting));
    }, { rootMargin: '120px 0px' });
    animEls.forEach((el) => animObserver.observe(el));
  } else {
    animEls.forEach((el) => el.classList.add('is-playing'));
  }

  /* ----------------------------------------------------------------
     17. PARALLAXE LÉGER sur les photos marquées data-parallax="facteur"
     ---------------------------------------------------------------- */
  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !prefersReducedMotion) {
    let ticking = false;

    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((img) => {
        const factor = parseFloat(img.dataset.parallax) || 0.1;
        const box = img.parentElement.getBoundingClientRect();
        if (box.bottom < -100 || box.top > vh + 100) return; // hors écran : on ne calcule rien

        let offset;
        if (img.closest('.hero')) {
          // Hero : l'image descend plus lentement que la page
          offset = window.scrollY * factor;
        } else {
          // Autres bandeaux : décalage autour du centre de l'écran, borné
          // par la marge disponible (l'image est agrandie à 118 % en CSS)
          const distance = (box.top + box.height / 2) - vh / 2;
          const limit = box.height * 0.08;
          offset = Math.max(-limit, Math.min(limit, -distance * factor));
        }
        img.style.setProperty('--py', `${offset.toFixed(1)}px`);
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', updateParallax);
    updateParallax();
  }
})();
