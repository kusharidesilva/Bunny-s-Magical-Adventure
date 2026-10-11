import Phaser from 'phaser';
import { gameConfig } from './game/config';
import { GameShell } from './ui/GameShell';
import './styles/main.css';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Game root was not found');

const shell = new GameShell(root);
const game = new Phaser.Game(gameConfig);
shell.attachGame(game);

// Browser diagnostics can inspect the running scene during local development.
if (import.meta.env.DEV) Object.assign(window, { __bunnyGame: game });

window.addEventListener('beforeunload', () => game.destroy(true));
