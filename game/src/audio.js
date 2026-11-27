// Synthesised sound for Giblet's Great Escape — WebAudio only, no audio
// files. Every effect is built from oscillators and filtered noise, so the
// game ships zero sound assets and still gobbles.

export class SoundBank {
  constructor() {
    this.context = null;
    this.master = null;
    this.muted = false;
    this.lastAlarmAt = 0;
  }

  ensure() {
    if (this.context) {
      if (this.context.state === 'suspended') this.context.resume();
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.context.destination);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  tone({ frequency, endFrequency, type = 'sine', duration = 0.15, volume = 0.5, delay = 0, slide = null }) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    const target = slide !== null ? slide : (endFrequency ?? frequency);
    if (target !== frequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, target), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  noiseBurst({ duration = 0.2, volume = 0.4, frequency = 1200, delay = 0 }) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime + delay;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = 0.8;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(now);
  }

  // The turkey's signature: a quick run of low honks.
  gobble() {
    this.ensure();
    const notes = [392, 330, 392, 311, 392];
    notes.forEach((frequency, i) => {
      this.tone({ frequency, endFrequency: frequency * 0.85, type: 'square', duration: 0.09, volume: 0.22, delay: i * 0.09 });
    });
  }

  jump() {
    this.tone({ frequency: 320, endFrequency: 720, type: 'sine', duration: 0.16, volume: 0.3 });
  }

  flap() {
    this.tone({ frequency: 520, endFrequency: 940, type: 'triangle', duration: 0.12, volume: 0.25 });
    this.noiseBurst({ duration: 0.08, volume: 0.12, frequency: 2400 });
  }

  pickup(combo) {
    const base = 660 + Math.min(combo, 8) * 40;
    this.tone({ frequency: base, type: 'sine', duration: 0.09, volume: 0.3 });
    this.tone({ frequency: base * 1.5, type: 'sine', duration: 0.12, volume: 0.28, delay: 0.06 });
  }

  feather() {
    [523, 659, 784, 1047].forEach((frequency, i) => {
      this.tone({ frequency, type: 'triangle', duration: 0.14, volume: 0.3, delay: i * 0.07 });
    });
  }

  dash() {
    this.noiseBurst({ duration: 0.22, volume: 0.3, frequency: 900 });
  }

  stumble() {
    this.noiseBurst({ duration: 0.25, volume: 0.45, frequency: 500 });
    this.tone({ frequency: 220, endFrequency: 90, type: 'sawtooth', duration: 0.3, volume: 0.3 });
  }

  alarm() {
    const now = performance.now();
    if (now - this.lastAlarmAt < 1400) return;
    this.lastAlarmAt = now;
    this.tone({ frequency: 880, type: 'square', duration: 0.1, volume: 0.16 });
    this.tone({ frequency: 660, type: 'square', duration: 0.1, volume: 0.16, delay: 0.13 });
  }

  knifeWhoosh() {
    this.noiseBurst({ duration: 0.18, volume: 0.22, frequency: 3200 });
  }

  ovenRoar() {
    this.noiseBurst({ duration: 0.4, volume: 0.2, frequency: 300 });
  }

  caughtSting() {
    // A short descending sting: dinner is served (almost).
    [392, 370, 349, 311].forEach((frequency, i) => {
      this.tone({ frequency, type: 'triangle', duration: 0.32, volume: 0.32, delay: i * 0.22 });
    });
    this.tone({ frequency: 155, endFrequency: 77, type: 'sawtooth', duration: 0.9, volume: 0.22, delay: 0.7 });
  }

  escapeFanfare() {
    [523, 659, 784, 1047, 1319].forEach((frequency, i) => {
      this.tone({ frequency, type: 'triangle', duration: 0.22, volume: 0.3, delay: i * 0.11 });
    });
    this.tone({ frequency: 1568, type: 'sine', duration: 0.5, volume: 0.25, delay: 0.6 });
  }

  click() {
    this.tone({ frequency: 980, type: 'sine', duration: 0.05, volume: 0.2 });
  }
}
