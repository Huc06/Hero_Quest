import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data';

export class TitleScene extends Phaser.Scene {
  constructor() { 
    super('Title'); 
  }
  
  create() {
    console.log('TitleScene: Starting...');
    this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.fadeIn(1000);
    this.cameras.main.setAlpha(1);
    
    if (this.textures.exists('village_map')) {
      const mapImage = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'village_map');
      const scaleX = GAME_WIDTH / mapImage.width;
      const scaleY = GAME_HEIGHT / mapImage.height;
      const scale = Math.max(scaleX, scaleY) * 1.1;
      mapImage.setScale(scale).setDepth(0).setAlpha(1);
    } else {
      const stars = this.add.graphics();
      for(let i=0; i<200; i++) {
        stars.fillStyle(0xffffff, Math.random());
        stars.fillCircle(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 2);
      }
    }

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.2).setDepth(1);
    
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'HERO QUEST', {
      fontFamily: 'MedievalSharp',
      fontSize: '100px',
      color: '#f59e0b',
      stroke: '#451a03',
      strokeThickness: 10
    }).setOrigin(0.5).setDepth(2);

    const startBtn = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
    const btnBg = this.add.rectangle(0, 0, 300, 60, 0xb45309).setStrokeStyle(2, 0xfcd34d);
    const btnText = this.add.text(0, 0, 'BẮT ĐẦU HÀNH TRÌNH', { 
      fontFamily: 'MedievalSharp', 
      fontSize: '22px' 
    }).setOrigin(0.5);
    
    startBtn.add([btnBg, btnText]);
    startBtn.setDepth(2);
    startBtn.setInteractive(new Phaser.Geom.Rectangle(-150, -30, 300, 60), Phaser.Geom.Rectangle.Contains);

    startBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Opening'));
    });
  }
}

