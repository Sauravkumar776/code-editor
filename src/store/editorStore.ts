import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EditorContent, Project } from '../types';

interface EditorState {
  currentProject: Project | null;
  isDarkTheme: boolean;
  autoSave: boolean;
  autoRun: boolean;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  setCurrentProject: (project: Project | null) => void;
  updateContent: (content: EditorContent) => void;
  toggleTheme: () => void;
  setAutoSave: (enabled: boolean) => void;
  toggleAutoRun: () => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  toggleWordWrap: () => void;
  toggleMinimap: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      currentProject: null,
      isDarkTheme: true,
      autoSave: true,
      autoRun: false,
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: false,

      setCurrentProject: (project) => set({ currentProject: project }),
      updateContent: (content) =>
        set((state) => ({
          currentProject: state.currentProject
            ? { ...state.currentProject, content }
            : null,
        })),
      toggleTheme: () => set((state) => ({ isDarkTheme: !state.isDarkTheme })),
      setAutoSave: (enabled) => set({ autoSave: enabled }),
      toggleAutoRun: () => set((state) => ({ autoRun: !state.autoRun })),
      setFontSize: (size) => set({ fontSize: size }),
      setTabSize: (size) => set({ tabSize: size }),
      toggleWordWrap: () => set((state) => ({ wordWrap: !state.wordWrap })),
      toggleMinimap: () => set((state) => ({ minimap: !state.minimap })),
    }),
    {
      name: 'editor-storage',
      partialize: (state) => ({
        isDarkTheme: state.isDarkTheme,
        autoSave: state.autoSave,
        autoRun: state.autoRun,
        fontSize: state.fontSize,
        tabSize: state.tabSize,
        wordWrap: state.wordWrap,
        minimap: state.minimap,
      }),
    }
  )
);