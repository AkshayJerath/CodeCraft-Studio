"use client";

import type { FC } from 'react';
import Editor, { type OnChange, type OnMount, type Monaco } from "@monaco-editor/react";
import { Skeleton } from "@/components/ui/skeleton";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  theme?: string;
  onEditorDidMount?: (editor: any, monaco: Monaco) => void;
}

export const CodeEditor: FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  theme = "vs-dark", 
  onEditorDidMount,
}) => {
  const handleEditorChange: OnChange = (value) => {
    onChange(value);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    if (onEditorDidMount) {
        onEditorDidMount(editor, monaco);
    }
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-md shadow-inner">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme}
        loading={<Skeleton className="h-full w-full bg-muted/50" />}
        options={{
          fontFamily: "var(--font-geist-mono)",
          minimap: { enabled: true, scale: 1 },
          fontSize: 14,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          // renderLineHighlight: "gutter", // Removed for troubleshooting
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          // glyphMargin: true, // Removed for troubleshooting
          folding: true,
          lineNumbers: "on",
          // lineDecorationsWidth: 10, // Removed for troubleshooting
          lineNumbersMinChars: 3,
          renderWhitespace: "boundary",
          cursorSmoothCaretAnimation: "on",
          cursorBlinking: "smooth",
        }}
      />
    </div>
  );
};
