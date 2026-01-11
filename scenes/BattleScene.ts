import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, CLASS_METADATA, DEFAULT_SKILLS } from '../data';
import { HeroData, HeroClass } from '../types';

interface BattleState {
  heroHP: number;
  heroMaxHP: number;
  dragonHP: number;
  dragonMaxHP: number;
  currentTurn: 'hero' | 'dragon';
  isPlayerTurn: boolean;
}

export class BattleScene extends Phaser.Scene {
  private battleState!: BattleState;
  private heroData!: HeroData;
  private dragonSprite!: Phaser.GameObjects.Sprite;
  private heroSprite!: Phaser.GameObjects.Sprite;
  private heroHealthBar!: Phaser.GameObjects.Graphics;
  private dragonHealthBar!: Phaser.GameObjects.Graphics;
  private heroHPText!: Phaser.GameObjects.Text;
  private dragonHPText!: Phaser.GameObjects.Text;
  private actionButtons!: Phaser.GameObjects.Container[];
  private turnIndicator!: Phaser.GameObjects.Text;
  private damageText!: Phaser.GameObjects.Text;
  private battleUI!: Phaser.GameObjects.Container;

  constructor() {
    super('Battle');
  }

  create() {
    console.log('BattleScene: Starting battle...');
    const gameState = this.registry.get('gameState');
    this.heroData = gameState?.currentHero;
    console.log('BattleScene: Hero data:', this.heroData);

    // Tạo hero mặc định nếu không có
    if (!this.heroData) {
      console.log('BattleScene: No hero found, creating default hero');
    
      const defaultClass = HeroClass.PALADIN;
      const metadata = CLASS_METADATA[defaultClass];
      this.heroData = {
        id: 'default_hero_' + Math.random().toString(36).substr(2, 9),
        name: 'Anh Hùng Mặc Định',
        classType: defaultClass,
        stats: { ...metadata.stats },
        level: 1,
        exp: 0,
        skills: DEFAULT_SKILLS[defaultClass],
        biography: 'Một anh hùng dũng cảm sẵn sàng chiến đấu với ác long.'
      };
    }

    this.setupBattleState();
    this.createBackground();
    this.createSprites();
    this.createHealthBars();
    this.createBattleUI();
    this.createActionButtons();
    
    // Fade in camera
    console.log('BattleScene: Fading in camera...');
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    // CHEAT KEY: Nhấn K để test JoJo ending
    const kKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    kKey.on('down', () => {
      console.log('CHEAT: Testing JoJo ending...');
      this.battleState.heroHP = 0;
      this.updateHealthBar('hero');
      this.gameOver();
    });
    
    this.startBattle();
  }

  setupBattleState() {
    this.battleState = {
      heroHP: this.heroData.stats.health,
      heroMaxHP: this.heroData.stats.health,
      dragonHP: 500,
      dragonMaxHP: 500,
      currentTurn: 'hero',
      isPlayerTurn: true
    };
  }

  createBackground() {
    console.log('BattleScene: Creating background...');
    if (this.textures.exists('battle_arena')) {
      console.log('BattleScene: battle_arena texture found');
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'battle_arena');
      const scaleX = GAME_WIDTH / bg.width;
      const scaleY = GAME_HEIGHT / bg.height;
      const scale = Math.max(scaleX, scaleY) * 1.05; // Phóng to một chút để cover toàn bộ
      bg.setScale(scale).setDepth(0);
    } else {
      console.log('BattleScene: battle_arena not found, using colored background');
      const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0000);
      bg.setDepth(0);
      
      const lava = this.add.graphics();
      for (let i = 0; i < 20; i++) {
        lava.fillStyle(0xff4400, 0.6);
        lava.fillCircle(
          Math.random() * GAME_WIDTH,
          GAME_HEIGHT - 50 + Math.random() * 50,
          Math.random() * 30 + 10
        );
      }
      lava.setDepth(0.5);
    }
  }

  createSprites() {
    console.log('BattleScene: Creating sprites...');
    // Rồng - scale nhỏ hơn
    if (this.textures.exists('dragon_idle')) {
      console.log('BattleScene: Creating dragon sprite');
      this.dragonSprite = this.add.sprite(GAME_WIDTH - 300, GAME_HEIGHT / 2 + 50, 'dragon_idle');
      this.dragonSprite.setScale(1.3).setDepth(2).setVisible(true).setFlipX(true); // Scale nhỏ hơn, FlipX để rồng quay về phía hero
      
      // Kiểm tra số frames thực tế
      const texture = this.textures.get('dragon_idle');
      const frameCount = texture.frameTotal || 1;
      
      // Log để debug
      console.log('BattleScene: Dragon idle texture info:', {
        key: texture.key,
        frameTotal: texture.frameTotal,
        frameCount: frameCount,
        width: texture.source[0]?.width,
        height: texture.source[0]?.height
      });
      
      // Chỉ tạo animation nếu có nhiều hơn 1 frame
      if (frameCount > 1 && !this.anims.exists('dragon_idle')) {
        this.anims.create({
          key: 'dragon_idle',
          frames: this.anims.generateFrameNumbers('dragon_idle', { start: 0, end: frameCount - 1 }),
          frameRate: 5,
          repeat: -1
        });
        this.dragonSprite.play('dragon_idle');
      }
      // Nếu chỉ có 1 frame, không cần animation, chỉ hiển thị static image
    } else {
      console.warn('BattleScene: dragon_idle texture not found!');
      // Fallback: tạo placeholder để thấy vị trí
      this.dragonSprite = this.add.sprite(GAME_WIDTH - 300, GAME_HEIGHT / 2 + 50, 'dragon_idle');
      this.dragonSprite.setVisible(false);
      const placeholder = this.add.rectangle(GAME_WIDTH - 300, GAME_HEIGHT / 2 + 50, 200, 200, 0xff0000, 0.5);
      placeholder.setStrokeStyle(3, 0xff0000, 1);
      placeholder.setDepth(2);
    }

    // Hero ở bên trái - scale nhỏ hơn nữa
    const heroClass = this.heroData.classType;
    const heroTextureKey = heroClass.toLowerCase();
    
    if (this.textures.exists(heroTextureKey)) {
      this.heroSprite = this.add.sprite(250, GAME_HEIGHT / 2 + 50, heroTextureKey);
      this.heroSprite.setScale(0.9).setDepth(3).setFlipX(true); // Scale nhỏ hơn
    } else {
      this.heroSprite = this.add.sprite(250, GAME_HEIGHT / 2 + 50, heroTextureKey);
      this.heroSprite.setVisible(false);
    }
  }

  createHealthBars() {
    const barWidth = 300;
    const barHeight = 28;
    
    // Hero health bar ở bên trái
    const heroBarX = 30;
    const heroBarY = 30;
    
    // Background panel cho hero health bar
    const heroPanel = this.add.rectangle(heroBarX + barWidth / 2, heroBarY + barHeight / 2, barWidth + 20, barHeight + 30, 0x000000, 0.7);
    heroPanel.setStrokeStyle(2, 0x00ff00, 0.8);
    heroPanel.setDepth(10);

    this.heroHealthBar = this.add.graphics();
    this.drawHealthBar(this.heroHealthBar, heroBarX, heroBarY + 25, barWidth, barHeight, 0x00ff00, this.battleState.heroHP / this.battleState.heroMaxHP);

    const heroNameText = this.add.text(heroBarX + 10, heroBarY + 2, `${this.heroData.name}`, {
      fontFamily: 'MedievalSharp',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(11);

    this.heroHPText = this.add.text(heroBarX + barWidth - 10, heroBarY + 27, `${this.battleState.heroHP}/${this.battleState.heroMaxHP}`, {
      fontFamily: 'MedievalSharp',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0).setDepth(11);

    // Dragon health bar ở bên phải
    const dragonBarX = GAME_WIDTH - 330;
    const dragonBarY = 30;
    
    // Background panel cho dragon health bar
    const dragonPanel = this.add.rectangle(dragonBarX + barWidth / 2, dragonBarY + barHeight / 2, barWidth + 20, barHeight + 30, 0x000000, 0.7);
    dragonPanel.setStrokeStyle(2, 0xff0000, 0.8);
    dragonPanel.setDepth(10);

    this.dragonHealthBar = this.add.graphics();
    this.drawHealthBar(this.dragonHealthBar, dragonBarX, dragonBarY + 25, barWidth, barHeight, 0xff0000, this.battleState.dragonHP / this.battleState.dragonMaxHP);

    const dragonNameText = this.add.text(dragonBarX + 10, dragonBarY + 2, 'Ác Long', {
      fontFamily: 'MedievalSharp',
      fontSize: '18px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(11);

    this.dragonHPText = this.add.text(dragonBarX + barWidth - 10, dragonBarY + 27, `${this.battleState.dragonHP}/${this.battleState.dragonMaxHP}`, {
      fontFamily: 'MedievalSharp',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0).setDepth(11);
  }

  drawHealthBar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, color: number, percentage: number) {
    graphics.clear();
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillRect(x, y, width, height);
    graphics.fillStyle(color, 1);
    graphics.fillRect(x + 2, y + 2, (width - 4) * percentage, height - 4);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(x, y, width, height);
  }

  createBattleUI() {
    this.battleUI = this.add.container(0, 0).setDepth(100);

    // UI Background với border đẹp hơn
    const uiBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 80, GAME_WIDTH, 160, 0x000000, 0.85);
    uiBg.setStrokeStyle(3, 0xf59e0b, 0.6);
    this.battleUI.add(uiBg);

    // Bỏ turn indicator - không hiển thị nữa
    this.turnIndicator = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 150, '', {
      fontFamily: 'MedievalSharp',
      fontSize: '26px',
      color: '#f59e0b',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(101).setVisible(false);
    this.battleUI.add(this.turnIndicator);

    // Damage text ở giữa màn hình
    this.damageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'MedievalSharp',
      fontSize: '36px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(50).setVisible(false);
  }

  createActionButtons() {
    this.actionButtons = [];
    // Chỉ giữ 2 nút: TẤN CÔNG và PHÒNG THỦ
    const buttons = [
      { text: 'TẤN CÔNG', action: 'attack', x: GAME_WIDTH / 2 - 100, color: 0xef4444 },
      { text: 'PHÒNG THỦ', action: 'defend', x: GAME_WIDTH / 2 + 100, color: 0x3b82f6 }
    ];

    buttons.forEach((btn, index) => {
      const container = this.add.container(btn.x, GAME_HEIGHT - 50);
      const bg = this.add.rectangle(0, 0, 180, 55, 0x1a1a1a, 1)
        .setStrokeStyle(3, btn.color, 0.8);
      const text = this.add.text(0, 0, btn.text, {
        fontFamily: 'MedievalSharp',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      container.add([bg, text]);
      container.setInteractive(new Phaser.Geom.Rectangle(-90, -27.5, 180, 55), Phaser.Geom.Rectangle.Contains);
      container.setDepth(101);

      container.on('pointerover', () => {
        bg.setFillStyle(0x2a2a2a, 1);
        bg.setStrokeStyle(3, btn.color, 1);
        container.setScale(1.08);
      });

      container.on('pointerout', () => {
        bg.setFillStyle(0x1a1a1a, 1);
        bg.setStrokeStyle(3, btn.color, 0.8);
        container.setScale(1.0);
      });

      container.on('pointerdown', () => {
        if (this.battleState.isPlayerTurn) {
          this.handlePlayerAction(btn.action);
        }
      });

      this.actionButtons.push(container);
      this.battleUI.add(container);
    });
  }

  handlePlayerAction(action: string) {
    if (!this.battleState.isPlayerTurn) return;

    switch (action) {
      case 'attack':
        this.playerAttack();
        break;
      case 'defend':
        this.playerDefend();
        break;
    }
  }

  playerAttack() {
    const damage = this.heroData.stats.attack + Math.floor(Math.random() * 10);
    this.dealDamage('dragon', damage);
    this.showDamageText(this.dragonSprite.x, this.dragonSprite.y - 50, `-${damage}`, 0xff0000);
    
    // Hero di chuyển về phía rồng khi tấn công
    this.tweens.add({
      targets: this.heroSprite,
      x: this.heroSprite.x + 80,
      duration: 300,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        this.endPlayerTurn();
      }
    });

    if (this.textures.exists('impact_effect')) {
      const impact = this.add.sprite(this.dragonSprite.x, this.dragonSprite.y, 'impact_effect');
      impact.setScale(1.5).setDepth(2); // Scale nhỏ hơn vì rồng ở xa
      this.anims.create({
        key: 'impact',
        frames: this.anims.generateFrameNumbers('impact_effect', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
      impact.play('impact');
      impact.on('animationcomplete', () => impact.destroy());
    }
  }

  playerDefend() {
    this.showDamageText(this.heroSprite.x, this.heroSprite.y - 50, 'PHÒNG THỦ!', 0x00ff00);
    this.endPlayerTurn();
  }

  playerSkill() {
    const skillDamage = this.heroData.stats.attack * 1.5 + Math.floor(Math.random() * 15);
    this.dealDamage('dragon', Math.floor(skillDamage));
    this.showDamageText(this.dragonSprite.x, this.dragonSprite.y - 50, `-${Math.floor(skillDamage)}!`, 0xff00ff);
    
    // Hiệu ứng phép thuật từ hero đến rồng
    if (this.textures.exists('magic_spell')) {
      const spell = this.add.sprite(this.heroSprite.x, this.heroSprite.y, 'magic_spell');
      spell.setScale(1.5).setDepth(3);
      
      // Di chuyển spell từ hero đến rồng
      this.tweens.add({
        targets: spell,
        x: this.dragonSprite.x,
        y: this.dragonSprite.y,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          this.anims.create({
            key: 'spell',
            frames: this.anims.generateFrameNumbers('magic_spell', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: 0
          });
          spell.play('spell');
          spell.on('animationcomplete', () => spell.destroy());
        }
      });
    }
    
    this.endPlayerTurn();
  }

  playerItem() {
    this.showDamageText(this.heroSprite.x, this.heroSprite.y - 50, 'Sử dụng đồ dùng', 0xffff00);
    this.endPlayerTurn();
  }

  endPlayerTurn() {
    this.battleState.isPlayerTurn = false;
    this.turnIndicator.setText('Lượt của Ác Long');
    this.turnIndicator.setColor('#ff0000');
    
    this.time.delayedCall(1000, () => {
      this.dragonTurn();
    });
  }

  dragonTurn() {
    const actions = ['attack', 'fire_breath', 'roar'];
    const action = actions[Math.floor(Math.random() * actions.length)];

    switch (action) {
      case 'attack':
        this.dragonAttack();
        break;
      case 'fire_breath':
        this.dragonFireBreath();
        break;
      case 'roar':
        this.dragonRoar();
        break;
    }
  }

  dragonAttack() {
    const damage = 30 + Math.floor(Math.random() * 20);
    this.dealDamage('hero', damage);
    this.showDamageText(this.heroSprite.x, this.heroSprite.y - 50, `-${damage}`, 0xff0000);
    
    // Rồng lao về phía hero
    this.tweens.add({
      targets: this.dragonSprite,
      x: this.dragonSprite.x - 80,
      y: this.dragonSprite.y + 20,
      duration: 300,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        this.endDragonTurn();
      }
    });
  }

  dragonFireBreath() {
    if (this.textures.exists('dragon_fire')) {
      // Kiểm tra animation đã tồn tại chưa
      if (!this.anims.exists('dragon_fire')) {
        const frameCount = this.textures.get('dragon_fire').frameTotal || 4;
        this.anims.create({
          key: 'dragon_fire',
          frames: this.anims.generateFrameNumbers('dragon_fire', { start: 0, end: frameCount - 1 }),
          frameRate: 8, // FrameRate mượt hơn
          repeat: 0
        });
      }
      this.dragonSprite.setVisible(true);
      this.dragonSprite.play('dragon_fire');
      this.dragonSprite.once('animationcomplete', () => {
        if (this.dragonSprite && this.dragonSprite.active) {
          this.dragonSprite.play('dragon_idle');
        }
      });
    }

    // Lửa từ rồng bay đến hero
    if (this.textures.exists('fire_effect')) {
      const fire = this.add.sprite(this.dragonSprite.x, this.dragonSprite.y, 'fire_effect');
      fire.setScale(1.5).setDepth(3);
      
      // Di chuyển lửa từ rồng đến hero
      this.tweens.add({
        targets: fire,
        x: this.heroSprite.x,
        y: this.heroSprite.y,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          this.anims.create({
            key: 'fire',
            frames: this.anims.generateFrameNumbers('fire_effect', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: 0
          });
          fire.play('fire');
          fire.on('animationcomplete', () => fire.destroy());
        }
      });
    }

    const damage = 40 + Math.floor(Math.random() * 20);
    this.dealDamage('hero', damage);
    this.showDamageText(this.heroSprite.x, this.heroSprite.y - 50, `-${damage} (Lửa!)`, 0xff4400);
    
    this.time.delayedCall(1200, () => {
      this.endDragonTurn();
    });
  }

  dragonRoar() {
    if (this.textures.exists('dragon_roar')) {
      // Kiểm tra animation đã tồn tại chưa
      if (!this.anims.exists('dragon_roar')) {
        const frameCount = this.textures.get('dragon_roar').frameTotal || 4;
        this.anims.create({
          key: 'dragon_roar',
          frames: this.anims.generateFrameNumbers('dragon_roar', { start: 0, end: frameCount - 1 }),
          frameRate: 8, // FrameRate mượt hơn
          repeat: 0
        });
      }
      this.dragonSprite.setVisible(true);
      this.dragonSprite.play('dragon_roar');
      this.dragonSprite.once('animationcomplete', () => {
        if (this.dragonSprite && this.dragonSprite.active) {
          this.dragonSprite.play('dragon_idle');
        }
      });
    }

    this.showDamageText(this.dragonSprite.x, this.dragonSprite.y - 100, 'ROAR!!!', 0xff0000);
    this.cameras.main.shake(500, 0.02);
    
    this.time.delayedCall(1000, () => {
      this.endDragonTurn();
    });
  }

  endDragonTurn() {
    this.battleState.isPlayerTurn = true;
    this.turnIndicator.setText('Lượt của bạn');
    this.turnIndicator.setColor('#f59e0b');
  }

  dealDamage(target: 'hero' | 'dragon', damage: number) {
    if (target === 'hero') {
      this.battleState.heroHP = Math.max(0, this.battleState.heroHP - damage);
      this.updateHealthBar('hero');
      console.log(`BattleScene: Hero took ${damage} damage, HP: ${this.battleState.heroHP}/${this.battleState.heroMaxHP}`);
      
      if (this.battleState.heroHP <= 0) {
        console.log('BattleScene: Hero HP <= 0, calling gameOver()...');
        this.gameOver();
      }
    } else {
      this.battleState.dragonHP = Math.max(0, this.battleState.dragonHP - damage);
      this.updateHealthBar('dragon');
      
      if (this.battleState.dragonHP <= 0) {
        this.victory();
      }
    }
  }

  updateHealthBar(target: 'hero' | 'dragon') {
    if (target === 'hero') {
      this.drawHealthBar(
        this.heroHealthBar,
        30,
        55, // heroBarY + 25
        300,
        28,
        0x00ff00,
        this.battleState.heroHP / this.battleState.heroMaxHP
      );
      // Update HP text
      if (this.heroHPText) {
        this.heroHPText.setText(`${this.battleState.heroHP}/${this.battleState.heroMaxHP}`);
      }
    } else {
      this.drawHealthBar(
        this.dragonHealthBar,
        GAME_WIDTH - 330, // dragonBarX
        55, // dragonBarY + 25
        300,
        28,
        0xff0000,
        this.battleState.dragonHP / this.battleState.dragonMaxHP
      );
      // Update HP text
      if (this.dragonHPText) {
        this.dragonHPText.setText(`${this.battleState.dragonHP}/${this.battleState.dragonMaxHP}`);
      }
    }
  }

  showDamageText(x: number, y: number, text: string, color: number) {
    this.damageText.setText(text);
    this.damageText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    this.damageText.setPosition(x, y);
    this.damageText.setVisible(true);
    
    this.tweens.add({
      targets: this.damageText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.damageText.setVisible(false);
        this.damageText.setAlpha(1);
      }
    });
  }

  victory() {
    if (this.textures.exists('victory_scene')) {
      const victory = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'victory_scene');
      victory.setScale(Math.max(GAME_WIDTH / victory.width, GAME_HEIGHT / victory.height)).setDepth(200);
    }

    const victoryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CHIẾN THẮNG!', {
      fontFamily: 'MedievalSharp',
      fontSize: '64px',
      color: '#f59e0b',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(201);

    this.cameras.main.flash(1000, 255, 255, 0);

    this.time.delayedCall(3000, () => {
      this.scene.start('MainGame');
    });
  }

  playJoJoMusic() {
    console.log('BattleScene: Attempting to play jojo_ending music...');
    
    try {
      if (this.cache.audio.exists('jojo_ending')) {
        console.log('BattleScene: Audio cache found, playing...');
        const music = this.sound.add('jojo_ending', { volume: 0.6 });
        music.play();
        console.log('BattleScene: Music playing:', music.isPlaying);
      } else {
        console.warn('BattleScene: jojo_ending audio not found in cache');
      }
    } catch (error) {
      console.error('BattleScene: Error playing music:', error);
    }
  }

  gameOver() {
    console.log('BattleScene: Game Over - JoJo style!');
    
    // 🎵 Play JoJo ending music (Roundabout style)
    // Resume audio context first (required by browser autoplay policy)
    const soundManager = this.sound as any;
    if (soundManager.context && soundManager.context.state === 'suspended') {
      console.log('BattleScene: Resuming suspended audio context...');
      soundManager.context.resume().then(() => {
        this.playJoJoMusic();
      });
    } else {
      this.playJoJoMusic();
    }
    
    // Disable all action buttons
    if (this.actionButtons) {
      this.actionButtons.forEach(btn => btn.setVisible(false));
    }
    
    // Freeze frame effect - Stop game animations only
    this.physics.pause();
    
    // Stop all existing tweens for game objects
    this.tweens.getTweens().forEach(tween => {
      if (tween.targets.includes(this.heroSprite) || 
          tween.targets.includes(this.dragonSprite) ||
          tween.targets.includes(this.turnIndicator)) {
        tween.pause();
      }
    });
    
    // Black overlay first (full screen freeze)
    const blackOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setDepth(299);
    
    this.tweens.add({
      targets: blackOverlay,
      alpha: 0.3,
      duration: 300,
      ease: 'Power2'
    });
    
    // Add sepia/vintage filter overlay
    const sepiaOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x8B7355, 0)
      .setDepth(300);
    
    this.tweens.add({
      targets: sepiaOverlay,
      alpha: 0.4,
      duration: 500,
      ease: 'Power2'
    });
    
    // Vignette effect (darker edges)
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0);
    vignette.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    vignette.fillStyle(0x000000, 0.6);
    // Draw gradient-like vignette using multiple rectangles
    for (let i = 0; i < 50; i++) {
      const alpha = (i / 50) * 0.6;
      vignette.fillStyle(0x000000, alpha);
      vignette.strokeRect(i * 5, i * 5, GAME_WIDTH - i * 10, GAME_HEIGHT - i * 10);
    }
    vignette.setDepth(301);
    vignette.setAlpha(0);
    
    this.tweens.add({
      targets: vignette,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    this.time.delayedCall(800, () => {
      console.log('BattleScene: Showing TO BE CONTINUED text...');
      
      // Arrow symbol "→" (JoJo style)
      const arrow = this.add.text(GAME_WIDTH / 2 - 400, GAME_HEIGHT / 2 + 80, '←', {
        fontFamily: 'Arial',
        fontSize: '100px',
        color: '#DAA520',
        stroke: '#000000',
        strokeThickness: 8
      }).setOrigin(0.5).setDepth(302).setAlpha(0);

      // "TO BE CONTINUED" text (JoJo style)
      const toBeContinued = this.add.text(GAME_WIDTH / 2 - 250, GAME_HEIGHT / 2 + 80, 'TO BE CONTINUED', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '56px',
        color: '#DAA520',
        stroke: '#000000',
        strokeThickness: 8,
        fontStyle: 'italic bold'
      }).setOrigin(0, 0.5).setDepth(302).setAlpha(0);

      // Vietnamese subtitle
      const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180, 'PHẦN TIẾP THEO SẼ SỚM RA MẮT...', {
        fontFamily: 'MedievalSharp',
        fontSize: '24px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(302).setAlpha(0);

      // Hint text
      const hintText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'Nhấn SPACE để quay lại màn hình chính', {
        fontFamily: 'MedievalSharp',
        fontSize: '18px',
        color: '#94a3b8',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(302).setAlpha(0);

      // Slide in animation (JoJo style - from left)
      this.tweens.add({
        targets: [arrow, toBeContinued],
        alpha: 1,
        x: '+=50',
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          // Subtle shake effect
          this.tweens.add({
            targets: [arrow, toBeContinued],
            y: '+=2',
            duration: 100,
            yoyo: true,
            repeat: 2
          });
        }
      });

      // Fade in subtitle
      this.tweens.add({
        targets: subtitle,
        alpha: 1,
        duration: 800,
        delay: 600,
        ease: 'Power2'
      });

      // Fade in hint
      this.tweens.add({
        targets: hintText,
        alpha: 1,
        duration: 800,
        delay: 1200,
        ease: 'Power2'
      });

      // Pulsing animation for hint
      this.tweens.add({
        targets: hintText,
        scale: 1.05,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        delay: 2000,
        ease: 'Sine.easeInOut'
      });

      // Space key to return to Title
      const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      spaceKey.once('down', () => {
        // Stop JoJo music
        this.sound.stopAll();
        
        // Freeze frame zoom out effect
        this.tweens.add({
          targets: [arrow, toBeContinued, subtitle, hintText],
          alpha: 0,
          scale: 0.8,
          duration: 300
        });
        
        this.time.delayedCall(300, () => {
          this.cameras.main.fadeOut(500);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Title');
          });
        });
      });
    });
  }

  startBattle() {
    this.turnIndicator.setText('Lượt của bạn');
    this.turnIndicator.setColor('#f59e0b');
  }
}


