import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { EditorContent, ConsoleMessage, Project } from '../types';
import CodeEditor from '../components/editor/CodeEditor';
import Console from '../components/editor/Console';
import { Save, Share } from 'lucide-react';
import {
  createProject,
  getProject,
  updateProject,
  createAnonymousProject
} from '../services/projectService';
import { useDebounce, useDebouncedCallback } from 'use-debounce';

const DEFAULT_CONTENT: EditorContent = {
  html: `<div class="container">
  <h1>Hello, World!</h1>
  <p>Start coding to see instant previews!</p>
</div>`,
  css: `.container {
  font-family: sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #3b82f6;
}`,
  js: `console.log("Hello from the console!");

// Try changing this code and watch the preview update
setTimeout(() => {
  console.log("This message appears after 2 seconds");
}, 2000);`
};

const EditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [content, setContent] = useState<EditorContent>(DEFAULT_CONTENT);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [horizontalSplit, setHorizontalSplit] = useState(70);
  const [isDragging, setIsDragging] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const project = await getProject(projectId);
          if (project) {
            setProject(project);
            setContent(project.content);
            setProjectTitle(project.title);
            setProjectDescription(project.description);
          }
        } catch (error) {
          console.error('Error fetching project:', error);
        }
      };

      fetchProject();
    } else {
      setProject(createAnonymousProject(DEFAULT_CONTENT));
    }
  }, [projectId]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const html = `
      <html>
        <head>
          <style>${content.css}</style>
        </head>
        <body>
          ${content.html}
          <script>
            const log = console.log;
            const error = console.error;
            const warn = console.warn;
            const info = console.info;

            console.log = (...args) => {
              window.parent.postMessage({ type: 'log', message: args.join(' ') }, '*');
              log(...args);
            };

            console.error = (...args) => {
              window.parent.postMessage({ type: 'error', message: args.join(' ') }, '*');
              error(...args);
            };

            console.warn = (...args) => {
              window.parent.postMessage({ type: 'warn', message: args.join(' ') }, '*');
              warn(...args);
            };

            console.info = (...args) => {
              window.parent.postMessage({ type: 'info', message: args.join(' ') }, '*');
              info(...args);
            };

            try {
              ${content.js}
            } catch (err) {
              console.error(err);
            }
          </script>
        </body>
      </html>
    `;

    iframe.srcdoc = html;
  }, [content]);

  const debouncedLog = useDebouncedCallback(
    (message: string, type: 'log' | 'error' | 'warn' | 'info') => {
      handleConsoleLog(message, type);
    },
    500
  );

  useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
      if (['log', 'error', 'warn', 'info'].includes(event.data.type)) {
        debouncedLog(event.data.message, event.data.type);
      }
    };
  
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [debouncedLog]);
  

  const handleContentChange = (newContent: EditorContent) => {
    setContent(newContent);
  };

  const handleConsoleLog = (message: string, type: 'log' | 'error' | 'warn' | 'info') => {
    setConsoleMessages(prev => [
      ...prev,
      {
        id: uuidv4(),
        type,
        content: message,
        timestamp: Date.now()
      }
    ]);
  };

  const clearConsole = () => setConsoleMessages([]);

  const handleSave = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setShowSaveModal(true);
  };

  const saveProject = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      if (project && project.id && projectId) {
        await updateProject(projectId, {
          title: projectTitle,
          description: projectDescription,
          content
        });
      } else {
        const newProjectId = await createProject(
          currentUser.uid,
          projectTitle,
          projectDescription,
          content
        );
        navigate(`/editor/${newProjectId}`);
      }
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const container = e.currentTarget as HTMLDivElement;
      const { top, height } = container.getBoundingClientRect();
      const newSplit = ((e.clientY - top) / height) * 100;
      setHorizontalSplit(Math.min(Math.max(newSplit, 20), 80));
    }
  };

  return (
    <div className="flex flex-col h-screen select-none" onMouseUp={handleMouseUp}>
      <div className="bg-gray-900 border-b border-gray-800 p-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-semibold text-white">
          {project ? project.title || 'Untitled Project' : 'New Project'}
        </h1>
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
            <Save className="w-4 h-4" /> Save
          </button>
          {project?.id && (
            <button className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center gap-2 text-sm font-medium"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}>
              <Share className="w-4 h-4" /> Share
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-1/2 border-r border-gray-800 bg-gray-900">
          <CodeEditor content={content} onChange={handleContentChange} />
        </div>
        <div className="w-1/2 bg-gray-950 flex flex-col" onMouseMove={handleMouseMove}>
          <div className="flex-1 overflow-hidden" style={{ height: `${horizontalSplit}%` }}>
            <iframe ref={iframeRef} title="preview" className="w-full h-full border-none" sandbox="allow-scripts" />
          </div>
          <div className="h-2 bg-gray-800 cursor-row-resize hover:bg-blue-600 transition-colors" onMouseDown={handleMouseDown} />
          <div className="overflow-hidden" style={{ height: `${100 - horizontalSplit}%` }}>
            <Console messages={consoleMessages} onClear={clearConsole}  />
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Save Project</h2>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="projectTitle">
                Title
              </label>
              <input
                type="text"
                id="projectTitle"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="projectDescription">
                Description
              </label>
              <textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={4}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={saveProject} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;
