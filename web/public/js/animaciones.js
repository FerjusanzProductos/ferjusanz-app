// Movimiento de la web (GSAP + ScrollTrigger + Lenis, servidos desde la propia web).
// Solo corre si el visitante no ha pedido «reducir movimiento» (la clase js-anim la pone el <head>).
(() => {
  const html = document.documentElement;
  if (!html.classList.contains('js-anim') || !window.gsap || !window.ScrollTrigger) { html.classList.remove('js-anim'); return; }
  gsap.registerPlugin(ScrollTrigger);
  const suave = 'power3.out';

  // Scroll suave con rueda de ratón (en el móvil Lenis deja el scroll nativo del dedo).
  if (window.Lenis) {
    const lenis = new Lenis({ anchors: { offset: -90 }, lerp: 0.12 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Portada: el titular entra palabra a palabra, y luego lo demás.
  const h1 = document.querySelector('.heroe h1');
  if (h1) {
    h1.setAttribute('aria-label', h1.textContent);
    h1.innerHTML = h1.textContent.trim().split(/\s+/).map(p => `<span class="palabra" aria-hidden="true"><span>${p}</span></span>`).join(' ');
    gsap.timeline({ defaults: { ease: suave } })
      .from('.heroe .antetitulo', { autoAlpha: 0, y: 12, duration: 0.5 })
      .from('.heroe h1 .palabra > span', { yPercent: 110, duration: 0.8, stagger: 0.06 }, '-=0.25')
      .from('.heroe .entradilla, .heroe-acciones, .heroe-nota', { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.1 }, '-=0.5');
    // La foto de fondo baja un poco más despacio que el texto al hacer scroll.
    gsap.to('.heroe', { '--py': '18%', ease: 'none', scrollTrigger: { trigger: '.heroe', start: 'top top', end: 'bottom top', scrub: true } });
  }

  // Cifras: cuentan desde cero la primera vez que se ven.
  document.querySelectorAll('.cifras strong').forEach(el => {
    const m = el.textContent.match(/^(\D*)(\d+)(.*)$/);
    if (!m || +m[2] < 10) return;
    const n = { v: 0 };
    gsap.to(n, { v: +m[2], duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = m[1] + Math.round(n.v) + m[3]; } });
  });

  // Fotos del puesto: se destapan de abajo arriba, una detrás de otra.
  const fotos = gsap.utils.toArray('.mosaico a');
  if (fotos.length) gsap.from(fotos, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.9, ease: 'power4.out', stagger: 0.08,
    scrollTrigger: { trigger: '.mosaico', start: 'top 80%', once: true }, onComplete: () => gsap.set(fotos, { clearProps: 'clipPath' }) });

  // Todo lo demás aparece suave al llegar con el scroll (tarjetas en cascada).
  const SEL = '.bloque-cabeza, .dolor, .producto, .sector, .articulo, .novedad, .pasos li, .preguntas details, .historia-in > div, .pedir-in > div, .texto > *, .titular-in > div';
  const mostrar = els => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.7, ease: suave, stagger: 0.08, overwrite: true,
    onComplete: () => els.forEach(e => { e.classList.add('visto'); gsap.set(e, { clearProps: 'all' }); }) });
  const todos = gsap.utils.toArray(SEL).filter(e => !e.closest('.heroe'));
  const yaVistos = todos.filter(e => e.getBoundingClientRect().top < innerHeight * 0.92);
  gsap.set(todos, { y: 28 });
  if (yaVistos.length) mostrar(yaVistos);
  ScrollTrigger.batch(todos.filter(e => !yaVistos.includes(e)), { start: 'top 92%', once: true, onEnter: mostrar });
  // Seguro: si algo se quedara sin aparecer (p. ej. al saltar a un ancla), se enseña igual.
  const repaso = () => { const quedan = todos.filter(e => !e.classList.contains('visto') && e.getBoundingClientRect().top < innerHeight); if (quedan.length) mostrar(quedan); };
  ScrollTrigger.addEventListener('scrollEnd', repaso);
  setTimeout(repaso, 2500);
})();
