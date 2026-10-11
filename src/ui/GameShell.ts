import type Phaser from 'phaser';
import { LEVELS } from '../game/levels/levelData';
import { WORLDS } from '../game/levels/worldData';
import { audioManager } from '../game/systems/AudioManager';
import { eventBus, Events } from '../game/systems/EventBus';
import { progressManager } from '../game/systems/ProgressManager';
import type { GameSettings, HudState, LevelCompletePayload, LevelId } from '../game/types/game';
import { completedLevels, levelUnlocked, totalBestGems, totalStars, worldUnlocked } from '../game/utils/scoring';
import { icon, starRating, worldArt } from './icons';

type ScreenName = 'loading' | 'menu' | 'worlds' | 'levels' | 'settings' | 'help' | 'pause' | 'gameover' | 'complete' | 'victory';

export class GameShell {
  private root: HTMLElement;
  private game?: Phaser.Game;
  private settingsReturn: ScreenName = 'menu';
  private activeWorld = 1;
  private activeLevel: LevelId = 1;
  private touchPointers = new Map<number, 'left' | 'right' | 'jump'>();

  private get nativeFullscreenElement(): Element | null {
    return document.fullscreenElement ?? (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement ?? null;
  }

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.innerHTML = this.markup();
    this.bindDom(); this.bindEvents(); this.show('loading');
    this.syncPreferences();
  }

  attachGame(game: Phaser.Game): void { this.game = game; }

  private markup(): string {
    return `<div class="game-page">
      <section class="game-frame" aria-label="Game player">
        <header class="frame-header">
          <div class="brand"><img src="/assets/art/bunny.svg" alt="" width="32" height="39"><span>Bunny's Magical Adventure</span></div>
          <div class="frame-tools"><button class="icon-button" data-action="sound" aria-label="Mute audio" aria-pressed="false">${icon('sound')}</button><button class="icon-button" data-action="fullscreen" aria-label="Enter fullscreen">${icon('expand')}</button></div>
        </header>
        <div class="game-viewport">
          <div id="game-canvas" aria-label="Platform game canvas"></div>
          <div class="leaf-frame" aria-hidden="true"><i class="leaf a"></i><i class="leaf b"></i><i class="leaf c"></i><i class="leaf d"></i></div>
          <div id="hud" class="hud" hidden aria-live="polite">
            <span class="hud-chip level-label" id="hud-level">Level</span><span class="hud-chip">${icon('star')}<span id="hud-stars">Stars 0 / 3</span></span>
            <span class="hud-chip">${icon('gem')}<span id="hud-gems">Gems 0</span></span><span class="hud-chip">${icon('heart')}<span id="hud-hearts">Hearts 3</span></span><span class="hud-spacer"></span>
            <button class="icon-button" type="button" data-action="pause" aria-label="Pause game">${icon('pause')}</button>
          </div>
          <p id="tutorial-hint" class="tutorial-hint" role="status" hidden></p>
          <div id="game-ui" class="ui-layer">
            <section class="screen" data-screen="loading" aria-labelledby="loading-title"><div class="screen-card"><p class="eyebrow">Loading</p><h2 id="loading-title">Packing a little adventure…</h2><p>Preparing six magical paths.</p></div></section>
            <section class="screen menu-screen" data-screen="menu" hidden aria-labelledby="game-title">
              <div class="menu-landscape" aria-hidden="true"></div>
              <div class="hero-content"><p class="adventure-badge">${icon('leaf')} A little adventure awaits</p>
                <h1 id="game-title"><span class="title-small">Bunny's </span><span class="title-magic">Magical </span><span class="title-adventure">Adventure</span></h1>
                <p class="tagline">Little Paws. Big Adventures.</p><p class="hero-description">Follow the stars. Find your courage.<br>One little hop at a time.</p>
                <div class="hero-actions"><button class="btn primary play-button" data-action="play">${icon('play')}<span>Play</span>${icon('arrow')}</button><button class="btn continue-button" data-action="continue">${icon('arrow')} Continue</button></div>
                <div class="menu-links"><button data-action="worlds">${icon('book')} Level Select</button><button data-action="settings">${icon('settings')} Settings</button><button data-action="help">${icon('help')} How to Play</button></div>
              </div>
              <div class="hero-character" aria-hidden="true"><span class="hero-spark s1">${icon('star')}</span><span class="hero-spark s2">${icon('star')}</span><span class="hero-spark s3">${icon('star')}</span><img class="hero-bunny" src="/assets/art/bunny.svg" alt="" width="320" height="390"><span class="character-caption">A brave little heart.</span></div>
              <div class="world-preview" aria-label="Adventure worlds">${WORLDS.map((world) => `<button class="preview-world" data-action="preview-world" data-value="${world.id}"><img src="${worldArt(world.id)}" alt="" width="84" height="54"><span><small>World ${world.id}</small><strong>${world.name}</strong></span><span class="preview-status" data-world-status="${world.id}">${icon(world.id === 1 ? 'arrow' : 'lock')}</span></button>`).join('')}</div>
            </section>
            <section class="screen selection-screen" data-screen="worlds" hidden aria-labelledby="world-title"><div class="screen-card selection-card"><p class="eyebrow">Three worlds. One little adventurer.</p><h2 id="world-title">Where will you hop next?</h2><p class="section-description">Every path holds a little magic. Start in the forest.</p><div id="world-grid" class="card-grid"></div><div class="button-row"><button class="btn ghost" data-action="menu">${icon('back')} Back</button></div></div></section>
            <section class="screen selection-screen" data-screen="levels" hidden aria-labelledby="level-title"><div class="screen-card selection-card"><p class="eyebrow" id="level-world">World</p><h2 id="level-title">Choose a level</h2><p class="section-description">Collect three stars and follow the trail to the portal.</p><div id="level-grid" class="card-grid level-grid"></div><div class="button-row"><button class="btn ghost" data-action="worlds">${icon('back')} Back to worlds</button></div></div></section>
            <section class="screen" data-screen="settings" hidden aria-labelledby="settings-title"><div class="screen-card"><p class="eyebrow">Preferences</p><h2 id="settings-title">Settings</h2><div id="settings-fields" class="settings-grid"></div><p class="save-note">Preferences and progress are saved in this browser. Clearing browser data can remove them.</p><div class="button-row"><button class="btn" data-action="settings-back">Done</button><button class="btn ghost" data-action="reset">Reset progress</button></div></div></section>
            <section class="screen" data-screen="help" hidden aria-labelledby="help-title"><div class="screen-card"><p class="eyebrow">Controls</p><h2 id="help-title">How to Play</h2><ul class="help-list"><li>Move with A and D, or the Left and Right arrow keys.</li><li>Jump with Space, W, or the Up arrow key.</li><li>Press the jump key again while airborne to double jump and reach higher ledges.</li><li>On touch screens, hold Left or Right and tap Jump. Tap Jump again in the air to double jump.</li><li>Collect three stars in each level and gather gems along the way.</li><li>Press Escape or P to pause.</li></ul><button class="btn" data-action="menu">Got it</button></div></section>
            <section class="screen" data-screen="pause" hidden aria-labelledby="pause-title"><div class="screen-card"><p class="eyebrow">Game paused</p><h2 id="pause-title">Take a breather</h2><div class="menu-actions"><button class="btn primary" data-action="resume">Resume</button><button class="btn" data-action="restart">Restart Level</button><button class="btn" data-action="pause-settings">Settings</button><button class="btn" data-action="worlds-from-game">Level Select</button><button class="btn ghost" data-action="menu-from-game">Main Menu</button></div></div></section>
            <section class="screen" data-screen="gameover" hidden aria-labelledby="gameover-title"><div class="screen-card"><img class="result-bunny" src="/assets/art/bunny.svg" alt="" width="88" height="107"><p class="eyebrow">The trail can wait</p><h2 id="gameover-title">Ready for another hop?</h2><p>Every adventurer needs a second try.</p><div class="button-row"><button class="btn primary" data-action="restart">Try Again</button><button class="btn" data-action="worlds-from-game">Level Select</button><button class="btn ghost" data-action="menu-from-game">Main Menu</button></div></div></section>
            <section class="screen" data-screen="complete" hidden aria-labelledby="complete-title"><div class="screen-card"><p class="eyebrow">Path cleared</p><h2 id="complete-title">Magical! Level Complete!</h2><div id="complete-stats"></div><div class="button-row"><button class="btn primary" data-action="next">Next Level</button><button class="btn" data-action="replay">Replay</button><button class="btn ghost" data-action="worlds-from-game">Level Select</button></div></div></section>
            <section class="screen" data-screen="victory" hidden aria-labelledby="victory-title"><div class="screen-card"><p class="eyebrow">The moonlight wish</p><h2 id="victory-title">You Did It, Little Adventurer!</h2><p class="tagline">Every magical journey begins with one brave little hop.</p><div id="victory-stats"></div><div class="button-row"><button class="btn primary" data-action="play-again">Play Again</button><button class="btn" data-action="worlds-from-game">Explore Levels</button><button class="btn ghost" data-action="menu-from-game">Main Menu</button></div></div></section>
          </div>
          <div id="touch-controls" class="touch-controls" hidden aria-label="Touch controls">
            <div class="touch-cluster"><button class="touch-btn" data-input="left" aria-label="Move left">Left</button><button class="touch-btn" data-input="right" aria-label="Move right">Right</button></div>
            <div class="touch-cluster"><button class="touch-btn jump" data-input="jump" aria-label="Jump">Jump</button></div>
          </div>
        </div>
        <footer class="footer"><div class="keyboard-hint"><span><kbd>A</kbd><kbd>D</kbd> Move</span><span><kbd>Space</kbd> Jump</span><span><kbd>Esc</kbd> Pause</span></div><span class="footer-note">${icon('leaf')} Your progress stays with you in this browser</span><span class="orientation-tip">Turn sideways for a wider adventure.</span></footer>
      </section>
    </div>`;
  }

  private bindEvents(): void {
    eventBus.on(Events.SHOW_MENU, () => this.showMenu());
    eventBus.on(Events.SHOW_WORLDS, () => this.showWorlds());
    eventBus.on(Events.HIDE_OVERLAYS, () => this.showGameplay());
    eventBus.on(Events.HUD, (hud: HudState) => this.updateHud(hud));
    eventBus.on(Events.TUTORIAL, (copy: string) => {
      const hint = this.root.querySelector<HTMLElement>('#tutorial-hint');
      if (hint) { hint.textContent = copy; hint.hidden = !copy; }
    });
    eventBus.on(Events.SHOW_PAUSE, ({ levelId }: { levelId: LevelId }) => { this.activeLevel = levelId; this.show('pause'); });
    eventBus.on(Events.SHOW_GAME_OVER, ({ levelId }: { levelId: LevelId }) => { this.activeLevel = levelId; this.show('gameover'); });
    eventBus.on(Events.SHOW_COMPLETE, (payload: LevelCompletePayload) => this.showComplete(payload));
    eventBus.on(Events.SHOW_VICTORY, (payload: LevelCompletePayload) => this.showVictory(payload));
  }

  private bindDom(): void {
    this.root.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
      if (!button || button.disabled) return;
      audioManager.play('click'); this.handleAction(button.dataset.action ?? '', Number(button.dataset.value));
    });
    this.root.addEventListener('input', (event) => {
      const input = event.target as HTMLInputElement;
      if (!input.dataset.setting) return;
      const key = input.dataset.setting as keyof GameSettings;
      const value = input.type === 'checkbox' ? input.checked : Number(input.value);
      progressManager.updateSettings({ [key]: value });
      audioManager.update(progressManager.settings); eventBus.emit(Events.SETTINGS_CHANGED, progressManager.settings);
      this.syncPreferences();
    });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-input]')) {
      const start = (event: PointerEvent): void => { event.preventDefault(); button.setPointerCapture(event.pointerId); const action = button.dataset.input as 'left' | 'right' | 'jump'; this.touchPointers.set(event.pointerId, action); button.dataset.active = 'true'; eventBus.emit(Events.INPUT, { action, pressed: true }); };
      const end = (event: PointerEvent): void => { const action = this.touchPointers.get(event.pointerId); if (!action) return; this.touchPointers.delete(event.pointerId); button.dataset.active = 'false'; eventBus.emit(Events.INPUT, { action, pressed: false }); };
      button.addEventListener('pointerdown', start); button.addEventListener('pointerup', end); button.addEventListener('pointercancel', end); button.addEventListener('lostpointercapture', end);
    }
    window.addEventListener('blur', () => this.releaseTouch());
    const syncFullscreen = (): void => this.syncFullscreenState();
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.root.dataset.fullscreen === 'fallback') this.setFallbackFullscreen(false);
    });
  }

  private handleAction(action: string, value: number): void {
    switch (action) {
      case 'sound': {
        const muted = !progressManager.settings.musicEnabled && !progressManager.settings.effectsEnabled;
        progressManager.updateSettings({ musicEnabled: muted, effectsEnabled: muted });
        audioManager.update(progressManager.settings); this.syncPreferences(); break;
      }
      case 'fullscreen': {
        void this.toggleFullscreen();
        break;
      }
      case 'preview-world': if (worldUnlocked(value, progressManager.data)) this.showLevels(value); else this.showWorlds(); break;
      case 'play': this.startLevel(1); break;
      case 'continue': this.startLevel(progressManager.data.unlockedLevel); break;
      case 'worlds': this.showWorlds(); break;
      case 'levels': this.showLevels(value || this.activeWorld); break;
      case 'menu': this.showMenu(); break;
      case 'settings': this.settingsReturn = 'menu'; this.renderSettings(); this.show('settings'); break;
      case 'pause-settings': this.settingsReturn = 'pause'; this.renderSettings(); this.show('settings'); break;
      case 'settings-back': this.show(this.settingsReturn); break;
      case 'help': this.show('help'); break;
      case 'start': this.startLevel(value as LevelId); break;
      case 'pause': eventBus.emit(Events.PAUSE); break;
      case 'resume': eventBus.emit(Events.RESUME); break;
      case 'restart': this.startLevel(this.activeLevel); break;
      case 'replay': this.startLevel(this.activeLevel); break;
      case 'next': this.startLevel(Math.min(6, this.activeLevel + 1) as LevelId); break;
      case 'play-again': this.startLevel(1); break;
      case 'worlds-from-game': this.stopGame(); this.showWorlds(); break;
      case 'menu-from-game': this.stopGame(); this.startMenuScene(); break;
      case 'reset': if (window.confirm('Reset all level progress and settings? This cannot be undone.')) { progressManager.reset(); audioManager.update(progressManager.settings); this.syncPreferences(); this.renderSettings(); } break;
    }
  }

  private show(name: ScreenName): void {
    this.root.dataset.screen = name;
    this.root.querySelectorAll<HTMLElement>('[data-screen]').forEach((screen) => { screen.hidden = screen.dataset.screen !== name; });
    const hud = this.root.querySelector<HTMLElement>('#hud'); const touch = this.root.querySelector<HTMLElement>('#touch-controls');
    if (hud) hud.hidden = true; if (touch) touch.hidden = true;
    requestAnimationFrame(() => this.root.querySelector<HTMLElement>(`.screen[data-screen="${name}"] button:not(:disabled), .screen[data-screen="${name}"] input`)?.focus({ preventScroll: true }));
  }

  private showMenu(): void {
    const continueButton = this.root.querySelector<HTMLButtonElement>('[data-action="continue"]');
    if (continueButton) continueButton.disabled = !progressManager.hasProgress;
    this.root.querySelectorAll<HTMLElement>('[data-world-status]').forEach((element) => {
      const unlocked = worldUnlocked(Number(element.dataset.worldStatus), progressManager.data);
      element.innerHTML = icon(unlocked ? 'arrow' : 'lock');
      element.closest('button')?.setAttribute('aria-label', `${WORLDS[Number(element.dataset.worldStatus) - 1].name}${unlocked ? '' : ', locked'}`);
    });
    this.show('menu');
  }

  private showGameplay(): void {
    this.root.dataset.screen = 'gameplay';
    this.root.querySelectorAll<HTMLElement>('[data-screen]').forEach((screen) => { screen.hidden = true; });
    const hud = this.root.querySelector<HTMLElement>('#hud'); const touch = this.root.querySelector<HTMLElement>('#touch-controls');
    if (hud) hud.hidden = false;
    if (touch) touch.hidden = !progressManager.settings.showTouchControls;
    this.releaseTouch();
  }

  private showWorlds(): void {
    const save = progressManager.data; const grid = this.root.querySelector<HTMLElement>('#world-grid');
    if (grid) grid.innerHTML = WORLDS.map((world) => {
      const levels = world.levels.map((id) => save.levels[id]); const unlocked = worldUnlocked(world.id, save);
      const done = levels.filter((level) => level.completed).length; const stars = levels.reduce((sum, level) => sum + level.bestStars, 0);
      return `<article class="world-card ${unlocked ? '' : 'is-locked'}" data-world="${world.id}"><div class="world-art"><img src="${worldArt(world.id)}" alt="" width="960" height="540"><span class="world-number">World 0${world.id}</span><span class="world-state">${icon(unlocked ? 'leaf' : 'lock')} ${unlocked ? 'Ready to explore' : 'Locked'}</span></div><div class="world-card-content"><h3>${world.name}</h3><p class="meta">${world.description}</p><div class="world-progress"><span>${icon('star')} ${stars} / 6 stars</span><span>${done} / 2 levels</span></div><div class="progress-track" aria-hidden="true"><span style="width:${done * 50}%"></span></div><button class="btn ${unlocked ? 'primary' : ''}" data-action="levels" data-value="${world.id}" ${unlocked ? '' : 'disabled'}>${unlocked ? `Choose levels ${icon('arrow')}` : `${icon('lock')} Finish the previous world`}</button></div></article>`;
    }).join('');
    this.show('worlds');
  }

  private showLevels(worldId: number): void {
    this.activeWorld = Math.max(1, Math.min(3, worldId)); const world = WORLDS[this.activeWorld - 1]; const save = progressManager.data;
    const label = this.root.querySelector<HTMLElement>('#level-world'); if (label) label.textContent = world.name;
    const grid = this.root.querySelector<HTMLElement>('#level-grid');
    if (grid) grid.innerHTML = world.levels.map((id) => {
      const level = LEVELS[id - 1]; const result = save.levels[id]; const unlocked = levelUnlocked(id, save);
      return `<article class="level-card ${unlocked ? '' : 'is-locked'}"><div class="level-art"><img src="${worldArt(world.id)}" alt="" width="960" height="540"><span class="level-number">0${id}</span></div><div class="world-card-content"><p class="eyebrow">Level ${id} · ${result.completed ? 'Completed' : unlocked ? 'Ready to play' : 'Locked'}</p><h3>${level.name}</h3>${starRating(result.bestStars)}<p class="meta">${result.completed ? `Best gems: ${result.bestGems}` : unlocked ? 'A new adventure is waiting.' : 'Complete the previous level first.'}</p><button class="btn ${unlocked ? 'primary' : ''}" data-action="start" data-value="${id}" ${unlocked ? '' : 'disabled'}>${icon(unlocked ? 'play' : 'lock')} ${result.completed ? 'Play again' : unlocked ? 'Play' : 'Locked'}</button></div></article>`;
    }).join('');
    this.show('levels');
  }

  private renderSettings(): void {
    const settings = progressManager.settings; const fields = this.root.querySelector<HTMLElement>('#settings-fields'); if (!fields) return;
    fields.innerHTML = `<label class="setting-row"><span>Music</span><input type="checkbox" data-setting="musicEnabled" ${settings.musicEnabled ? 'checked' : ''}></label>
      <label class="setting-row"><span>Music volume</span><input type="range" min="0" max="1" step="0.05" data-setting="musicVolume" value="${settings.musicVolume}"></label>
      <label class="setting-row"><span>Sound effects</span><input type="checkbox" data-setting="effectsEnabled" ${settings.effectsEnabled ? 'checked' : ''}></label>
      <label class="setting-row"><span>Effects volume</span><input type="range" min="0" max="1" step="0.05" data-setting="effectsVolume" value="${settings.effectsVolume}"></label>
      <label class="setting-row"><span>Reduced motion</span><input type="checkbox" data-setting="reducedMotion" ${settings.reducedMotion ? 'checked' : ''}></label>
      <label class="setting-row"><span>Show touch controls</span><input type="checkbox" data-setting="showTouchControls" ${settings.showTouchControls ? 'checked' : ''}></label>`;
  }

  private showComplete(payload: LevelCompletePayload): void {
    this.activeLevel = payload.levelId; const stats = this.root.querySelector<HTMLElement>('#complete-stats');
    if (stats) stats.innerHTML = `${starRating(payload.stars)}<div class="result-stats"><div><strong>${payload.stars}<small> / 3</small></strong><span>Stars collected</span></div><div><strong>${payload.gems}</strong><span>Gems collected</span></div></div><p class="result-note">${icon('check')} ${payload.isBest ? 'New best result!' : 'Your best result is safely saved'}</p>`;
    const next = this.root.querySelector<HTMLButtonElement>('[data-action="next"]'); if (next) next.hidden = payload.levelId >= 6;
    this.show('complete');
  }

  private showVictory(payload: LevelCompletePayload): void {
    this.activeLevel = payload.levelId; const save = progressManager.data; const stats = this.root.querySelector<HTMLElement>('#victory-stats');
    if (stats) stats.innerHTML = `<img class="result-bunny" src="/assets/art/bunny.svg" alt="" width="88" height="107"><div class="result-stats"><div><strong>${totalStars(save)}<small> / 18</small></strong><span>Total stars</span></div><div><strong>${completedLevels(save)}<small> / 6</small></strong><span>Levels completed</span></div><div><strong>${totalBestGems(save)}</strong><span>Best gems</span></div><div><strong>3<small> / 3</small></strong><span>Worlds explored</span></div></div>`;
    this.show('victory');
  }

  private updateHud(hud: HudState): void {
    this.activeLevel = hud.levelId;
    this.setText('#hud-level', `${hud.worldName} · ${hud.levelName}`); this.setText('#hud-stars', `Stars ${hud.stars} / 3`);
    this.setText('#hud-gems', `Gems ${hud.gems}`); this.setText('#hud-hearts', `Hearts ${hud.hearts}`);
  }
  private setText(selector: string, text: string): void { const element = this.root.querySelector<HTMLElement>(selector); if (element) element.textContent = text; }

  private syncPreferences(): void {
    const settings = progressManager.settings;
    this.root.dataset.reducedMotion = String(settings.reducedMotion);
    const muted = !settings.musicEnabled && !settings.effectsEnabled;
    const button = this.root.querySelector<HTMLButtonElement>('[data-action="sound"]');
    if (button) { button.innerHTML = icon(muted ? 'mute' : 'sound'); button.setAttribute('aria-pressed', String(muted)); button.setAttribute('aria-label', muted ? 'Enable audio' : 'Mute audio'); }
    const touch = this.root.querySelector<HTMLElement>('#touch-controls');
    if (touch && this.root.dataset.screen === 'gameplay') touch.hidden = !settings.showTouchControls;
  }

  private async toggleFullscreen(): Promise<void> {
    if (this.root.dataset.fullscreen === 'fallback') { this.setFallbackFullscreen(false); return; }
    if (this.nativeFullscreenElement) {
      const doc = document as Document & { webkitExitFullscreen?: () => void | Promise<void> };
      try {
        if (document.exitFullscreen) await document.exitFullscreen();
        else await doc.webkitExitFullscreen?.();
      } catch { /* The fullscreenchange event will preserve the correct state. */ }
      this.syncFullscreenState(); return;
    }

    const frame = this.root.querySelector<HTMLElement>('.game-frame') as (HTMLElement & { webkitRequestFullscreen?: () => void | Promise<void> }) | null;
    const request = frame?.requestFullscreen?.bind(frame) ?? frame?.webkitRequestFullscreen?.bind(frame);
    if (request) {
      try {
        await request();
        await new Promise((resolve) => window.setTimeout(resolve, 80));
        if (this.nativeFullscreenElement) { this.syncFullscreenState(); return; }
      } catch { /* Mobile Safari can expose the API and still reject element fullscreen. */ }
    }
    this.setFallbackFullscreen(true);
  }

  private setFallbackFullscreen(active: boolean): void {
    if (active) this.root.dataset.fullscreen = 'fallback';
    else delete this.root.dataset.fullscreen;
    this.syncFullscreenButton();
    window.setTimeout(() => this.game?.scale.refresh(), 50);
  }

  private syncFullscreenState(): void {
    if (this.nativeFullscreenElement) this.root.dataset.fullscreen = 'native';
    else if (this.root.dataset.fullscreen === 'native') delete this.root.dataset.fullscreen;
    this.syncFullscreenButton();
    window.setTimeout(() => this.game?.scale.refresh(), 50);
  }

  private syncFullscreenButton(): void {
    const active = Boolean(this.nativeFullscreenElement) || this.root.dataset.fullscreen === 'fallback';
    const button = this.root.querySelector<HTMLButtonElement>('[data-action="fullscreen"]');
    if (button) { button.innerHTML = icon(active ? 'collapse' : 'expand'); button.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen'); button.setAttribute('aria-pressed', String(active)); }
  }

  private startLevel(levelId: LevelId): void {
    if (!levelUnlocked(levelId, progressManager.data)) return;
    this.activeLevel = levelId; this.stopGame(); this.game?.scene.stop('MainMenuScene'); this.game?.scene.start('GameScene', { levelId });
  }
  private stopGame(): void { if (this.game?.scene.isActive('GameScene') || this.game?.scene.isPaused('GameScene')) this.game.scene.stop('GameScene'); }
  private startMenuScene(): void { this.game?.scene.stop('GameScene'); this.game?.scene.start('MainMenuScene'); }
  private releaseTouch(): void { for (const action of this.touchPointers.values()) eventBus.emit(Events.INPUT, { action, pressed: false }); this.touchPointers.clear(); this.root.querySelectorAll<HTMLElement>('[data-input]').forEach((button) => { button.dataset.active = 'false'; }); }
}
