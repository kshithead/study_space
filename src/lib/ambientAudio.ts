// Web Audio Ambient Sound Generator for Focus Room
// Generates rain, warm cafe lofi, 40Hz binaural waves, and deep forest breeze dynamically

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private gainNode: GainNode | null = null;
  private activeNodes: Array<AudioNode> = [];
  private stopTimeout: any = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public play(type: "rain" | "lofi" | "binaural" | "forest" | string) {
    // If a stop timeout was pending from a previous switch, clear it immediately
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    // Immediately cleanup previous nodes so they don't overlap
    this.cleanupNodes();

    const ctx = this.getContext();
    this.currentType = type;

    // Master gain for ambient atmosphere
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.6);
    gain.connect(ctx.destination);
    this.gainNode = gain;

    if (type === "binaural") {
      // 40Hz Gamma Focus Binaural Beats (200Hz base + 240Hz harmonic)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(200, now);
      osc2.frequency.setValueAtTime(240, now);

      osc1.connect(gain);
      osc2.connect(gain);
      osc1.start();
      osc2.start();
      this.activeNodes.push(osc1, osc2);
    } else {
      // 5-second seamless looped noise buffer
      const sampleRate = ctx.sampleRate;
      const bufferSize = sampleRate * 5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === "rain") {
          // Paul Kellet's Pink Noise algorithm (natural rainfall sound)
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else if (type === "lofi") {
          // Warm brown noise (deep relaxing cafe hum)
          b0 = (b0 + 0.02 * white) / 1.02;
          output[i] = b0 * 2.8;
        } else {
          // Forest breeze: soft modulated pink/brown noise
          b0 = (b0 + 0.03 * white) / 1.03;
          output[i] = b0 * 2.2;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === "rain") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, now);
      } else if (type === "lofi") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(400, now);
        filter.Q.setValueAtTime(1.2, now);
      } else {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(700, now);
      }

      source.connect(filter);
      filter.connect(gain);
      source.start();
      this.activeNodes.push(source, filter);
    }
  }

  private cleanupNodes() {
    for (const node of this.activeNodes) {
      try {
        if ("stop" in node && typeof (node as any).stop === "function") {
          (node as any).stop();
        }
        node.disconnect();
      } catch {
        // ignore
      }
    }
    this.activeNodes = [];
  }

  public stop() {
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    if (this.gainNode && this.ctx) {
      try {
        const cur = this.gainNode.gain.value;
        this.gainNode.gain.setValueAtTime(cur, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
      } catch {
        // ignore
      }
    }

    // Capture current nodes in a closure so future calls don't get wiped
    const oldNodes = [...this.activeNodes];
    this.activeNodes = [];
    this.currentType = null;

    this.stopTimeout = setTimeout(() => {
      for (const node of oldNodes) {
        try {
          if ("stop" in node && typeof (node as any).stop === "function") {
            (node as any).stop();
          }
          node.disconnect();
        } catch {
          // ignore
        }
      }
      this.stopTimeout = null;
    }, 450);
  }

  public isPlaying(type?: string): boolean {
    return type ? this.currentType === type : Boolean(this.currentType);
  }
}

export const ambientAudio = new AmbientSoundEngine();
