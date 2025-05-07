import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface EditorTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex bg-gray-800 border-b border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex items-center px-4 py-2 text-sm font-medium transition-colors duration-150 ${
            activeTab === tab.id
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default EditorTabs;