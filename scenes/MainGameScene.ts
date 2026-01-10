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
    this.add.grid(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH*2, GAME_HEIGHT*2, 64, 64, 0x0f172a, 0.5, 0x1e293b, 0.8);
    
    const color = parseInt(CLASS_METADATA[currentHero.classType as HeroClass].color.replace('#', '0x'));
    this.player = this.physics.add.sprite(GAME_WIDTH/2, GAME_HEIGHT/2, '');
    
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(20, 20, 18);
    graphics.generateTexture(`p_${currentHero.classType}`, 40, 40);
    graphics.destroy();
    
    this.player.setTexture(`p_${currentHero.classType}`);
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard!.createCursorKeys();

    this.add.text(20, 20, `Khu vực: Sui Realm Core`, { fontFamily: 'MedievalSharp', color: '#94a3b8' });
    this.add.text(20, 50, `Nhân vật: ${currentHero.name}`, { fontFamily: 'MedievalSharp', color: '#f59e0b' });
    
    const battleHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'Nhấn SPACE để chiến đấu với Ác Long', {
      fontFamily: 'MedievalSharp',
      fontSize: '20px',
      color: '#f59e0b',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Battle');
      });
    });
  }

  update() {
    if (!this.player || !this.cursors) return;
    this.player.setVelocity(0);
    const s = 300;
    if (this.cursors.left.isDown) this.player.setVelocityX(-s);
    else if (this.cursors.right.isDown) this.player.setVelocityX(s);
    if (this.cursors.up.isDown) this.player.setVelocityY(-s);
    else if (this.cursors.down.isDown) this.player.setVelocityY(s);
  }
}

