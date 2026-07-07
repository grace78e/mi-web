/* ==========================================================
   ASA-FLM — Interactividad Vanilla JS
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────────
     1. NAVBAR — clase .solid cuando el hero sale del viewport
  ────────────────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const heroEl = document.getElementById('inicio');

  function updateNavbar(){
    const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
    if(heroBottom <= 70){
      navbar.classList.add('solid');
    } else {
      navbar.classList.remove('solid');
    }
  }
  window.addEventListener('scroll', updateNavbar, { passive:true });
  updateNavbar();

  /* ──────────────────────────────────────────────────────────
     2. MENÚ HAMBURGUESA (MÓVIL)
  ────────────────────────────────────────────────────────── */
  const navToggle  = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu(){
    navToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  function toggleMobileMenu(){
    const isOpen = mobileMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  navToggle.addEventListener('click', toggleMobileMenu);

  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', closeMobileMenu)
  );

  window.addEventListener('resize', () => {
    if(window.innerWidth > 860) closeMobileMenu();
  });

  /* ──────────────────────────────────────────────────────────
     3. LINK ACTIVO en la navbar según sección visible
  ────────────────────────────────────────────────────────── */
  const sections   = document.querySelectorAll('section[id], header[id]');
  const navLinkEls = document.querySelectorAll('.nav-links .nav-link');

  function updateActiveLink(){
    let current = 'inicio';
    sections.forEach(sec => {
      if(sec.getBoundingClientRect().top <= 100) current = sec.id;
    });
    navLinkEls.forEach(link => {
      link.classList.toggle('active',
        link.getAttribute('href') === `#${current}`
      );
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive:true });
  updateActiveLink();

  /* ──────────────────────────────────────────────────────────
     4. PARALLAX SUAVE en la imagen del hero
  ────────────────────────────────────────────────────────── */
  const heroBg = document.querySelector('.hero-bg-image');

  function parallax(){
    if(!heroBg) return;
    const y = window.scrollY;
    
    if (y <= 0) {
      heroBg.style.transform = 'translateY(0px)';
      return;
    }
    
    if(y < window.innerHeight * 1.2){
      heroBg.style.transform = `translateY(${y * 0.25}px)`;
    }
  }
  window.addEventListener('scroll', parallax, { passive:true });
  parallax();

  /* ──────────────────────────────────────────────────────────
     5. SISTEMA DE ANIMACIONES DIRECCIONALES FLUIDAS (Mover Izq / Der)
  ────────────────────────────────────────────────────────── */
  const animElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up');

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const target = entry.target;
      const parent = target.parentElement;
      
      // Encontrar elementos hermanos pendientes de animar en el mismo bloque
      const siblings = Array.from(parent.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-up:not(.visible)'));
      const index = siblings.indexOf(target);
      
      // Ráfaga limpia de 50ms para un comportamiento dinámico y rápido
      const delay = index >= 0 ? Math.min(index * 50, 200) : 0;

      setTimeout(() => {
        target.classList.add('visible');
        
        // Soporte exclusivo si el Banner de Galápagos usa estas transiciones
        if (target.classList.contains('animated-banner')) {
          animateGalapagosInner(target);
        }
      }, delay);

      animObserver.unobserve(target);
    });
  }, { 
    threshold: 0.05, 
    rootMargin: '0px 0px -30px 0px'
  });

  animElements.forEach(el => animObserver.observe(el));

  /**
   * Micro-animaciones internas para los componentes hijos de Galápagos
   */
  function animateGalapagosInner(bannerEl) {
    const badge = bannerEl.querySelector('.galapagos-badge');
    const title = bannerEl.querySelector('h3');
    const text = bannerEl.querySelector('p');
    const routes = bannerEl.querySelectorAll('.route-tag');

    const items = [badge, title, text, ...routes];
    items.forEach(item => {
      if(item) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)'; // Entrada lateral interna fresca
        item.style.transition = 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)';
      }
    });

    items.forEach((item, i) => {
      if(item) {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        }, 120 + (i * 50));
      }
    });
  }

  /* ──────────────────────────────────────────────────────────
     6. CONTADOR ANIMADO — Stats Strip
  ────────────────────────────────────────────────────────── */
  const counters = document.querySelectorAll('.stat-num');

  function animateCounter(el){
    const target    = +el.dataset.target;
    const duration  = 1800; 
    const frameTime = 16;   
    const increment = target / (duration / frameTime);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if(current >= target){
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, frameTime);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold:0.6 });

  counters.forEach(c => statsObserver.observe(c));

  /* ──────────────────────────────────────────────────────────
     7. BOTÓN FLOTANTE WHATSAPP & INTERCEPTOR DE CLICS DEL MENÚ
  ────────────────────────────────────────────────────────── */
  const waFloat  = document.getElementById('waFloat');
  const waBubble = document.getElementById('waBubble');

  function handleWaScroll(){
    if(waFloat) waFloat.classList.toggle('visible', window.scrollY > 300);
  }
  window.addEventListener('scroll', handleWaScroll, { passive:true });
  handleWaScroll();

  let bubbleShown = false;
  setTimeout(() => {
    if(!bubbleShown && waFloat && waFloat.classList.contains('visible')){
      waBubble.classList.add('show');
      bubbleShown = true;
      setTimeout(() => waBubble.classList.remove('show'), 6000);
    }
  }, 5000);

  if(waFloat){
    waFloat.addEventListener('mouseenter', () => {
      if(waBubble) waBubble.classList.add('show');
      bubbleShown = true;
    });
    waFloat.addEventListener('mouseleave', () => {
      setTimeout(() => { if(waBubble) waBubble.classList.remove('show'); }, 1600);
    });
  }

  // Interceptor global de clics para transiciones fluidas de los links
  const allNavLinks = document.querySelectorAll('.nav-links a, .mobile-menu a, .hero-actions a');

  allNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          const navbarHeight = document.getElementById('navbar').offsetHeight || 70;
          const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Reiniciar ráfaga lateral al llegar por clic
          const sectionAnims = targetSection.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up');
          sectionAnims.forEach((el, index) => {
            el.classList.remove('visible');
            setTimeout(() => {
              el.classList.add('visible');
            }, 60 + (index * 40)); 
          });
        }
      }
    });
  });

}); // Fin seguro del DOMContentLoaded
