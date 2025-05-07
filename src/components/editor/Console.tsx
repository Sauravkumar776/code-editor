import React, { useState, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ConsoleMessage } from '../../types';
import { Terminal, X, AlertCircle, Info, AlertTriangle, ChevronDown } from 'lucide-react';

interface ConsoleProps {
  messages: ConsoleMessage[];
  onClear: () => void;
}

const Console: React.FC<ConsoleProps> = ({ messages, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(true);

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
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-300';
      case 'info': return 'text-blue-300';
      default: return 'text-green-300';
    }
  };


  if (!isExpanded) {
    return (
      <div
        className="fixed bottom-0 right-0 m-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition"
        onClick={() => setIsExpanded(true)}
        title="Expand Console"
      >
        <Terminal className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="h-64 bg-gray-900 border-t border-gray-700 flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2 text-white text-sm">
          <Terminal className="w-4 h-4" />
          <span>Console Output</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-white transition"
            title="Clear Console"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-white transition"
            title="Minimize Console"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto px-3 py-2 font-mono text-sm">
        {messages.length === 0 ? (
          <div className="text-gray-500">No messages yet.</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex items-start space-x-2 ${getMessageStyle(msg.type)}`}>
              <span>{getIconForType(msg.type)}</span>
              <pre className="whitespace-pre-wrap break-words">{msg.content}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Console;
