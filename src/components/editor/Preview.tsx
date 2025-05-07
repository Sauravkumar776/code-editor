import React, { useEffect, useRef } from "react";
import { EditorContent } from "../../types";

interface PreviewProps {
  content: EditorContent;
  onConsoleLog: (
    message: string,
    type: "log" | "error" | "warn" | "info"
  ) => void;
}

const Preview: React.FC<PreviewProps> = ({ content, onConsoleLog }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generateHTML = (content: EditorContent) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Reset default styles */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            /* Custom styles */
            ${content.css}
          </style>
        </head>
        <body>
          ${content.html}
          <script>
            // Error handling wrapper
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              window.parent.postMessage({
                type: 'console',
                method: 'error',
                args: [msg]
              }, '*');
              return false;
            };

            // Console override with better formatting
            const formatValue = (value) => {
              try {
                if (typeof value === 'object') {
                  return JSON.stringify(value, null, 2);
                }
                return String(value);
              } catch (e) {
                return String(value);
              }
            };

            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info
            };

            ['log', 'error', 'warn', 'info'].forEach(method => {
              console[method] = function() {
                const args = Array.from(arguments).map(formatValue);
                window.parent.postMessage({
                  type: 'console',
                  method,
                  args
                }, '*');
                originalConsole[method].apply(console, arguments);
              };
            });

            // Execute user code in a try-catch block
            try {
              ${content.js}
            } catch (error) {
              console.error(error.message);
            }
          </script>
        </body>
      </html>
    `;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "console") {
        const { method, args } = event.data;
        const message = args.join(" ");
        onConsoleLog(message, method as "log" | "error" | "warn" | "info");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConsoleLog]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const html = generateHTML(content);
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
      }
    }
  }, [content]);

  return (
    <div className="flex flex-col h-full border border-gray-700 rounded-md overflow-hidden bg-white">
<div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
  <h3 className="text-sm font-medium text-white">Preview</h3>
        <button
          onClick={() => {
            const iframe = iframeRef.current;
            if (iframe) {
              const html = generateHTML(content);
              const iframeDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(html);
                iframeDoc.close();
              }
            }
          }}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      <div className="flex-grow bg-white">
        <iframe
          ref={iframeRef}
          title="preview"
          className="w-full h-full bg-white border-0 rounded-b-md"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default Preview;
