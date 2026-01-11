
import React, { useState, useEffect } from 'react';
import { useWallets, useCurrentWallet, useCurrentAccount, useConnectWallet, useDisconnectWallet, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { HeroClass, GameState, HeroData, InventoryItem, Quest } from './types';
import { CLASS_METADATA, DEFAULT_SKILLS } from './data';
import HeroQuestGame from './components/HeroQuestGame';
import SuiLogPanel, { SuiLogEntry } from './components/SuiLogPanel';
import { Shield, Package, Zap, User, X, Swords, Heart, Wind } from 'lucide-react';

const App: React.FC = () => {
  const wallets = useWallets();
  const { currentWallet, isConnected } = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [gameState, setGameState] = useState<GameState>({
    currentHero: null,
    walletConnected: false,
    walletAddress: null,
    scene: 'Title',
    inventory: [
      // WEAPONS with layer data
      { 
        id: 'weapon_1', 
        name: 'Kiếm Sắt', 
        type: 'WEAPON', 
        rarity: 'COMMON', 
        description: 'Một thanh kiếm sắt cơ bản',
        stats: { attack: 5 },
        icon: '⚔️',
        layerImage: '/assets/equipment/weapon_iron_sword.png',
        layerOffset: { x: -30, y: 10 },
        layerScale: 1.2
      },
      { 
        id: 'weapon_2', 
        name: 'Kiếm Thép', 
        type: 'WEAPON', 
        rarity: 'RARE', 
        description: 'Thanh kiếm thép sắc bén',
        stats: { attack: 10 },
        icon: '⚔️',
        layerImage: '/assets/equipment/weapon_steel_blade.png',
        layerOffset: { x: -30, y: 10 },
        layerScale: 1.2
      },
      
      // ARMOR with layer data
      { 
        id: 'armor_1', 
        name: 'Giáp Da', 
        type: 'ARMOR', 
        rarity: 'COMMON', 
        description: 'Áo giáp da nhẹ',
        stats: { defense: 5 },
        icon: '🛡️',
        layerImage: '/assets/equipment/armor_leather.png',
        layerOffset: { x: 0, y: 0 },
        layerScale: 1.0
      },
      { 
        id: 'armor_2', 
        name: 'Giáp Xích', 
        type: 'ARMOR', 
        rarity: 'RARE', 
        description: 'Giáp xích kim loại',
        stats: { defense: 10 },
        icon: '🛡️',
        layerImage: '/assets/equipment/armor_chainmail.png',
        layerOffset: { x: 0, y: 0 },
        layerScale: 1.0
      },
      
      // HELMETS
      { 
        id: 'helmet_1', 
        name: 'Mũ Da', 
        type: 'ARTIFACT', 
        rarity: 'COMMON', 
        description: 'Mũ da đơn giản',
        stats: { defense: 2 },
        icon: '👑',
        layerImage: '/assets/equipment/helmet_leather_cap.png',
        layerOffset: { x: 0, y: -15 },
        layerScale: 0.8
      },
      { 
        id: 'helmet_2', 
        name: 'Mũ Sắt', 
        type: 'ARTIFACT', 
        rarity: 'RARE', 
        description: 'Mũ sắt bảo vệ đầu',
        stats: { defense: 5 },
        icon: '👑',
        layerImage: '/assets/equipment/helmet_iron.png',
        layerOffset: { x: 0, y: -15 },
        layerScale: 0.85
      },
      
      // BOOTS
      { 
        id: 'boots_1', 
        name: 'Giày Da', 
        type: 'ARTIFACT', 
        rarity: 'COMMON', 
        description: 'Giày da bền chắc',
        stats: { speed: 2 },
        icon: '👢',
        layerImage: '/assets/equipment/boots_leather.png',
        layerOffset: { x: 0, y: 20 },
        layerScale: 0.7
      },
      { 
        id: 'boots_2', 
        name: 'Giày Cánh', 
        type: 'ARTIFACT', 
        rarity: 'EPIC', 
        description: 'Giày có cánh tăng tốc độ',
        stats: { speed: 10 },
        icon: '👟',
        layerImage: '/assets/equipment/boots_winged.png',
        layerOffset: { x: 0, y: 20 },
        layerScale: 0.75
      },
      
      // ACCESSORIES
      { 
        id: 'ring_1', 
        name: 'Nhẫn Bạc', 
        type: 'ARTIFACT', 
        rarity: 'RARE', 
        description: 'Nhẫn bạc tăng ma phòng',
        stats: { defense: 3 },
        icon: '💍'
      },
      { 
        id: 'bracelet_1', 
        name: 'Vòng Tay Vàng', 
        type: 'ARTIFACT', 
        rarity: 'EPIC', 
        description: 'Vòng tay vàng tăng sức mạnh',
        stats: { attack: 5 },
        icon: '💎'
      }
    ],
    quests: [],
    activeTab: null
  });

  const [suiLogs, setSuiLogs] = useState<SuiLogEntry[]>([]);
  const [transactionCompleted, setTransactionCompleted] = useState(false);
  
  // Sync wallet state with game state - chỉ sync khi ở CharacterSelect scene
  useEffect(() => {
    if (gameState.scene === 'CharacterSelect') {
      if (isConnected && currentAccount) {
    setGameState(prev => ({
      ...prev,
      walletConnected: true,
          walletAddress: currentAccount.address
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          walletConnected: false,
          walletAddress: null
        }));
      }
    }
  }, [isConnected, currentAccount, gameState.scene]);

  const addLog = React.useCallback((type: SuiLogEntry['type'], message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
    setSuiLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      type,
      message,
      data
    }]);
  }, []);

  const connectWallet = React.useCallback(() => {
    // Chỉ cho phép connect khi ở CharacterSelect scene
    if (gameState.scene !== 'CharacterSelect') {
      return;
    }
    
    try {
      if (wallets.length === 0) {
        return;
      }
      
      // Use the first available wallet
      const walletToConnect = wallets[0];
      
      connect(
        { wallet: walletToConnect },
        {
          onSuccess: () => {
            // Không log khi connect wallet
          },
          onError: (error: any) => {
            // Không log error
          }
        }
      );
    } catch (error: any) {
      // Không log error
    }
  }, [connect, wallets, gameState.scene]);

  // Expose functions to window for Phaser scenes
  useEffect(() => {
    (window as any).connectWallet = connectWallet;
    (window as any).addSuiLog = addLog;
    return () => {
      delete (window as any).connectWallet;
      delete (window as any).addSuiLog;
    };
  }, [connectWallet, addLog]);

  const onHeroSelected = async (heroClass: HeroClass) => {
    if (transactionCompleted) {
      return;
    }
    
    const metadata = CLASS_METADATA[heroClass];
    const heroName = `Hero_${Math.floor(Math.random() * 1000)}`;
    const bio = `${heroName} là một ${metadata.name} dũng cảm, đã trải qua nhiều cuộc chiến và luôn sẵn sàng bảo vệ Sui Realm khỏi bóng tối.`;
    
    if (!isConnected || !currentAccount) {
      alert('Vui lòng connect wallet trước khi chọn nhân vật!');
      return;
    }
    
    setSuiLogs([]);
    setTransactionCompleted(false);
    
    const packageId = '0x8293ff56f12eaf3de33823b7c2ef448c50e3d3480d211e3622c189ca99940a97';
    const module = 'hero';
    const functionName = 'mint_hero';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    addLog('call', 'Preparing Sui Move call', {
      code: `const tx = new Transaction();\ntx.moveCall({\n  target: '${packageId}::${module}::${functionName}',\n  arguments: []\n});`
    });
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::${module}::${functionName}`,
      arguments: []
    });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    addLog('call', 'Signing and executing transaction', {
      code: `const result = await signAndExecuteTransaction({\n  transaction: tx\n});\nconsole.log('Transaction digest:', result.digest);`
    });
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
    
    // Step 3: Sign and execute transaction - Wallet sẽ popup để approve
    signAndExecute(
      {
        transaction: tx
      },
      {
        onSuccess: (result) => {
          addLog('call', 'Transaction executed successfully', {
            code: `{\n  digest: '${result.digest}',\n  effects: ${JSON.stringify(result.effects || {}, null, 2)}\n}`
          });
          
          setTransactionCompleted(true);
          
          setTimeout(() => {
            const heroObjectId = result.digest || '0x' + Math.random().toString(16).slice(2, 66);
            
            addLog('call', 'Fetching hero object from Sui', {
              code: `const txEffects = await suiClient.getTransactionBlock({\n  digest: '${result.digest}',\n  options: { showObjectChanges: true }\n});\nconst heroObjectId = txEffects.objectChanges.find(\n  change => change.type === 'created' && change.objectType.includes('Hero')\n)?.objectId;\n\nconst heroObject = await suiClient.getObject({\n  id: heroObjectId,\n  options: { \n    showContent: true,\n    showOwner: true,\n    showType: true\n  }\n});\nconsole.log('Hero NFT:', heroObject);`
            });
    
    const newHero: HeroData = {
              id: heroObjectId,
      name: heroName,
      classType: heroClass,
              stats: {
                health: 100,
                attack: metadata.stats.attack,
                defense: metadata.stats.defense,
                speed: metadata.stats.speed
              },
      level: 1,
      exp: 0,
              walletAddress: currentAccount.address,
              skills: DEFAULT_SKILLS[heroClass],
              biography: bio
            };
            
            setGameState(prev => ({
              ...prev,
              currentHero: newHero,
              quests: formattedQuests
            }));
          }, 500);
        },
        onError: (error: any) => {
          addLog('call', 'Transaction failed', {
            code: `${error.message || JSON.stringify(error, null, 2)}`
          });
          alert('Transaction failed: ' + (error.message || 'Unknown error'));
        }
      }
    );
  };

  const handleSceneChange = (newScene: string) => {
    setGameState(prev => ({ ...prev, scene: newScene }));
  };

  const handleSetActiveTab = (tab: GameState['activeTab']) => {
    setGameState(prev => ({ ...prev, activeTab: tab }));
  };

  const toggleTab = (tab: GameState['activeTab']) => {
    // Nếu click vào QUEST, chuyển sang cảnh chiến đấu với rồng
    if (tab === 'QUEST') {
      setGameState(prev => ({
        ...prev,
        scene: 'Battle',
        activeTab: null
      }));
      
      // Chuyển scene trong Phaser
      const phaserGame = (window as any).__PHASER_GAME__;
      if (phaserGame) {
        const mainGameScene = phaserGame.scene.getScene('MainGame');
        if (mainGameScene && mainGameScene.scene.isActive()) {
          mainGameScene.cameras.main.fadeOut(500);
          mainGameScene.cameras.main.once('camerafadeoutcomplete', () => {
            mainGameScene.scene.start('Battle');
          });
        }
      }
      return;
    }
    
    // Các tab khác hoạt động bình thường
    setGameState(prev => {
      const newActiveTab = prev.activeTab === tab ? null : tab;
      return { ...prev, activeTab: newActiveTab };
    });
  };

  return (
    <div className="relative w-screen h-screen bg-black flex flex-col items-center justify-center overflow-hidden text-slate-200">
      {/* Decorative Background - REMOVED */}

      {/* Top Nav - Đã ẩn */}

      {/* Main Game Area */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="w-full h-full overflow-hidden relative bg-black">
          <HeroQuestGame 
            gameState={gameState} 
            onHeroSelected={onHeroSelected}
            onSceneChange={handleSceneChange}
            onSetActiveTab={handleSetActiveTab}
          />
        </div>
      </div>

      {/* UI MODALS REMOVED */}
          {false && gameState.activeTab && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-12" 
          style={{ 
            pointerEvents: 'auto',
            zIndex: 10000,
            position: 'fixed'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              toggleTab(null);
            }
          }}
        >
            <div 
              className="bg-slate-900/95 border-2 border-slate-700/50 w-full max-w-4xl h-full max-h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
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

                    <div className="flex-1 overflow-y-auto p-6">
                        {/* HERO TAB */}
                        {gameState.activeTab === 'HERO' && gameState.currentHero && (
                            <div className="grid grid-cols-3 gap-6 h-full">
                                {/* Left Panel - Stats & Equipment Slots */}
                                <div className="space-y-4">
                                    {/* Combat Power */}
                                    <div className="relative bg-gradient-to-br from-amber-900/60 via-amber-800/50 to-amber-700/40 p-5 rounded-xl border-2 border-amber-600/60 text-center shadow-xl overflow-hidden">
                                        {/* Animated glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-pulse"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="text-[10px] text-amber-300 mb-1 uppercase tracking-wider font-bold">⚡ Chiến Lực ⚡</div>
                                            <div className="text-4xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                                                {gameState.currentHero.stats.attack + gameState.currentHero.stats.defense + gameState.currentHero.stats.health + gameState.currentHero.stats.speed}
                                            </div>
                                            <div className="text-[9px] text-amber-500/70 mt-1">TOTAL POWER</div>
                                        </div>
                                    </div>
                                    
                                    {/* Stats */}
                                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-xl border-2 border-slate-700/50 space-y-2 shadow-lg">
                                        <div className="text-sm font-bold text-amber-400 mb-3 flex items-center">
                                            <span className="mr-2">📊</span> Thuộc Tính
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded-lg border border-red-900/30">
                                                <span className="text-slate-400 flex items-center"><span className="text-red-400 mr-2">⚔️</span>Vật công:</span>
                                                <span className="text-white font-bold text-sm bg-red-900/30 px-2 py-0.5 rounded">{gameState.currentHero.stats.attack}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded-lg border border-blue-900/30">
                                                <span className="text-slate-400 flex items-center"><span className="text-blue-400 mr-2">🛡️</span>Vật phòng:</span>
                                                <span className="text-white font-bold text-sm bg-blue-900/30 px-2 py-0.5 rounded">{gameState.currentHero.stats.defense}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded-lg border border-green-900/30">
                                                <span className="text-slate-400 flex items-center"><span className="text-green-400 mr-2">❤️</span>Máu:</span>
                                                <span className="text-white font-bold text-sm bg-green-900/30 px-2 py-0.5 rounded">{gameState.currentHero.stats.health}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 bg-slate-900/40 rounded-lg border border-purple-900/30">
                                                <span className="text-slate-400 flex items-center"><span className="text-purple-400 mr-2">✨</span>Ma phòng:</span>
                                                <span className="text-white font-bold text-sm bg-purple-900/30 px-2 py-0.5 rounded">{gameState.currentHero.stats.defense}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Equipment Slots List */}
                                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-xl border-2 border-slate-700/50 shadow-lg">
                                        <div className="text-sm font-bold text-amber-400 mb-3 flex items-center">
                                            <span className="mr-2">⚡</span> Trang Bị
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { key: 'helmet', label: 'Mũ', icon: '👑', item: gameState.currentHero.equippedHelmet },
                                                { key: 'weapon', label: 'Vũ Khí', icon: '⚔️', item: gameState.currentHero.equippedWeapon },
                                                { key: 'armor', label: 'Áo Giáp', icon: '🛡️', item: gameState.currentHero.equippedArmor },
                                                { key: 'boots', label: 'Giày', icon: '👢', item: gameState.currentHero.equippedBoots },
                                                { key: 'bracelet', label: 'Vòng Tay', icon: '💍', item: gameState.currentHero.equippedBracelet },
                                                { key: 'ring', label: 'Nhẫn', icon: '💎', item: gameState.currentHero.equippedRing },
                                            ].map((slot) => (
                                                <div 
                                                    key={slot.key}
                                                    className="flex items-center space-x-2 p-2 bg-gradient-to-r from-slate-900/60 to-slate-800/60 rounded-lg border border-slate-700 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer transition-all duration-300"
                                                    onClick={() => {
                                                        const items = gameState.inventory.filter(item => {
                                                            if (slot.key === 'weapon') return item.type === 'WEAPON';
                                                            if (slot.key === 'armor') return item.type === 'ARMOR';
                                                            return item.type === 'ARTIFACT';
                                                        });
                                                        if (items.length > 0) {
                                                            const item = items[0];
                                                            setGameState(prev => ({
                                                                ...prev,
                                                                currentHero: prev.currentHero ? {
                                                                    ...prev.currentHero,
                                                                    [slot.key === 'weapon' ? 'equippedWeapon' : 
                                                                     slot.key === 'armor' ? 'equippedArmor' :
                                                                     slot.key === 'helmet' ? 'equippedHelmet' :
                                                                     slot.key === 'boots' ? 'equippedBoots' :
                                                                     slot.key === 'bracelet' ? 'equippedBracelet' : 'equippedRing']: item
                                                                } : null
                                                            }));
                                                        }
                                                    }}
                                                >
                                                    <span className="text-xl">{slot.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="text-xs text-slate-400">{slot.label}</div>
                                                        <div className="text-xs text-slate-300 font-bold">
                                                            {slot.item ? slot.item.name : 'Trống'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Center - Character Model with Equipment Slots */}
                                <div className="relative flex items-center justify-center bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50 rounded-xl border-2 border-slate-700 shadow-2xl">
                                    {/* Decorative corner accents */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-600/50 rounded-tl-xl"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-600/50 rounded-tr-xl"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-600/50 rounded-bl-xl"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-600/50 rounded-br-xl"></div>
                                    
                                    {/* Character Model Area */}
                                    <div className="relative w-full h-full flex items-center justify-center p-4">
                                        {/* Equipment Slots positioned around character */}
                                        {/* Helmet - Top */}
                                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 group">
                                            <div 
                                                className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-600 flex items-center justify-center text-2xl hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/50 cursor-pointer transition-all duration-300 shadow-md"
                                                onClick={() => {
                                                    if (gameState.currentHero.equippedHelmet) {
                                                        // Unequip: remove item
                                                        setGameState(prev => ({
                                                            ...prev,
                                                            currentHero: prev.currentHero ? { ...prev.currentHero, equippedHelmet: null } : null
                                                        }));
                                                    }
                                                }}
                                            >
                                                {gameState.currentHero.equippedHelmet?.icon || <span className="opacity-40">👑</span>}
                                            </div>
                                            {gameState.currentHero.equippedHelmet && (
                                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full border-2 border-slate-900 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center text-[8px] text-white font-bold">✕</div>
                                            )}
                                        </div>
                                        
                                        {/* Weapon - Left */}
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 group">
                                            <div 
                                                className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-600 flex items-center justify-center text-2xl hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/50 cursor-pointer transition-all duration-300 shadow-md"
                                                onClick={() => {
                                                    if (gameState.currentHero.equippedWeapon) {
                                                        setGameState(prev => ({
                                                            ...prev,
                                                            currentHero: prev.currentHero ? { ...prev.currentHero, equippedWeapon: null } : null
                                                        }));
                                                    }
                                                }}
                                            >
                                                {gameState.currentHero.equippedWeapon?.icon || <span className="opacity-40">⚔️</span>}
                                            </div>
                                            {gameState.currentHero.equippedWeapon && (
                                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full border-2 border-slate-900 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center text-[8px] text-white font-bold">✕</div>
                                            )}
                                        </div>
                                        
                                        {/* Shield/Armor - Right */}
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 group">
                                            <div 
                                                className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-600 flex items-center justify-center text-2xl hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/50 cursor-pointer transition-all duration-300 shadow-md"
                                                onClick={() => {
                                                    if (gameState.currentHero.equippedArmor) {
                                                        setGameState(prev => ({
                                                            ...prev,
                                                            currentHero: prev.currentHero ? { ...prev.currentHero, equippedArmor: null } : null
                                                        }));
                                                    }
                                                }}
                                            >
                                                {gameState.currentHero.equippedArmor?.icon || <span className="opacity-40">🛡️</span>}
                                            </div>
                                            {gameState.currentHero.equippedArmor && (
                                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full border-2 border-slate-900 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center text-[8px] text-white font-bold">✕</div>
                                            )}
                                        </div>
                                        
                                        {/* Boots - Bottom */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 group">
                                            <div 
                                                className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-600 flex items-center justify-center text-2xl hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/50 cursor-pointer transition-all duration-300 shadow-md"
                                                onClick={() => {
                                                    if (gameState.currentHero.equippedBoots) {
                                                        setGameState(prev => ({
                                                            ...prev,
                                                            currentHero: prev.currentHero ? { ...prev.currentHero, equippedBoots: null } : null
                                                        }));
                                                    }
                                                }}
                                            >
                                                {gameState.currentHero.equippedBoots?.icon || <span className="opacity-40">👢</span>}
                                            </div>
                                            {gameState.currentHero.equippedBoots && (
                                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full border-2 border-slate-900 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center text-[8px] text-white font-bold">✕</div>
                                            )}
                                        </div>
                                        
                                        {/* Bracelet - Top Right */}
                                        <div className="absolute top-20 right-12 z-10">
                                            <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border-2 border-slate-600 flex items-center justify-center text-xl hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/50 cursor-pointer transition-all duration-300 shadow-md">
                                                {gameState.currentHero.equippedBracelet?.icon || <span className="opacity-40">💍</span>}
                                            </div>
                                        </div>
                                        
                                        {/* Ring - Bottom Right */}
                                        <div className="absolute bottom-20 right-12 z-10">
                                            <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border-2 border-slate-600 flex items-center justify-center text-xl hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/50 cursor-pointer transition-all duration-300 shadow-md">
                                                {gameState.currentHero.equippedRing?.icon || <span className="opacity-40">💎</span>}
                                            </div>
                                        </div>
                                        
                                        {/* Character Model - Layered Equipment System */}
                                        <div className="relative w-48 h-64 bg-gradient-to-b from-slate-900/80 to-slate-950/80 rounded-2xl border-2 border-amber-600/30 flex items-center justify-center overflow-hidden shadow-2xl">
                                            {/* Glow effect */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-amber-600/10 via-transparent to-transparent"></div>
                                            
                                            {/* Character Layers Container */}
                                            <div className="relative w-40 h-40 flex items-center justify-center">
                                                {/* Layer 1: Base Character Image */}
                                                <img 
                                                    src={`/assets/${gameState.currentHero.classType.toLowerCase()}.png`}
                                                    alt={gameState.currentHero.name}
                                                    className="absolute w-full h-full object-contain drop-shadow-2xl z-10"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                        if (fallback) fallback.style.display = 'block';
                                                    }}
                                                />
                                                {/* Fallback emoji */}
                                                <div className="absolute text-8xl z-10" style={{ display: 'none' }}>
                                                    {gameState.currentHero.classType === 'PALADIN' ? '🛡️' :
                                                     gameState.currentHero.classType === 'WARRIOR' ? '⚔️' :
                                                     gameState.currentHero.classType === 'MAGE' ? '🔮' : '🏹'}
                                                </div>
                                                
                                                {/* Layer 2: Boots (behind character) */}
                                                {gameState.currentHero.equippedBoots?.layerImage && (
                                                    <img 
                                                        src={gameState.currentHero.equippedBoots.layerImage}
                                                        alt="Boots"
                                                        className="absolute object-contain drop-shadow-xl z-5 transition-all duration-300"
                                                        style={{ 
                                                            width: `${(gameState.currentHero.equippedBoots.layerScale || 1) * 100}%`,
                                                            height: `${(gameState.currentHero.equippedBoots.layerScale || 1) * 100}%`,
                                                            transform: `translate(${gameState.currentHero.equippedBoots.layerOffset?.x || 0}px, ${gameState.currentHero.equippedBoots.layerOffset?.y || 0}px)`
                                                        }}
                                                    />
                                                )}
                                                
                                                {/* Layer 3: Armor (on top of character) */}
                                                {gameState.currentHero.equippedArmor?.layerImage && (
                                                    <img 
                                                        src={gameState.currentHero.equippedArmor.layerImage}
                                                        alt="Armor"
                                                        className="absolute object-contain drop-shadow-xl z-20 transition-all duration-300"
                                                        style={{ 
                                                            width: `${(gameState.currentHero.equippedArmor.layerScale || 1) * 100}%`,
                                                            height: `${(gameState.currentHero.equippedArmor.layerScale || 1) * 100}%`,
                                                            transform: `translate(${gameState.currentHero.equippedArmor.layerOffset?.x || 0}px, ${gameState.currentHero.equippedArmor.layerOffset?.y || 0}px)`
                                                        }}
                                                    />
                                                )}
                                                
                                                {/* Layer 4: Helmet (on top of armor) */}
                                                {gameState.currentHero.equippedHelmet?.layerImage && (
                                                    <img 
                                                        src={gameState.currentHero.equippedHelmet.layerImage}
                                                        alt="Helmet"
                                                        className="absolute object-contain drop-shadow-xl z-30 transition-all duration-300"
                                                        style={{ 
                                                            width: `${(gameState.currentHero.equippedHelmet.layerScale || 1) * 100}%`,
                                                            height: `${(gameState.currentHero.equippedHelmet.layerScale || 1) * 100}%`,
                                                            transform: `translate(${gameState.currentHero.equippedHelmet.layerOffset?.x || 0}px, ${gameState.currentHero.equippedHelmet.layerOffset?.y || 0}px)`
                                                        }}
                                                    />
                                                )}
                                                
                                                {/* Layer 5: Weapon (on side) */}
                                                {gameState.currentHero.equippedWeapon?.layerImage && (
                                                    <img 
                                                        src={gameState.currentHero.equippedWeapon.layerImage}
                                                        alt="Weapon"
                                                        className="absolute object-contain drop-shadow-xl z-25 transition-all duration-300"
                                                        style={{ 
                                                            width: `${(gameState.currentHero.equippedWeapon.layerScale || 1) * 100}%`,
                                                            height: `${(gameState.currentHero.equippedWeapon.layerScale || 1) * 100}%`,
                                                            transform: `translate(${gameState.currentHero.equippedWeapon.layerOffset?.x || 0}px, ${gameState.currentHero.equippedWeapon.layerOffset?.y || 0}px)`
                                                        }}
                                                    />
                                                )}
                                                
                                                {/* Layer 6: Accessories glow effects */}
                                                {gameState.currentHero.equippedRing && (
                                                    <div className="absolute w-2 h-2 bg-purple-500 rounded-full animate-pulse z-35" style={{ top: '60%', left: '30%', boxShadow: '0 0 10px 2px rgba(168, 85, 247, 0.5)' }}></div>
                                                )}
                                                {gameState.currentHero.equippedBracelet && (
                                                    <div className="absolute w-2 h-2 bg-amber-500 rounded-full animate-pulse z-35" style={{ top: '50%', left: '20%', boxShadow: '0 0 10px 2px rgba(251, 191, 36, 0.5)' }}></div>
                                                )}
                                            </div>
                                            
                                            {/* Character Name */}
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/90 px-4 py-1 rounded-full border border-amber-600/50 z-40">
                                                <div className="text-xs font-bold text-amber-400">{gameState.currentHero.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right Panel - Inventory Items */}
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-xl border-2 border-slate-700/50 shadow-lg">
                                        <div className="text-sm font-bold text-amber-400 mb-3 flex items-center">
                                            <span className="mr-2">🎒</span> Túi Đồ
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                                            {gameState.inventory.slice(0, 9).map((item) => (
                                                <div 
                                                    key={item.id}
                                                    className="bg-slate-900/50 aspect-square rounded-lg border border-slate-700 flex items-center justify-center text-2xl hover:border-amber-500 hover:scale-110 cursor-pointer transition-all relative group"
                                                    onClick={() => {
                                                        // Equip item based on type
                                                        setGameState(prev => {
                                                            if (!prev.currentHero) return prev;
                                                            
                                                            const updates: any = {};
                                                            
                                                            if (item.type === 'WEAPON') {
                                                                updates.equippedWeapon = item;
                                                            } else if (item.type === 'ARMOR') {
                                                                updates.equippedArmor = item;
                                                            } else if (item.type === 'ARTIFACT') {
                                                                // Artifacts go to helmet, boots, bracelet, or ring
                                                                if (item.name.includes('Mũ') || item.name.includes('Helmet')) {
                                                                    updates.equippedHelmet = item;
                                                                } else if (item.name.includes('Giày') || item.name.includes('Boots')) {
                                                                    updates.equippedBoots = item;
                                                                } else if (item.name.includes('Vòng') || item.name.includes('Bracelet')) {
                                                                    updates.equippedBracelet = item;
                                                                } else if (item.name.includes('Nhẫn') || item.name.includes('Ring')) {
                                                                    updates.equippedRing = item;
                                                                }
                                                            }
                                                            
                                                            return {
                                                                ...prev,
                                                                currentHero: {
                                                                    ...prev.currentHero,
                                                                    ...updates
                                                                }
                                                            };
                                                        });
                                                    }}
                                                >
                                                    {item.icon}
                                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 p-1 rounded text-[8px] z-10 w-20 text-center whitespace-nowrap border border-amber-500/50">
                                                        {item.name}
                                                        <div className="text-[7px] text-amber-400">Click to equip</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {[...Array(Math.max(0, 9 - gameState.inventory.slice(0, 9).length))].map((_, i) => (
                                                <div key={`empty-${i}`} className="bg-slate-900/30 aspect-square rounded-lg border border-slate-800 flex items-center justify-center text-slate-700 text-xs">
                                                    Trống
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Biography */}
                                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-xl border-2 border-slate-700/50 shadow-lg">
                                        <div className="text-sm font-bold text-amber-400 mb-3 flex items-center">
                                            <span className="mr-2">📜</span> Tiểu Sử
                                        </div>
                                        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                                            <p className="text-xs text-slate-300 italic leading-relaxed">"{gameState.currentHero.biography}"</p>
                                        </div>
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

      {/* Bottom HUD Nav - REMOVED */}

      {/* Sui SDK Log Panel - Hiển thị NGAY khi vào CharacterSelect scene */}
      {gameState.scene === 'CharacterSelect' && (
        <SuiLogPanel 
          logs={suiLogs} 
          onClear={() => setSuiLogs([])}
          visible={true}
          transactionCompleted={transactionCompleted}
          onContinue={() => {
            setTransactionCompleted(false);
            setSuiLogs([]); // Clear logs khi chuyển scene
            setGameState(prev => ({
              ...prev,
              scene: 'MainGame',
              activeTab: null
            }));
            
            const phaserGame = (window as any).__PHASER_GAME__;
            if (phaserGame) {
              const characterSelectScene = phaserGame.scene.getScene('CharacterSelect');
              if (characterSelectScene && characterSelectScene.scene.isActive()) {
                characterSelectScene.cameras.main.fadeOut(500);
                characterSelectScene.cameras.main.once('camerafadeoutcomplete', () => {
                  characterSelectScene.scene.start('MainGame');
                });
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
