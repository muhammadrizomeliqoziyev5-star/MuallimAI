class SoundEffects {
  private ctx: AudioContext | null = null;
  public muted = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq: number, duration = 0.1, type: OscillatorType = "sine", volume = 0.08, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  playFlip() {
    this.playTone(420, 0.06, "triangle", 0.05);
  }

  playSnap() {
    this.playTone(520, 0.08, "sine", 0.09);
    this.playTone(780, 0.11, "sine", 0.07, 0.04);
  }

  playSuccess() {
    this.playTone(523.25, 0.12, "triangle", 0.08, 0);
    this.playTone(659.25, 0.14, "triangle", 0.08, 0.08);
    this.playTone(783.99, 0.2, "triangle", 0.09, 0.16);
  }

  playError() {
    this.playTone(220, 0.14, "sawtooth", 0.04, 0);
    this.playTone(180, 0.16, "sawtooth", 0.04, 0.08);
  }

  playTick() {
    this.playTone(880, 0.03, "square", 0.025);
  }

  playFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, "triangle", 0.09, idx * 0.09);
    });
  }
}

export const soundFx = new SoundEffects();
