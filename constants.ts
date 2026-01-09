
import { HeroClass, HeroStats, Skill } from './types';

export const DEFAULT_SKILLS: Record<HeroClass, Skill[]> = {
  [HeroClass.PALADIN]: [
    { name: 'Thánh Quang Kích', description: 'Tấn công kẻ địch bằng ánh sáng, hồi máu cho bản thân.', icon: '✨', levelRequired: 1, cooldown: 8 },
    { name: 'Khiên Thần Thánh', description: 'Tạo lớp bảo vệ chặn 50% sát thương.', icon: '🛡️', levelRequired: 3, cooldown: 15 }
  ],
  [HeroClass.WARRIOR]: [
    { name: 'Xung Kích', description: 'Lao thẳng vào mục tiêu gây choáng.', icon: '🏃', levelRequired: 1, cooldown: 6 },
    { name: 'Nộ Long Trảm', description: 'Cú chém uy lực gây sát thương diện rộng.', icon: '🔥', levelRequired: 3, cooldown: 12 }
  ],
  [HeroClass.MAGE]: [
    { name: 'Cầu Lửa', description: 'Phóng quả cầu lửa thiêu rụi mục tiêu.', icon: '☄️', levelRequired: 1, cooldown: 4 },
    { name: 'Băng Giá Phủ', description: 'Làm chậm tất cả kẻ địch xung quanh.', icon: '❄️', levelRequired: 3, cooldown: 10 }
  ],
  [HeroClass.ARCHER]: [
    { name: 'Ưng Nhãn', description: 'Tăng 50% tỉ lệ chí mạng trong 10 giây.', icon: '👁️', levelRequired: 1, cooldown: 20 },
    { name: 'Vạn Tiễn Xuyên Tâm', description: 'Bắn ra cơn mưa tên từ bầu trời.', icon: '🏹', levelRequired: 3, cooldown: 15 }
  ]
};

export const CLASS_METADATA: Record<HeroClass, { 
  name: string; 
  description: string; 
  stats: HeroStats; 
  icon: string; 
  color: string;
  imagePrompt: string;
}> = {
  [HeroClass.PALADIN]: {
    name: 'Thánh Kị Sĩ',
    description: 'Phòng thủ cao, tấn công vừa phải. Có thể chữa lành và kháng bóng tối.',
    stats: { health: 100, attack: 60, defense: 90, speed: 40 },
    icon: '🛡️',
    color: '#fbbf24',
    imagePrompt: 'A noble Paladin in heavy intricate silver armor with gold filigree, holding a massive shield with a sun emblem and a glowing holy sword, righteous expression, standing in a grand cathedral beam of light, high fantasy, detailed textures, cinematic lighting, 8k masterpiece.'
  },
  [HeroClass.WARRIOR]: {
    name: 'Chiến Sĩ',
    description: 'Tấn công cao, phòng thủ trung bình. Sát thương vật lý cực mạnh.',
    stats: { health: 80, attack: 90, defense: 60, speed: 50 },
    icon: '⚔️',
    color: '#ef4444',
    imagePrompt: 'A fierce Warrior with massive muscles, wearing rugged fur and leather plate armor, wielding a gigantic stone-hewn battle axe, battle-scarred face, red war paint, standing on a stormy mountain peak, epic cinematic composition, hyper-realistic fantasy art.'
  },
  [HeroClass.MAGE]: {
    name: 'Ma Pháp Sư',
    description: 'Sát thương phép diện rộng. Buff và debuff mạnh mẽ.',
    stats: { health: 60, attack: 100, defense: 30, speed: 60 },
    icon: '🔮',
    color: '#8b5cf6',
    imagePrompt: 'An ancient Archmage wearing deep violet silk robes with glowing runes, levitating a mystical crystal staff, arcane magic circles spinning around, eyes glowing with cosmic power, ethereal magical library background, vibrant colors, masterpiece.'
  },
  [HeroClass.ARCHER]: {
    name: 'Xạ Thủ',
    description: 'Tấn công từ xa, chí mạng cao và né tránh linh hoạt.',
    stats: { health: 70, attack: 80, defense: 40, speed: 100 },
    icon: '🏹',
    color: '#10b981',
    imagePrompt: 'An elven Ranger Archer in forest green leather scout armor, aiming a longbow made of living wood with a glowing magical arrow, hidden in moonlit forest foliage, sharp focused gaze, elegant and agile, fantasy realism, misty forest background.'
  }
};

export const GODDESS_PROMPT = 'A magnificent, ethereal Goddess of Light with colossal glowing wings made of pure energy, wearing celestial white and gold flowing robes, divine aura, standing in a cosmic realm filled with nebula and stars, hyper-realistic, 8k resolution, cinematic lighting, masterpiece.';
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
