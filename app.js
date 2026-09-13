/**
 * Durga Puja 2026 - Sharodotsav Web Experience Logic
 * Includes: Self-contained Web Audio Synthesizer, Particle Engine,
 * Interactive Aarti & Darshan, Schedule Engine, Pandal Explorer,
 * and HTML5 Canvas Greeting Card Maker.
 */

// ==========================================================================
// 1. Web Audio API Synthesizer (Zero External Dependencies, 100% Reliable)
// ==========================================================================

class FestivalAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isAtmospherePlaying = false;
    this.atmosphereTimer = null;
    this.grooveTimer = null;
    this.isGroovePlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Blow Divine Shankha (Conch Shell)
  playShankha() {
    this.init();
    const now = this.ctx.currentTime;
    const dur = 3.6;

    // Master Gain
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.001, now);
    master.gain.linearRampToValueAtTime(0.7, now + 0.5);
    master.gain.exponentialRampToValueAtTime(0.001, now + dur);
    master.connect(this.ctx.destination);

    // Fundamental Tone Oscillator (Smooth pitch slide)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(410, now);
    osc1.frequency.exponentialRampToValueAtTime(520, now + 0.6);
    osc1.frequency.exponentialRampToValueAtTime(460, now + 2.8);
    osc1.frequency.exponentialRampToValueAtTime(400, now + dur);

    // Filter to give rich, warm resonant brassy tone
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(4.5, now);

    // Sub-harmonic for hollow depth
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(205, now);
    osc2.frequency.exponentialRampToValueAtTime(260, now + 0.6);
    osc2.frequency.exponentialRampToValueAtTime(230, now + 2.8);

    // Connect nodes
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(master);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
  }

  // Ring Temple Brass Bell (Ghanta / Kashor)
  playGhanta(freq = 1480, duration = 2.4) {
    this.init();
    const now = this.ctx.currentTime;

    // Frequencies simulating bell vibrational partials
    const partials = [freq, freq * 1.62, freq * 2.76, freq * 4.2];
    const gains = [0.6, 0.35, 0.18, 0.1];

    partials.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gains[idx], now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * (1 - idx * 0.15));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  // Dhak Percussion Bol Synthesis
  playDhakBol(bolType) {
    this.init();
    const now = this.ctx.currentTime;

    switch (bolType) {
      case 'dhak-dha': {
        // Deep resonance bass beat
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(145, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.28);

        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'dhak-ti': {
        // Sharp rim slap / stick click
        const bufferSize = this.ctx.sampleRate * 0.06;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1600, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        break;
      }
      case 'dhak-kure': {
        // Double fast bounce slap
        this.playDhakBol('dhak-ti');
        setTimeout(() => this.playDhakBol('dhak-ti'), 55);
        break;
      }
      case 'ghanta': {
        this.playGhanta(1900, 1.8);
        break;
      }
      case 'shankha': {
        this.playShankha();
        break;
      }
      case 'crescendo': {
        // Rapid Aarti drum roll
        let count = 0;
        const rollInterval = setInterval(() => {
          this.playDhakBol(count % 2 === 0 ? 'dhak-dha' : 'dhak-ti');
          if (count % 4 === 0) this.playGhanta(2100, 0.8);
          count++;
          if (count >= 14) {
            clearInterval(rollInterval);
            this.playShankha();
          }
        }, 80);
        break;
      }
    }
  }

  // Toggle Atmospheric Soundscape (Distant sacred bells & drone)
  toggleAtmosphere() {
    this.init();
    const btn = document.getElementById('soundToggleBtn');

    if (this.isAtmospherePlaying) {
      clearInterval(this.atmosphereTimer);
      this.isAtmospherePlaying = false;
      btn.classList.remove('playing');
      btn.querySelector('.sound-label').textContent = 'Atmosphere';
    } else {
      this.isAtmospherePlaying = true;
      btn.classList.add('playing');
      btn.querySelector('.sound-label').textContent = 'Playing 🔔';

      this.playGhanta(1320, 2.5);
      this.atmosphereTimer = setInterval(() => {
        if (!this.isAtmospherePlaying) return;
        const freqs = [1180, 1420, 1680];
        const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];
        this.playGhanta(randomFreq, 2.8);
      }, 3400);
    }
  }

  // Automated Festive Dhunuchi Groove Loop
  startAutoGroove() {
    this.init();
    if (this.isGroovePlaying) return;
    this.isGroovePlaying = true;

    const pattern = [
      { type: 'dhak-dha', delay: 0 },
      { type: 'dhak-ti', delay: 180 },
      { type: 'dhak-kure', delay: 360 },
      { type: 'dhak-dha', delay: 540 },
      { type: 'ghanta', delay: 540 },
      { type: 'dhak-ti', delay: 720 },
      { type: 'dhak-dha', delay: 900 },
      { type: 'dhak-kure', delay: 1080 }
    ];

    const loopLength = 1260;
    const playCycle = () => {
      if (!this.isGroovePlaying) return;
      pattern.forEach(step => {
        setTimeout(() => {
          if (this.isGroovePlaying) {
            this.playDhakBol(step.type);
            this.animateVisualizerBars();
          }
        }, step.delay);
      });
    };

    playCycle();
    this.grooveTimer = setInterval(playCycle, loopLength);
  }

  stopAutoGroove() {
    this.isGroovePlaying = false;
    clearInterval(this.grooveTimer);
  }

  animateVisualizerBars() {
    const bars = document.querySelectorAll('#rhythmVisualizer .bar');
    bars.forEach(bar => {
      const h = Math.floor(Math.random() * 32) + 8;
      bar.style.height = `${h}px`;
      setTimeout(() => {
        bar.style.height = '6px';
      }, 140);
    });
  }

  // Synthesize Resonant Veena Pluck Chord (for Devi Saraswati)
  playVeenaChord() {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [220, 277.18, 329.63, 440]; // A major meditative chord
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq * 0.98, now + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq, now + idx * 0.04 + 0.08);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 2.2, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 3.3);
    });
  }

  // Play Deity Specific Sacred Acoustic Sound
  playDeitySound(deity) {
    switch (deity) {
      case 'durga':
        this.playShankha();
        this.playGhanta(880, 2.6);
        break;
      case 'lakshmi':
        this.playGhanta(1760, 2.5);
        setTimeout(() => this.playGhanta(2200, 2.0), 180);
        break;
      case 'saraswati':
        this.playVeenaChord();
        break;
      case 'ganesha':
        this.playGhanta(1100, 2.4);
        setTimeout(() => this.playGhanta(1320, 2.0), 200);
        break;
      case 'kartikeya':
        this.playDhakBol('dhak-dha');
        setTimeout(() => this.playDhakBol('dhak-ti'), 130);
        setTimeout(() => this.playGhanta(1500, 1.4), 260);
        break;
      default:
        this.playGhanta(1480, 2.0);
        break;
    }
  }
}

const synth = new FestivalAudioSynthesizer();

// ==========================================================================
// 2. Particle Engine & Floating Autumn Kash Phool
// ==========================================================================

function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      speedY: Math.random() * 0.4 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.4 ? '#d4af37' : '#ffa726'
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.alpha += Math.sin(Date.now() * p.pulse) * 0.01;

      if (p.y < 0) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(0.9, p.alpha));
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }
  render();
}

// ==========================================================================
// 3. Live Festival Countdown Clock (Durga Puja 2026)
// ==========================================================================

function initCountdown() {
  // Maha Shashthi 2026: October 16, 2026, 06:00:00
  const targetDate = new Date('2026-10-16T06:00:00');

  function update() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.getElementById('countdownEventName').textContent = 'শারদোৎসবের শুভ মুহূর্ত!';
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const pad = n => String(n).padStart(2, '0');
    document.getElementById('days').textContent = pad(days);
    document.getElementById('hours').textContent = pad(hours);
    document.getElementById('minutes').textContent = pad(minutes);
    document.getElementById('seconds').textContent = pad(seconds);
  }

  update();
  setInterval(update, 1000);
}

// ==========================================================================
// 4. High-End Dynamic Durga Pratima Animation Engine
// ==========================================================================

class DurgaProtimaAnimationEngine {
  constructor() {
    this.stage = document.getElementById('mandapStage');
    this.pratimaLayer = document.getElementById('pratima3DLayer');
    this.haloCanvas = document.getElementById('haloCanvas');
    this.sparkCanvas = document.getElementById('weaponSparkCanvas');
    this.smokeCanvas = document.getElementById('smokeCanvas');
    this.trinayan = document.getElementById('trinayanGlow');
    this.trishulPoint = document.getElementById('trishulPoint');
    this.flashOverlay = document.getElementById('awakeningFlash');
    this.sandhiArc = document.getElementById('sandhiDiyaArc');
    this.thali = document.getElementById('aartiThali');
    this.burstLayer = document.getElementById('flowerBurstLayer');

    this.currentMode = 'normal'; // 'normal' | 'cosmic' | 'awakening' | 'sandhi'
    
    // Parallax tracking
    this.targetTiltX = 0;
    this.targetTiltY = 0;
    this.currentTiltX = 0;
    this.currentTiltY = 0;

    // Halo properties
    this.haloAngle = 0;
    this.haloSpeed = 0.006;
    this.haloPulse = 0;

    // Particles & Emitters
    this.sparks = [];
    this.smokePuffs = [];
    this.isAartiOrbiting = false;
    this.sandhiDiyas = [];
  }

  init() {
    if (!this.stage) return;

    this.resizeCanvases();
    window.addEventListener('resize', () => this.resizeCanvases());

    this.initParallax();
    this.init108SandhiDiyas();
    this.initAartiThali();
    this.initRitualButtons();
    this.initModeSwitcher();

    // Start animation loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resizeCanvases() {
    const rect = this.stage.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 450;

    [this.haloCanvas, this.sparkCanvas, this.smokeCanvas].forEach(c => {
      if (c) {
        c.width = w;
        c.height = h;
      }
    });
  }

  initParallax() {
    this.stage.addEventListener('mousemove', e => {
      const rect = this.stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      this.targetTiltX = (x - 0.5) * 2; // -1 to 1
      this.targetTiltY = (y - 0.5) * 2; // -1 to 1

      // Also move Aarti Thali if not orbiting
      if (!this.isAartiOrbiting && this.thali) {
        this.thali.style.left = `${e.clientX - rect.left}px`;
        this.thali.style.top = `${e.clientY - rect.top}px`;
      }
    });

    this.stage.addEventListener('mouseleave', () => {
      this.targetTiltX = 0;
      this.targetTiltY = 0;
    });

    // Touch support for mobile devices
    this.stage.addEventListener('touchmove', e => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.stage.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;
        this.targetTiltX = (x - 0.5) * 2;
        this.targetTiltY = (y - 0.5) * 2;
      }
    }, { passive: true });
  }

  init108SandhiDiyas() {
    if (!this.sandhiArc) return;
    this.sandhiArc.innerHTML = '';
    this.sandhiDiyas = [];

    for (let i = 0; i < 108; i++) {
      const diya = document.createElement('div');
      diya.className = 'micro-sandhi-diya';
      diya.title = `Sandhi Diya #${i + 1}`;
      diya.innerHTML = `
        <div class="micro-flame"></div>
        <div class="micro-bowl"></div>
      `;
      this.sandhiArc.appendChild(diya);
      this.sandhiDiyas.push(diya);
    }
  }

  initAartiThali() {
    // Aarti mode toggle
    document.getElementById('btnAartiMode')?.addEventListener('click', () => {
      this.isAartiOrbiting = !this.isAartiOrbiting;
      this.thali?.classList.toggle('orbiting', this.isAartiOrbiting);
      if (this.isAartiOrbiting) {
        synth.playDhakBol('crescendo');
      }
    });
  }

  initRitualButtons() {
    document.getElementById('btnShankha')?.addEventListener('click', () => {
      synth.playShankha();
      this.triggerDivineGlowBurst();
    });

    document.getElementById('btnGhanta')?.addEventListener('click', () => {
      synth.playGhanta(1420, 2.2);
      this.triggerDivineGlowBurst();
    });

    document.getElementById('btnPushpanjali')?.addEventListener('click', () => {
      this.triggerFlowerShower();
      synth.playGhanta(1750, 1.8);
    });

    document.getElementById('btnPranom')?.addEventListener('click', () => {
      this.triggerDivineGlowBurst();
      synth.playShankha();
      alert('মা দুর্গার আশীর্বাদ আপনার এবং আপনার পরিবারের উপর সদা বর্ষিত হোক। শুভ শারদীয়া!');
    });

    document.getElementById('chantToggleBtn')?.addEventListener('click', () => {
      synth.playGhanta(1300, 3.0);
      const text = 'ওঁ জয়ন্তী মঙ্গলা কালী ভদ্রকালী কপালিনী। দুর্গা শিবা ক্ষমা ধাত্রী স্বাহা স্বধা নমোঽস্তু তে॥';
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    });
  }

  initModeSwitcher() {
    const buttons = document.querySelectorAll('.mode-pill-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchMode(btn.dataset.mode);
      });
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.stage.classList.remove('cosmic-mode', 'awakening-dim');
    this.trinayan?.classList.remove('active-eye', 'awakened');
    this.trishulPoint?.classList.remove('active-trishul');

    switch (mode) {
      case 'normal':
        this.haloSpeed = 0.006;
        break;

      case 'cosmic':
        this.triggerCosmicPowerMode();
        break;

      case 'awakening':
        this.triggerAwakeningMode();
        break;

      case 'sandhi':
        this.trigger108SandhiMode();
        break;
    }
  }

  // Cinematic Mode 1: Cosmic Power Strike (রণচণ্ডী রূপ)
  triggerCosmicPowerMode() {
    this.stage.classList.add('cosmic-mode');
    this.stage.classList.add('camera-shake');
    this.trishulPoint?.classList.add('active-trishul');
    this.haloSpeed = 0.024;

    synth.playDhakBol('crescendo');
    setTimeout(() => {
      synth.playShankha();
      this.stage.classList.remove('camera-shake');
    }, 450);

    // Erupt explosive electric sparks around Trishul
    const w = this.sparkCanvas.width;
    const h = this.sparkCanvas.height;
    for (let i = 0; i < 40; i++) {
      this.sparks.push({
        x: w * 0.375,
        y: h * 0.180,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        radius: Math.random() * 3.5 + 1.5,
        alpha: 1,
        color: Math.random() > 0.4 ? '#ffe600' : '#ff3300'
      });
    }
  }

  // Cinematic Mode 2: Bodhon & Chokkhu Daan (Divine Awakening)
  triggerAwakeningMode() {
    this.stage.classList.add('awakening-dim');
    this.haloSpeed = 0.003;
    synth.playGhanta(1100, 3.5);

    setTimeout(() => {
      // Third eye begins to pulse
      this.trinayan?.classList.add('active-eye');
      synth.playGhanta(1650, 2.0);
    }, 800);

    setTimeout(() => {
      // Beam awakens and flash burst
      this.trinayan?.classList.add('awakened');
      this.flashOverlay?.classList.add('flashing');
      synth.playShankha();

      setTimeout(() => {
        this.flashOverlay?.classList.remove('flashing');
        this.stage.classList.remove('awakening-dim');
        this.triggerFlowerShower();
      }, 450);
    }, 2100);
  }

  // Cinematic Mode 3: 108 Sandhi Diya Illumination (সন্ধিপূজা)
  trigger108SandhiMode() {
    synth.playShankha();
    this.isAartiOrbiting = true;
    this.thali?.classList.add('orbiting');

    // Light up 108 Diyas in rapid cascade
    this.sandhiDiyas.forEach((diya, index) => {
      setTimeout(() => {
        diya.classList.add('lit');
        if (index % 12 === 0) {
          synth.playGhanta(1500 + (index * 6), 0.8);
        }
      }, index * 22);
    });

    setTimeout(() => {
      this.triggerDivineGlowBurst();
      synth.playDhakBol('dhak-dha');
    }, 108 * 22 + 200);
  }

  triggerDivineGlowBurst() {
    const aura = document.getElementById('auraGlow');
    if (!aura) return;
    aura.style.opacity = '1';
    aura.style.transform = 'translateX(-50%) scale(1.6)';
    setTimeout(() => {
      aura.style.opacity = '0.6';
      aura.style.transform = 'translateX(-50%) scale(1)';
    }, 1200);
  }

  triggerFlowerShower() {
    const petals = ['🌸', '🌺', '🪷', '🌼', '✨'];
    for (let i = 0; i < 28; i++) {
      const petal = document.createElement('div');
      petal.className = 'falling-petal';
      petal.textContent = petals[Math.floor(Math.random() * petals.length)];
      petal.style.left = `${Math.random() * 90 + 5}%`;
      petal.style.top = `${Math.random() * 20}%`;
      petal.style.animationDelay = `${Math.random() * 0.7}s`;
      this.burstLayer.appendChild(petal);

      setTimeout(() => petal.remove(), 2600);
    }
  }

  // Core 60 FPS Animation Loop
  animate() {
    // 1. Smooth Parallax Interpolation (LERP)
    this.currentTiltX += (this.targetTiltX - this.currentTiltX) * 0.08;
    this.currentTiltY += (this.targetTiltY - this.currentTiltY) * 0.08;

    if (this.pratimaLayer) {
      const rotY = this.currentTiltX * 7.5;
      const rotX = -this.currentTiltY * 6.5;
      this.pratimaLayer.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) scale3d(1.02, 1.02, 1.02)`;
    }

    // 2. Render Golden Radiant Halo Mandala
    this.renderHalo();

    // 3. Render Trishul & Weapon Sparks
    this.renderWeaponSparks();

    // 4. Render Volumetric Dhuno Smoke
    this.renderSmoke();

    requestAnimationFrame(this.animate);
  }

  renderHalo() {
    if (!this.haloCanvas) return;
    const ctx = this.haloCanvas.getContext('2d');
    const w = this.haloCanvas.width;
    const h = this.haloCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.504 - (this.currentTiltX * 12);
    const cy = h * 0.245 - (this.currentTiltY * 8);
    const baseRadius = Math.min(w, h) * 0.26;

    this.haloAngle += this.haloSpeed;
    this.haloPulse += 0.03;
    const pulseScale = 1 + Math.sin(this.haloPulse) * 0.05;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.haloAngle);

    const isCosmic = this.currentMode === 'cosmic';

    // Outer Solar Rays (24 Spikes)
    const rays = 24;
    for (let i = 0; i < rays; i++) {
      const angle = (Math.PI * 2 / rays) * i;
      const rayLength = (baseRadius * (isCosmic ? 1.5 : 1.25)) * pulseScale;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle - 0.06) * (baseRadius * 0.85), Math.sin(angle - 0.06) * (baseRadius * 0.85));
      ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
      ctx.lineTo(Math.cos(angle + 0.06) * (baseRadius * 0.85), Math.sin(angle + 0.06) * (baseRadius * 0.85));
      ctx.closePath();

      const grad = ctx.createRadialGradient(0, 0, baseRadius * 0.5, 0, 0, rayLength);
      if (isCosmic) {
        grad.addColorStop(0, 'rgba(255, 230, 0, 0.9)');
        grad.addColorStop(0.5, 'rgba(255, 60, 0, 0.6)');
        grad.addColorStop(1, 'transparent');
      } else {
        grad.addColorStop(0, 'rgba(255, 235, 120, 0.7)');
        grad.addColorStop(0.6, 'rgba(212, 175, 55, 0.35)');
        grad.addColorStop(1, 'transparent');
      }
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Sacred Concentric Circles & Lotus Petals
    ctx.strokeStyle = isCosmic ? '#ffcc00' : 'rgba(255, 220, 100, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // 16 Petals Arc Motif
    const petals = 16;
    for (let j = 0; j < petals; j++) {
      const pAngle = (Math.PI * 2 / petals) * j;
      ctx.beginPath();
      ctx.arc(Math.cos(pAngle) * (baseRadius * 0.75), Math.sin(pAngle) * (baseRadius * 0.75), 14, 0, Math.PI * 2);
      ctx.fillStyle = isCosmic ? 'rgba(255, 100, 0, 0.3)' : 'rgba(212, 175, 55, 0.2)';
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  renderWeaponSparks() {
    if (!this.sparkCanvas) return;
    const ctx = this.sparkCanvas.getContext('2d');
    const w = this.sparkCanvas.width;
    const h = this.sparkCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const tx = w * 0.375;
    const ty = h * 0.180;

    const isCosmic = this.currentMode === 'cosmic';

    // Generate random spark particles
    if (isCosmic || Math.random() < 0.3) {
      const count = isCosmic ? 4 : 1;
      for (let k = 0; k < count; k++) {
        this.sparks.push({
          x: tx + (Math.random() - 0.5) * 12,
          y: ty + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * (isCosmic ? 6 : 3),
          vy: (Math.random() - 0.8) * (isCosmic ? 5 : 2.5),
          radius: Math.random() * 2.5 + 1,
          alpha: 1,
          color: isCosmic ? (Math.random() > 0.5 ? '#ffe600' : '#ff4400') : '#ffeaa7'
        });
      }
    }

    // Draw Trishul Electric Lightning Arcs
    if (isCosmic || Math.random() < 0.2) {
      ctx.beginPath();
      ctx.moveTo(tx, ty + 20);
      let curX = tx;
      let curY = ty + 20;
      const targetX = tx + (Math.random() - 0.5) * 20;
      const targetY = ty - 25;

      const steps = 4;
      for (let s = 1; s <= steps; s++) {
        const nextX = tx + (targetX - tx) * (s / steps) + (Math.random() - 0.5) * 8;
        const nextY = (ty + 20) + (targetY - (ty + 20)) * (s / steps);
        ctx.lineTo(nextX, nextY);
      }
      ctx.strokeStyle = isCosmic ? '#ffffff' : '#ffd700';
      ctx.lineWidth = isCosmic ? 2.5 : 1.5;
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 10;
      ctx.stroke();
    }

    // Update and draw existing sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.08; // gravity
      s.alpha -= 0.025;

      if (s.alpha <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 6;
      ctx.fill();
    }
  }

  renderSmoke() {
    if (!this.smokeCanvas) return;
    const ctx = this.smokeCanvas.getContext('2d');
    const w = this.smokeCanvas.width;
    const h = this.smokeCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Emit subtle fragrant dhuno incense puffs
    if (Math.random() < 0.2) {
      this.smokePuffs.push({
        x: w * 0.5 + (Math.random() - 0.5) * 40,
        y: h * 0.86,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(Math.random() * 0.6 + 0.4),
        radius: 12,
        maxRadius: Math.random() * 25 + 35,
        alpha: 0.16,
        curl: Math.random() * 0.04 - 0.02
      });
    }

    for (let i = this.smokePuffs.length - 1; i >= 0; i--) {
      const p = this.smokePuffs[i];
      p.x += p.vx + Math.sin(p.y * 0.03) * 0.5;
      p.y += p.vy;
      p.radius += 0.25;
      p.alpha -= 0.0014;

      if (p.alpha <= 0 || p.radius >= p.maxRadius) {
        this.smokePuffs.splice(i, 1);
        continue;
      }

      const grad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.1, p.x, p.y, p.radius);
      grad.addColorStop(0, `rgba(255, 245, 230, ${p.alpha})`);
      grad.addColorStop(0.6, `rgba(240, 220, 190, ${p.alpha * 0.5})`);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }
}

let protimaEngine = null;
function initDarshanInteractions() {
  protimaEngine = new DurgaProtimaAnimationEngine();
  protimaEngine.init();
}

// ==========================================================================
// 5. Festival Calendar & Puja Schedule Dataset
// ==========================================================================

const scheduleData = {
  mahalaya: {
    dayBengali: 'মহালয়া',
    dayEnglish: 'Mahalaya - Welcoming the Goddess',
    date: 'October 10, 2026',
    tithi: 'Krishna Amavasya (Mahalaya Amavasya)',
    desc: 'The dawn of Sharodotsav. Devotees offer Tarpan on the holy Ganges to honor ancestors. Birendra Krishna Bhadra\'s iconic Chandipath resonates across Bengal, heralding the descent of Mahamaya.',
    rituals: [
      { time: '05:32 AM', name: 'মহিষাসুরমর্দিনী চণ্ডীপাঠ', detail: 'Sacred chanting of Devi Mahatmyam at dawn.' },
      { time: '06:15 AM - 11:30 AM', name: 'পিতৃতর্পণ (Pitru Tarpan)', detail: 'Offering water and sesame seeds to departed ancestors.' },
      { time: 'Evening', name: 'চক্ষুদান (Chokkhu Daan)', detail: 'Artisans paint the divine third eye of Maa Durga.' }
    ],
    bhog: ['তিল মিশ্রিত জল', 'কলা ও ফলমূল', 'সাত্ত্বিক অন্ন', 'পায়েস']
  },
  shashthi: {
    dayBengali: 'মহা ষষ্ঠী',
    dayEnglish: 'Maha Shashthi - Bodhon & Amontron',
    date: 'October 16, 2026',
    tithi: 'Shukla Shashthi',
    desc: 'The festival officially begins with Bodhon under the sacred Bel tree (Bilva Vriksha), awakening the Mother Goddess and inviting Her with ritual Adhibas.',
    rituals: [
      { time: '07:00 AM', name: 'বিল্ববৃক্ষতলে বোধন (Bodhon)', detail: 'Awakening of Maa Durga beneath the Bilva tree.' },
      { time: '11:00 AM', name: 'আমন্ত্রণ ও অধিবাস (Adhibas)', detail: 'Purification with sacred soil, herbs, and holy water.' },
      { time: '07:30 PM', name: 'মহাসন্ধ্যা আরতি', detail: 'Illuminated pandals open to devotees worldwide.' }
    ],
    bhog: ['লুচি ও আলুর দম', 'ফল প্রসাদ', 'মিষ্টান্ন', 'সুজির হালুয়া']
  },
  saptami: {
    dayBengali: 'মহা সপ্তমী',
    dayEnglish: 'Maha Saptami - Nabapatrika Pravesh',
    date: 'October 17, 2026',
    tithi: 'Shukla Saptami',
    desc: 'Kola Bou (Nabapatrika) is ceremonially bathed at dawn in the river and draped in a yellow-bordered red saree, signifying the cosmic power of Mother Nature in nine botanical forms.',
    rituals: [
      { time: '06:20 AM', name: 'নবপত্রিকা স্নান (Kola Bou Snan)', detail: 'Sacred bathing of 9 plants at river ghats.' },
      { time: '09:00 AM', name: 'প্রাণপ্রতিষ্ঠা ও সপ্তমী পূজা', detail: 'Infusing divine life into the Pratima.' },
      { time: '01:00 PM', name: 'সপ্তমী ভোগ নিবেদন', detail: 'Offering royal Annabhog with Govindobhog rice.' }
    ],
    bhog: ['গোবিন্দভোগ চালের খিচুড়ি', 'লাবড়া তরকারি', 'বেগুনভাজা', 'চাটনি ও পায়েস']
  },
  ashtami: {
    dayBengali: 'মহা অষ্টমী ও সন্ধিপূজা',
    dayEnglish: 'Maha Ashtami - Kumari Puja & Sandhi Puja',
    date: 'October 18, 2026',
    tithi: 'Shukla Ashtami',
    desc: 'The pinnacle of Durga Puja. Kumari Puja worships a young girl as the living Goddess. The grand Sandhi Puja marks the precise 48 minutes when Ashtami ends and Navami begins, lighting 108 diyas and offering 108 blue lotuses.',
    rituals: [
      { time: '08:30 AM', name: 'মহাষ্টমী পুষ্পাঞ্জলি', detail: 'Millions gather in new attire to offer flowers to Maa.' },
      { time: '10:45 AM', name: 'কুমারী পূজা (Kumari Puja)', detail: 'Worship of the divine Mother manifested in innocence.' },
      { time: '04:52 PM - 05:40 PM', name: 'সন্ধিপূজা (Sandhi Puja)', detail: 'Lighting of 108 lamps to celebrate slaying of Chanda & Munda.' }
    ],
    bhog: ['ঘিয়ে ভাজা লুচি', 'ছোলার ডাল নারকেল দিয়ে', 'বাসন্তী পোলাও', 'কমলাভোগ']
  },
  navami: {
    dayBengali: 'মহা নবমী',
    dayEnglish: 'Maha Navami - Maha Aarti & Dhunuchi Naach',
    date: 'October 19, 2026',
    tithi: 'Shukla Navami',
    desc: 'Celebration of Mahishasuramardini\'s ultimate victory. The sacred fire sacrifice (Navami Homa) is performed, accompanied by exuberant Dhunuchi Naach dances.',
    rituals: [
      { time: '09:30 AM', name: 'মহাশক্তি পূজা ও যজ্ঞ (Homa)', detail: 'Sacred fire oblation with bel leaves and ghee.' },
      { time: '01:30 PM', name: 'মহা নবমী রাজভোগ', detail: 'Elaborate community feast for thousands.' },
      { time: '06:45 PM', name: 'ধুনুচি নাচ প্রতিযোগিতা', detail: 'Traditional dancing with smoking earthen dhunuchi.' }
    ],
    bhog: ['খিচুড়ি ও পোলাও', 'ধোঁকার ডালনা', 'পনির কোর্মা', 'নলেন গুড়ের পায়েস']
  },
  dashami: {
    dayBengali: 'বিজয়া দশমী',
    dayEnglish: 'Bijoya Dashami - Sindoor Khela & Bishorjon',
    date: 'October 20, 2026',
    tithi: 'Shukla Dashami',
    desc: 'The poignant farewell as Maa Durga returns to Mount Kailash. Married women celebrate Sindoor Khela, and the immersion (Bishorjon) concludes with the sweet exchange of "Shubho Bijoya".',
    rituals: [
      { time: '09:00 AM', name: 'দর্পণ বিসর্জন (Darpan Bishorjon)', detail: 'Viewing the reflection of the Goddess in holy water mirror.' },
      { time: '10:30 AM', name: 'সিঁদুর খেলা (Sindoor Khela)', detail: 'Devotees smear vermilion, wishing happiness and long life.' },
      { time: '04:00 PM onwards', name: 'বিসর্জন ও শুভ বিজয়া', detail: 'Immersion in the Ganges and sharing sweets & embrace.' }
    ],
    bhog: ['পান্তা ভাত ও ইলিশ ভাজা', 'রসগোল্লা ও সন্দেশ', 'মিষ্টি দই', 'নিমকি']
  }
};

function initScheduleTabs() {
  const tabs = document.querySelectorAll('.schedule-tabs .tab-btn');
  const container = document.getElementById('scheduleDetail');

  function renderDay(dayKey) {
    const day = scheduleData[dayKey];
    if (!day) return;

    let ritualsHtml = day.rituals
      .map(
        r => `
      <div class="ritual-item">
        <div class="ritual-time">${r.time}</div>
        <div class="ritual-info">
          <strong>${r.name}</strong>
          <p>${r.detail}</p>
        </div>
      </div>
    `
      )
      .join('');

    let bhogHtml = day.bhog
      .map(
        b => `
      <div class="bhog-tag">
        <strong>${b}</strong>
        <span>পবিত্র নৈবেদ্য</span>
      </div>
    `
      )
      .join('');

    container.innerHTML = `
      <div class="schedule-layout">
        <div class="schedule-meta-box">
          <span class="tithi-date-tag">📅 ${day.date} • ${day.tithi}</span>
          <h3 class="schedule-day-title">
            ${day.dayBengali}
            <small>${day.dayEnglish}</small>
          </h3>
          <p class="schedule-desc">${day.desc}</p>
          
          <div class="rituals-list">
            ${ritualsHtml}
          </div>
        </div>

        <div class="schedule-visual-box">
          <h4 class="bhog-box-title">🍲 প্রসাদ ও মহাভোগ (Sacred Offerings)</h4>
          <div class="bhog-items-grid">
            ${bhogHtml}
          </div>

          ${
            dayKey === 'ashtami'
              ? `
            <div class="sandhi-alert">
              <span class="sandhi-alert-icon">🪔</span>
              <div>
                <strong style="color:#ffb347; display:block;">সন্ধিপূজার মাহাত্ম্য (Sandhi Puja):</strong>
                <span style="font-size:0.86rem; color:#f0ede6;">১০৮টি প্রদীপ ও ১০৮টি নীলপদ্ম সহযোগে চণ্ড ও মুণ্ড বধের সন্ধিক্ষণের পুণ্য আরাধনা।</span>
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderDay(tab.dataset.day);
    });
  });

  renderDay('mahalaya');
}

// ==========================================================================
// 6. Pandal Parikrama & Hopping Directory
// ==========================================================================

const pandalsData = [
  {
    id: 1,
    name: 'Sreebhumi Sporting Club',
    bengali: 'শ্রীভূমি স্পোর্টিং ক্লাব',
    category: 'grand',
    image: 'assets/pandal_heritage.jpg',
    tag: 'Palatial Wonder',
    crowd: 'peak',
    crowdLabel: 'Peak Crowd',
    desc: 'Renowned for mind-boggling scale, replica palaces of gold, and diamond-studded jewelry for Maa Durga.',
    timing: 'Best: 2:00 AM - 6:00 AM',
    location: 'Lake Town, Kolkata'
  },
  {
    id: 2,
    name: 'Bagbazar Sarbojanin',
    bengali: 'বাগবাজার সর্বজনীন',
    category: 'heritage',
    image: 'assets/durga_pratima.jpg',
    tag: '100+ Years Tradition',
    crowd: 'moderate',
    crowdLabel: 'Moderate',
    desc: 'The mother of community pujas. Classic serene Daker Saaj Pratima, pristine carnival atmosphere, and rich legacy.',
    timing: 'Best: 9:00 AM - 1:00 PM',
    location: 'Bagbazar Ghat, North Kolkata'
  },
  {
    id: 3,
    name: 'College Square',
    bengali: 'কলেজ স্কোয়ার',
    category: 'grand',
    image: 'assets/pandal_heritage.jpg',
    tag: 'Illuminated Lake',
    crowd: 'peak',
    crowdLabel: 'Peak Crowd',
    desc: 'The iconic reflection of millions of shimmering lights dancing upon the historic square lake.',
    timing: 'Best: 11:00 PM - 3:00 AM',
    location: 'College Street, Kolkata'
  },
  {
    id: 4,
    name: 'Sovabazar Rajbari',
    bengali: 'শোভাবাজার রাজবাড়ি',
    category: 'heritage',
    image: 'assets/durga_pratima.jpg',
    tag: 'Aristocratic Heritage (1757)',
    crowd: 'low',
    crowdLabel: 'Peaceful',
    desc: 'Initiated by Raja Nabakrishna Deb in 1757. Celebrated for royal Thakurdalan, Mithai Naivedya, and gun salutes.',
    timing: 'Best: 7:00 AM - 11:00 AM',
    location: 'Sovabazar, North Kolkata'
  },
  {
    id: 5,
    name: 'Santosh Mitra Square',
    bengali: 'সন্তোষ মিত্র স্কোয়ার',
    category: 'art',
    image: 'assets/pandal_heritage.jpg',
    tag: 'Innovative Light Art',
    crowd: 'peak',
    crowdLabel: 'Peak Crowd',
    desc: 'Pioneers of breathtaking laser illumination and high-tech thematic pandal installations.',
    timing: 'Best: 1:00 AM - 5:00 AM',
    location: 'Lebutala, Bowbazar'
  },
  {
    id: 6,
    name: 'Chetla Agrani Club',
    bengali: 'চেতলা অগ্রণী',
    category: 'eco',
    image: 'assets/dhunuchi_dance.jpg',
    tag: 'Eco-Friendly & Clay Art',
    crowd: 'moderate',
    crowdLabel: 'Moderate',
    desc: 'Eco-conscious craftsmanship using terracotta tiles, bamboo, jute weaves, and indigenous folk aesthetics.',
    timing: 'Best: 4:00 PM - 8:00 PM',
    location: 'Chetla, South Kolkata'
  }
];

function initPandalsGrid() {
  const grid = document.getElementById('pandalsGrid');
  const filters = document.querySelectorAll('.pandal-filters .filter-pill');

  function render(category = 'all') {
    const list = category === 'all' ? pandalsData : pandalsData.filter(p => p.category === category);
    grid.innerHTML = list
      .map(
        p => `
      <div class="pandal-card">
        <div class="pandal-thumb-wrap">
          <img src="${p.image}" alt="${p.name}" class="pandal-thumb" loading="lazy">
          <span class="pandal-tag">${p.tag}</span>
          <div class="crowd-meter">
            <span class="crowd-dot ${p.crowd}"></span> ${p.crowdLabel}
          </div>
        </div>
        <div class="pandal-body">
          <h3 class="pandal-name">${p.name}</h3>
          <span class="pandal-bengali">${p.bengali}</span>
          <p class="pandal-desc">${p.desc}</p>
          <div class="pandal-meta">
            <span>🕒 ${p.timing}</span>
            <a href="https://maps.google.com/?q=${encodeURIComponent(p.name + ' ' + p.location)}" target="_blank" rel="noopener noreferrer" class="map-link">📍 Route</a>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  filters.forEach(f => {
    f.addEventListener('click', () => {
      filters.forEach(btn => btn.classList.remove('active'));
      f.classList.add('active');
      render(f.dataset.filter);
    });
  });

  render();
}

// ==========================================================================
// 7. Interactive Dhak Rhythm Studio
// ==========================================================================

function initDhakStudio() {
  const pads = document.querySelectorAll('.drum-pad');

  pads.forEach(pad => {
    pad.addEventListener('click', () => {
      const sound = pad.dataset.sound;
      synth.playDhakBol(sound);
      synth.animateVisualizerBars();

      pad.classList.add('pad-active');
      setTimeout(() => pad.classList.remove('pad-active'), 120);
    });
  });

  // Keyboard shortcut listener (Keys 1 - 6)
  window.addEventListener('keydown', e => {
    const keyMap = {
      '1': 'dhak-dha',
      '2': 'dhak-ti',
      '3': 'dhak-kure',
      '4': 'ghanta',
      '5': 'shankha',
      '6': 'crescendo'
    };
    if (keyMap[e.key]) {
      const targetPad = document.querySelector(`.drum-pad[data-key="${e.key}"]`);
      if (targetPad) {
        synth.playDhakBol(keyMap[e.key]);
        synth.animateVisualizerBars();
        targetPad.classList.add('pad-active');
        setTimeout(() => targetPad.classList.remove('pad-active'), 120);
      }
    }
  });

  document.getElementById('btnAutoGroove')?.addEventListener('click', () => {
    synth.startAutoGroove();
  });

  document.getElementById('btnStopGroove')?.addEventListener('click', () => {
    synth.stopAutoGroove();
  });
}

// ==========================================================================
// 8. Shubho Bijoya / Festive Greeting Card Maker (HTML5 Canvas)
// ==========================================================================

function initGreetingCardMaker() {
  const canvas = document.getElementById('greetingCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const senderInput = document.getElementById('senderName');
  const receiverInput = document.getElementById('receiverName');
  const wishSelect = document.getElementById('wishPreset');
  const themeButtons = document.querySelectorAll('.theme-choice');

  let currentTheme = 'crimson-gold';

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTheme = btn.dataset.cardTheme;
      drawCard();
    });
  });

  [senderInput, receiverInput, wishSelect].forEach(elem => {
    elem.addEventListener('input', drawCard);
  });

  function drawCard() {
    const w = canvas.width;
    const h = canvas.height;

    // 1. Background Fill
    if (currentTheme === 'crimson-gold') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#590614');
      grad.addColorStop(0.5, '#850c1e');
      grad.addColorStop(1, '#3b020a');
      ctx.fillStyle = grad;
    } else if (currentTheme === 'midnight-divine') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0c0717');
      grad.addColorStop(0.5, '#190e2b');
      grad.addColorStop(1, '#050308');
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#9e4a00');
      grad.addColorStop(0.5, '#cc6b04');
      grad.addColorStop(1, '#522400');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, w, h);

    // 2. Ornate Golden Borders
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    ctx.strokeStyle = 'rgba(255, 235, 150, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, w - 44, h - 44);

    // Corner Motifs
    drawCornerAlpona(ctx, 22, 22);
    drawCornerAlpona(ctx, w - 22, 22, true);
    drawCornerAlpona(ctx, 22, h - 22, false, true);
    drawCornerAlpona(ctx, w - 22, h - 22, true, true);

    // 3. Header Symbol & Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbe28a';
    ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
    ctx.fillText('🔱 শুভ শারদোৎসব ও শুভ বিজয়া 🔱', w / 2, 60);

    // 4. Recipient Name
    const receiver = receiverInput.value.trim() || 'Dear Friends & Family';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`To: ${receiver}`, w / 2, 95);

    // 5. Festive Wish Message (Multi-line wrap)
    const wishText = wishSelect.options[wishSelect.selectedIndex].text;
    ctx.fillStyle = '#fdfbf7';
    ctx.font = '16px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
    wrapText(ctx, wishText, w / 2, 145, w - 100, 26);

    // 6. Traditional Sanskrit Shloka
    ctx.fillStyle = '#d4af37';
    ctx.font = '14px "Hind Siliguri", sans-serif';
    ctx.fillText('"যা দেবী সর্বভূতেষু মাতৃরূপেণ সংস্থিতা। নমস্তস্যৈ নমো নমঃ॥"', w / 2, h - 90);

    // 7. Sender Name
    const sender = senderInput.value.trim() || 'Devotee';
    ctx.fillStyle = '#ffe680';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Warm Greetings from: ${sender}`, w / 2, h - 50);

    // 8. Diya Icon at bottom
    ctx.font = '22px serif';
    ctx.fillText('🪔', w / 2, h - 25);
  }

  function drawCornerAlpona(c, x, y, flipX = false, flipY = false) {
    c.save();
    c.translate(x, y);
    if (flipX) c.scale(-1, 1);
    if (flipY) c.scale(1, -1);
    c.strokeStyle = '#d4af37';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(24, 0);
    c.moveTo(0, 0);
    c.lineTo(0, 24);
    c.arc(0, 0, 16, 0, Math.PI / 2);
    c.stroke();
    c.restore();
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }

  drawCard();

  // Download Card as PNG
  document.getElementById('btnDownloadCard')?.addEventListener('click', () => {
    drawCard();
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Durga_Puja_Greetings_${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  });

  // Share on WhatsApp
  document.getElementById('btnShareCard')?.addEventListener('click', () => {
    const wish = wishSelect.options[wishSelect.selectedIndex].text;
    const sender = senderInput.value.trim();
    const message = `🔱 *শুভ শারদোৎসব ও শারদ শুভেচ্ছা!* 🔱\n\n"${wish}"\n\n- Warmly sent by *${sender}*\n\nCelebrate Durga Puja online: https://angkon101.github.io/DurgaPujo/`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  });
}

// ==========================================================================
// 9. Community Diya Lighting Counter & Bhog Booking
// ==========================================================================

function initCommunity() {
  const diyaStorageKey = 'durga_global_diyas_count';
  let count = parseInt(localStorage.getItem(diyaStorageKey) || '10482', 10);

  const display = document.getElementById('globalDiyaCounter');
  const navDisplay = document.getElementById('navDiyaCount');

  const updateDisplay = () => {
    if (display) display.textContent = count.toLocaleString();
    if (navDisplay) navDisplay.textContent = count.toLocaleString();
  };

  updateDisplay();

  const lightDiya = () => {
    count++;
    localStorage.setItem(diyaStorageKey, count);
    updateDisplay();
    synth.playGhanta(1650, 1.8);

    // Trigger glowing notification
    const btn = document.getElementById('btnLightGlobalDiya');
    if (btn) {
      btn.style.transform = 'scale(1.15)';
      setTimeout(() => (btn.style.transform = 'scale(1)'), 200);
    }
  };

  document.getElementById('btnLightGlobalDiya')?.addEventListener('click', lightDiya);
  document.getElementById('quickDiyaBtn')?.addEventListener('click', lightDiya);
}

// Global Bhog Registration Handler
window.registerBhog = function () {
  const name = document.getElementById('bhogName').value;
  const day = document.getElementById('bhogDay').value;
  const result = document.getElementById('bhogResult');

  const token = 'DP26-' + Math.floor(100000 + Math.random() * 900000);

  result.innerHTML = `
    🎉 <strong>Token Generated: ${token}</strong><br>
    Prasadam Pass confirmed for <em>${name}</em> for <strong>${day}</strong>.<br>
    Please show this token at the mandap distribution counter. শুভ শারদীয়া!
  `;
  result.classList.remove('hidden');
  synth.playGhanta(1540, 2.0);
};

// ==========================================================================
// 10. Navigation & Mobile Menu Handler
// ==========================================================================

function initNavigation() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('mobileMenuToggle');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('nav-open');
    });

    links.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('nav-open');
      });
    });
  }

  document.getElementById('soundToggleBtn')?.addEventListener('click', () => {
    synth.toggleAtmosphere();
  });
}

// ==========================================================================
// 11. High-End Durga Vector Animation Controller (Hero Showcase)
// ==========================================================================

function initDurgaVectorAnimation() {
  const container = document.getElementById('durgaVectorContainer');
  const svg = document.getElementById('durgaSvg');
  const leftPupil = document.getElementById('leftPupilGroup');
  const rightPupil = document.getElementById('rightPupilGroup');
  const btnReplay = document.getElementById('btnReplayDraw');
  const btnBlessing = document.getElementById('btnBlessingBurst');

  if (!container || !svg) return;

  // 1. Eye Tracking (Pupil gently follows mouse/cursor)
  window.addEventListener('mousemove', e => {
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // SVG coordinate space mapping (500x500 viewBox)
    const mouseSvgX = ((e.clientX - rect.left) / rect.width) * 500;
    const mouseSvgY = ((e.clientY - rect.top) / rect.height) * 500;

    // Left eye center in SVG: (216, 246)
    const leftDx = mouseSvgX - 216;
    const leftDy = mouseSvgY - 246;
    const leftDist = Math.hypot(leftDx, leftDy) || 1;
    const maxRadius = 4.0;
    const leftMoveX = (leftDx / leftDist) * Math.min(leftDist * 0.05, maxRadius);
    const leftMoveY = (leftDy / leftDist) * Math.min(leftDist * 0.05, maxRadius);

    if (leftPupil) {
      leftPupil.setAttribute('transform', `translate(${216 + leftMoveX}, ${246 + leftMoveY})`);
    }

    // Right eye center in SVG: (284, 246)
    const rightDx = mouseSvgX - 284;
    const rightDy = mouseSvgY - 246;
    const rightDist = Math.hypot(rightDx, rightDy) || 1;
    const rightMoveX = (rightDx / rightDist) * Math.min(rightDist * 0.05, maxRadius);
    const rightMoveY = (rightDy / rightDist) * Math.min(rightDist * 0.05, maxRadius);

    if (rightPupil) {
      rightPupil.setAttribute('transform', `translate(${284 + rightMoveX}, ${246 + rightMoveY})`);
    }
  });

  // 2. Interactive Click / Touch Shockwave & Temple Bell
  container.addEventListener('click', e => {
    const rect = container.getBoundingClientRect();
    const shock = document.createElement('div');
    shock.className = 'vector-shockwave';
    shock.style.left = `${e.clientX - rect.left}px`;
    shock.style.top = `${e.clientY - rect.top}px`;
    container.appendChild(shock);

    synth.playGhanta(1780, 2.0);

    setTimeout(() => shock.remove(), 750);
  });

  // 3. Replay Path Animation
  btnReplay?.addEventListener('click', e => {
    e.stopPropagation();
    const paths = svg.querySelectorAll('.animated-path');
    paths.forEach(p => {
      p.style.animation = 'none';
      p.offsetHeight; // Trigger reflow
      p.style.animation = '';
    });
    synth.playGhanta(1540, 1.8);
  });

  // 4. Divine Blessing Shockwave & Conch Sound
  btnBlessing?.addEventListener('click', e => {
    e.stopPropagation();
    synth.playShankha();
    synth.playGhanta(1600, 2.5);

    // Shockwave from center
    const shock = document.createElement('div');
    shock.className = 'vector-shockwave';
    shock.style.left = '50%';
    shock.style.top = '50%';
    container.appendChild(shock);

    container.style.transform = 'scale(1.08)';
    setTimeout(() => {
      container.style.transform = '';
      shock.remove();
    }, 800);
  });
}

// ==========================================================================
// 12. Grand Ekchala Pantheon Vector Art Controller
// ==========================================================================

const DEITY_DATA = {
  all: {
    badge: 'ঐতিহ্যবাহী শারদোৎসব',
    title: 'সম্পূর্ণ একচালা দুর্গোৎসব পরিষদ (The Grand Ekchala Pantheon)',
    shloka: '“ওঁ জয়ন্তী মঙ্গলা কালী ভদ্রকালী কপালিনী। দুর্গা শিবা ক্ষমা ধাত্রী স্বাহা স্বধা নমোঽস্তু তে॥”',
    meaning: 'In traditional Bengali heritage, Maa Durga arrives on earth accompanied by Her divine children: Lakshmi (wealth & prosperity), Saraswati (knowledge & arts), Ganesha (wisdom & auspicious beginnings), and Kartikeya (courage & protection), united under the sacred arched Chalchitra frame.',
    tags: ['🏛️ Tradition: Ekchala (একচালা)', '🖼️ Frame: Celestial Chalchitra', '👨‍👩‍👧‍👦 Family: The Divine Homecoming']
  },
  durga: {
    badge: 'দশপ্রহরণধারিণী',
    title: 'মা দুর্গা ও মহিষাসুরমর্দিনী (Maa Durga)',
    shloka: '“সর্বমঙ্গলমঙ্গল্যে শিবে সর্বার্থসাধিকে। শরণ্যে ত্র্যম্বকে গৌরি নারায়ণি নমোঽস্তু তে॥”',
    meaning: 'Maa Durga stands in the center as the supreme embodiment of divine feminine energy (Shakti). Her ten arms hold the ten weapons gifted by the gods to vanquish darkness and ignorance (Mahishasura), riding Her fearless golden Lion.',
    tags: ['🦁 Vahan: Singho (Lion)', '🔱 Weapon: Golden Trishul', '✨ Symbolism: Supreme Cosmic Energy']
  },
  lakshmi: {
    badge: 'ধনধান্যদা',
    title: 'দেবী লক্ষ্মী (Devi Lakshmi)',
    shloka: '“ওঁ শ্রীং হ্রীং ক্লীং ত্রিভুবন মহালক্ষ্ম্যৈ অস্মাকং দারিদ্র্য নাশায় মঙ্গলাং দেহি নমো নমঃ॥”',
    meaning: 'Devi Lakshmi is the goddess of wealth, fortune, light, and auspicious harvests. In the Ekchala frame, She stands gracefully to Durga’s right, clutching a blooming pink lotus and sheaf of golden paddy (dhaner chhari), seated beside Her mount, the wise white barn owl.',
    tags: ['🦉 Vahan: Pecha (White Owl)', '🪷 Attributes: Pink Lotus & Golden Grain', '🌾 Symbolism: Abundance & Purity']
  },
  saraswati: {
    badge: 'বিদ্যাদায়িনী',
    title: 'দেবী সরস্বতী (Devi Saraswati)',
    shloka: '“যা কুন্দেন্দুতুষারহারধবলা যা শুভ্রবস্ত্রাবৃতা। যা বীণাবরদণ্ডমণ্ডীতকরা যা শ্বেতপদ্মাসীনা॥”',
    meaning: 'Devi Saraswati is the radiant goddess of knowledge, arts, literature, and inner wisdom. Dressed in spotless white representing ultimate truth, She plays the sacred Veena and is accompanied by the discriminating royal white swan (Rajhamsa).',
    tags: ['🦢 Vahan: Rajhamsa (Divine Swan)', '🪕 Instrument: Classical Veena', '📖 Symbolism: Truth, Knowledge & Arts']
  },
  ganesha: {
    badge: 'সিদ্ধিদাতা',
    title: 'শ্রী সিদ্ধিদাতা গণেশ (Lord Ganesha)',
    shloka: '“বক্রতুণ্ড মহাকায় সূর্যকোটি সমপ্রভ। নির্বিঘ্নং কুরু মে দেব সর্বকার্যেষু সর্বদা॥”',
    meaning: 'Lord Ganesha is the remover of all obstacles and harbinger of auspicious beginnings and intellect. In the Ekchala composition, He resides on the far left with His curved trunk holding a sweet modak, blessing devotees alongside His nimble carrier, Moushiko the mouse.',
    tags: ['🐀 Vahan: Moushiko (Mouse)', '🍯 Attribute: Modak & Broken Tusk', '🕉️ Symbolism: Intellect & Remover of Obstacles']
  },
  kartikeya: {
    badge: 'দেবসেনাপতি',
    title: 'শ্রী কার্তিক (Lord Kartikeya)',
    shloka: '“কার্তিকেয়ং মহাবাহুং ময়ূরবাহনস্থিতম্। শক্তিহস্তং মহাবীরং দেবসেনাপতিং ভজে॥”',
    meaning: 'Lord Kartikeya is the handsome divine commander of the celestial forces, personifying youth, supreme valour, and righteous strength. Standing on the far right, He wields a golden bow and spear while standing beside His resplendent dancing peacock.',
    tags: ['🦚 Vahan: Mayur (Peacock)', '🏹 Weapons: Golden Spear (Vel) & Bow', '⚔️ Symbolism: Valour & Righteous Protection']
  }
};

function initEkchalaController() {
  const pills = document.querySelectorAll('.deity-pill');
  const hotspots = document.querySelectorAll('.deity-hotspot');
  const stage = document.getElementById('ekchalaStage');
  const svg = document.getElementById('ekchalaSvg');
  const btnReplay = document.getElementById('btnReplayEkchala');
  const btnAarti = document.getElementById('btnAartiSpotlight');

  const badgeEl = document.getElementById('infoDeityBadge');
  const titleEl = document.getElementById('infoDeityTitle');
  const shlokaEl = document.getElementById('infoDeityShloka');
  const meaningEl = document.getElementById('infoDeityMeaning');
  const tagsEl = document.getElementById('infoDeityTags');

  if (!stage || !svg) return;

  function selectDeity(deityId, playSound = true) {
    const data = DEITY_DATA[deityId] || DEITY_DATA.all;

    // Update active pill
    pills.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-deity') === deityId);
    });

    // Update SVG hotspots spotlight / dimmed states
    hotspots.forEach(hs => {
      const hDeity = hs.getAttribute('data-deity');
      if (deityId === 'all') {
        hs.classList.remove('spotlight', 'dimmed');
      } else if (hDeity === deityId) {
        hs.classList.add('spotlight');
        hs.classList.remove('dimmed');
      } else {
        hs.classList.add('dimmed');
        hs.classList.remove('spotlight');
      }
    });

    // Smoothly update Info Card
    const infoCard = document.getElementById('deityInfoCard');
    if (infoCard) {
      infoCard.style.opacity = '0.3';
      infoCard.style.transform = 'translateY(4px)';
      setTimeout(() => {
        if (badgeEl) badgeEl.textContent = data.badge;
        if (titleEl) titleEl.textContent = data.title;
        if (shlokaEl) shlokaEl.textContent = data.shloka;
        if (meaningEl) meaningEl.textContent = data.meaning;
        if (tagsEl) {
          tagsEl.innerHTML = data.tags.map(t => `<span class="symbol-tag">${t}</span>`).join('');
        }
        infoCard.style.opacity = '1';
        infoCard.style.transform = 'translateY(0)';
      }, 150);
    }

    if (playSound) {
      synth.playDeitySound(deityId);
    }
  }

  // Pill click handlers
  pills.forEach(p => {
    p.addEventListener('click', () => {
      const deity = p.getAttribute('data-deity');
      selectDeity(deity, true);
    });
  });

  // SVG Hotspot click handlers
  hotspots.forEach(hs => {
    hs.addEventListener('click', e => {
      e.stopPropagation();
      const deity = hs.getAttribute('data-deity');
      selectDeity(deity, true);
    });
  });

  // Replay Line Draw Animation
  btnReplay?.addEventListener('click', () => {
    const ekPaths = svg.querySelectorAll('.ek-path');
    ekPaths.forEach(p => {
      p.style.animation = 'none';
      p.offsetHeight; // trigger reflow
      p.style.animation = '';
    });
    synth.playGhanta(1620, 2.0);
  });

  // Toggle Aarti Spotlight Atmosphere
  btnAarti?.addEventListener('click', () => {
    stage.classList.toggle('aarti-spotlight');
    const isActive = stage.classList.contains('aarti-spotlight');
    btnAarti.classList.toggle('active', isActive);

    if (isActive) {
      synth.playShankha();
      synth.playGhanta(1760, 2.5);
    } else {
      synth.playGhanta(1200, 1.2);
    }
  });
}

// ==========================================================================
// Initialize on DOM Ready
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initCountdown();
  initDurgaVectorAnimation();
  initEkchalaController();
  initDarshanInteractions();
  initScheduleTabs();
  initPandalsGrid();
  initDhakStudio();
  initGreetingCardMaker();
  initCommunity();
  initNavigation();
});

