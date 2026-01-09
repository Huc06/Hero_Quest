
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
