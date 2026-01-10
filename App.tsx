
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
      { id: '1', name: 'Kiếm Tân Thủ', type: 'WEAPON', rarity: 'COMMON', description: 'Một thanh kiếm sắt bình thường.', icon: '⚔️', stats: { attack: 5 } }
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

      {/* Top Nav - Đã ẩn */}

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

      {/* Sui SDK Log Panel - Hiển thị ở dưới màn hình khi ở CharacterSelect */}
      {gameState.scene === 'CharacterSelect' && (
        <SuiLogPanel 
          logs={suiLogs} 
          onClear={() => setSuiLogs([])}
          visible={gameState.scene === 'CharacterSelect'}
        />
      )}
      
      {/* Nút TIẾP TỤC - Hiển thị khi transaction hoàn thành */}
      {gameState.scene === 'CharacterSelect' && transactionCompleted && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[10000]" style={{ pointerEvents: 'auto' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              
              setTransactionCompleted(false);
              setGameState(prev => ({
                ...prev,
                scene: 'MainGame'
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
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors border border-green-500/50 font-bold shadow-lg"
            style={{ pointerEvents: 'auto' }}
          >
            TIẾP TỤC →
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
