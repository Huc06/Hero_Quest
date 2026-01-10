import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data';
import { HeroData } from '../types';

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
  private actionButtons!: Phaser.GameObjects.Container[];
  private turnIndicator!: Phaser.GameObjects.Text;
  private damageText!: Phaser.GameObjects.Text;
  private battleUI!: Phaser.GameObjects.Container;

  constructor() {
    super('Battle');
  }

  create() {
    const gameState = this.registry.get('gameState');
    this.heroData = gameState?.currentHero;

    if (!this.heroData) {
      this.scene.start('CharacterSelect');
      return;
    }

    this.setupBattleState();
    this.createBackground();
    this.createSprites();
    this.createHealthBars();
    this.createBattleUI();
    this.createActionButtons();
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
    if (this.textures.exists('battle_arena')) {
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'battle_arena');
      const scaleX = GAME_WIDTH / bg.width;
      const scaleY = GAME_HEIGHT / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale).setDepth(0);
    } else {
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
    if (this.textures.exists('dragon_idle')) {
      this.dragonSprite = this.add.sprite(GAME_WIDTH - 200, GAME_HEIGHT / 2 - 50, 'dragon_idle');
      this.dragonSprite.setScale(2).setDepth(2);
      this.anims.create({
        key: 'dragon_idle',
        frames: this.anims.generateFrameNumbers('dragon_idle', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
      this.dragonSprite.play('dragon_idle');
    } else {
      this.dragonSprite = this.add.sprite(GAME_WIDTH - 200, GAME_HEIGHT / 2 - 50, 'dragon_idle');
      this.dragonSprite.setVisible(false);
    }

    const heroClass = this.heroData.classType;
    const heroTextureKey = heroClass.toLowerCase();
    
    if (this.textures.exists(heroTextureKey)) {
      this.heroSprite = this.add.sprite(200, GAME_HEIGHT / 2 + 100, heroTextureKey);
      this.heroSprite.setScale(2).setDepth(2).setFlipX(true);
    } else {
      this.heroSprite = this.add.sprite(200, GAME_HEIGHT / 2 + 100, heroTextureKey);
      this.heroSprite.setVisible(false);
    }
  }

  createHealthBars() {
    const barWidth = 300;
    const barHeight = 30;
    const barX = 50;
    const heroBarY = 50;
    const dragonBarY = 100;

    this.heroHealthBar = this.add.graphics();
    this.drawHealthBar(this.heroHealthBar, barX, heroBarY, barWidth, barHeight, 0x00ff00, this.battleState.heroHP / this.battleState.heroMaxHP);

    this.dragonHealthBar = this.add.graphics();
    this.drawHealthBar(this.dragonHealthBar, barX, dragonBarY, barWidth, barHeight, 0xff0000, this.battleState.dragonHP / this.battleState.dragonMaxHP);

    this.add.text(barX, heroBarY - 20, `${this.heroData.name}`, {
      fontFamily: 'MedievalSharp',
      fontSize: '20px',
      color: '#ffffff'
    }).setDepth(10);

    this.add.text(barX, dragonBarY - 20, 'Ác Long', {
      fontFamily: 'MedievalSharp',
      fontSize: '20px',
      color: '#ff0000'
    }).setDepth(10);
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

    const uiBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 100, GAME_WIDTH, 200, 0x000000, 0.8);
    this.battleUI.add(uiBg);

    this.turnIndicator = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 180, 'Lượt của bạn', {
      fontFamily: 'MedievalSharp',
      fontSize: '24px',
      color: '#f59e0b'
    }).setOrigin(0.5).setDepth(101);
    this.battleUI.add(this.turnIndicator);

    this.damageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'MedievalSharp',
      fontSize: '32px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(50).setVisible(false);
  }

  createActionButtons() {
    this.actionButtons = [];
    const buttons = [
      { text: 'TẤN CÔNG', action: 'attack', x: GAME_WIDTH / 2 - 200 },
      { text: 'PHÒNG THỦ', action: 'defend', x: GAME_WIDTH / 2 - 100 },
      { text: 'KỸ NĂNG', action: 'skill', x: GAME_WIDTH / 2 },
      { text: 'ĐỒ DÙNG', action: 'item', x: GAME_WIDTH / 2 + 100 }
    ];

    buttons.forEach((btn, index) => {
      const container = this.add.container(btn.x, GAME_HEIGHT - 50);
      const bg = this.add.rectangle(0, 0, 90, 40, 0x1a1a1a, 1)
        .setStrokeStyle(2, 0xf59e0b, 1);
      const text = this.add.text(0, 0, btn.text, {
        fontFamily: 'MedievalSharp',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);

      container.add([bg, text]);
      container.setInteractive(new Phaser.Geom.Rectangle(-45, -20, 90, 40), Phaser.Geom.Rectangle.Contains);
      container.setDepth(101);

      container.on('pointerover', () => {
        bg.setFillStyle(0x2a2a2a, 1);
        bg.setStrokeStyle(2, 0xfcd34d, 1);
      });

      container.on('pointerout', () => {
        bg.setFillStyle(0x1a1a1a, 1);
        bg.setStrokeStyle(2, 0xf59e0b, 1);
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
      case 'skill':
        this.playerSkill();
        break;
      case 'item':
        this.playerItem();
        break;
    }
  }

  playerAttack() {
    const damage = this.heroData.stats.attack + Math.floor(Math.random() * 10);
    this.dealDamage('dragon', damage);
    this.showDamageText(this.dragonSprite.x, this.dragonSprite.y - 50, `-${damage}`, 0xff0000);
    
    this.tweens.add({
      targets: this.heroSprite,
      x: this.heroSprite.x + 50,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.endPlayerTurn();
      }
    });

    if (this.textures.exists('impact_effect')) {
      const impact = this.add.sprite(this.dragonSprite.x, this.dragonSprite.y, 'impact_effect');
      impact.setScale(2).setDepth(3);
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
    
    if (this.textures.exists('magic_spell')) {
      const spell = this.add.sprite(this.dragonSprite.x, this.dragonSprite.y, 'magic_spell');
      spell.setScale(2).setDepth(3);
      this.anims.create({
        key: 'spell',
        frames: this.anims.generateFrameNumbers('magic_spell', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: 0
      });
      spell.play('spell');
      spell.on('animationcomplete', () => spell.destroy());
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
    
    this.tweens.add({
      targets: this.dragonSprite,
      x: this.dragonSprite.x - 50,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.endDragonTurn();
      }
    });
  }

  dragonFireBreath() {
    if (this.textures.exists('dragon_fire')) {
      this.dragonSprite.play('dragon_fire');
      this.dragonSprite.once('animationcomplete', () => {
        this.dragonSprite.play('dragon_idle');
      });
    }

    if (this.textures.exists('fire_effect')) {
      const fire = this.add.sprite(this.heroSprite.x, this.heroSprite.y, 'fire_effect');
      fire.setScale(2).setDepth(3);
      this.anims.create({
        key: 'fire',
        frames: this.anims.generateFrameNumbers('fire_effect', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: 0
      });
      fire.play('fire');
      fire.on('animationcomplete', () => fire.destroy());
    }

    const damage = 40 + Math.floor(Math.random() * 20);
    this.dealDamage('hero', damage);
    this.showDamageText(this.heroSprite.x, this.heroSprite.y - 50, `-${damage} (Lửa!)`, 0xff4400);
    
    this.time.delayedCall(1000, () => {
      this.endDragonTurn();
    });
  }

  dragonRoar() {
    if (this.textures.exists('dragon_roar')) {
      this.dragonSprite.play('dragon_roar');
      this.dragonSprite.once('animationcomplete', () => {
        this.dragonSprite.play('dragon_idle');
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
      
      if (this.battleState.heroHP <= 0) {
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
        50,
        50,
        300,
        30,
        0x00ff00,
        this.battleState.heroHP / this.battleState.heroMaxHP
      );
    } else {
      this.drawHealthBar(
        this.dragonHealthBar,
        50,
        100,
        300,
        30,
        0xff0000,
        this.battleState.dragonHP / this.battleState.dragonMaxHP
      );
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

  gameOver() {
    const gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'THẤT BẠI...', {
      fontFamily: 'MedievalSharp',
      fontSize: '64px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(201);

    this.cameras.main.fadeOut(2000, 0, 0, 0);

    this.time.delayedCall(3000, () => {
      this.scene.start('CharacterSelect');
    });
  }

  startBattle() {
    this.turnIndicator.setText('Lượt của bạn');
    this.turnIndicator.setColor('#f59e0b');
  }
}

