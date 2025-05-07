export interface EditorContent {
  html: string;
  css: string;
  js: string;
}

export interface Project {
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