import type { GameSettings, WorldId } from '../types/game';

type SoundName = 'click' | 'jump' | 'star' | 'gem' | 'hurt' | 'checkpoint' | 'complete' | 'unlock';

const soundMap: Record<SoundName, [number, number, OscillatorType]> = {
  click: [440, .06, 'sine'], jump: [330, .1, 'sine'], star: [880, .16, 'triangle'], gem: [660, .09, 'sine'],
  hurt: [140, .16, 'square'], checkpoint: [520, .22, 'triangle'], complete: [740, .45, 'triangle'], unlock: [620, .35, 'sine'],
};

export class AudioManager {
  private context?: AudioContext;
  private musicNodes: OscillatorNode[] = [];
  private settings: GameSettings;
  private currentWorld?: WorldId;

  constructor(settings: GameSettings) { this.settings = settings; }
  update(settings: GameSettings): void { this.settings = settings; if (!settings.musicEnabled) this.stopMusic(); else if (this.currentWorld) this.startMusic(this.currentWorld); }

  private getContext(): AudioContext | undefined {
    try { this.context ??= new AudioContext(); if (this.context.state === 'suspended') void this.context.resume(); return this.context; } catch { return undefined; }
  }

  play(name: SoundName): void {
    if (!this.settings.effectsEnabled) return;
    const context = this.getContext(); if (!context) return;
    const [frequency, duration, type] = soundMap[name];
    const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    if (name === 'jump' || name === 'hurt') oscillator.frequency.exponentialRampToValueAtTime(Math.max(70, frequency * .65), context.currentTime + duration);
    gain.gain.setValueAtTime(this.settings.effectsVolume * .12, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + duration);
  }

  startMusic(world: WorldId): void {
    this.currentWorld = world; this.stopMusic(false);
    if (!this.settings.musicEnabled || this.settings.musicVolume <= 0) return;
    const context = this.getContext(); if (!context) return;
    const roots: Record<WorldId, number[]> = { 1: [196, 294], 2: [220, 330], 3: [164.8, 246.9] };
    this.musicNodes = roots[world].map((frequency, index) => {
      const osc = context.createOscillator(); const gain = context.createGain();
      osc.type = index ? 'sine' : 'triangle'; osc.frequency.value = frequency;
      gain.gain.value = this.settings.musicVolume * (index ? .018 : .012);
      osc.connect(gain).connect(context.destination); osc.start(); return osc;
    });
  }

  stopMusic(clearWorld = true): void { this.musicNodes.forEach((node) => { try { node.stop(); } catch { /* already stopped */ } }); this.musicNodes = []; if (clearWorld) this.currentWorld = undefined; }
}

export const audioManager = new AudioManager(progressManagerSettings());
function progressManagerSettings(): GameSettings {
  try {
    const raw = localStorage.getItem('bunny-magical-adventure:v1');
    const parsed = raw ? JSON.parse(raw) as { settings?: GameSettings } : undefined;
    return parsed?.settings ?? { musicEnabled: true, musicVolume: .22, effectsEnabled: true, effectsVolume: .45, reducedMotion: false, showTouchControls: true };
  } catch { return { musicEnabled: true, musicVolume: .22, effectsEnabled: true, effectsVolume: .45, reducedMotion: false, showTouchControls: true }; }
}
