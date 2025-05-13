import React, { useState, useRef, useEffect } from 'react';
import { Settings, Moon, Sun, Save, Type, AlignJustify, Map, Zap } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

const EditorSettings: React.FC = () => {
  const {
    isDarkTheme,
    autoSave,
    fontSize,
    tabSize,
    wordWrap,
    minimap,
    autoRun,
    toggleTheme,
    setAutoSave,
    setFontSize,
    setTabSize,
    toggleWordWrap,
    toggleMinimap,
    toggleAutoRun,
  } = useEditorStore();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-md transition-colors"
        title="Editor Settings"
      >
        <Settings className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDarkTheme ? (
                  <Moon className="w-4 h-4 text-gray-400" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-sm text-gray-300">Theme</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3 py-1 bg-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-600"
              >
                {isDarkTheme ? 'Dark' : 'Light'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Auto Save</span>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`px-3 py-1 rounded-md text-sm ${
                  autoSave
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {autoSave ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Auto Run JS</span>
              </div>
              <button
                onClick={toggleAutoRun}
                className={`px-3 py-1 rounded-md text-sm ${
                  autoRun
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {autoRun ? 'On' : 'Off'}
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Font Size</span>
              </div>
              <input
                type="range"
                min="12"
                max="20"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-right text-sm text-gray-400">{fontSize}px</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlignJustify className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Tab Size</span>
              </div>
              <select
                value={tabSize}
                onChange={(e) => setTabSize(Number(e.target.value))}
                className="w-full bg-gray-700 text-gray-300 rounded-md px-2 py-1"
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="8">8 spaces</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlignJustify className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Word Wrap</span>
              </div>
              <button
                onClick={toggleWordWrap}
                className={`px-3 py-1 rounded-md text-sm ${
                  wordWrap
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {wordWrap ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Minimap</span>
              </div>
              <button
                onClick={toggleMinimap}
                className={`px-3 py-1 rounded-md text-sm ${
                  minimap
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {minimap ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorSettings;