import React from 'react';
import { Terminal, Copy, Check, X } from 'lucide-react';

export interface SuiLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'call';
  message: string;
  data?: any;
}

interface SuiLogPanelProps {
  logs: SuiLogEntry[];
  onClear: () => void;
  visible: boolean;
}

const SuiLogPanel: React.FC<SuiLogPanelProps> = ({ logs, onClear, visible }) => {
  const [copied, setCopied] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [panelHeight, setPanelHeight] = React.useState(256);
  const [panelBottom, setPanelBottom] = React.useState(0);
  const logEndRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const resizeStartY = React.useRef<number>(0);
  const resizeStartHeight = React.useRef<number>(256);
  const dragStartY = React.useRef<number>(0);
  const dragStartBottom = React.useRef<number>(0);

  React.useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Handle resize (change height) - Kéo thanh resize
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isDragging) return; // Prevent conflict
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = panelHeight;
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drag (move position) - Kéo thanh drag
  const handleDragMouseDown = (e: React.MouseEvent) => {
    if (isResizing) return; // Prevent conflict
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartBottom.current = panelBottom;
    e.preventDefault();
    e.stopPropagation();
  };

  React.useEffect(() => {
    if (!isResizing && !isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        // Resize: kéo lên = tăng height, kéo xuống = giảm height
        const deltaY = resizeStartY.current - e.clientY;
        const newHeight = Math.max(120, Math.min(600, resizeStartHeight.current + deltaY));
        setPanelHeight(newHeight);
      } else if (isDragging) {
        // Drag: kéo lên = panel di chuyển lên (bottom tăng), kéo xuống = panel di chuyển xuống (bottom giảm)
        const deltaY = dragStartY.current - e.clientY;
        const windowHeight = window.innerHeight;
        const maxBottom = Math.max(0, windowHeight - panelHeight);
        const newBottom = Math.max(0, Math.min(maxBottom, dragStartBottom.current + deltaY));
        setPanelBottom(newBottom);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = isDragging ? 'move' : isResizing ? 'ns-resize' : 'default';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, isDragging, panelHeight]);

  const copyAllLogs = () => {
    const logText = logs.map(log => {
      const prompt = log.type === 'call' ? '$' : '>';
      return `${prompt} ${log.message}${log.data ? '\n' + (typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)) : ''}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogColor = (type: SuiLogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'call': return 'text-cyan-400';
      default: return 'text-green-400';
    }
  };

  if (!visible) return null;

  return (
    <div 
      ref={panelRef}
      className="absolute left-0 right-0 bg-black border-t-2 border-green-500/30 z-[200] font-mono shadow-2xl" 
      style={{ 
        fontFamily: 'Monaco, Menlo, "Courier New", monospace',
        height: `${panelHeight}px`,
        bottom: `${panelBottom}px`,
        pointerEvents: 'auto'
      }}
    >
      {/* Drag Handle - Kéo để di chuyển panel lên/xuống */}
      <div
        className="absolute top-0 left-0 right-0 h-8 bg-green-500/20 hover:bg-green-500/40 cursor-move flex items-center justify-center group select-none"
        onMouseDown={handleDragMouseDown}
        style={{ 
          userSelect: 'none', 
          WebkitUserSelect: 'none',
          pointerEvents: 'auto',
          zIndex: 20
        }}
      >
        <div className="w-full h-full"></div>
      </div>
      
      {/* Resize Handle - Kéo để thay đổi chiều cao */}
      <div
        className="absolute top-8 left-0 right-0 h-2 bg-green-500/20 hover:bg-green-500/40 cursor-ns-resize flex items-center justify-center group"
        onMouseDown={handleResizeMouseDown}
        style={{ 
          pointerEvents: 'auto',
          zIndex: 19
        }}
      >
        <div className="w-16 h-1 bg-green-500/60 rounded-full group-hover:bg-green-500"></div>
      </div>
      
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-green-500/20" style={{ marginTop: '50px' }}>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <Terminal size={14} className="text-green-500" />
          <span className="text-xs text-green-400 font-bold">sui-sdk-terminal</span>
          <span className="text-xs text-gray-500">({logs.length} entries)</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={copyAllLogs}
            className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 text-green-400 rounded flex items-center space-x-1 transition-colors border border-green-500/20"
            title="Copy all logs"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={onClear}
            className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 text-red-400 rounded transition-colors border border-red-500/20 flex items-center space-x-1"
            title="Clear logs"
          >
            <X size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        className="overflow-y-auto p-4 text-xs bg-black text-green-400" 
        style={{ 
          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
          height: `${panelHeight - 90}px` // Subtract header + handles height
        }}
      >
        {logs.length === 0 ? (
          <div className="text-gray-600">
            <span className="text-green-500">$</span>{' '}
            <span className="text-gray-500">Waiting for character selection...</span>
            <span className="animate-pulse">▋</span>
          </div>
        ) : (
          <>
            {logs.map((log, index) => {
              const prompt = log.type === 'call' ? '$' : '>';
              const isLast = index === logs.length - 1;
              
              return (
                <div key={log.id} className="mb-2">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 select-none">{prompt}</span>
                    <div className="flex-1">
                      <span className={getLogColor(log.type)}>{log.message}</span>
                      {log.data && (
                        <pre className="mt-2 text-[11px] text-gray-400 bg-gray-900/50 p-3 rounded border border-green-500/10 overflow-x-auto">
                          <code>{typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                  {isLast && (
                    <div className="flex items-center mt-1">
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
  );
};

export default SuiLogPanel;
