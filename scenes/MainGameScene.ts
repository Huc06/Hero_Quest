import Phaser from 'phaser';
import { HeroClass } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, CLASS_METADATA } from '../data';

export class MainGameScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() { 
    super('MainGame'); 
  }
  
  create() {
    let gameState = this.registry.get('gameState');
    let currentHero = gameState?.currentHero;
    
    if (!currentHero) {
      this.time.delayedCall(200, () => {
        gameState = this.registry.get('gameState');
        currentHero = gameState?.currentHero;
        if (currentHero) {
          this.setupGame(currentHero);
        } else {
          console.warn('No hero found, returning to character select');
          this.scene.start('CharacterSelect');
        }
      });
      return;
    }
    
    this.setupGame(currentHero);
  }
  
  setupGame(currentHero: any) {
    console.log('MainGameScene: Setting up game for hero:', currentHero.name);
    // Chỉ hiển thị background đơn giản
    this.cameras.main.setBackgroundColor(0x020617);
    
    // Tự động chuyển sang Battle scene sau 1 giây
    console.log('MainGameScene: Will transition to Battle scene in 1 second...');
    this.time.delayedCall(1000, () => {
      console.log('MainGameScene: Transitioning to Battle scene...');
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Battle');
      });
    });
  }

  update() {
    // Không cần update gì cả
  }
}

