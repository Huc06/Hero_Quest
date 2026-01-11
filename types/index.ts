
export enum HeroClass {
  PALADIN = 'PALADIN',
  WARRIOR = 'WARRIOR',
  MAGE = 'MAGE',
  ARCHER = 'ARCHER'
}

export interface HeroStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Skill {
  name: string;
  description: string;
  icon: string;
  levelRequired: number;
  cooldown: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'WEAPON' | 'ARMOR' | 'POTION' | 'ARTIFACT';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  description: string;
  stats?: Partial<HeroStats>;
  icon: string;
  // Equipment layer image - để overlay lên character
  layerImage?: string;
  // Position offset cho equipment layer (px)
  layerOffset?: { x: number; y: number };
  // Scale cho equipment layer
  layerScale?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED';
}

export interface HeroData {
  id: string;
  name: string;
  classType: HeroClass;
  stats: HeroStats;
  level: number;
  exp: number;
  walletAddress?: string;
  skills: Skill[];
  biography?: string;
  equippedWeapon?: InventoryItem | null;
  equippedArmor?: InventoryItem | null;
  equippedHelmet?: InventoryItem | null;
  equippedBoots?: InventoryItem | null;
  equippedRing?: InventoryItem | null;
  equippedBracelet?: InventoryItem | null;
}

export interface GameState {
  currentHero: HeroData | null;
  walletConnected: boolean;
  walletAddress: string | null;
  scene: string;
  inventory: InventoryItem[];
  quests: Quest[];
  activeTab: 'HERO' | 'ITEMS' | 'QUEST' | 'SKILLS' | null;
}
