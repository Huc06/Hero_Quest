
import React, { useState, useEffect } from 'react';
import { HeroClass, GameState, HeroData, InventoryItem, Quest } from './types';
import { CLASS_METADATA, DEFAULT_SKILLS } from './constants';
import HeroQuestGame from './components/HeroQuestGame';
import { Wallet, Shield, Package, Settings, Zap, User, X, Swords, Heart, Activity, Wind, Star } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentHero: null,
    walletConnected: false,
    walletAddress: null,
    scene: 'Title',
    inventory: [
      { id: '1', name: 'Kiếm Tân Thủ', type: 'WEAPON', rarity: 'COMMON', description: 'Một thanh kiếm sắt bình thường.', icon: '⚔️', stats: { attack: 5 } }
    ],
    quests: [],
    activeTab: null
  });

  const connectWallet = () => {
    const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
    setGameState(prev => ({
      ...prev,
      walletConnected: true,
      walletAddress: mockAddress
    }));
  };

  const onHeroSelected = async (heroClass: HeroClass) => {
    const metadata = CLASS_METADATA[heroClass];
    const heroName = `Hero_${Math.floor(Math.random() * 1000)}`;
    const bio = `${heroName} là một ${metadata.name} dũng cảm, đã trải qua nhiều cuộc chiến và luôn sẵn sàng bảo vệ Sui Realm khỏi bóng tối.`;
    
    const newHero: HeroData = {
      id: Math.random().toString(36).substr(2, 9),
      name: heroName,
      classType: heroClass,
      stats: metadata.stats,
      level: 1,
      exp: 0,
      walletAddress: gameState.walletAddress || undefined,
      skills: DEFAULT_SKILLS[heroClass],
      biography: bio
    };

    const formattedQuests: Quest[] = [
      {
        id: Math.random().toString(36).substr(2, 5),
        title: 'Tiêu Diệt Quái Vật',
        description: 'Tiêu diệt 10 con quái vật trong rừng tối để nhận phần thưởng.',
        reward: '100 EXP + 50 Vàng',
        status: 'AVAILABLE'
      },
      {
        id: Math.random().toString(36).substr(2, 5),
        title: 'Thu Thập Tài Nguyên',
        description: 'Thu thập 5 viên đá ma thuật từ các hang động.',
        reward: '3 Viên Đá Ma Thuật',
        status: 'AVAILABLE'
      },
      {
        id: Math.random().toString(36).substr(2, 5),
        title: 'Bảo Vệ Làng',
        description: 'Giúp dân làng đánh đuổi bọn cướp đang tấn công.',
        reward: '150 EXP + Vũ Khí Hiếm',
        status: 'AVAILABLE'
      }
    ];

    setGameState(prev => ({
      ...prev,
      currentHero: newHero,
      quests: formattedQuests,
      scene: 'MainGame'
    }));
  };

  const handleSceneChange = (newScene: string) => {
    setGameState(prev => ({ ...prev, scene: newScene }));
  };

  const toggleTab = (tab: GameState['activeTab']) => {
    setGameState(prev => ({ ...prev, activeTab: prev.activeTab === tab ? null : tab }));
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden text-slate-200">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-800 rounded-full blur-[120px]"></div>
      </div>

      {/* Top Nav - Ẩn trong Opening và Title scene */}
      <div className={`absolute top-0 left-0 w-full p-6 flex justify-between items-start z-[100] pointer-events-none ${gameState.scene === 'Opening' || gameState.scene === 'Title' ? 'hidden' : ''}`}>
        <div className="flex flex-col space-y-2 pointer-events-auto">
          {gameState.currentHero ? (
            <div className="bg-slate-900/80 border border-slate-700/50 p-3 rounded-2xl flex items-center space-x-4 backdrop-blur-xl shadow-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-2xl border border-slate-600">
                {CLASS_METADATA[gameState.currentHero.classType].icon}
              </div>
              <div className="pr-4">
                <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                  Lv. {gameState.currentHero.level} {CLASS_METADATA[gameState.currentHero.classType].name}
                </div>
                <div className="font-medieval text-lg leading-tight">{gameState.currentHero.name}</div>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          ) : (
             <div className="font-medieval text-3xl text-amber-500 drop-shadow-md">Hero Quest</div>
          )}
        </div>

        <div className="flex space-x-3 pointer-events-auto">
          {!gameState.walletConnected ? (
            <button 
              onClick={connectWallet}
              className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all font-medieval shadow-lg"
            >
              <Wallet size={18} />
              <span>Connect Sui Wallet</span>
            </button>
          ) : (
            <div className="bg-slate-900/80 border border-slate-700/50 px-4 py-2.5 rounded-xl flex items-center space-x-3 text-blue-300 font-mono text-xs backdrop-blur-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{gameState.walletAddress?.slice(0, 6)}...{gameState.walletAddress?.slice(-4)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 w-full h-full max-w-[1920px] max-h-[1080px] flex items-center justify-center p-4">
        <div className="w-full h-full aspect-video shadow-2xl rounded-lg overflow-hidden border border-slate-800/50 relative bg-black">
          <HeroQuestGame 
            gameState={gameState} 
            onHeroSelected={onHeroSelected}
            onSceneChange={handleSceneChange}
          />

          {/* UI MODALS OVERLAY */}
          {gameState.activeTab && (
            <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-12">
                <div className="bg-slate-900/95 border-2 border-slate-700/50 w-full max-w-4xl h-full max-h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center p-6 border-b border-slate-800">
                        <h2 className="text-3xl font-medieval text-amber-500 flex items-center gap-3">
                            {gameState.activeTab === 'HERO' && <User className="text-blue-400" />}
                            {gameState.activeTab === 'ITEMS' && <Package className="text-green-400" />}
                            {gameState.activeTab === 'QUEST' && <Shield className="text-purple-400" />}
                            {gameState.activeTab === 'SKILLS' && <Zap className="text-yellow-400" />}
                            {gameState.activeTab}
                        </h2>
                        <button onClick={() => toggleTab(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {/* HERO TAB */}
                        {gameState.activeTab === 'HERO' && gameState.currentHero && (
                            <div className="grid grid-cols-2 gap-8 h-full">
                                <div className="space-y-6">
                                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                        <h3 className="text-xl font-medieval mb-4 text-amber-400">Tiểu Sử Anh Hùng</h3>
                                        <p className="text-slate-300 italic leading-relaxed">"{gameState.currentHero.biography}"</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Sức Mạnh', val: gameState.currentHero.stats.attack, icon: Swords, color: 'text-red-400' },
                                            { label: 'Phòng Thủ', val: gameState.currentHero.stats.defense, icon: Shield, color: 'text-blue-400' },
                                            { label: 'Sức Khỏe', val: gameState.currentHero.stats.health, icon: Heart, color: 'text-green-400' },
                                            { label: 'Tốc Độ', val: gameState.currentHero.stats.speed, icon: Wind, color: 'text-yellow-400' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex items-center space-x-4">
                                                <stat.icon size={20} className={stat.color} />
                                                <div>
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">{stat.label}</div>
                                                    <div className="text-lg font-bold">{stat.val}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center bg-slate-800/20 rounded-2xl border border-dashed border-slate-700 p-4">
                                    <div className="text-amber-500 mb-2 font-medieval">Vật Phẩm NFT Trên Sui</div>
                                    <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 text-slate-600">
                                        Chưa có NFT nào được đúc
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ITEMS TAB */}
                        {gameState.activeTab === 'ITEMS' && (
                            <div className="grid grid-cols-6 gap-4">
                                {gameState.inventory.map((item) => (
                                    <div key={item.id} className="group relative bg-slate-800/50 aspect-square rounded-xl border border-slate-700 flex items-center justify-center text-4xl hover:bg-slate-700 hover:border-amber-500 cursor-pointer transition-all shadow-inner">
                                        {item.icon}
                                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 p-2 rounded border border-slate-600 text-[10px] z-10 w-24 text-center">
                                            {item.name}
                                        </div>
                                    </div>
                                ))}
                                {[...Array(11)].map((_, i) => (
                                    <div key={i} className="bg-slate-900/50 aspect-square rounded-xl border border-slate-800 flex items-center justify-center text-slate-800 italic text-xs">
                                        Trống
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* QUEST TAB */}
                        {gameState.activeTab === 'QUEST' && (
                            <div className="space-y-4">
                                {gameState.quests.map((quest) => (
                                    <div key={quest.id} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 flex justify-between items-center hover:bg-slate-800/60 transition-colors">
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-medieval text-purple-400">{quest.title}</h4>
                                            <p className="text-slate-400 text-sm">{quest.description}</p>
                                            <div className="text-xs text-amber-500/80 font-bold uppercase mt-2">Phần thưởng: {quest.reward}</div>
                                        </div>
                                        <button className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-transform active:scale-95">
                                            NHẬN NHIỆM VỤ
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SKILLS TAB */}
                        {gameState.activeTab === 'SKILLS' && gameState.currentHero && (
                            <div className="grid grid-cols-2 gap-6">
                                {gameState.currentHero.skills.map((skill, i) => (
                                    <div key={i} className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 flex items-start space-x-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors"></div>
                                        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-4xl border border-slate-800 shadow-2xl">
                                            {skill.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="text-xl font-medieval text-amber-400">{skill.name}</h4>
                                                <span className="text-[10px] bg-slate-950 px-2 py-1 rounded-md text-slate-500 border border-slate-800">CD: {skill.cooldown}s</span>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-snug">{skill.description}</p>
                                            <div className="mt-4 h-1.5 w-full bg-slate-950 rounded-full">
                                                <div className="h-full bg-yellow-500 w-full rounded-full opacity-30"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom HUD Nav */}
      {gameState.currentHero && gameState.scene === 'MainGame' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-6 z-[150]">
          {[
            { id: 'HERO', icon: User, label: 'Hero', color: 'hover:text-blue-400 hover:border-blue-500' },
            { id: 'ITEMS', icon: Package, label: 'Items', color: 'hover:text-green-400 hover:border-green-500' },
            { id: 'QUEST', icon: Shield, label: 'Quest', color: 'hover:text-purple-400 hover:border-purple-500' },
            { id: 'SKILLS', icon: Zap, label: 'Skills', color: 'hover:text-yellow-400 hover:border-yellow-500' }
          ].map((item, i) => (
            <button 
                key={i} 
                onClick={() => toggleTab(item.id as any)}
                className={`group relative bg-slate-900/90 border border-slate-700 p-4 rounded-2xl text-slate-300 transition-all shadow-xl backdrop-blur-md ${item.color} ${gameState.activeTab === item.id ? 'border-amber-500 text-amber-500 scale-110' : ''}`}
            >
              <item.icon size={26} />
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-amber-400 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-2xl">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
