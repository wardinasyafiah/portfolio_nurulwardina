const galleries = {
  project01: [
    { src: 'assets/img-004.png', title: 'MS Barbershop — Home Page' },
    { src: 'assets/img-006.png', title: 'MS Barbershop — Create Account' },
    { src: 'assets/img-007.png', title: 'MS Barbershop — Login' },
    { src: 'assets/img-008.png', title: 'MS Barbershop — Book Appointment' },
    { src: 'assets/img-005.png', title: 'MS Barbershop — My Bookings' }
  ],
  project02: [
    { src: 'assets/img-009.png', title: 'MR Playground — Home Page' },
    { src: 'assets/img-010.png', title: 'MR Playground — About / Solutions' },
    { src: 'assets/img-011.png', title: 'MR Playground — Services' },
    { src: 'assets/img-012.png', title: 'MR Playground — Gallery' },
    { src: 'assets/img-013.png', title: 'MR Playground — Contact' }
  ]
};

const lightbox = document.getElementById('lightbox');
const image = document.getElementById('lightbox-image');
const caption = document.getElementById('lightbox-caption');
const count = document.getElementById('lightbox-count');
const thumbs = document.getElementById('gallery-thumbs');
const galleryStage = document.getElementById('gallery-stage');
let activeGallery = [];
let activeIndex = 0;
let lastFocusedElement = null;

function buildThumbnails() {
  thumbs.innerHTML = '';
  activeGallery.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-thumb';
    button.setAttribute('aria-label', `View image ${index + 1}`);
    button.innerHTML = `<img src="${item.src}" alt="" loading="lazy">`;
    button.addEventListener('click', () => renderGallery(index));
    thumbs.appendChild(button);
  });
}

function updateThumbState() {
  [...thumbs.children].forEach((button, index) => {
    button.classList.toggle('active', index === activeIndex);
    button.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
  });
  const current = thumbs.children[activeIndex];
  current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function renderGallery(index, direction = null) {
  const oldIndex = activeIndex;
  activeIndex = (index + activeGallery.length) % activeGallery.length;
  const item = activeGallery[activeIndex];

  image.classList.remove('slide-next', 'slide-prev');
  void image.offsetWidth;
  if (activeGallery.length > 1 && oldIndex !== activeIndex) {
    const resolvedDirection = direction || (activeIndex > oldIndex ? 'next' : 'prev');
    image.classList.add(resolvedDirection === 'next' ? 'slide-next' : 'slide-prev');
  }

  image.src = item.src;
  image.alt = item.title;
  caption.textContent = item.title;
  count.textContent = `${activeIndex + 1} / ${activeGallery.length}`;
  updateThumbState();
}

function openGallery(name) {
  activeGallery = galleries[name] || [];
  if (!activeGallery.length) return;
  lastFocusedElement = document.activeElement;
  buildThumbnails();
  renderGallery(0);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  document.querySelector('.lightbox-close').focus();
}

function closeGallery() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  image.src = '';
  thumbs.innerHTML = '';
  lastFocusedElement?.focus?.();
}

function moveGallery(step) {
  renderGallery(activeIndex + step, step > 0 ? 'next' : 'prev');
}

document.querySelectorAll('[data-gallery]').forEach(button => {
  button.addEventListener('click', () => openGallery(button.dataset.gallery));
});
document.querySelector('.lightbox-close').addEventListener('click', closeGallery);
document.querySelector('.lightbox-prev').addEventListener('click', () => moveGallery(-1));
document.querySelector('.lightbox-next').addEventListener('click', () => moveGallery(1));

lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeGallery();
});

let pointerStartX = null;
let pointerStartY = null;
let isDraggingGallery = false;
galleryStage.addEventListener('pointerdown', event => {
  pointerStartX = event.clientX;
  pointerStartY = event.clientY;
  isDraggingGallery = false;
  galleryStage.classList.add('dragging');
  galleryStage.setPointerCapture?.(event.pointerId);
});
galleryStage.addEventListener('pointermove', event => {
  if (pointerStartX === null) return;
  const dx = event.clientX - pointerStartX;
  const dy = event.clientY - pointerStartY;
  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) isDraggingGallery = true;
});
galleryStage.addEventListener('pointerup', event => {
  if (pointerStartX === null) return;
  const dx = event.clientX - pointerStartX;
  galleryStage.classList.remove('dragging');
  if (isDraggingGallery && Math.abs(dx) > 50) moveGallery(dx < 0 ? 1 : -1);
  pointerStartX = null;
  pointerStartY = null;
  isDraggingGallery = false;
});
galleryStage.addEventListener('pointercancel', () => {
  pointerStartX = null;
  pointerStartY = null;
  isDraggingGallery = false;
  galleryStage.classList.remove('dragging');
});

document.addEventListener('keydown', event => {
  if (!lightbox.classList.contains('open')) return;
  if (event.key === 'Escape') closeGallery();
  if (event.key === 'ArrowLeft') moveGallery(-1);
  if (event.key === 'ArrowRight') moveGallery(1);
});

// Active navigation and scroll progress.
const navLinks = [...document.querySelectorAll('.quick-nav a')];
const sections = [...document.querySelectorAll('.page, .project-page')];
const progressBar = document.getElementById('progress-bar');
const backTop = document.getElementById('back-top');
const header = document.getElementById('site-header');

const navObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
}, { threshold: [0.25, 0.5, 0.75] });
sections.forEach(section => navObserver.observe(section));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.08 });
sections.forEach(section => revealObserver.observe(section));

let ticking = false;
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    backTop.classList.toggle('show', window.scrollY > window.innerHeight * .7);

    const currentY = window.scrollY;
    if (currentY > lastScrollY && currentY > 120 && !lightbox.classList.contains('open')) header.classList.add('hidden');
    if (currentY < lastScrollY) header.classList.remove('hidden');
    lastScrollY = currentY;
    ticking = false;
  });
}, { passive: true });

backTop.addEventListener('click', () => document.getElementById('home').scrollIntoView({ behavior: 'smooth' }));

// Keep internal navigation reliable after hash changes.
window.addEventListener('hashchange', () => {
  const target = document.querySelector(window.location.hash);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Avoid accidental navigation when a project hotspot is activated by keyboard while hidden behind artwork.
document.querySelectorAll('.hotspot, .page-arrow').forEach(el => {
  el.addEventListener('click', () => {
    document.body.classList.remove('no-scroll');
  });
});

/* =========================================================
   Creative interaction layer
   ========================================================= */
(function () {
  const loader = document.getElementById('intro-loader');

  // Let the artwork load first, then dissolve the intro into the portfolio.
  const finishLoader = () => {
    window.setTimeout(() => loader?.classList.add('is-done'), 850);
  };
  if (document.readyState === 'complete') finishLoader();
  else window.addEventListener('load', finishLoader, { once: true });

  // Minimal cursor point: follows the actual pointer without drawing a ring over content.
  const cursorPoint = document.createElement('div');
  cursorPoint.className = 'cursor-point';
  cursorPoint.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursorPoint);

  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      cursorPoint.style.left = `${event.clientX}px`;
      cursorPoint.style.top = `${event.clientY}px`;
      cursorPoint.classList.add('visible');
    }, { passive: true });
    window.addEventListener('pointerleave', () => cursorPoint.classList.remove('visible'));
  }

  // Add a small amount of pointer parallax to the project preview frame only.
  // The actual image is never edited; only its containing frame moves.
  document.querySelectorAll('.project-image-frame').forEach((frame) => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    frame.addEventListener('pointermove', (event) => {
      const rect = frame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      frame.style.transform = `perspective(1100px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.2).toFixed(2)}deg) translateY(-3px)`;
    });
    frame.addEventListener('pointerleave', () => {
      frame.style.transform = '';
    });
  });
})();
