// Web Audio Ambient Sound Generator for Focus Room
// Generates rain, warm cafe noise, 40Hz binaural waves, and forest wind dynamically

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private gainNode: GainNode | null = null;
  private activeNodes: Array<AudioNode> = [];

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
    this.stop();
    const ctx = this.getContext();

    this.currentType = type;
    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
    // Smooth fade in
    this.gainNode.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.2);
    this.gainNode.connect(ctx.destination);

    if (type === "binaural") {
      // 40Hz Gamma Focus Binaural Beats (200Hz Base, 240Hz Harmonic)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(200, ctx.currentTime);
      osc2.frequency.setValueAtTime(240, ctx.currentTime);

      osc1.connect(this.gainNode);
      osc2.connect(this.gainNode);
      osc1.start();
      osc2.start();
      this.activeNodes.push(osc1, osc2);
    } else {
      // Noise buffer for Rain, Lofi, and Forest
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Filter into brown/pink noise
        if (type === "rain") {
          // Rain: crisp pink noise
          output[i] = (lastOut + 0.04 * white) / 1.04;
        } else if (type === "lofi") {
          // Lofi: warm brown noise
          output[i] = (lastOut + 0.02 * white) / 1.02;
        } else {
          // Forest: gentle wind modulation
          output[i] = (lastOut + 0.03 * white) / 1.03;
        }
        lastOut = output[i];
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === "rain") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(900, ctx.currentTime);
      } else if (type === "lofi") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);
      } else {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(650, ctx.currentTime);
      }

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      whiteNoise.start();
      this.activeNodes.push(whiteNoise, filter);
    }
  }

  public stop() {
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
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
      this.currentType = null;
    }, 550);
  }

  public isPlaying(type?: string): boolean {
    return type ? this.currentType === type : Boolean(this.currentType);
  }
}

export const ambientAudio = new AmbientSoundEngine();
