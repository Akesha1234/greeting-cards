// Luxury Greeting Card - Procedural Sound & Music Synthesizer
// Synthesizes tactile paper friction, wax seal crack, card sliding, and ambient melody via Web Audio API

class CardAudio {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.musicGain = null;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Wax seal crack & pop
  playSealBreak() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Click / crack impulse
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

      // Textured paper friction underneath
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // 2. Envelope flap folding open sound
  playFlapOpen() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const duration = 0.35;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.18);
      filter.frequency.exponentialRampToValueAtTime(500, now + duration);
      filter.Q.setValueAtTime(1.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // 3. Card sliding out of envelope
  playCardSlide() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const duration = 0.55;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(1500, now + 0.25);
      filter.frequency.linearRampToValueAtTime(750, now + duration);
      filter.Q.setValueAtTime(2.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // 4. Heavyweight cardstock paper turn / rustle
  playPaperFlip(intensity = 1.0) {
    if (!this.soundEnabled) return;
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const duration = 0.32;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.42));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(750, now);
      bandpass.frequency.exponentialRampToValueAtTime(2200, now + 0.14);
      bandpass.frequency.exponentialRampToValueAtTime(650, now + duration);
      bandpass.Q.setValueAtTime(1.6, now);

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(200, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(Math.min(0.4 * intensity, 0.5), now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // 5. Card closes shut (subtle soft tap)
  playCardClose() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Soft low thud of heavy paper meeting
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);

      // Paper friction overlay
      this.playPaperFlip(0.6);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // 6. Celebratory chime / harp arpeggio
  playChime() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;
      // D major pentatonic / magical sparkle notes
      const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.25);
      });
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Ambient Music Loop (Warm Rhodes/Piano chords)
  toggleMusic(forceState) {
    this.musicEnabled = forceState !== undefined ? forceState : !this.musicEnabled;
    if (this.musicEnabled) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
    return this.musicEnabled;
  }

  startAmbientMusic() {
    this.init();
    if (!this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
    }

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G6
    ];

    const playChord = () => {
      if (!this.musicEnabled) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const chord = chords[this.musicStep % chords.length];
      this.musicStep++;

      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.08, now + 0.6);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 3.5);
      });

      this.musicTimer = setTimeout(playChord, 3200);
    };

    playChord();
  }

  stopAmbientMusic() {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleSound(forceState) {
    this.soundEnabled = forceState !== undefined ? forceState : !this.soundEnabled;
    return this.soundEnabled;
  }
}

window.cardAudio = new CardAudio();

