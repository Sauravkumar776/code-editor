import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { EditorContent, ConsoleMessage, Project } from '../types';
import CodeEditor from '../components/editor/CodeEditor';
import Preview from '../components/editor/Preview';
import Console from '../components/editor/Console';
import { Save, Share } from 'lucide-react';
import { createProject, getProject, updateProject, createAnonymousProject } from '../services/projectService';

const DEFAULT_CONTENT: EditorContent = {
  html: '<div class="container">\n  <h1>Hello, World!</h1>\n  <p>Start coding to see instant previews!</p>\n</div>',
  css: '.container {\n  font-family: sans-serif;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 2rem;\n  text-align: center;\n}\n\nh1 {\n  color: #3b82f6;\n}',
  js: 'console.log("Hello from the console!");\n\n// Try changing this code and watch the preview update\nsetTimeout(() => {\n  console.log("This message appears after 2 seconds");\n}, 2000);'
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

  const clearConsole = () => {
    setConsoleMessages([]);
  };

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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      const container = e.currentTarget as HTMLDivElement;
      const { top, height } = container.getBoundingClientRect();
      const newSplit = ((e.clientY - top) / height) * 100;
      setHorizontalSplit(Math.min(Math.max(newSplit, 20), 80));
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {project ? project.title || 'Untitled Project' : 'New Project'}
          </h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center text-sm"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </button>
          {project && project.id && (
            <button
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center text-sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
            >
              <Share className="w-4 h-4 mr-1" />
              Share
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-grow grid grid-cols-2 gap-0">
        <div className="h-full">
          <CodeEditor content={content} onChange={handleContentChange} />
        </div>
        <div 
          className="h-full grid grid-rows-[1fr_auto] relative"
          onMouseMove={handleMouseMove}
        >
          <div style={{ height: `${horizontalSplit}%` }}>
            <Preview content={content} onConsoleLog={handleConsoleLog} />
          </div>
          <div 
            className="h-2 bg-gray-700 cursor-row-resize hover:bg-blue-500 transition-colors"
            onMouseDown={(e) => e.preventDefault()}
          />
          <div style={{ height: `${100 - horizontalSplit}%` }}>
            <Console messages={consoleMessages} onClear={clearConsole} />
          </div>
        </div>
      </div>
      
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-white">Save Project</h2>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Enter project title"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                rows={3}
                placeholder="Enter project description"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                onClick={saveProject}
                disabled={isSaving}
              >
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