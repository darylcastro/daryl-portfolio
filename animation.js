// ══════════════════════════════════════════════════════
//  animation.js — Unified lightbox for about + gallery + project
// ═════════════════════════════════════════════════════

// ── Inject shared button & counter styles ──
const style = document.createElement('style');
style.textContent = `
  #lightbox-prev,
  #lightbox-next {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0,0,0,0.55);
    color: #fff;
    border: 2px solid rgba(255,255,255,0.35);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 1.4rem;
    cursor: pointer;
    z-index: 10001;
    display: none;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, border-color 0.2s;
    line-height: 1;
  }
  #lightbox-prev { left: 16px; }
  #lightbox-next { right: 16px; }
  #lightbox-prev:hover,
  #lightbox-next:hover {
    background: rgba(255,255,255,0.2);
    border-color: #fff;
  }
  #lightbox.open #lightbox-prev,
  #lightbox.open #lightbox-next { display: flex; }

  #lightbox-counter {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255,255,255,0.8);
    font-family: sans-serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    z-index: 10001;
    display: none;
    pointer-events: none;
  }
  #lightbox.open #lightbox-counter { display: block; }

  #lightbox-img {
    transition: opacity 0.32s ease, transform 0.36s cubic-bezier(0.34,1.56,0.64,1);
  }
  #lb-img {
    transition: opacity 0.32s ease, transform 0.36s cubic-bezier(0.34,1.56,0.64,1);
  }
`;
document.head.appendChild(style);

// ══════════════════════════════════════════════════════
//  ABOUT PAGE  (uses #lightbox, #lightbox-img, .img-cell)
// ══════════════════════════════════════════════════════
(function initAbout() {
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn    = document.getElementById('lightbox-close');
  if (!lightbox || !lightboxImg || !closeBtn) return;

  const allImgs = Array.from(document.querySelectorAll('.img-cell img'));
  let current = 0;

  const prevBtn = document.createElement('button');
  prevBtn.id = 'lightbox-prev';
  prevBtn.innerHTML = '&#8592;';
  prevBtn.setAttribute('aria-label', 'Previous');

  const nextBtn = document.createElement('button');
  nextBtn.id = 'lightbox-next';
  nextBtn.innerHTML = '&#8594;';
  nextBtn.setAttribute('aria-label', 'Next');

  const counter = document.createElement('div');
  counter.id = 'lightbox-counter';

  lightbox.appendChild(prevBtn);
  lightbox.appendChild(nextBtn);
  lightbox.appendChild(counter);

  function showImage(isOpen) {
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = isOpen ? 'scale(0.5)' : 'scale(0.82)';
    lightboxImg.src = allImgs[current].src;
    lightboxImg.alt = allImgs[current].alt || ('Photo ' + (current + 1));
    counter.textContent = (current + 1) + ' / ' + allImgs.length;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }));
  }

  allImgs.forEach((img, idx) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      current = idx;
      showImage(true);
      lightbox.classList.remove('closing');
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.6)';
    lightbox.classList.add('closing');
    setTimeout(() => {
      lightbox.classList.remove('open', 'closing');
      lightboxImg.src = '';
      lightboxImg.style.opacity = '';
      lightboxImg.style.transform = '';
      document.body.style.overflow = '';
    }, 300);
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + allImgs.length) % allImgs.length;
    showImage(false);
  });
  nextBtn.addEventListener('click', () => {
    current = (current + 1) % allImgs.length;
    showImage(false);
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  { current = (current - 1 + allImgs.length) % allImgs.length; showImage(false); }
    if (e.key === 'ArrowRight') { current = (current + 1) % allImgs.length; showImage(false); }
  });

  let touchX = 0;
  lightbox.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchX;
    if (Math.abs(dx) > 50) {
      current = dx < 0
        ? (current + 1) % allImgs.length
        : (current - 1 + allImgs.length) % allImgs.length;
      showImage(false);
    }
  });
})();


// ══════════════════════════════════════════════════════
//  GALLERY PAGE  (uses #lightbox, #lb-img, .photo-cell)
// ══════════════════════════════════════════════════════
(function initGallery() {
  const lightbox   = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lb-img');
  const lbClose    = document.getElementById('lb-close');
  const lbPrev     = document.getElementById('lb-prev');
  const lbNext     = document.getElementById('lb-next');
  const lbCounter  = document.getElementById('lb-counter');
  const lbBackdrop = document.getElementById('lb-backdrop');
  if (!lightbox || !lbImg || !lbClose) return;

  const allImgs = Array.from(document.querySelectorAll('.photo-cell img'));
  let current = 0;

  function showImage(isOpen) {
    lbImg.style.opacity = '0';
    lbImg.style.transform = isOpen ? 'scale(0.5)' : 'scale(0.82)';
    lbImg.src = allImgs[current].src;
    lbImg.alt = allImgs[current].alt || ('Photo ' + (current + 1));
    if (lbCounter) lbCounter.textContent = (current + 1) + ' / ' + allImgs.length;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      lbImg.style.opacity = '1';
      lbImg.style.transform = 'scale(1)';
    }));
  }

  document.querySelectorAll('.photo-cell').forEach((cell, idx) => {
    cell.style.cursor = 'pointer';
    cell.addEventListener('click', () => {
      current = idx;
      showImage(true);
      lightbox.classList.remove('closing');
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lbImg.style.opacity = '0';
    lbImg.style.transform = 'scale(0.6)';
    lightbox.classList.add('closing');
    setTimeout(() => {
      lightbox.classList.remove('open', 'closing');
      lbImg.src = '';
      lbImg.style.opacity = '';
      lbImg.style.transform = '';
      document.body.style.overflow = '';
    }, 300);
  }

  lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);

  if (lbPrev) lbPrev.addEventListener('click', () => {
    current = (current - 1 + allImgs.length) % allImgs.length;
    showImage(false);
  });
  if (lbNext) lbNext.addEventListener('click', () => {
    current = (current + 1) % allImgs.length;
    showImage(false);
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  { current = (current - 1 + allImgs.length) % allImgs.length; showImage(false); }
    if (e.key === 'ArrowRight') { current = (current + 1) % allImgs.length; showImage(false); }
  });

  let touchX = 0;
  lightbox.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchX;
    if (Math.abs(dx) > 50) {
      current = dx < 0
        ? (current + 1) % allImgs.length
        : (current - 1 + allImgs.length) % allImgs.length;
      showImage(false);
    }
  });
})();

// ══════════════════════════════════════════════════════
//  CONTACT PAGE — staggered row slide-in animation
// ══════════════════════════════════════════════════════
(function initContact() {
  const rows = document.querySelectorAll('.contact-page .contact-row');
  if (!rows.length) return;

  // Stagger each row appearing one after the other
  rows.forEach((row, idx) => {
    setTimeout(() => {
      row.classList.add('visible');
    }, 120 + idx * 110);
  });
})();