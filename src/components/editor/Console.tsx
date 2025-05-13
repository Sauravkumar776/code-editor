import React, { useState, useCallback } from 'react';
import { ConsoleMessage } from '../../types';
import { Terminal, X, AlertCircle, Info, AlertTriangle, ChevronDown, Trash2 } from 'lucide-react';

interface ConsoleProps {
  messages: ConsoleMessage[];
  onClear: () => void;
}

const Console: React.FC<ConsoleProps> = ({ messages, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'log'>('all');

  const getIconForType = (type: ConsoleMessage['type']) => {
    const baseClass = "w-4 h-4";
    switch (type) {
      case 'error': return <AlertCircle className={`${baseClass} text-red-500`} />;
      case 'warn': return <AlertTriangle className={`${baseClass} text-yellow-400`} />;
      case 'info': return <Info className={`${baseClass} text-blue-400`} />;
      default: return <Terminal className={`${baseClass} text-green-400`} />;
    }
  };

  const getMessageStyle = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'warn': return 'text-yellow-300 bg-yellow-900/20';
      case 'info': return 'text-blue-300 bg-blue-900/20';
      default: return 'text-green-300';
    }
  };

  const filteredMessages = messages.filter(msg => 
    filter === 'all' || msg.type === filter
  );

  const getFilterCount = (type: 'error' | 'warn' | 'info' | 'log') => 
    messages.filter(msg => msg.type === type).length;

  if (!isExpanded) {
    return (
      <div
        className="fixed bottom-0 right-0 m-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all"
        onClick={() => setIsExpanded(true)}
        title="Expand Console"
      >
        <Terminal className="w-5 h-5" />
        {getFilterCount('error') > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {getFilterCount('error')}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="h-64 bg-gray-900 border-t border-gray-700 flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-white text-sm">
            <Terminal className="w-4 h-4" />
            <span>Console</span>
          </div>
          <div className="flex space-x-2 text-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-1 rounded ${filter === 'error' ? 'bg-red-900/50' : 'hover:bg-gray-700'}`}
            >
              Errors ({getFilterCount('error')})
            </button>
            <button
              onClick={() => setFilter('warn')}
              className={`px-2 py-1 rounded ${filter === 'warn' ? 'bg-yellow-900/50' : 'hover:bg-gray-700'}`}
            >
              Warnings ({getFilterCount('warn')})
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-white transition p-1"
            title="Clear Console"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-white transition p-1"
            title="Minimize Console"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto px-3 py-2 font-mono text-sm">
        {filteredMessages.length === 0 ? (
          <div className="text-gray-500 italic">No console output</div>
        ) : (
          filteredMessages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 px-2 py-1 rounded ${getMessageStyle(msg.type)} ${
                index !== filteredMessages.length - 1 ? 'border-b border-gray-800' : ''
              }`}
            >
              <span className="mt-1">{getIconForType(msg.type)}</span>
              <pre className="whitespace-pre-wrap break-words flex-1 overflow-x-auto">
                {msg.content}
              </pre>
              <span className="text-gray-500 text-xs whitespace-nowrap">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Console;