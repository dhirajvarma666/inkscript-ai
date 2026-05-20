document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════
     1.  CUSTOM INK-PEN CURSOR
     ══════════════════════════════ */
  const penEl   = document.getElementById('cursor-pen');
  const glowEl  = document.getElementById('cursor-glow');
  const inkCvs  = document.getElementById('ink-canvas');
  const inkCtx  = inkCvs.getContext('2d');

  let mx = -200, my = -200;   // raw mouse
  let tx = -200, ty = -200;   // lerped position for glow
  let trail = [];              // ink trail points

  function resizeInkCanvas () {
    inkCvs.width  = window.innerWidth;
    inkCvs.height = window.innerHeight;
  }
  resizeInkCanvas();
  window.addEventListener('resize', resizeInkCanvas);

  /* Track mouse */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;

    // Move the pen cursor element (sharp, no lag)
    penEl.style.left = mx + 'px';
    penEl.style.top  = my + 'px';

    // Spawn trail point
    trail.push({
      x: mx, y: my,
      r: Math.random() * 2.2 + 0.6,
      a: 0.55,
      hue: Math.round(Math.random() * 10) // slight hue variation
    });
    if (trail.length > 55) trail.shift();
  });

  /* Smooth glow follows with lag */
  function animateCursor () {
    tx += (mx - tx) * 0.14;
    ty += (my - ty) * 0.14;
    glowEl.style.left = tx + 'px';
    glowEl.style.top  = ty + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* Hover effect on interactive elements */
  document.querySelectorAll('a, button, .feat-card, .gal-card, .testi-card, .proc-item').forEach(el => {
    el.addEventListener('mouseenter', () => glowEl.classList.add('hovered'));
    el.addEventListener('mouseleave', () => glowEl.classList.remove('hovered'));
  });

  /* Draw ink trail */
  let splats = [];  // click splatter particles

  function renderInk () {
    inkCtx.clearRect(0, 0, inkCvs.width, inkCvs.height);

    // Trail
    for (let i = trail.length - 1; i >= 0; i--) {
      const p   = trail[i];
      const pct = i / trail.length;
      inkCtx.beginPath();
      inkCtx.arc(p.x, p.y, p.r * pct, 0, Math.PI * 2);
      inkCtx.fillStyle = `rgba(200, ${115 + p.hue}, 55, ${p.a * pct * 0.5})`;
      inkCtx.fill();
      p.a *= 0.96;
    }
    trail = trail.filter(p => p.a > 0.008);

    // Splats
    for (let i = splats.length - 1; i >= 0; i--) {
      const s = splats[i];
      inkCtx.beginPath();
      inkCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      inkCtx.fillStyle = `rgba(200, 130, 58, ${s.a})`;
      inkCtx.fill();
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.25;   // gravity
      s.a  *= 0.91;
      s.r  *= 0.97;
      if (s.a < 0.01 || s.r < 0.3) splats.splice(i, 1);
    }

    requestAnimationFrame(renderInk);
  }
  renderInk();

  /* Click → ink splatter */
  document.addEventListener('click', e => {
    const count = 10 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1;
      splats.push({
        x: e.clientX, y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        r: Math.random() * 4 + 1.5,
        a: 0.7
      });
    }
  });


  /* ══════════════════════════════
     2.  ANTIGRAVITY PARTICLES
     ══════════════════════════════ */
  const pCvs = document.getElementById('particles-canvas');
  const pCtx = pCvs.getContext('2d');

  function resizePCvs () {
    pCvs.width  = window.innerWidth;
    pCvs.height = window.innerHeight;
  }
  resizePCvs();
  window.addEventListener('resize', resizePCvs);

  class Particle {
    constructor (scatter) {
      this.reset(scatter);
    }

reset (scatter) {
  this.x =
    Math.random() * pCvs.width;
  /* spawn everywhere instead of bottom */
  this.y =
    Math.random() * pCvs.height;
  /* very slow floating */
  this.vy =
    -(Math.random() * 0.22 + 0.05);
  this.vx =
    (Math.random() - 0.5) * 0.12;
  this.size =
    Math.random() * 2.2 + 0.4;
  this.alpha =
    Math.random() * 0.22 + 0.04;
  this.decay =
    0.00022 + Math.random() * 0.00018;
  this.type =
    Math.random() < 0.7 ? 'circle' : 'drop';
  this.rot =
    Math.random() * Math.PI * 2;
  this.rotV =
    (Math.random() - 0.5) * 0.008;
  const palette = [
    [200,130,58],
    [224,156,88],
    [155,122,107],
    [196,169,125]
  ];
  this.col =
    palette[Math.floor(Math.random() * palette.length)];
}

    update () {
      this.x   += this.vx;
      this.y   += this.vy;
      this.rot += this.rotV;
      this.alpha -= this.decay;
      if (
  this.alpha < 0 ||
  this.y < -30 ||
  this.x < -30 ||
  this.x > pCvs.width + 30
){
  this.reset(false);
}
    }
    draw () {
      const [r, g, b] = this.col;
      pCtx.save();
      pCtx.globalAlpha = this.alpha;
      pCtx.translate(this.x, this.y);
      pCtx.rotate(this.rot);

      if (this.type === 'circle') {
        pCtx.beginPath();
        pCtx.arc(0, 0, this.size, 0, Math.PI * 2);
        pCtx.fillStyle = `rgb(${r},${g},${b})`;
        pCtx.fill();
      } else {
        // Ink-drop shape: circle + upward triangle
        pCtx.beginPath();
        pCtx.arc(0, 0, this.size, 0, Math.PI * 2);
        pCtx.fillStyle = `rgb(${r},${g},${b})`;
        pCtx.fill();
        pCtx.beginPath();
        pCtx.moveTo(0, -this.size);
        pCtx.lineTo( this.size * 0.55, -this.size * 2.4);
        pCtx.lineTo(-this.size * 0.55, -this.size * 2.4);
        pCtx.closePath();
        pCtx.fillStyle = `rgba(${r},${g},${b},0.7)`;
        pCtx.fill();
      }
      pCtx.restore();
    }
  }

  const PARTICLE_COUNT = 1000;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle(true));

  function animateParticles () {
    pCtx.clearRect(0, 0, pCvs.width, pCvs.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();


  /* ══════════════════════════════
     3.  NAVBAR SCROLL SHRINK
     ══════════════════════════════ */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });


  /* ══════════════════════════════
     4.  SCROLL REVEAL
     Uses IntersectionObserver to
     add class "in" to animated els
     ══════════════════════════════ */
  const revealTargets = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );
  const cardContainers = document.querySelectorAll(
    '.features-grid, .testi-grid, .gallery-grid, .process-grid, .morph-steps'
  );

  /* Individual elements */
  const singleObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        singleObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => singleObs.observe(el));

  /* Card grids – stagger children */
  const gridObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const cards = entry.target.querySelectorAll('.reveal-card');
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('in');
        }, i * 110);
      });
      gridObs.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  cardContainers.forEach(el => gridObs.observe(el));

  /* CTA box */
  const ctaObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        ctaObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.cta-box, .sec-divider').forEach(el => ctaObs.observe(el));

  /* Also catch bento cards */
  const bentoObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const cards = entry.target.querySelectorAll('.bento-card');
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('in'), i * 130);
      });
      bentoObs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.bento-grid, .bento-right').forEach(el => bentoObs.observe(el));


  /* ══════════════════════════════
     5.  GALLERY CANVAS ART
     Draw calligraphic text inside
     each gallery card image area
     ══════════════════════════════ */
  const galCanvases = document.querySelectorAll('.gal-canvas');

  const galStyles = {
    architect: {
      lines: ['—————', '— — —', '─────'],
      font: '500 18px "Josefin Sans", sans-serif',
      color: 'rgba(196,169,125,0.45)',
      subText: null,
      shadow: 'rgba(200,130,58,0.2)'
    },
    scholar: {
      lines: ['sssssttt', 'wwwwww', 'gggggg'],
      font: 'italic 22px "Cormorant Garamond", serif',
      color: 'rgba(224,156,88,0.55)',
      shadow: 'rgba(200,130,58,0.3)'
    },
    modern: {
      lines: ['InkScript'],
      font: 'bold italic 28px "Playfair Display", serif',
      color: 'rgba(240,210,160,0.6)',
      shadow: 'rgba(200,130,58,0.5)'
    },
    historian: {
      lines: ['Quill & Ink', 'Anno 1842'],
      font: 'italic 16px "Cormorant Garamond", serif',
      color: 'rgba(196,169,125,0.5)',
      shadow: 'rgba(155,122,107,0.3)'
    }
  };

  galCanvases.forEach(cvs => {
    const style = galStyles[cvs.dataset.style];
    if (!style) return;
    cvs.width  = 400;
    cvs.height = 220;
    const ctx = cvs.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 400, 220);
    if (cvs.dataset.style === 'scholar') {
      grad.addColorStop(0, '#2a1a08');
      grad.addColorStop(1, '#3d2510');
    } else if (cvs.dataset.style === 'modern') {
      grad.addColorStop(0, '#100b04');
      grad.addColorStop(1, '#1e1208');
    } else if (cvs.dataset.style === 'historian') {
      grad.addColorStop(0, '#1a1206');
      grad.addColorStop(1, '#100c04');
    } else {
      grad.addColorStop(0, '#1c1008');
      grad.addColorStop(1, '#2e1d0a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 220);

    // Texture dots (subtle)
    for (let i = 0; i < 80; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * 400,
        Math.random() * 220,
        Math.random() * 1.2, 0, Math.PI * 2
      );
      ctx.fillStyle = 'rgba(200,130,58,0.08)';
      ctx.fill();
    }

    // Lines
    ctx.font = style.font;
    ctx.textAlign = 'center';
    ctx.shadowColor = style.shadow;
    ctx.shadowBlur  = 14;

    const startY = 220 / 2 - ((style.lines.length - 1) * 32) / 2;
    style.lines.forEach((line, i) => {
      ctx.fillStyle = style.color;
      ctx.fillText(line, 200, startY + i * 34);
    });

    // Decorative underline for modern slate
    if (cvs.dataset.style === 'modern') {
      ctx.beginPath();
      ctx.moveTo(120, startY + 22);
      ctx.lineTo(280, startY + 22);
      ctx.strokeStyle = 'rgba(200,130,58,0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Horizontal ruled lines for architect
    if (cvs.dataset.style === 'architect') {
      ctx.shadowBlur = 0;
      for (let y = 40; y < 200; y += 28) {
        ctx.beginPath();
        ctx.moveTo(20, y); ctx.lineTo(380, y);
        ctx.strokeStyle = 'rgba(200,130,58,0.1)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  });


  /* ══════════════════════════════
     6.  TYPING PREVIEW ANIMATION
     Animate the preview window
     script text with a typewriter
     ══════════════════════════════ */
  const previewArea = document.getElementById('typing-preview');
  if (previewArea) {
    const lines = ['Heading\n', 'Yarday'];
    let lineIdx = 0, charIdx = 0;
    let isForward = true, isPaused = false;

    const scriptLines = previewArea.querySelectorAll('.script-line');

    function typeLoop () {
      if (isPaused) { setTimeout(typeLoop, 1400); return; }

      const full   = lines[lineIdx];
      const target = scriptLines[lineIdx];
      if (!target) return;

      if (isForward) {
        charIdx++;
        target.textContent = full.slice(0, charIdx);
        if (charIdx >= full.length) {
          if (lineIdx < lines.length - 1) {
            lineIdx++;
            charIdx = 0;
            setTimeout(typeLoop, 500);
          } else {
            isPaused = true;
            setTimeout(() => {
              isPaused = false;
              isForward = false;
              setTimeout(typeLoop, 80);
            }, 2400);
          }
        } else {
          setTimeout(typeLoop, 85 + Math.random() * 50);
        }
      } else {
        // Erase
        const t = scriptLines[lineIdx];
        if (charIdx > 0) { t.textContent = lines[lineIdx].slice(0, --charIdx); }
        else if (lineIdx > 0) { lineIdx--; charIdx = lines[lineIdx].length; }
        else {
          isForward = true;
          charIdx = 0;
          scriptLines.forEach(l => l.textContent = '');
        }
        setTimeout(typeLoop, 45);
      }
    }

    // Start after a short delay
    setTimeout(typeLoop, 2000);
  }


  /* ══════════════════════════════
     7.  SMOOTH SECTION ENTRANCE
     Add staggered slide to hero
     elements already handled by
     CSS keyframes; this triggers
     process-line draw animation
     ══════════════════════════════ */
  const processLine = document.querySelector('.process-line');
  if (processLine) {
    const lineObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        processLine.style.transition = 'width 1.2s 0.3s cubic-bezier(0.16,1,.3,1)';
        processLine.style.transformOrigin = 'left center';
        processLine.style.animation = 'lineGrow 1.2s 0.3s cubic-bezier(0.16,1,.3,1) both';
        lineObs.unobserve(processLine);
      }
    }, { threshold: 0.5 });
    lineObs.observe(processLine);
  }

  /* CSS keyframe for process line */
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes lineGrow {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    .process-line { transform-origin: left; animation: lineGrow 1.2s .3s both; }
    
    /* Bento card base state */
    .bento-card {
      opacity: 0;
      transform: translateY(44px);
      transition: opacity .8s var(--ease-out-expo), transform .8s var(--ease-out-expo),
                  border-color .3s, box-shadow .3s;
    }
    .bento-card.in {
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Gallery featured card slightly lifted already */
    .gal-featured.in {
      transform: translateY(-12px) scale(1.018) !important;
    }
    .gal-featured:hover {
      transform: translateY(-18px) scale(1.03) !important;
    }
  `;
  document.head.appendChild(styleTag);


  /* ══════════════════════════════
     8.  MOBILE: disable custom
     cursor on touch devices
     ══════════════════════════════ */
  if ('ontouchstart' in window) {
    penEl.style.display  = 'none';
    glowEl.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

});


  /* YOUR EXISTING JS ABOVE */


  /* ══════════════════════════════
     DARKER PARTICLES
     ══════════════════════════════ */

  const originalPalette = [
    [90, 55, 20],
    [60, 38, 12],
    [110, 70, 30],
    [40, 25, 8]
  ];


  /* ══════════════════════════════
     SCHOLAR CARD FIX
     ══════════════════════════════ */

  document.querySelectorAll('.gal-card').forEach(card => {
    card.style.transform = 'translateY(0)';
  });


  /* ══════════════════════════════
     FLYING PAGES ON SCROLL
     ══════════════════════════════ */

  const flyingWrap = document.getElementById('flying-pages-wrap');

  let pagesTriggered = false;

  window.addEventListener('scroll', () => {

    const scrollY = window.scrollY;
    const triggerPoint = window.innerHeight * 2.8;

    if (scrollY > triggerPoint && !pagesTriggered) {

      pagesTriggered = true;

      flyingWrap.classList.add('active');

      setTimeout(() => {
        flyingWrap.classList.remove('active');
      }, 4200);

    }

  });


  /* ══════════════════════════════
     MORE REALISTIC PEN ROTATION
     ══════════════════════════════ */

  let lastX = 0;

  document.addEventListener('mousemove', e => {

    const dx = e.clientX - lastX;
    lastX = e.clientX;

    const rotate = Math.max(
      -35,
      Math.min(15, dx * 0.8)
    );

    const pen = document.getElementById('cursor-pen');

    pen.style.transform =
      `translate(-7px,-54px) rotate(${rotate - 20}deg)`;

  });
