import type { AttributeBoosterCard } from '../types/tcg';

interface BoosterCardProps {
  booster: AttributeBoosterCard;
  onClick?: () => void;
  selected?: boolean;
}

export function BoosterCardComponent({ booster, onClick, selected = false }: BoosterCardProps) {
  const getBoosterTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon': return '⚔️';
      case 'health': return '❤️';
      case 'chakra': return '💙';
      case 'form_change': return '⚡';
      default: return '✨';
    }
  };

  const getBoosterColor = (type: string) => {
    switch (type) {
      case 'weapon': return 'from-red-500 to-orange-500';
      case 'health': return 'from-pink-500 to-red-500';
      case 'chakra': return 'from-blue-500 to-cyan-500';
      case 'form_change': return 'from-yellow-500 to-orange-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 cursor-pointer max-w-sm mx-auto
        ${selected 
          ? 'border-yellow-400 shadow-2xl shadow-yellow-500/50 scale-105 ring-4 ring-yellow-300' 
          : 'border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600'
        }
        bg-linear-to-br ${getBoosterColor(booster.type)} text-white
      `}
    >
      {/* Icon */}
      <div className="text-center mb-4">
        <div className="text-6xl mb-2 animate-pulse">
          {getBoosterTypeIcon(booster.type)}
        </div>
        <h4 className="text-2xl font-bold drop-shadow-lg">{booster.name}</h4>
      </div>

      {/* Description */}
      <p className="text-center text-white/90 mb-4 text-sm">
      </p>

      {/* Effects */}
      <div className="flex flex-wrap justify-center gap-2">
        {booster.effect.healthBoost && (
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
            +{booster.effect.healthBoost} ❤️
          </span>
        )}
        {booster.effect.chakraBoost && (
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
            +{booster.effect.chakraBoost} 💙
          </span>
        )}
        
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-3xl translate-y-16 -translate-x-16" />
    </div>
  );
}
