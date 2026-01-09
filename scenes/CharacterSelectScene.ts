import Phaser from 'phaser';
import { HeroClass } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, CLASS_METADATA } from '../data';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() { 
    super('CharacterSelect'); 
  }
  
  create() {
    const bgGradient = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x020617);
    bgGradient.setDepth(0);
    
    const stars = this.add.graphics();
    for(let i=0; i<150; i++) {
      stars.fillStyle(0xffffff, Math.random() * 0.8);
      stars.fillCircle(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 2);
    }
    stars.setDepth(1);

    const title = this.add.text(GAME_WIDTH/2, 60, 'CHỌN LỚP NHÂN VẬT', {
      fontFamily: 'MedievalSharp', 
      fontSize: '56px', 
      color: '#f59e0b',
      stroke: '#451a03',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(2);

    const subtitle = this.add.text(GAME_WIDTH/2, 110, 'Chọn một lớp nhân vật để bắt đầu hành trình', {
      fontFamily: 'Almendra',
      fontSize: '20px',
      color: '#94a3b8'
    }).setOrigin(0.5).setDepth(2);

    const classes = [HeroClass.PALADIN, HeroClass.WARRIOR, HeroClass.MAGE, HeroClass.ARCHER];
    
    classes.forEach((classKey, idx) => {
      const metadata = CLASS_METADATA[classKey];
      const x = 160 + idx * 280;
      const y = 400;
      const card = this.add.container(x, y);
      
      const bg = this.add.rectangle(0, 0, 240, 480, 0x0f172a, 0.95)
        .setStrokeStyle(3, parseInt(metadata.color.replace('#', '0x')), 0.3);
      const bgGlow = this.add.rectangle(0, 0, 240, 480, parseInt(metadata.color.replace('#', '0x')), 0.1);
      
      const icon = this.add.text(0, -160, metadata.icon, { fontSize: '100px' }).setOrigin(0.5);
      const name = this.add.text(0, -40, metadata.name, { 
        fontFamily: 'MedievalSharp', 
        fontSize: '26px', 
        color: metadata.color,
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      
      const desc = this.add.text(0, 10, metadata.description, {
        fontFamily: 'Almendra',
        fontSize: '16px',
        color: '#cbd5e1',
        wordWrap: { width: 200, useAdvancedWrap: true },
        align: 'center'
      }).setOrigin(0.5);
      
      const statsY = 80;
      const statsText = [
        `❤️ HP: ${metadata.stats.health}`,
        `⚔️ ATK: ${metadata.stats.attack}`,
        `🛡️ DEF: ${metadata.stats.defense}`,
        `💨 SPD: ${metadata.stats.speed}`
      ];
      
      const statsContainer = this.add.container(0, statsY);
      statsText.forEach((stat, i) => {
        const statText = this.add.text(0, i * 28, stat, {
          fontFamily: 'Almendra',
          fontSize: '14px',
          color: '#e2e8f0'
        }).setOrigin(0.5);
        statsContainer.add(statText);
      });
      
      const selectBtn = this.add.rectangle(0, 200, 180, 40, parseInt(metadata.color.replace('#', '0x')), 0.8)
        .setStrokeStyle(2, parseInt(metadata.color.replace('#', '0x')));
      const selectText = this.add.text(0, 200, 'CHỌN', {
        fontFamily: 'MedievalSharp',
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5);
      
      card.add([bgGlow, bg, icon, name, desc, statsContainer, selectBtn, selectText]);
      card.setDepth(2);
      card.setInteractive(new Phaser.Geom.Rectangle(-120, -240, 240, 480), Phaser.Geom.Rectangle.Contains);
      
      card.on('pointerover', () => {
        bg.setStrokeStyle(5, parseInt(metadata.color.replace('#', '0x')), 1);
        bgGlow.setAlpha(0.3);
        this.tweens.add({ targets: card, scale: 1.08, duration: 200, ease: 'Power2' });
        this.tweens.add({ targets: icon, scale: 1.2, duration: 200 });
      });
      
      card.on('pointerout', () => {
        bg.setStrokeStyle(3, parseInt(metadata.color.replace('#', '0x')), 0.3);
        bgGlow.setAlpha(0.1);
        this.tweens.add({ targets: card, scale: 1.0, duration: 200 });
        this.tweens.add({ targets: icon, scale: 1.0, duration: 200 });
      });
      
      card.on('pointerdown', () => {
        this.cameras.main.flash(300, 255, 255, 255);
        const { onHeroSelected } = this.registry.get('callbacks');
        onHeroSelected(classKey);
        
        this.time.delayedCall(100, () => {
          this.tweens.add({
            targets: card,
            scale: 1.15,
            alpha: 0.8,
            duration: 300,
            onComplete: () => {
              this.scene.start('MainGame');
            }
          });
        });
      });
    });
  }
}

