import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Edit, Save, Share, Eye, Terminal } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Code className="w-16 h-16 mx-auto mb-6 text-blue-500" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Code, Preview, and Share <span className="text-blue-500">Instantly</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            A powerful online code editor with live preview for HTML, CSS, and JavaScript development.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/editor" 
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              <Edit className="w-5 h-5 mr-2" />
              Start Coding
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition duration-200 flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      
      <section className="py-16 px-4 bg-gray-800">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg transition-transform hover:scale-105">
              <Edit className="w-10 h-10 mb-4 text-blue-500" />
              <h3 className="text-xl font-semibold mb-3 text-white">Monaco Editor</h3>
              <p className="text-gray-300">
                Powerful code editing with syntax highlighting, IntelliSense, and autocomplete for multiple languages.
              </p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg transition-transform hover:scale-105">
              <Eye className="w-10 h-10 mb-4 text-blue-500" />
              <h3 className="text-xl font-semibold mb-3 text-white">Live Preview</h3>
              <p className="text-gray-300">
                See your changes in real-time with automatic preview that updates as you code.
              </p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg transition-transform hover:scale-105">
              <Terminal className="w-10 h-10 mb-4 text-blue-500" />
              <h3 className="text-xl font-semibold mb-3 text-white">Console Integration</h3>
              <p className="text-gray-300">
                Built-in console that captures logs, warnings, and errors from your JavaScript code.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Create</h3>
              <p className="text-gray-300">
                Start a new project and write HTML, CSS, and JavaScript code with our powerful editor.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Preview</h3>
              <p className="text-gray-300">
                Instantly see your code in action with our real-time preview panel and debug with the console.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Share</h3>
              <p className="text-gray-300">
                Save your projects and share them with a unique URL that others can view and fork.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;