import Phaser from 'phaser';
import { HeroClass } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, CLASS_METADATA } from '../data';

export class CharacterSelectScene extends Phaser.Scene {
  private continueButton: Phaser.GameObjects.Container | null = null;
  private selectedHero: HeroClass | null = null;
  
  constructor() { 
    super('CharacterSelect'); 
  }
  
  create() {
    // Update scene in React state
    const { onSceneChange } = this.registry.get('callbacks');
    if (onSceneChange) {
      onSceneChange('CharacterSelect');
    }
    
    // Reset selected hero
    this.selectedHero = null;
    
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

    // Wallet Connection UI
    const walletContainer = this.add.container(GAME_WIDTH - 180, 80);
    walletContainer.setDepth(100);
    
    const updateWalletUI = () => {
      walletContainer.removeAll(true);
      
      const gameState = this.registry.get('gameState');
      
      if (gameState?.walletConnected && gameState?.walletAddress) {
        // Wallet đã kết nối
        const walletBg = this.add.rectangle(0, 0, 200, 50, 0x1e293b, 0.95)
          .setStrokeStyle(2, 0x10b981, 0.8);
        
        const address = gameState.walletAddress;
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        const walletText = this.add.text(0, 0, shortAddress, {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#10b981',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5);
        
        const statusDot = this.add.circle(-75, 0, 5, 0x10b981);
        walletContainer.add([walletBg, statusDot, walletText]);
      } else {
        // Wallet chưa kết nối
        const walletBg = this.add.rectangle(0, 0, 200, 50, 0x1e293b, 0.95)
          .setStrokeStyle(2, 0xf59e0b, 0.8);
        
        const walletButton = this.add.rectangle(0, 0, 180, 40, 0xf59e0b, 1)
          .setStrokeStyle(2, 0xfcd34d, 1)
          .setInteractive({ useHandCursor: true });
        
        const walletButtonText = this.add.text(0, 0, 'Connect Wallet', {
          fontFamily: 'MedievalSharp',
          fontSize: '16px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5);
        
        walletButton.on('pointerover', () => {
          walletButton.setFillStyle(0xfbbf24, 1);
          this.tweens.add({ targets: walletButton, scale: 1.05, duration: 100 });
        });
        
        walletButton.on('pointerout', () => {
          walletButton.setFillStyle(0xf59e0b, 1);
          this.tweens.add({ targets: walletButton, scale: 1.0, duration: 100 });
        });
        
        walletButton.on('pointerdown', () => {
          const connectWallet = (window as any).connectWallet;
          if (connectWallet) {
            connectWallet();
          }
        });
        
        walletContainer.add([walletBg, walletButton, walletButtonText]);
      }
    };
    
    updateWalletUI();
    
    // Update wallet UI mỗi 500ms
    this.time.addEvent({
      delay: 500,
      callback: updateWalletUI,
      loop: true
    });

    const classes = [HeroClass.PALADIN, HeroClass.WARRIOR, HeroClass.MAGE, HeroClass.ARCHER];
    
    classes.forEach((classKey, idx) => {
      const metadata = CLASS_METADATA[classKey];
      const cardWidth = 220;
      const cardHeight = 320;
      const spacing = 250;
      const startX = (GAME_WIDTH - (spacing * 3 + cardWidth)) / 2 + cardWidth / 2;
      const x = startX + idx * spacing;
      const y = 280; // Căn giữa màn hình, để terminal ở dưới
      const card = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x0f172a, 0.95)
        .setStrokeStyle(3, parseInt(metadata.color.replace('#', '0x')), 0.3);
      const bgGlow = this.add.rectangle(0, 0, cardWidth, cardHeight, parseInt(metadata.color.replace('#', '0x')), 0.1);
      
      // Hiển thị ảnh cho các class, fallback về icon emoji nếu không có ảnh
      let icon: Phaser.GameObjects.Text | Phaser.GameObjects.Image;
      const imageMap: Record<HeroClass, string> = {
        [HeroClass.PALADIN]: 'paladin',
        [HeroClass.WARRIOR]: 'warrior',
        [HeroClass.MAGE]: 'mage',
        [HeroClass.ARCHER]: 'archer'
      };
      
      const imageKey = imageMap[classKey];
      let initialIconScale = 1;
      if (imageKey && this.textures.exists(imageKey)) {
        icon = this.add.image(0, -90, imageKey).setOrigin(0.5);
        // Scale ảnh để vừa với card
        const scale = Math.min(140 / icon.width, 140 / icon.height);
        initialIconScale = scale * 0.65;
        icon.setScale(initialIconScale);
      } else {
        icon = this.add.text(0, -90, metadata.icon, { fontSize: '70px' }).setOrigin(0.5);
        initialIconScale = 1;
      }
      const name = this.add.text(0, -10, metadata.name, { 
        fontFamily: 'MedievalSharp', 
        fontSize: '24px', 
        color: metadata.color,
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      
      const desc = this.add.text(0, 25, metadata.description, {
        fontFamily: 'Almendra',
        fontSize: '14px',
        color: '#cbd5e1',
        wordWrap: { width: 180, useAdvancedWrap: true },
        align: 'center'
      }).setOrigin(0.5);
      
      const selectBtn = this.add.rectangle(0, 100, 170, 42, parseInt(metadata.color.replace('#', '0x')), 0.9)
        .setStrokeStyle(3, parseInt(metadata.color.replace('#', '0x')));
      const selectText = this.add.text(0, 100, 'CHỌN', {
        fontFamily: 'MedievalSharp',
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      
      card.add([bgGlow, bg, icon, name, desc, selectBtn, selectText]);
      card.setDepth(2);
      card.setInteractive(new Phaser.Geom.Rectangle(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);
      
      card.on('pointerover', () => {
        bg.setStrokeStyle(5, parseInt(metadata.color.replace('#', '0x')), 1);
        bgGlow.setAlpha(0.3);
        this.tweens.add({ targets: card, scale: 1.08, duration: 200, ease: 'Power2' });
        this.tweens.add({ targets: icon, scale: initialIconScale * 1.2, duration: 200 });
      });
      
      card.on('pointerout', () => {
        bg.setStrokeStyle(3, parseInt(metadata.color.replace('#', '0x')), 0.3);
        bgGlow.setAlpha(0.1);
        this.tweens.add({ targets: card, scale: 1.0, duration: 200, ease: 'Power2' });
        this.tweens.add({ targets: icon, scale: initialIconScale, duration: 200 });
      });
      
      card.on('pointerdown', () => {
        const gameState = this.registry.get('gameState');
        if (gameState?.transactionCompleted) {
          return;
        }
        
        this.cameras.main.flash(300, 255, 255, 255);
        const { onHeroSelected } = this.registry.get('callbacks');
        
        // Add logs before calling onHeroSelected
        const addLog = (window as any).addSuiLog;
        if (addLog) {
          addLog('info', `User selected hero class: ${classKey}`);
          addLog('call', 'Triggering hero selection callback', {
            code: `onHeroSelected('${classKey}');`
          });
        }
        
        // Call onHeroSelected which will add more logs
        // KHÔNG tự động chuyển scene nữa - user sẽ click "TIẾP TỤC" trong terminal modal
        onHeroSelected(classKey);
      });
    });
  }
  
  showContinueButton() {
    // Remove existing button if any
    if (this.continueButton) {
      this.continueButton.destroy();
    }
    
    const continueBtnContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 100);
    const continueBtnBg = this.add.rectangle(0, 0, 300, 60, 0xf59e0b, 0.95)
      .setStrokeStyle(3, 0xfcd34d, 1);
    const continueBtnText = this.add.text(0, 0, 'TIẾP TỤC ➜', {
      fontFamily: 'MedievalSharp',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    continueBtnContainer.add([continueBtnBg, continueBtnText]);
    continueBtnContainer.setDepth(100);
    continueBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-150, -30, 300, 60), Phaser.Geom.Rectangle.Contains);
    
    // Hover effects
    continueBtnContainer.on('pointerover', () => {
      continueBtnBg.setFillStyle(0xfbbf24, 1);
      this.tweens.add({ targets: continueBtnContainer, scale: 1.05, duration: 100 });
    });
    
    continueBtnContainer.on('pointerout', () => {
      continueBtnBg.setFillStyle(0xf59e0b, 0.95);
      this.tweens.add({ targets: continueBtnContainer, scale: 1.0, duration: 100 });
    });
    
    // Click to continue
    continueBtnContainer.on('pointerdown', () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainGame');
      });
    });
    
    this.continueButton = continueBtnContainer;
    
    // Pulse animation
    this.tweens.add({
      targets: continueBtnContainer,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}

