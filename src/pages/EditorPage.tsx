import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { EditorContent, ConsoleMessage, Project } from '../types';
import CodeEditor from '../components/editor/CodeEditor';
import Console from '../components/editor/Console';
import Preview from '../components/editor/Preview';
import { Save, Share, Trash2, Copy } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  forkProject
} from '../services/projectService';
import { useDebouncedCallback } from 'use-debounce';

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
  const { 
    currentProject,
    setCurrentProject,
    updateContent,
    autoSave
  } = useEditorStore();

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [horizontalSplit, setHorizontalSplit] = useState(70);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const project = await getProject(projectId);
          if (project) {
            setCurrentProject(project);
            setProjectTitle(project.title);
            setProjectDescription(project.description || '');
            setIsPublic(project.is_public || false);
          }
        } catch (error) {
          console.error('Error fetching project:', error);
          navigate('/editor');
        }
      };
      fetchProject();
    } else {
      setCurrentProject({
        id: uuidv4(),
        title: 'Untitled Project',
        description: '',
        content: DEFAULT_CONTENT,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_public: false,
        version: 1
      });
    }
  }, [projectId, setCurrentProject, navigate]);

  const debouncedSave = useDebouncedCallback(async (content: EditorContent) => {
    if (!currentUser || !currentProject || !autoSave) return;
    try {
      await updateProject(currentProject.id, {
        content,
        title: projectTitle,
        description: projectDescription,
        is_public: isPublic
      });
    } catch (error) {
      console.error('Error auto-saving:', error);
    }
  }, 2000);

  const handleContentChange = (newContent: EditorContent) => {
    updateContent(newContent);
    if (currentProject) {
      debouncedSave(newContent);
    }
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
    if (!currentUser || !currentProject) return;
    setIsSaving(true);
    try {
      if (projectId) {
        await updateProject(projectId, {
          title: projectTitle,
          description: projectDescription,
          content: currentProject.content,
          is_public: isPublic
        });
      } else {
        const newProjectId = await createProject(
          currentUser.uid,
          projectTitle,
          projectDescription,
          currentProject.content,
          isPublic
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

  const handleDelete = async () => {
    if (!currentProject?.id || !confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(currentProject.id);
      navigate('/my-projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleFork = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!currentProject?.id) return;
    try {
      const newProjectId = await forkProject(currentProject.id, currentUser.uid);
      navigate(`/editor/${newProjectId}`);
    } catch (error) {
      console.error('Error forking project:', error);
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

  if (!currentProject) return null;

  return (
    <div className="flex flex-col h-screen select-none" onMouseUp={handleMouseUp}>
      <div className="bg-gray-900 border-b border-gray-800 p-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">
            {currentProject.title || 'Untitled Project'}
          </h1>
          {autoSave && <span className="text-sm text-gray-400">Auto-saving enabled</span>}
        </div>
        <div className="flex gap-2">
          {currentUser && currentProject.id && (
            <>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button
                onClick={handleFork}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
              >
                <Copy className="w-4 h-4" /> Fork
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
          >
            <Save className="w-4 h-4" /> Save
          </button>
          {currentProject.id && (
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center gap-2 text-sm font-medium"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
            >
              <Share className="w-4 h-4" /> Share
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-1/2 border-r border-gray-800 bg-gray-900">
          <CodeEditor
            content={currentProject.content}
            onChange={handleContentChange}
          />
        </div>
        <div className="w-1/2 bg-gray-950 flex flex-col" onMouseMove={handleMouseMove}>
          <div className="flex-1 overflow-hidden" style={{ height: `${horizontalSplit}%` }}>
            <Preview
              content={currentProject.content}
              onConsoleLog={handleConsoleLog}
            />
          </div>
          <div
            className="h-2 bg-gray-800 cursor-row-resize hover:bg-blue-600 transition-colors"
            onMouseDown={handleMouseDown}
          />
          <div className="overflow-hidden" style={{ height: `${100 - horizontalSplit}%` }}>
            <Console messages={consoleMessages} onClear={clearConsole} />
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Save Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="projectTitle">
                  Title
                </label>
                <input
                  type="text"
                  id="projectTitle"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="projectDescription">
                  Description
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={4}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  placeholder="Enter project description"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isPublic" className="text-gray-300 text-sm">
                  Make project public
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={saveProject}
                disabled={isSaving || !projectTitle.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500"
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