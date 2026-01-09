import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data';

export class OpeningScene extends Phaser.Scene {
  constructor() { 
    super('Opening'); 
  }
  
  create() {
    // Background
    let cosmicBg: Phaser.GameObjects.Image | null = null;
    if (this.textures.exists('cosmic_bg')) {
      cosmicBg = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2, 'cosmic_bg');
      cosmicBg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      cosmicBg.setDepth(0);
    } else {
      const stars = this.add.graphics();
      stars.fillStyle(0x1e1b4b, 1);
      stars.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      for(let i=0; i<300; i++) {
        stars.fillStyle(0xffffff, Math.random());
        stars.fillCircle(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 2);
      }
      stars.setDepth(0);
    }

    // Goddess image
    let goddessImage: Phaser.GameObjects.Image | null = null;
    if (this.textures.exists('goddess')) {
      goddessImage = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2 - 100, 'goddess');
      const scale = Math.min(GAME_WIDTH / goddessImage.width * 0.6, GAME_HEIGHT / goddessImage.height * 0.7);
      goddessImage.setScale(scale);
      goddessImage.setDepth(2);
      goddessImage.setAlpha(1);
      goddessImage.setBlendMode(Phaser.BlendModes.NORMAL);
      
      this.tweens.add({
        targets: goddessImage,
        alpha: { from: 0.8, to: 1 },
        scale: { from: scale * 0.95, to: scale },
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    } else {
      const aura = this.add.graphics();
      aura.fillStyle(0xfef3c7, 0.2);
      aura.fillCircle(GAME_WIDTH/2, GAME_HEIGHT/2 - 100, 150);
      aura.fillStyle(0xfef3c7, 0.1);
      aura.fillCircle(GAME_WIDTH/2, GAME_HEIGHT/2 - 100, 250);
      aura.setDepth(1);
    }

    // Particles
    const emitter = this.add.particles(GAME_WIDTH/2, GAME_HEIGHT/2 - 100, 'flare', {
      speed: { min: -50, max: 50 },
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 3000,
      blendMode: 'ADD',
      frequency: 50
    });
    emitter.setDepth(3);

    // Dialogue box
    const dialogueContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 160);
    const box = this.add.rectangle(0, 0, GAME_WIDTH - 160, 180, 0x020617, 0.9).setStrokeStyle(3, 0xf59e0b);
    const title = this.add.text(-(GAME_WIDTH-200)/2, -65, 'NỮ THẦN ÁNH SÁNG', { 
      fontFamily: 'MedievalSharp', 
      fontSize: '30px', 
      color: '#f59e0b' 
    });
    
    const dialogueText = this.add.text(-(GAME_WIDTH-200)/2, -20, 
      'Chào mừng người chơi đến với Sui Realm, vùng đất của những anh hùng vĩ đại. Ta là Nữ Thần Ánh Sáng, người bảo vệ cho vương quốc này. Hành trình của ngươi sắp bắt đầu, và ta sẽ dẫn dắt ngươi qua những thử thách đầu tiên. Hãy chọn một lớp nhân vật và bắt đầu cuộc phiêu lưu của mình!', 
      {
        fontFamily: 'Almendra',
        fontSize: '22px',
        color: '#e2e8f0',
        wordWrap: { width: GAME_WIDTH - 240, useAdvancedWrap: true },
        lineSpacing: 10
      }
    );

    dialogueContainer.add([box, title, dialogueText]);

    // Next button
    const nextBtnContainer = this.add.container((GAME_WIDTH-200)/2 - 80, 60);
    const nextBtnBg = this.add.rectangle(0, 0, 160, 40, 0xf59e0b, 0.9).setStrokeStyle(2, 0xfcd34d);
    const nextBtnText = this.add.text(0, 0, 'TIẾP TỤC ➜', {
      fontFamily: 'MedievalSharp', 
      fontSize: '18px', 
      color: '#ffffff'
    }).setOrigin(0.5);
    
    nextBtnContainer.add([nextBtnBg, nextBtnText]);
    nextBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-80, -20, 160, 40), Phaser.Geom.Rectangle.Contains);
    nextBtnContainer.setDepth(10);
    
    nextBtnContainer.on('pointerover', () => {
      nextBtnBg.setFillStyle(0xfbbf24, 1);
      this.tweens.add({ targets: nextBtnContainer, scale: 1.05, duration: 100 });
    });
    
    nextBtnContainer.on('pointerout', () => {
      nextBtnBg.setFillStyle(0xf59e0b, 0.9);
      this.tweens.add({ targets: nextBtnContainer, scale: 1.0, duration: 100 });
    });
    
    nextBtnContainer.on('pointerdown', () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CharacterSelect');
      });
    });

    dialogueContainer.add(nextBtnContainer);
    this.typewriteText(dialogueText, dialogueText.text);
  }

  typewriteText(label: Phaser.GameObjects.Text, text: string) {
    label.text = '';
    let i = 0;
    this.time.addEvent({
      callback: () => {
        label.text = text.substr(0, i);
        i++;
      },
      repeat: text.length - 1,
      delay: 30
    });
  }
}

