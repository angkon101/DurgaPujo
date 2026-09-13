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
// 4. Interactive Virtual Darshan & Aarti Actions
// ==========================================================================

function initDarshanInteractions() {
  const mandap = document.getElementById('mandapStage');
  const thali = document.getElementById('aartiThali');
  const burstLayer = document.getElementById('flowerBurstLayer');
  let isOrbiting = false;

  // Move thali with mouse over the mandap
  if (mandap && thali) {
    mandap.addEventListener('mousemove', e => {
      if (isOrbiting) return;
      const rect = mandap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      thali.style.left = `${x}px`;
      thali.style.top = `${y}px`;
    });
  }

  // Ritual Buttons
  document.getElementById('btnShankha')?.addEventListener('click', () => {
    synth.playShankha();
    triggerDivineHalo();
  });

  document.getElementById('btnGhanta')?.addEventListener('click', () => {
    synth.playGhanta(1420, 2.2);
    triggerDivineHalo();
  });

  document.getElementById('btnPushpanjali')?.addEventListener('click', () => {
    triggerFlowerShower();
    synth.playGhanta(1750, 1.8);
  });

  document.getElementById('btnAartiMode')?.addEventListener('click', () => {
    isOrbiting = !isOrbiting;
    thali.classList.toggle('orbiting', isOrbiting);
    if (isOrbiting) {
      synth.playDhakBol('crescendo');
    }
  });

  document.getElementById('btnPranom')?.addEventListener('click', () => {
    triggerDivineHalo();
    synth.playShankha();
    alert('মা দুর্গার আশীর্বাদ আপনার এবং আপনার পরিবারের উপর সদা বর্ষিত হোক। শুভ শারদীয়া!');
  });

  // Mantra Chanting Recitation
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

  function triggerDivineHalo() {
    const aura = document.getElementById('auraGlow');
    if (!aura) return;
    aura.style.opacity = '1';
    aura.style.transform = 'translateX(-50%) scale(1.5)';
    setTimeout(() => {
      aura.style.opacity = '0.6';
      aura.style.transform = 'translateX(-50%) scale(1)';
    }, 1400);
  }

  function triggerFlowerShower() {
    const petals = ['🌸', '🌺', '🪷', '🌼', '✨'];
    for (let i = 0; i < 24; i++) {
      const petal = document.createElement('div');
      petal.className = 'falling-petal';
      petal.textContent = petals[Math.floor(Math.random() * petals.length)];
      petal.style.left = `${Math.random() * 90 + 5}%`;
      petal.style.top = `${Math.random() * 20}%`;
      petal.style.animationDelay = `${Math.random() * 0.8}s`;
      burstLayer.appendChild(petal);

      setTimeout(() => petal.remove(), 2600);
    }
  }
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
// Initialize on DOM Ready
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initCountdown();
  initDarshanInteractions();
  initScheduleTabs();
  initPandalsGrid();
  initDhakStudio();
  initGreetingCardMaker();
  initCommunity();
  initNavigation();
});
