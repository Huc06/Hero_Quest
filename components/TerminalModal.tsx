import React from 'react';
import { Terminal, X } from 'lucide-react';
import { SuiLogEntry } from './SuiLogPanel';

interface TerminalModalProps {
  logs: SuiLogEntry[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  onContinue?: () => void;
  showContinueButton?: boolean;
}

const TerminalModal: React.FC<TerminalModalProps> = ({ logs, isOpen, onClose, onClear, onContinue, showContinueButton = false }) => {
  const logEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (logEndRef.current && isOpen) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const getLogColor = (type: SuiLogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'call': return 'text-cyan-400';
      default: return 'text-green-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-8" onClick={onClose}>
      <div 
        className="w-full max-w-4xl h-[85vh] bg-black border-2 border-green-500/50 rounded-lg shadow-2xl font-mono flex flex-col"
        style={{ fontFamily: 'Monaco, Menlo, "Courier New", monospace' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-green-500/30 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <Terminal size={16} className="text-green-500" />
            <span className="text-sm text-green-400 font-bold">sui-sdk-terminal</span>
            <span className="text-xs text-gray-500">({logs.length} entries)</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClear}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-red-400 rounded transition-colors border border-red-500/20"
              title="Clear logs"
            >
              Clear
            </button>
            {showContinueButton && onContinue && (
              <button
                onClick={onContinue}
                className="px-4 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors border border-green-500/50 font-bold"
                title="Continue to game"
              >
                TIẾP TỤC →
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 rounded transition-colors border border-gray-700 flex items-center space-x-1"
              title="Close terminal"
            >
              <X size={14} />
              <span>Back</span>
            </button>
          </div>
        </div>

        <div 
          className="flex-1 overflow-y-auto p-6 text-xs bg-black text-green-400"
          style={{ fontFamily: 'Monaco, Menlo, "Courier New", monospace' }}
        >
          {logs.length === 0 ? (
            <div className="text-gray-600 h-full flex items-center justify-center">
              <div>
                <span className="text-green-500">$</span>{' '}
                <span className="text-gray-500">Waiting for Sui Move calls...</span>
                <span className="animate-pulse">▋</span>
              </div>
            </div>
          ) : (
            <>
              {logs.map((log, index) => {
                const prompt = log.type === 'call' ? '$' : '>';
                const isLast = index === logs.length - 1;
                
                return (
                  <div key={log.id} className="mb-3">
                    <div className="flex items-start">
                      <span className="text-green-500 mr-3 select-none font-bold">{prompt}</span>
                      <div className="flex-1">
                        <span className={getLogColor(log.type)}>{log.message}</span>
                        {log.data && (
                          <pre className="mt-2 text-[11px] text-gray-400 bg-gray-900/70 p-4 rounded border border-green-500/20 overflow-x-auto">
                            <code>{typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}</code>
                          </pre>
                        )}
                      </div>
                    </div>
                    {isLast && (
                      <div className="flex items-center mt-2 ml-4">
                        <span className="text-green-500">$</span>
                        <span className="ml-2 text-green-400 animate-pulse">▋</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalModal;

