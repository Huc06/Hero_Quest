# Hero Quest: Sui Realm

Một game RPG pixel art được xây dựng với React, TypeScript và Phaser 3, tích hợp với Sui Blockchain.

## 🎮 Tính năng

- **Pixel Art Style**: Game được thiết kế với phong cách pixel art cổ điển
- **4 Lớp Nhân Vật**: Thánh Kị Sĩ, Chiến Sĩ, Ma Pháp Sư, Xạ Thủ
- **Hệ Thống Kỹ Năng**: Mỗi lớp có các kỹ năng đặc biệt riêng
- **Quest System**: Hệ thống nhiệm vụ hàng ngày
- **Inventory**: Quản lý vật phẩm và trang bị
- **Sui Integration**: Tích hợp ví Sui để kết nối blockchain

## 📁 Cấu trúc dự án

Xem file [ARCHITECTURE.md](./ARCHITECTURE.md) để hiểu chi tiết về kiến trúc hệ thống.

### Cấu trúc cơ bản:

```
hero-quest_-sui-realm/
├── 📂 components/          # React Components
│   └── HeroQuestGame.tsx   # Phaser game wrapper
│
├── 📂 scenes/              # Phaser Scenes (Game Logic)
│   ├── BootScene.ts
│   ├── TitleScene.ts
│   ├── OpeningScene.ts
│   ├── CharacterSelectScene.ts
│   ├── MainGameScene.ts
│   └── index.ts
│
├── 📂 data/                # Game Data & Constants
│   ├── constants.ts         # Class metadata, skills, game config
│   └── index.ts
│
├── 📂 config/               # Configuration Files
│   └── metadata.json       # App metadata
│
├── 📂 types/                # TypeScript Definitions
│   └── index.ts
│
├── 📂 public/               # Static Assets
│   └── assets/              # Game images
│
├── 📄 App.tsx               # Main React app
├── 📄 index.tsx             # Entry point
├── 📄 index.html            # HTML template
├── 📄 vite.config.ts        # Vite config (must be in root)
├── 📄 tsconfig.json         # TypeScript config (must be in root)
└── 📄 README.md             # This file
```

**Lưu ý**: Các file `vite.config.ts`, `tsconfig.json`, và `index.html` phải ở root để các tool tự động nhận diện.

## 🚀 Cài đặt và chạy

### Yêu cầu

- Node.js 18+
- pnpm (hoặc npm/yarn)

### Cài đặt

```bash
# Cài đặt dependencies
pnpm install

# Hoặc
npm install
```

### Chạy development server

```bash
pnpm dev

# Hoặc
npm run dev
```

Game sẽ chạy tại `http://localhost:3000`

## 🎯 Cách chơi

1. **Màn hình Title**: Click "BẮT ĐẦU HÀNH TRÌNH" để bắt đầu
2. **Opening Scene**: Xem câu chuyện mở đầu và click "TIẾP TỤC"
3. **Chọn Nhân Vật**: Chọn một trong 4 lớp nhân vật:
   - 🛡️ **Thánh Kị Sĩ**: Phòng thủ cao, có thể chữa lành
   - ⚔️ **Chiến Sĩ**: Tấn công cao, sát thương vật lý mạnh
   - 🔮 **Ma Pháp Sư**: Sát thương phép diện rộng
   - 🏹 **Xạ Thủ**: Tấn công từ xa, tốc độ cao
4. **Game Chính**: Di chuyển bằng phím mũi tên, khám phá Sui Realm

## 🛠️ Công nghệ sử dụng

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Phaser 3**: Game engine
- **Vite**: Build tool
- **Tailwind CSS**: Styling (via CDN)

## 📝 Assets

### Yêu cầu ảnh

Đặt các file ảnh sau vào `public/assets/`:

- `goddess.png`: Ảnh nữ thần với nền trong suốt (PNG với alpha channel)
- `cosmic_scene.png`: Background cảnh vũ trụ (1280x720px hoặc lớn hơn)

### Xử lý ảnh

Game tự động xử lý loại bỏ nền xám/trắng từ ảnh nữ thần bằng thuật toán flood fill.

## 🎨 Customization

### Thay đổi kích thước màn hình

Sửa trong `constants.ts`:

```typescript
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
```

### Thêm lớp nhân vật mới

1. Thêm enum vào `types.ts`:
```typescript
export enum HeroClass {
  // ... existing classes
  NEW_CLASS = 'NEW_CLASS'
}
```

2. Thêm metadata vào `constants.ts`:
```typescript
[HeroClass.NEW_CLASS]: {
  name: 'Tên Lớp',
  description: 'Mô tả',
  stats: { health: 100, attack: 80, defense: 60, speed: 70 },
  icon: '🎮',
  color: '#ff0000',
  imagePrompt: '...'
}
```

## 🔧 Development

### Cấu trúc code

- **Scenes**: Mỗi scene được tách riêng trong thư mục `scenes/` để dễ quản lý
- **Components**: React components trong `components/`
- **Constants**: Game constants và metadata trong `constants.ts`
- **Types**: TypeScript definitions trong `types.ts`

### Thêm scene mới

1. Tạo file mới trong `scenes/`:
```typescript
export class NewScene extends Phaser.Scene {
  constructor() { super('NewScene'); }
  create() {
    // Scene logic
  }
}
```

2. Export trong `scenes/index.ts`
3. Thêm vào `HeroQuestGame.tsx` trong array `scene`

## 📄 License

MIT

## 🙏 Credits

- Phaser 3: https://phaser.io
- React: https://react.dev
- Sui Blockchain: https://sui.io
