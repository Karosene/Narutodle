import type { CharacterCard } from '../types/tcg';

interface CharacterCardProps {
  card: CharacterCard;
  onClick?: () => void;
  selected?: boolean;
  showDetails?: boolean;
}

export function CharacterCardComponent({ 
  card, 
  onClick, 
  selected = false,
  showDetails = true 
}: CharacterCardProps) {
  const formData = card.forms[card.currentForm];
  if (!formData) return null;
  
  const healthPercent = (card.currentHealth / formData.health) * 100;
  const chakraPercent = (card.currentChakra / formData.maxChakra) * 100;

  const getAttackTypeColor = (type: string) => {
    switch (type) {
      case 'taijutsu': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'ninjutsu': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'genjutsu': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer h-full flex flex-col
        ${selected 
          ? 'border-orange-500 shadow-2xl shadow-orange-500/50 scale-105 ring-4 ring-orange-300 dark:ring-orange-700' 
          : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
        }
        ${card.currentHealth === 0 ? 'opacity-50 grayscale' : 'hover:shadow-xl'}
        bg-linear-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900
      `}
    >
      {/* Character Image Background */}
      <div className="relative h-32 overflow-hidden bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 shrink-0">
        <img 
          src={formData.imageUrl} 
          alt={card.name}
          className="w-full h-full object-cover opacity-90"
          onError={(e) => {
            // Fallback to a placeholder if image doesn't exist
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e2e8f0" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="40"%3E%F0%9F%A5%B7%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Character Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h3 className="text-white font-bold text-sm drop-shadow-lg truncate">{card.name}</h3>
          {card.clan && (
            <span className="inline-block px-1.5 py-0.5 text-xs font-semibold bg-orange-500 text-white rounded-full">
              {card.clan}
            </span>
          )}
        </div>

        {/* Form Badge */}
        <div className="absolute top-1 right-1">
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-md shadow-lg">
            {formData.name}
            {card.currentForm === 'upgraded' && <span className="ml-1">⚡</span>}
          </span>
        </div>
      </div>

      {/* Card Stats */}
      <div className="p-2.5 space-y-2 flex-1 flex flex-col">
        {/* Attack Type */}
        <div className="flex items-center justify-center">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${getAttackTypeColor(formData.attackType)}`}>
            {formData.attackType.toUpperCase()}
          </span>
        </div>

        {/* Health Bar */}
        <div>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">HP</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {card.currentHealth}/{formData.health}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-red-500 to-orange-500 transition-all duration-300"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Chakra Bar */}
        <div>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Chakra</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {card.currentChakra}/{formData.maxChakra}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${chakraPercent}%` }}
            />
          </div>
        </div>

        {/* Resistances */}
        {Object.entries(formData.resistances).filter(([_, level]) => level !== 'none').length > 0 && (
          <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-0.5">
              {Object.entries(formData.resistances).map(([type, level]) => {
                if (level === 'none') return null;
                return (
                  <span 
                    key={type} 
                    className={`text-[10px] px-1 py-0.5 rounded-md font-semibold ${
                      level === 'full' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}
                  >
                    🛡️ {type}: {level === 'full' ? '100%' : '50%'}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Boosters */}
        {card.boosters.length > 0 && (
          <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-0.5">
              {card.boosters.map((booster, idx) => (
                <span 
                  key={idx} 
                  className="text-[10px] px-1 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-md font-semibold"
                  title={booster.description}
                >
                  ✨ {booster.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Defeated Overlay */}
      {card.currentHealth === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <span className="text-2xl font-bold text-white drop-shadow-lg">DEFEATED</span>
        </div>
      )}
    </div>
  );
}
