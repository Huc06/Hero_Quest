import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data';

export class BootScene extends Phaser.Scene {
  constructor() { 
    super('Boot'); 
  }
  
  preload() {
    this.load.image('village_map', '/assets/village_map.png').on('loaderror', () => {
      this.load.image('village_map', '/assets/town_map.png').on('loaderror', () => {
        this.load.image('village_map', '/assets/map.png').on('loaderror', () => {
          console.warn('Village map image not found. Please add village_map.png, town_map.png, or map.png to /public/assets/');
        });
      });
    });
    this.load.image('cosmic_bg', '/assets/cosmic_scene.png');
    this.load.image('goddess', '/assets/goddess.png');
    this.load.image('paladin', '/assets/paladin.png');
    this.load.image('warrior', '/assets/warrior.png').on('loaderror', () => console.warn('warrior.png not found'));
    this.load.image('mage', '/assets/mage.png').on('loaderror', () => console.warn('mage.png not found'));
    this.load.image('archer', '/assets/archer.png').on('loaderror', () => console.warn('archer.png not found'));
    this.load.image('flare', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/particles/blue.png');
    
    this.load.image('battle_arena', '/assets/battle_arena.png').on('loaderror', () => console.warn('battle_arena.png not found'));
    this.load.spritesheet('dragon_idle', '/assets/dragon_idle.png', { frameWidth: 256, frameHeight: 256 }).on('loaderror', () => console.warn('dragon_idle.png not found'));
    this.load.spritesheet('dragon_fire', '/assets/dragon_fire.png', { frameWidth: 256, frameHeight: 256 }).on('loaderror', () => console.warn('dragon_fire.png not found'));
    this.load.spritesheet('dragon_roar', '/assets/dragon_roar.png', { frameWidth: 256, frameHeight: 256 }).on('loaderror', () => console.warn('dragon_roar.png not found'));
    this.load.spritesheet('fire_effect', '/assets/fire_effect.png', { frameWidth: 32, frameHeight: 32 }).on('loaderror', () => console.warn('fire_effect.png not found'));
    this.load.spritesheet('impact_effect', '/assets/impact_effect.png', { frameWidth: 64, frameHeight: 64 }).on('loaderror', () => console.warn('impact_effect.png not found'));
    this.load.spritesheet('magic_spell', '/assets/magic_spell.png', { frameWidth: 64, frameHeight: 64 }).on('loaderror', () => console.warn('magic_spell.png not found'));
    this.load.image('victory_scene', '/assets/victory_scene.png').on('loaderror', () => console.warn('victory_scene.png not found'));
    
    const progress = this.add.graphics();
    this.load.on('progress', (value: number) => {
      progress.clear();
      progress.fillStyle(0xf59e0b, 1);
      progress.fillRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 + 50, 300 * value, 10);
    });
    
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`Failed to load: ${file.key}`);
    });
  }
  
  create() {
    // Xử lý loại bỏ nền xám/trắng từ ảnh
    this.processTextureTransparency('goddess');
    // Xử lý nền trong suốt cho các ảnh nhân vật
    ['paladin', 'warrior', 'mage', 'archer'].forEach(textureKey => {
      if (this.textures.exists(textureKey)) {
        this.processTextureTransparency(textureKey);
      }
    });
    
    this.cameras.main.fadeOut(0);
    this.scene.start('Title');
  }
  
  processTextureTransparency(textureKey: string) {
    if (!this.textures.exists(textureKey)) return;
    
    const texture = this.textures.get(textureKey);
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
      
      const isBackground = new Array(width * height).fill(false);
      const visited = new Array(width * height).fill(false);
      
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
          
          const brightness = (r + g + b) / 3;
          const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
          const isGrayWhite = brightness > 200 && colorVariance < 30;
          const colorDiff = Math.abs(r - targetColor.r) + Math.abs(g - targetColor.g) + Math.abs(b - targetColor.b);
          
          if (isGrayWhite && colorDiff < 50) {
            isBackground[idx] = true;
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
          }
        }
      };
      
      floodFill(0, 0);
      floodFill(width - 1, 0);
      floodFill(0, height - 1);
      floodFill(width - 1, height - 1);
      
      for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        if (isBackground[idx]) {
          data[i + 3] = 0;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      this.textures.remove(textureKey);
      this.textures.addCanvas(textureKey, canvas);
    };
    
    if (source && source.complete) {
      processTexture();
    } else if (source) {
      source.onload = processTexture;
    }
  }
}
