export interface EditorContent {
  html: string;
  css: string;
  js: string;
}

export interface Project {
  is_public: any;
  updated_at(updated_at: any): import("react").ReactNode;
  version: ReactNode;
  id: string;
  title: string;
  description: string;
  content: EditorContent;
  createdAt: number;
  updatedAt: number;
  userId?: string;
}

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: number;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}