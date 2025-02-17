import { Infinity, Minus, Plus, Ban } from 'lucide-react';

const Counter = ({
  icon: Icon,
  value,
  label,
  helperText,
  onIncrement,
  onDecrement,
  canModify,
  isAdmin
}) => (
  <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 flex flex-col items-center">
    <Icon className="w-6 h-6 mb-2 text-white" />
    <button 
      onClick={canModify ? onIncrement : null} 
      disabled={!canModify}
      className={`hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20 p-2 rounded-lg transition-all ${!canModify && 'opacity-50'}`}
    >
      <Plus className="w-5 h-5 text-white" />
    </button>
    <div className="text-2xl font-bold my-2 text-white">
    { canModify 
        ? (isAdmin && value === -1 
          ? <Infinity className="w-5 h-8 text-white" />  
          : value)
        : <Ban className="w-5 h-8 text-white" />
      }
    </div>
    <button 
      onClick={canModify ? onDecrement : null}
      // Disable the button only if the user is not admin and the value is 0.
      disabled={!canModify || (isAdmin ? value === -1 : value <= 0)}
      className={`hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20 p-2 rounded-lg transition-all ${
        (!canModify || (isAdmin ? value === -1 : value <= 0)) && 'opacity-50'
      }`}
    >
      { canModify && (isAdmin && value === 0) 
        ? <Infinity className="w-5 h-5 text-white" />  
        : <Minus className="w-5 h-5 text-white" />
      }
    </button>
    <div className="text-sm text-gray-300 text-center mt-2">{label}</div>
    <div className="text-xs text-gray-400 text-center mt-1">{helperText}</div>
  </div>
);

export default Counter;