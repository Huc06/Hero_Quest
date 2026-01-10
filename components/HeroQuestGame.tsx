import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameState, HeroClass } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../data';
import { BootScene, TitleScene, OpeningScene, CharacterSelectScene, MainGameScene } from '../scenes';

interface HeroQuestGameProps {
  gameState: GameState;
  onHeroSelected: (heroClass: HeroClass) => void;
  onSceneChange: (scene: string) => void;
  onContinueToGame?: () => void;
}

const HeroQuestGame: React.FC<HeroQuestGameProps> = ({ gameState, onHeroSelected, onSceneChange, onContinueToGame }) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: 'phaser-root',
      backgroundColor: '#020617',
      pixelArt: true,
      render: {
        transparent: false,
        antialias: false,
        preserveDrawingBuffer: false
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0, x: 0 }, debug: false }
      },
      scene: [BootScene, TitleScene, OpeningScene, CharacterSelectScene, MainGameScene]
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.registry.set('gameState', gameState);
      gameRef.current.registry.set('callbacks', { onHeroSelected, onSceneChange, onContinueToGame });
      (window as any).__PHASER_GAME__ = gameRef.current;
    }
  }, [gameState, onHeroSelected, onSceneChange, onContinueToGame]);

  return <div id="phaser-root" className="w-full h-full bg-slate-950" />;
};

export default HeroQuestGame;
