// Vintage Minimalist Greeting Card - Application Orchestrator
// Powered by StPageFlip Canvas Bézier Deformation Engine (identical to reference flipbook)

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const waxSeal = document.getElementById('wax-seal');
  const cardStage = document.getElementById('card-stage-container');
  const flipbookWrapper = document.getElementById('flipbook-centering-wrapper');
  const flipbookEl = document.getElementById('card-flipbook');
  const statusText = document.getElementById('status-text');

  // Toolbar References
  const btnToggleCard = document.getElementById('btn-toggle-card');
  const toggleCardIcon = document.getElementById('toggle-card-icon');
  const toggleCardLabel = document.getElementById('toggle-card-label');
  const btnViewBack = document.getElementById('btn-view-back');
  const viewBackLabel = document.getElementById('view-back-label');
  const btnReplay = document.getElementById('btn-replay');
  const btnSound = document.getElementById('btn-sound-toggle');
  const btnMusic = document.getElementById('btn-music-toggle');

  let pageFlip = null;
  let pageImages = [];
  let isUnboxing = false;

  function setStatus(text) {
    if (statusText) statusText.innerText = text;
  }

  // ==========================================================================
  // 1. INITIALIZE StPageFlip CANVAS ENGINE (AUTHENTIC BOOK-STYLE PEELING & CURL)
  // ==========================================================================

  function initFlipbook() {
    if (pageFlip) {
      try { pageFlip.destroy(); } catch (e) {}
      pageFlip = null;
    }

    // Clean mount element
    flipbookEl.innerHTML = '';

    // Render crisp 2x retina page textures
    const renderer = new window.CardPageRenderer(320, 460, 2);
    pageImages = renderer.renderAll();

    pageFlip = new St.PageFlip(flipbookEl, {
      width: 320,
      height: 460,
      size: "fixed",
      showCover: true,
      drawShadow: true,
      maxShadowOpacity: 0.85,
      showPageCorners: true,
      useMouseEvents: true,
      swipeDistance: 15,
      flippingTime: 750,
      mobileScrollSupport: false
    });

    // Load from high-resolution images: this triggers StPageFlip's Canvas 2D
    // Bézier mesh deformation engine (corner peeling, soft paper flex, and curvature)
    pageFlip.loadFromImages(pageImages);

    // Dynamic Centering & State Synchronization
    pageFlip.on('flip', (e) => {
      const pageIndex = e.data;
      updateCentering(pageIndex);
      updateToolbar(pageIndex);
    });

    // Tactile procedural paper rustle on any page turn
    pageFlip.on('changeState', (e) => {
      if (e.data === 'flipping' && window.cardAudio) {
        window.cardAudio.playPaperFlip(1.0);
      }
    });

    // Initial position: Page 0 is Front Cover (shifted left by 160px so Cover is dead-center)
    updateCentering(0);
    updateToolbar(0);
  }

  // Smoothly center the active page/spread in the viewport
  function updateCentering(pageIndex) {
    if (!flipbookWrapper) return;
    flipbookWrapper.classList.remove('center-spread', 'center-back');

    if (pageIndex === 0) {
      // Closed Front Cover: shift left so right-half page sits dead-center
      flipbookWrapper.style.transform = 'translateX(-160px)';
      setStatus("Folded front cover • Drag corner or click 'Open Card' to flip");
    } else if (pageIndex === 1 || pageIndex === 2) {
      // Open 2-Page Inside Spread: center the spread
      flipbookWrapper.style.transform = 'translateX(0px)';
      setStatus("Inside spread • Read the personal message");
    } else if (pageIndex >= 3) {
      // Closed Back Cover: shift right so left-half page sits dead-center
      flipbookWrapper.style.transform = 'translateX(160px)';
      setStatus("Back cover • Letterpress Edition");
    }
  }

  function updateToolbar(pageIndex) {
    if (pageIndex === 0) {
      toggleCardIcon.innerText = '📖';
      toggleCardLabel.innerText = 'Open Card';
      viewBackLabel.innerText = 'View Back';
    } else if (pageIndex === 1 || pageIndex === 2) {
      toggleCardIcon.innerText = '📕';
      toggleCardLabel.innerText = 'Close Card';
      viewBackLabel.innerText = 'View Back';
    } else if (pageIndex >= 3) {
      toggleCardIcon.innerText = '📖';
      toggleCardLabel.innerText = 'View Inside';
      viewBackLabel.innerText = 'View Front';
    }
  }

  // ==========================================================================
  // 2. ENVELOPE UNBOXING SEQUENCE (FLAP -> SLIDE -> HERO CARD)
  // ==========================================================================

  waxSeal.addEventListener('click', () => {
    if (isUnboxing) return;
    isUnboxing = true;

    // 1. Play wax seal crack
    if (window.cardAudio) window.cardAudio.playSealBreak();

    // 2. Open Flap
    setTimeout(() => {
      envelopeWrapper.classList.add('flap-open');
      if (window.cardAudio) window.cardAudio.playFlapOpen();
      setStatus("Opening envelope flap...");
    }, 200);

    // 3. Extract card from slot
    setTimeout(() => {
      envelopeWrapper.classList.add('card-extracted');
      if (window.cardAudio) window.cardAudio.playCardSlide();
      setStatus("Extracting your folded greeting card...");
    }, 1100);

    // 4. Reveal hero card with StPageFlip Canvas Engine
    setTimeout(() => {
      envelopeWrapper.classList.add('receded');
      cardStage.classList.remove('hidden');

      initFlipbook();
      setStatus("Folded front cover • Drag corner or click 'Open Card' to flip");
    }, 2100);
  });

  // Replay Envelope Sequence
  btnReplay.addEventListener('click', () => {
    cardStage.classList.add('hidden');
    envelopeWrapper.classList.remove('receded', 'card-extracted', 'flap-open');
    isUnboxing = false;
    setStatus("Click the seal to open the envelope");
    if (pageFlip) {
      try { pageFlip.turnToPage(0); } catch (e) {}
    }
  });

  // ==========================================================================
  // 3. CARD TURNING INTERACTIONS
  // ==========================================================================

  // Toggle Open / Close
  btnToggleCard.addEventListener('click', () => {
    if (!pageFlip) {
      waxSeal.click();
      return;
    }
    const current = pageFlip.getCurrentPageIndex();
    if (current === 0) {
      pageFlip.flipNext('top');
    } else if (current === 1 || current === 2) {
      pageFlip.flipPrev('top');
    } else {
      pageFlip.turnToPage(1);
    }
  });

  // View Back Cover / View Front
  btnViewBack.addEventListener('click', () => {
    if (!pageFlip) return;
    const current = pageFlip.getCurrentPageIndex();
    if (current < 3) {
      pageFlip.turnToPage(3);
    } else {
      pageFlip.turnToPage(0);
    }
  });

  // ==========================================================================
  // 4. AUDIO & AMBIENT MUSIC
  // ==========================================================================

  btnSound.addEventListener('click', () => {
    const enabled = window.cardAudio.toggleSound();
    btnSound.classList.toggle('active', enabled);
  });

  btnMusic.addEventListener('click', () => {
    const enabled = window.cardAudio.toggleMusic();
    btnMusic.classList.toggle('active', enabled);
  });

  // ==========================================================================
  // 5. AMBIENT DUST MOTES (QUIET STUDY ROOM ATMOSPHERE)
  // ==========================================================================

  const canvas = document.getElementById('ambient-dust-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.6,
      speedY: Math.random() * 0.35 + 0.1,
      speedX: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.15,
      fade: Math.random() * 0.008 + 0.002,
      dir: Math.random() > 0.5 ? 1 : -1
    }));

    function animateDust() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.alpha += p.fade * p.dir;
        if (p.alpha <= 0.08) { p.alpha = 0.08; p.dir = 1; }
        if (p.alpha >= 0.55) { p.alpha = 0.55; p.dir = -1; }
        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(215, 195, 170, ${p.alpha})`;
        ctx.fill();
      }
      requestAnimationFrame(animateDust);
    }
    animateDust();
  }
});
