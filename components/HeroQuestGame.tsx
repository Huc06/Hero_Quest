
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameState, HeroClass } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, CLASS_METADATA } from '../constants';

interface HeroQuestGameProps {
  gameState: GameState;
  onHeroSelected: (heroClass: HeroClass) => void;
  onSceneChange: (scene: string) => void;
}

const HeroQuestGame: React.FC<HeroQuestGameProps> = ({ gameState, onHeroSelected, onSceneChange }) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: 'phaser-root',
      backgroundColor: '#020617',
      pixelArt: true,
      render: {
        transparent: false,
        antialias: false,
        preserveDrawingBuffer: false
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0, x: 0 }, debug: false }
      },
      scene: [BootScene, TitleScene, OpeningScene, CharacterSelectScene, MainGameScene]
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.registry.set('gameState', gameState);
      gameRef.current.registry.set('callbacks', { onHeroSelected, onSceneChange });
    }
  }, [gameState, onHeroSelected, onSceneChange]);

  return <div id="phaser-root" className="w-full h-full bg-slate-950" />;
};

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    // Tải các asset với xử lý lỗi
    // Load ảnh cảnh vũ trụ (cosmic appearance scene)
    this.load.image('cosmic_bg', '/assets/cosmic_scene.png');
    // Load ảnh nữ thần (đã có nền trong suốt)
    // Phaser tự động hỗ trợ PNG với alpha channel
    this.load.image('goddess', '/assets/goddess.png');
    // Fallback cho particles
    this.load.image('flare', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/particles/blue.png');
    
    const progress = this.add.graphics();
    this.load.on('progress', (value: number) => {
      progress.clear();
      progress.fillStyle(0xf59e0b, 1);
      progress.fillRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 + 50, 300 * value, 10);
    });
    
    // Xử lý lỗi load ảnh
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`Failed to load: ${file.key}`);
    });
  }
  
  create() {
    // Xử lý loại bỏ nền xám/trắng từ ảnh nữ thần
    if (this.textures.exists('goddess')) {
      const texture = this.textures.get('goddess');
      const source = texture.getSourceImage() as HTMLImageElement;
      
      const processTexture = () => {
        if (!source || !source.complete) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        
        canvas.width = source.width;
        canvas.height = source.height;
        ctx.drawImage(source, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // Tạo mask để đánh dấu các pixel là nền (bắt đầu từ các góc)
        const isBackground = new Array(width * height).fill(false);
        const visited = new Array(width * height).fill(false);
        
        // Flood fill từ các góc để tìm vùng nền
        const floodFill = (startX: number, startY: number) => {
          const stack: [number, number][] = [[startX, startY]];
          const targetColor = {
            r: data[(startY * width + startX) * 4],
            g: data[(startY * width + startX) * 4 + 1],
            b: data[(startY * width + startX) * 4 + 2]
          };
          
          while (stack.length > 0) {
            const [x, y] = stack.pop()!;
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            
            const idx = y * width + x;
            if (visited[idx]) continue;
            visited[idx] = true;
            
            const i = idx * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Kiểm tra xem có phải màu xám/trắng tương tự không
            const brightness = (r + g + b) / 3;
            const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
            const isGrayWhite = brightness > 200 && colorVariance < 30;
            
            // Kiểm tra độ tương đồng với màu nền ở góc
            const colorDiff = Math.abs(r - targetColor.r) + Math.abs(g - targetColor.g) + Math.abs(b - targetColor.b);
            
            if (isGrayWhite && colorDiff < 50) {
              isBackground[idx] = true;
              // Thêm các pixel lân cận vào stack
              stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
            }
          }
        };
        
        // Bắt đầu flood fill từ 4 góc
        floodFill(0, 0);
        floodFill(width - 1, 0);
        floodFill(0, height - 1);
        floodFill(width - 1, height - 1);
        
        // Loại bỏ các pixel đã được đánh dấu là nền
        for (let i = 0; i < data.length; i += 4) {
          const idx = i / 4;
          if (isBackground[idx]) {
            data[i + 3] = 0; // Đặt alpha = 0 để làm trong suốt
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Cập nhật texture
        this.textures.remove('goddess');
        this.textures.addCanvas('goddess', canvas);
      };
      
      if (source && source.complete) {
        processTexture();
      } else if (source) {
        source.onload = processTexture;
      }
    }
    
    this.scene.start('Title');
  }
}

class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }
  create() {
    // Tạo nền sao chuyển động bằng code (không sợ lỗi ảnh)
    const stars = this.add.graphics();
    for(let i=0; i<200; i++) {
        stars.fillStyle(0xffffff, Math.random());
        stars.fillCircle(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 2);
    }

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'HERO QUEST', {
      fontFamily: 'MedievalSharp',
      fontSize: '100px',
      color: '#f59e0b',
      stroke: '#451a03',
      strokeThickness: 10
    }).setOrigin(0.5);

    const startBtn = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
    const btnBg = this.add.rectangle(0, 0, 300, 60, 0xb45309).setStrokeStyle(2, 0xfcd34d);
    const btnText = this.add.text(0, 0, 'BẮT ĐẦU HÀNH TRÌNH', { fontFamily: 'MedievalSharp', fontSize: '22px' }).setOrigin(0.5);
    startBtn.add([btnBg, btnText]);
    startBtn.setInteractive(new Phaser.Geom.Rectangle(-150, -30, 300, 60), Phaser.Geom.Rectangle.Contains);

    startBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Opening'));
    });
  }
}

class OpeningScene extends Phaser.Scene {
  constructor() { super('Opening'); }
  async create() {
    // Load ảnh cảnh vũ trụ làm background
    let cosmicBg: Phaser.GameObjects.Image | null = null;
    if (this.textures.exists('cosmic_bg')) {
      cosmicBg = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2, 'cosmic_bg');
      cosmicBg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      cosmicBg.setDepth(0);
    } else {
      // Fallback: tạo background vũ trụ bằng code
      const stars = this.add.graphics();
      stars.fillStyle(0x1e1b4b, 1);
      stars.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      for(let i=0; i<300; i++) {
        stars.fillStyle(0xffffff, Math.random());
        stars.fillCircle(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 2);
      }
      stars.setDepth(0);
    }

    // Load ảnh nữ thần
    let goddessImage: Phaser.GameObjects.Image | null = null;
    if (this.textures.exists('goddess')) {
      goddessImage = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2 - 100, 'goddess');
      // Scale ảnh để phù hợp với màn hình
      const scale = Math.min(GAME_WIDTH / goddessImage.width * 0.6, GAME_HEIGHT / goddessImage.height * 0.7);
      goddessImage.setScale(scale);
      goddessImage.setDepth(2);
      
      // Đảm bảo ảnh hiển thị với nền trong suốt (alpha channel tự động được xử lý)
      goddessImage.setAlpha(1);
      // Không dùng blend mode để giữ nguyên alpha channel
      goddessImage.setBlendMode(Phaser.BlendModes.NORMAL);
      
      // Thêm hiệu ứng glow cho nữ thần
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
      // Fallback: tạo hào quang Nữ Thần bằng Graphics
    const aura = this.add.graphics();
    aura.fillStyle(0xfef3c7, 0.2);
    aura.fillCircle(GAME_WIDTH/2, GAME_HEIGHT/2 - 100, 150);
    aura.fillStyle(0xfef3c7, 0.1);
    aura.fillCircle(GAME_WIDTH/2, GAME_HEIGHT/2 - 100, 250);
      aura.setDepth(1);
    }

    // Thêm hiệu ứng hạt lấp lánh
    const emitter = this.add.particles(GAME_WIDTH/2, GAME_HEIGHT/2 - 100, 'flare', {
        speed: { min: -50, max: 50 },
        scale: { start: 0.1, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 3000,
        blendMode: 'ADD',
        frequency: 50
    });
    emitter.setDepth(3);

    const dialogueContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 160);
    const box = this.add.rectangle(0, 0, GAME_WIDTH - 160, 180, 0x020617, 0.9).setStrokeStyle(3, 0xf59e0b);
    const title = this.add.text(-(GAME_WIDTH-200)/2, -65, 'NỮ THẦN ÁNH SÁNG', { 
        fontFamily: 'MedievalSharp', fontSize: '30px', color: '#f59e0b' 
    });
    
    // Text hội thoại tĩnh
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

    // Nút TIẾP TỤC - đặt ở góc dưới bên phải của dialogue box (nhỏ hơn)
    const nextBtnContainer = this.add.container((GAME_WIDTH-200)/2 - 80, 60);
    const nextBtnBg = this.add.rectangle(0, 0, 160, 40, 0xf59e0b, 0.9)
      .setStrokeStyle(2, 0xfcd34d);
    const nextBtnText = this.add.text(0, 0, 'TIẾP TỤC ➜', {
      fontFamily: 'MedievalSharp', 
      fontSize: '18px', 
      color: '#ffffff'
    }).setOrigin(0.5);
    
    nextBtnContainer.add([nextBtnBg, nextBtnText]);
    nextBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-80, -20, 160, 40), Phaser.Geom.Rectangle.Contains);
    nextBtnContainer.setDepth(10);
    
    // Hiệu ứng hover cho nút
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

    // Hiệu ứng typewrite cho text
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

class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelect'); }
  create() {
    // Background với hiệu ứng
    const bgGradient = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x020617);
    bgGradient.setDepth(0);
    
    // Thêm sao nền
    const stars = this.add.graphics();
    for(let i=0; i<150; i++) {
      stars.fillStyle(0xffffff, Math.random() * 0.8);
      stars.fillCircle(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 2);
    }
    stars.setDepth(1);

    // Title
    const title = this.add.text(GAME_WIDTH/2, 60, 'CHỌN LỚP NHÂN VẬT', {
        fontFamily: 'MedievalSharp', 
        fontSize: '56px', 
        color: '#f59e0b',
        stroke: '#451a03',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(2);

    // Subtitle
    const subtitle = this.add.text(GAME_WIDTH/2, 110, 'Chọn một lớp nhân vật để bắt đầu hành trình', {
        fontFamily: 'Almendra',
        fontSize: '20px',
        color: '#94a3b8'
    }).setOrigin(0.5).setDepth(2);

    const classes = [HeroClass.PALADIN, HeroClass.WARRIOR, HeroClass.MAGE, HeroClass.ARCHER];
    let selectedCard: Phaser.GameObjects.Container | null = null;
    
    classes.forEach((classKey, idx) => {
      const metadata = CLASS_METADATA[classKey];
      const x = 160 + idx * 280;
      const y = 400;
      const card = this.add.container(x, y);
      
      // Card background với gradient effect
      const bg = this.add.rectangle(0, 0, 240, 480, 0x0f172a, 0.95)
        .setStrokeStyle(3, parseInt(metadata.color.replace('#', '0x')), 0.3);
      const bgGlow = this.add.rectangle(0, 0, 240, 480, parseInt(metadata.color.replace('#', '0x')), 0.1);
      
      // Icon với hiệu ứng
      const icon = this.add.text(0, -160, metadata.icon, { 
        fontSize: '100px' 
      }).setOrigin(0.5);
      
      // Name
      const name = this.add.text(0, -40, metadata.name, { 
        fontFamily: 'MedievalSharp', 
        fontSize: '26px', 
        color: metadata.color,
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      
      // Description
      const desc = this.add.text(0, 10, metadata.description, {
        fontFamily: 'Almendra',
        fontSize: '16px',
        color: '#cbd5e1',
        wordWrap: { width: 200, useAdvancedWrap: true },
        align: 'center'
      }).setOrigin(0.5);
      
      // Stats
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
      
      // Select button
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
      
      // Hover effects
      card.on('pointerover', () => {
        bg.setStrokeStyle(5, parseInt(metadata.color.replace('#', '0x')), 1);
        bgGlow.setAlpha(0.3);
        this.tweens.add({ 
          targets: card, 
          scale: 1.08, 
          duration: 200,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: icon,
          scale: 1.2,
          duration: 200
        });
      });
      
      card.on('pointerout', () => {
        bg.setStrokeStyle(3, parseInt(metadata.color.replace('#', '0x')), 0.3);
        bgGlow.setAlpha(0.1);
        this.tweens.add({ 
          targets: card, 
          scale: 1.0, 
          duration: 200 
        });
        this.tweens.add({
          targets: icon,
          scale: 1.0,
          duration: 200
        });
      });
      
      card.on('pointerdown', () => {
        // Animation khi chọn
        this.cameras.main.flash(300, 255, 255, 255);
        const { onHeroSelected } = this.registry.get('callbacks');
        
        // Gọi callback trước để cập nhật gameState
        onHeroSelected(classKey);
        
        // Đợi một chút để gameState được cập nhật trong registry
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

class MainGameScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() { super('MainGame'); }
  create() {
    // Lấy gameState từ registry
    let gameState = this.registry.get('gameState');
    let currentHero = gameState?.currentHero;
    
    // Nếu chưa có hero, thử lấy lại sau một chút
    if (!currentHero) {
      this.time.delayedCall(200, () => {
        gameState = this.registry.get('gameState');
        currentHero = gameState?.currentHero;
        if (currentHero) {
          this.setupGame(currentHero);
        } else {
          // Fallback: quay lại scene chọn nhân vật
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

export default HeroQuestGame;
