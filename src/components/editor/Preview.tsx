import React, { useEffect, useRef } from "react";
import { EditorContent } from "../../types";
import { useDebouncedCallback } from "use-debounce";

interface PreviewProps {
  content: EditorContent;
  onConsoleLog: (message: string, type: "log" | "error" | "warn" | "info") => void;
}

const generateHTML = (content: EditorContent) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      ${content.css}
    </style>
  </head>
  <body>
    ${content.html}
    <script>
      window.onerror = function(msg) {
        window.parent.postMessage({ type: 'console', method: 'error', args: [msg] }, '*');
      };

      const formatValue = (value) => {
        try {
          return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
        } catch { return String(value); }
      };

      const originalConsole = { log: console.log, error: console.error, warn: console.warn, info: console.info };
      ['log', 'error', 'warn', 'info'].forEach(method => {
        console[method] = function() {
          const args = Array.from(arguments).map(formatValue);
          window.parent.postMessage({ type: 'console', method, args }, '*');
          originalConsole[method].apply(console, arguments);
        };
      });

      try {
        ${content.js}
      } catch (err) {
        console.error(err.message);
      }
    </script>
  </body>
  </html>
`;

const Preview: React.FC<PreviewProps> = ({ content, onConsoleLog }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  const updateIframe = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(generateHTML(content));
      iframeDoc.close();
    }
  };

  const debouncedUpdate = useDebouncedCallback(updateIframe, 500);

  useEffect(() => {
    debouncedUpdate();
  }, [content, debouncedUpdate]);

  const handleRefresh = () => updateIframe();

  return (
    <div className="flex flex-col h-full border border-gray-700 rounded-md overflow-hidden bg-white">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Preview</h3>
        <button
          onClick={handleRefresh}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      <div className="flex-grow bg-white">
        <iframe
          ref={iframeRef}
          title="Live Preview"
          className="w-full h-full bg-white border-0 rounded-b-md"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default Preview;
