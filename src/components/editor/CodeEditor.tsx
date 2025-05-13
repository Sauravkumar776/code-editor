import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { EditorContent } from '../../types';
import EditorTabs from './EditorTabs';
import EditorSettings from './EditorSettings';
import { FileCode, Paintbrush, Folder } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface CodeEditorProps {
  content: EditorContent;
  onChange: (newContent: EditorContent) => void;
}

type EditorTab = 'html' | 'css' | 'js';

const CodeEditor: React.FC<CodeEditorProps> = ({ content, onChange }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const { isDarkTheme, fontSize, tabSize, wordWrap, minimap } = useEditorStore();

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      const newContent = { ...content };
      newContent[activeTab] = value;
      onChange(newContent);
    }
  };

  const getLanguageForTab = (tab: EditorTab): string => {
    switch (tab) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      default: return 'html';
    }
  };

  const getIconForTab = (tab: EditorTab) => {
    switch (tab) {
      case 'html': return <FileCode className="w-4 h-4 mr-2" />;
      case 'css': return <Paintbrush className="w-4 h-4 mr-2" />;
      case 'js': return <Folder className="w-4 h-4 mr-2" />;
      default: return <FileCode className="w-4 h-4 mr-2" />;
    }
  };

  const tabs = [
    { id: 'html', label: 'HTML', icon: getIconForTab('html') },
    { id: 'css', label: 'CSS', icon: getIconForTab('css') },
    { id: 'js', label: 'JavaScript', icon: getIconForTab('js') },
  ];

  return (
    <div className="flex flex-col h-full border border-gray-700 rounded-md overflow-hidden">
      <div className="flex justify-between items-center bg-gray-800 border-b border-gray-700">
        <EditorTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={(tab) => setActiveTab(tab as EditorTab)} 
        />
        <EditorSettings />
      </div>
      <div className="flex-grow relative">
        <Editor
          height="100%"
          language={getLanguageForTab(activeTab)}
          value={content[activeTab]}
          onChange={handleEditorChange}
          theme={isDarkTheme ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: minimap },
            fontSize: fontSize,
            wordWrap: wordWrap ? 'on' : 'off',
            tabSize: tabSize,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            roundedSelection: false,
            renderLineHighlight: 'all',
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            quickSuggestions: true,
            quickSuggestionsDelay: 100,
            folding: true,
            foldingHighlight: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoIndent: 'full',
            dragAndDrop: true,
            links: true,
            mouseWheelZoom: true,
            parameterHints: {
              enabled: true,
              cycle: true,
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showClasses: true,
              showFunctions: true,
              showVariables: true,
              showConstants: true,
              showModules: true,
            },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;