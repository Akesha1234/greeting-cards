// Luxury Greeting Card - Card Mesh & Curvature Deformation Physics Engine
// Implements multi-segment cardstock bending physics, dynamic crease lighting, and interactive drag

class CardMeshEngine {
  constructor(options = {}) {
    this.container = options.container;
    this.numSegments = options.numSegments || 12; // Segmented strips for smooth cardstock curvature
    this.cardWidth = options.cardWidth || 320;   // Single page width
    this.cardHeight = options.cardHeight || 440; // Card height
    this.stripWidth = this.cardWidth / this.numSegments;

    // Deformation state
    this.openProgress = 0; // 0 = closed (front cover), 1 = fully open (inside spread)
    this.isDragging = false;
    this.startX = 0;
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.animFrameId = null;

    // View state: 'envelope', 'front', 'inside', 'back'
    this.viewState = 'envelope';

    this.initDOM();
    this.setupInteractivity();
  }

  initDOM() {
    if (!this.container) return;

    // Main Card Stage
    this.container.innerHTML = `
      <div class="card-viewport" id="card-viewport">
        <!-- 3D Card Pivot & Hinge Structure -->
        <div class="card-assembly" id="card-assembly">
          
          <!-- Back Panel (Holds Inside Right when open, and Back Cover on reverse) -->
          <div class="card-back-panel" id="card-back-panel">
            <div class="panel-face panel-inside-right" id="inside-right-face">
              <!-- Content rendered via HTML -->
            </div>
            <div class="panel-face panel-back-cover" id="back-cover-face">
              <!-- Content rendered via HTML -->
            </div>
            <!-- Dynamic crease shadow cast by folding front cover -->
            <div class="crease-cast-shadow" id="crease-shadow"></div>
          </div>

          <!-- Front Folding Flap (Multi-Segment Curved Mesh) -->
          <div class="card-front-mesh" id="card-front-mesh">
            <!-- Dynamically populated with connected strips -->
          </div>

          <!-- Flat Fallback / Locked Layer for settled states -->
          <div class="card-front-flat" id="card-front-flat">
            <div class="flat-face flat-cover" id="flat-cover-content"></div>
            <div class="flat-face flat-inside-left" id="flat-inside-content"></div>
          </div>

        </div>
      </div>
    `;

    this.viewport = document.getElementById('card-viewport');
    this.assembly = document.getElementById('card-assembly');
    this.frontMesh = document.getElementById('card-front-mesh');
    this.frontFlat = document.getElementById('card-front-flat');
    this.creaseShadow = document.getElementById('crease-shadow');
    this.backPanel = document.getElementById('card-back-panel');

    this.buildSegmentedMesh();
  }

  // Build multi-strip bone hierarchy for authentic cylindrical / elastica paper curvature
  buildSegmentedMesh() {
    this.frontMesh.innerHTML = '';
    this.stripElements = [];

    // We build a nested chain: Strip 0 -> Strip 1 -> Strip 2 ...
    // Each strip rotates relative to its predecessor, creating a continuous curved arc.
    let parentEl = this.frontMesh;

    for (let i = 0; i < this.numSegments; i++) {
      const strip = document.createElement('div');
      strip.className = `mesh-strip strip-${i}`;
      strip.style.width = `${this.stripWidth + 0.5}px`; // 0.5px subpixel overlap prevents hairline gaps
      strip.style.height = `${this.cardHeight}px`;

      // Front & Back surfaces for each strip
      const frontFace = document.createElement('div');
      frontFace.className = 'strip-face strip-front';
      frontFace.style.width = `${this.cardWidth}px`;
      frontFace.style.left = `-${i * this.stripWidth}px`; // UV slice alignment

      const backFace = document.createElement('div');
      backFace.className = 'strip-face strip-back';
      backFace.style.width = `${this.cardWidth}px`;
      backFace.style.left = `-${i * this.stripWidth}px`; // UV slice alignment

      // Specular highlight / curvature shadow overlay for this strip
      const shadeOverlay = document.createElement('div');
      shadeOverlay.className = 'strip-shade';

      strip.appendChild(frontFace);
      strip.appendChild(backFace);
      strip.appendChild(shadeOverlay);

      parentEl.appendChild(strip);
      this.stripElements.push({
        element: strip,
        frontFace,
        backFace,
        shade: shadeOverlay,
        index: i
      });

      // Next strip is child of current strip so rotations cascade naturally
      parentEl = strip;
    }
  }

  // Populate HTML templates into the mesh faces and flat faces
  setCardContent({ frontCoverHTML, insideLeftHTML, insideRightHTML, backCoverHTML }) {
    this.frontCoverHTML = frontCoverHTML;
    this.insideLeftHTML = insideLeftHTML;
    this.insideRightHTML = insideRightHTML;
    this.backCoverHTML = backCoverHTML;

    // Apply to mesh strips
    this.stripElements.forEach(({ frontFace, backFace }) => {
      frontFace.innerHTML = frontCoverHTML;
      backFace.innerHTML = insideLeftHTML;
    });

    // Apply to flat settled layers
    document.getElementById('flat-cover-content').innerHTML = frontCoverHTML;
    document.getElementById('flat-inside-content').innerHTML = insideLeftHTML;
    document.getElementById('inside-right-face').innerHTML = insideRightHTML;
    document.getElementById('back-cover-face').innerHTML = backCoverHTML;
  }

  // Core Physics: compute realistic Euler elastica curvature for progress p (0 = closed, 1 = open)
  renderProgress(p) {
    this.openProgress = Math.max(0, Math.min(1, p));
    const prog = this.openProgress;

    // If completely settled at 0 or 1, we can show clean flat layer to save GPU
    if (prog <= 0.001) {
      this.frontMesh.style.display = 'none';
      this.frontFlat.style.display = 'block';
      this.frontFlat.style.transform = 'rotateY(0deg)';
      this.assembly.style.transform = 'translateX(0px)';
      this.creaseShadow.style.opacity = '0';
      return;
    }

    if (prog >= 0.999) {
      this.frontMesh.style.display = 'none';
      this.frontFlat.style.display = 'block';
      this.frontFlat.style.transform = 'rotateY(-180deg)';
      // When opened, shift assembly to the right by cardWidth/2 so the 2-page spread is centered!
      this.assembly.style.transform = `translateX(${this.cardWidth / 2}px)`;
      this.creaseShadow.style.opacity = '0.08';
      return;
    }

    // Active turning: enable 3D curved mesh
    this.frontFlat.style.display = 'none';
    this.frontMesh.style.display = 'block';

    // Spread centering transition: as card opens, shift center point
    const shiftX = (this.cardWidth / 2) * Math.sin(prog * Math.PI * 0.5);
    this.assembly.style.transform = `translateX(${shiftX}px)`;

    // Total base rotation from 0 to -180 deg
    const baseAngle = -180 * prog;

    // Bending curve / flex profile:
    // Heavy cardstock resists bending at the spine, curves outward in the middle, and flattens towards ends.
    // Curvature peaks around prog = 0.45 - 0.65 (when the hand pulls the flap open).
    const flexIntensity = Math.sin(prog * Math.PI); // 0 at ends, 1 at middle
    const maxCurl = 38 * flexIntensity; // degrees of total arc flex

    // Apply cascade rotations to strips
    const N = this.numSegments;
    this.stripElements.forEach(({ element, shade, index }) => {
      let stripAngle = 0;
      if (index === 0) {
        // Root spine hinge: takes base angle minus a portion of the curl
        stripAngle = baseAngle - (maxCurl * 0.15);
      } else {
        // Incremental curvature across strips
        // Parabolic weight across the strips
        const normalizedPos = index / N;
        const stripWeight = Math.sin(normalizedPos * Math.PI);
        stripAngle = (maxCurl / N) * stripWeight * 2.2;
      }

      element.style.transform = `rotateY(${stripAngle}deg)`;

      // Dynamic lighting & shadow gradient per strip
      // Strips facing away from light darken; strips catching specular light brighten
      const cumulativeAngle = Math.abs(baseAngle) + (index * 2.5);
      const normalAngle = (cumulativeAngle % 360) * (Math.PI / 180);
      const lightFactor = Math.cos(normalAngle);

      if (lightFactor < 0) {
        // Shadow side
        shade.style.background = `rgba(0, 0, 0, ${Math.min(0.45, Math.abs(lightFactor) * 0.4 * flexIntensity)})`;
      } else {
        // Specular sheen side
        shade.style.background = `linear-gradient(90deg, transparent, rgba(255, 255, 255, ${lightFactor * 0.25 * flexIntensity}), transparent)`;
      }
    });

    // Crease shadow cast onto the inside right panel
    // Darkest when flap is near 90 deg, soft at 0 and 180
    const shadowIntensity = Math.pow(Math.sin(prog * Math.PI), 1.5) * 0.75;
    this.creaseShadow.style.opacity = shadowIntensity.toFixed(3);
    const shadowWidth = 30 + 70 * flexIntensity;
    this.creaseShadow.style.width = `${shadowWidth}px`;
  }

  // Smooth spring / lerp animation towards target progress
  animateTo(target, duration = 850, onComplete = null) {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const start = this.openProgress;
    const delta = target - start;
    const startTime = performance.now();

    // Play tactile paper audio
    if (Math.abs(delta) > 0.2 && window.cardAudio) {
      window.cardAudio.playPaperFlip(Math.abs(delta));
    }

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      // Custom smooth easing (cardstock spring settle)
      // Quintic ease-out with subtle inertia
      const ease = 1 - Math.pow(1 - t, 4);
      const current = start + delta * ease;

      this.renderProgress(current);

      if (t < 1) {
        this.animFrameId = requestAnimationFrame(step);
      } else {
        this.renderProgress(target);
        if (target >= 0.99) {
          this.viewState = 'inside';
          if (window.cardAudio) window.cardAudio.playChime();
        } else if (target <= 0.01) {
          this.viewState = 'front';
          if (window.cardAudio) window.cardAudio.playCardClose();
        }
        if (onComplete) onComplete();
      }
    };

    this.animFrameId = requestAnimationFrame(step);
  }

  // Interactive Touch & Mouse Dragging
  setupInteractivity() {
    const handleStart = (clientX) => {
      if (this.viewState === 'envelope' || this.viewState === 'back') return;
      this.isDragging = true;
      this.startX = clientX;
      this.startProg = this.openProgress;
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    };

    const handleMove = (clientX) => {
      if (!this.isDragging) return;
      const deltaX = clientX - this.startX;
      // Dragging left (negative deltaX) pulls the cover open (increases progress)
      // Dragging right (positive deltaX) closes the card (decreases progress)
      const progDelta = -deltaX / (this.cardWidth * 1.15);
      const newProg = Math.max(0, Math.min(1, this.startProg + progDelta));
      this.renderProgress(newProg);
    };

    const handleEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      // Snap logic: if past 35%, snap fully open; otherwise snap closed
      const target = this.openProgress > 0.35 ? 1 : 0;
      this.animateTo(target, 700);
    };

    // Pointer events
    this.container.addEventListener('mousedown', (e) => handleStart(e.clientX));
    window.addEventListener('mousemove', (e) => handleMove(e.clientX));
    window.addEventListener('mouseup', handleEnd);

    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) handleStart(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) handleMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', handleEnd);

    // Subtle 3D gyroscope / cursor tilt when card is in hero view
    window.addEventListener('mousemove', (e) => {
      if (this.viewState === 'front' && !this.isDragging) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const tiltX = (e.clientY - cy) / cy * -4;
        const tiltY = (e.clientX - cx) / cx * 6;
        this.viewport.style.transform = `perspective(1600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      } else if (this.viewState === 'inside' && !this.isDragging) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const tiltX = (e.clientY - cy) / cy * -2;
        const tiltY = (e.clientX - cx) / cx * 3;
        this.viewport.style.transform = `perspective(1600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      } else {
        this.viewport.style.transform = 'perspective(1600px) rotateX(0deg) rotateY(0deg)';
      }
    });
  }

  // Flip whole card to show Back Cover
  showBackCover() {
    if (this.viewState === 'back') return;
    if (window.cardAudio) window.cardAudio.playPaperFlip(1.2);

    // First ensure card is closed, then flip 180 around vertical axis
    this.animateTo(0, 400, () => {
      this.assembly.classList.add('flipped-to-back');
      this.viewState = 'back';
    });
  }

  // Return to front cover or inside from back cover
  returnFromBackCover(targetState = 'inside') {
    if (window.cardAudio) window.cardAudio.playPaperFlip(1.0);
    this.assembly.classList.remove('flipped-to-back');
    this.viewState = 'front';
    setTimeout(() => {
      if (targetState === 'inside') {
        this.animateTo(1, 800);
      }
    }, 400);
  }

  // Toggle open / close
  toggleCard() {
    if (this.viewState === 'back') {
      this.returnFromBackCover('inside');
      return;
    }
    const target = this.openProgress > 0.5 ? 0 : 1;
    this.animateTo(target, 850);
  }
}

window.CardMeshEngine = CardMeshEngine;

