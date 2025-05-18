
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Monaco } from "@monaco-editor/react";
import { AppHeader } from '@/components/layout/AppHeader';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { TerminalOutput, type TerminalMessage } from '@/components/terminal/TerminalOutput';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useToast } from "@/hooks/use-toast";
import { explainCode, type ExplainCodeInput } from '@/ai/flows/explain-code';

const initialCodeSamples: Record<string, string> = {
  python: 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")',
  javascript: '// Try using prompt("Enter your name:") in a browser console or HTML environment.\n// For this terminal, we simulate input.\nconst name = "User"; // Simulated input for Node.js like environment\nconsole.log(`Hello, ${name}!`);',
  java: 'import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner scanner = new Scanner(System.in);\n    System.out.print("Enter your name: ");\n    String name = scanner.nextLine();\n    System.out.println("Hello, " + name + "!");\n    scanner.close();\n  }\n}',
  typescript: '// Try using prompt("Enter your name:") in a browser console or HTML environment.\n// For this terminal, we simulate input.\nconst name: string = "User"; // Simulated input\nconsole.log(`Hello, ${name}!`);',
  html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; background-color: #282c34; color: #abb2bf; }\n    input, button { padding: 8px; margin: 5px; border-radius: 4px; border: 1px solid #61afef; background-color: #21252b; color: #abb2bf; }\n    button { cursor: pointer; background-color: #61afef; color: #282c34; }\n  </style>\n</head>\n<body>\n  <h1>Welcome to Interactive HTML!</h1>\n  <p>Enter your name: <input type="text" id="nameInput" placeholder="Your Name"></p>\n  <button onclick="greet()">Greet</button>\n  <p id="greetingOutput" style="margin-top:10px;"></p>\n\n  <script>\n    function greet() {\n      const name = document.getElementById("nameInput").value || "Guest";\n      document.getElementById("greetingOutput").textContent = "Hello, " + name + " from HTML!";\n    }\n  </script>\n</body>\n</html>',
  css: 'body {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0; /* Light background for contrast */\n  color: #333; /* Dark text */\n  margin: 20px;\n  padding: 20px;\n  border: 1px solid #ccc;\n  border-radius: 8px;\n}\n\nh1 {\n  color: #3F51B5; /* Deep blue from theme */\n  text-align: center;\n}\n\n.container {\n  background-color: white;\n  padding: 15px;\n  border-radius: 4px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n}',
};

const defaultWelcomeMessage: TerminalMessage = {
  id: 'welcome',
  type: 'system',
  content: 'Welcome to CodeCraft Studio! Select a language and start coding, or try running the sample code.',
  timestamp: new Date().toLocaleTimeString(),
};

export default function CodeCraftStudioPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState(initialCodeSamples.python);
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessage[]>([defaultWelcomeMessage]);
  const [showInputPrompt, setShowInputPrompt] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const { toast } = useToast();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const addTerminalMessage = useCallback((type: TerminalMessage['type'], content: string) => {
    setTerminalMessages(prev => [...prev.slice(-100), { // Keep last 100 messages
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      type, 
      content,
      timestamp: (type !== 'user-input' && type !== 'input-prompt') ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}) : undefined,
    }]);
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
       // If no theme in localStorage, ensure default 'dark' from layout is applied or check system pref
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);


  useEffect(() => {
    setCode(initialCodeSamples[selectedLanguage] || `// Start coding in ${selectedLanguage}...`);
    if (terminalMessages.length > 1 || terminalMessages[0].id !== 'welcome') { // Avoid duplicate message on initial load
        addTerminalMessage('system', `Switched to ${selectedLanguage} environment. Sample code loaded.`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage]); // addTerminalMessage removed from deps to avoid loop on init
  
  const handleEditorDidMount = (editor: any, monacoInstance: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    editor.focus();
    
    if (monacoInstance) {
        editor.addCommand(
          monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
          () => {
            if (!isExecuting) handleRunCode();
          }
        );
      }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleRunCode = useCallback(() => {
    setIsExecuting(true);
    addTerminalMessage('log', `Executing ${selectedLanguage} code... (Simulation)`);
    
    if (selectedLanguage === 'html') {
        addTerminalMessage('output', 'HTML/CSS code is typically rendered in a browser. For a live preview, copy this code into an HTML file and open it, or use a tool like CodePen.\n\nFor this simulation, we will just acknowledge the run.');
        addTerminalMessage('log', 'Execution finished.');
        setIsExecuting(false);
        return;
    }
    if (selectedLanguage === 'css') {
        addTerminalMessage('output', 'CSS code is used for styling HTML. It doesn\'t "run" in the same way as script languages. Apply this CSS to an HTML document to see its effects.');
        addTerminalMessage('log', 'Execution finished.');
        setIsExecuting(false);
        return;
    }

    addTerminalMessage('input-prompt', `Enter input for your program (if any), then press Enter:`);
    setShowInputPrompt(true);
  }, [selectedLanguage, addTerminalMessage]);

  const handleTerminalInputCommand = (input: string) => {
    setShowInputPrompt(false);
    addTerminalMessage('user-input', input || "(empty input)");
    
    setTimeout(() => {
      addTerminalMessage('output', `Simulated output for your ${selectedLanguage} code:`);
      if (selectedLanguage === 'python') {
        addTerminalMessage('output', input ? `Hello, ${input}! (Python Simulation)`: 'Python code ran with no input.');
      } else if (selectedLanguage === 'javascript' || selectedLanguage === 'typescript') {
        addTerminalMessage('output', input ? `Hello, ${input}! (JS/TS Simulation)` : 'JS/TS code ran with no input.');
      } else if (selectedLanguage === 'java') {
        addTerminalMessage('output', input ? `Hello, ${input}! (Java Simulation)` : 'Java code ran with no input.');
      } else {
        addTerminalMessage('output', `Processed input: "${input}"`);
      }
      addTerminalMessage('log', `Execution finished.`);
      setIsExecuting(false);
    }, 700);
  };

  const handleDownloadCode = () => {
    if (!code.trim()) {
      toast({ title: "Empty Code", description: "There's no code to download.", variant: "destructive" });
      return;
    }
    const fileExtensionMap: Record<string, string> = {
      python: 'py', javascript: 'js', java: 'java', typescript: 'ts', html: 'html', css: 'css',
    };
    const extension = fileExtensionMap[selectedLanguage] || 'txt';
    const filename = `codecraft_source.${extension}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Code Downloaded", description: `${filename} saved.` });
    addTerminalMessage('system', `Code downloaded as ${filename}.`);
  };

  const handleExplainCode = async () => {
    if (!code.trim()) {
      toast({ title: "Empty Code", description: "Write some code to explain.", variant: "destructive" });
      return;
    }
    setIsExplaining(true);
    addTerminalMessage('system', '✨ AI is analyzing your code... Please wait.');
    try {
      const inputPayload: ExplainCodeInput = { code };
      const result = await explainCode(inputPayload);
      if (result && result.explanation) {
        addTerminalMessage('ai-explanation', `🤖 AI Code Explanation:\n\n${result.explanation}`);
        toast({ title: "AI Explanation Ready!", description: "Check the terminal for the explanation." });
      } else {
        throw new Error("AI did not provide an explanation.");
      }
    } catch (error) {
      console.error("Error explaining code with AI:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addTerminalMessage('error', `AI Explanation Failed: ${errorMessage}`);
      toast({ title: "AI Error", description: `Could not explain code: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsExplaining(false);
    }
  };
  
  const handleClearTerminal = () => {
    setTerminalMessages([
        { 
            id: `${Date.now()}-cleared`, 
            type: 'system', 
            content: 'Terminal cleared.', 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'})
        }
    ]);
    setShowInputPrompt(false);
    setIsExecuting(false); // Reset execution state if terminal is cleared mid-execution
    toast({ title: "Terminal Cleared" });
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      <AppHeader
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onRunCode={handleRunCode}
        onDownloadCode={handleDownloadCode}
        onExplainCode={handleExplainCode}
        onClearTerminal={handleClearTerminal}
        isExecuting={isExecuting}
        isExplaining={isExplaining}
      />
      <main className="flex-grow overflow-hidden p-1 md:p-2">
        <ResizablePanelGroup direction="vertical" className="h-full max-h-[calc(100vh-5rem)] rounded-lg border border-border/50">
          <ResizablePanel defaultSize={65} minSize={20} className="overflow-hidden">
             <div className="h-full p-1 md:p-2">
                <CodeEditor
                language={selectedLanguage}
                value={code}
                onChange={(newCode) => setCode(newCode || '')}
                onEditorDidMount={handleEditorDidMount}
                />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35} minSize={15} className="overflow-hidden">
            <div className="h-full p-1 md:p-2">
             <TerminalOutput 
                messages={terminalMessages} 
                onInputCommand={handleTerminalInputCommand}
                showInputPrompt={showInputPrompt}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
