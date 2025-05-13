import React, { useEffect, useRef, useState } from "react";
import { EditorContent } from "../../types";
import { useDebouncedCallback } from "use-debounce";
import { useEditorStore } from "../../store/editorStore";
import { Play, RefreshCw } from 'lucide-react';

interface PreviewProps {
  content: EditorContent;
  onConsoleLog: (message: string, type: "log" | "error" | "warn" | "info") => void;
}

const generateHTML = (content: EditorContent, isDarkTheme: boolean) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      :root {
        color-scheme: ${isDarkTheme ? 'dark' : 'light'};
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.5;
        ${isDarkTheme ? 'background: #1a1a1a; color: #fff;' : 'background: #fff; color: #000;'}
      }
      ${content.css}
    </style>
  </head>
  <body>
    ${content.html}
    <script>
      let isAutoRun = true;

      // Helper function to send messages to parent window
      const sendConsoleMessage = (type, method, args) => {
        try {
          window.parent.postMessage({ type, method, args }, '*');
        } catch (err) {
          console.error('Failed to send message to parent:', err);
        }
      };

      // Custom error handler
      window.onerror = function(msg, url, lineNo, columnNo, error) {
        const errorMessage = [
          msg,
          \`Line: \${lineNo}, Column: \${columnNo}\`,
          error?.stack || ''
        ].filter(Boolean).join('\\n');
        
        sendConsoleMessage('console', 'error', [errorMessage]);
        return false;
      };

      // Format console output
      const formatValue = (value) => {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'function') return value.toString();
        if (Array.isArray(value)) {
          return \`[\${value.map(formatValue).join(', ')}]\`;
        }
        if (typeof value === 'object') {
          try {
            return JSON.stringify(value, null, 2);
          } catch (err) {
            return String(value);
          }
        }
        return String(value);
      };

      // Override console methods
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      };

      Object.keys(originalConsole).forEach(method => {
        console[method] = function(...args) {
          const formattedArgs = args.map(formatValue);
          sendConsoleMessage('console', method, formattedArgs);
          originalConsole[method].apply(console, args);
        };
      });

      // Function to run JavaScript code
      window.runJavaScript = function(code, autoRun = false) {
        isAutoRun = autoRun;
        try {
          // Clear previous console output if not auto-running
          if (!autoRun) {
            sendConsoleMessage('console', 'info', ['Running JavaScript...']);
          }
          
          // Create a new Function to execute the code in a clean scope
          (new Function(code))();
        } catch (err) {
          console.error(err);
        }
      };

      // Initial run
      if (isAutoRun) {
        runJavaScript(\`${content.js}\`, true);
      }
    </script>
  </body>
  </html>
`;

const Preview: React.FC<PreviewProps> = ({ content, onConsoleLog }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isDarkTheme } = useEditorStore();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "console") {
        const { method, args } = event.data;
        onConsoleLog(args.join(" "), method);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConsoleLog]);

  const updatePreview = useDebouncedCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(generateHTML(content, isDarkTheme));
        iframeDoc.close();
      }
    } catch (error) {
      console.error('Failed to update preview:', error);
      onConsoleLog('Failed to update preview: ' + error.message, 'error');
    }
  }, 1000);

  useEffect(() => {
    updatePreview();
  }, [content.html, content.css, isDarkTheme, updatePreview]);

  const runJavaScript = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    setIsRunning(true);
    onConsoleLog('Clearing console...', 'info');
    
    try {
      iframe.contentWindow.runJavaScript(content.js);
    } catch (error) {
      console.error('Failed to run JavaScript:', error);
      onConsoleLog('Failed to run JavaScript: ' + error.message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full border border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Preview</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={runJavaScript}
            disabled={isRunning}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-3 h-3" />
            Run JS
          </button>
          <button
            onClick={() => updatePreview()}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>
      <div className="flex-grow bg-white dark:bg-gray-900">
        <iframe
          ref={iframeRef}
          title="Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default Preview;