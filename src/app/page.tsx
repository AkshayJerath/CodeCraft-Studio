"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Monaco } from "@monaco-editor/react";
import { AppHeader } from '@/components/layout/AppHeader';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { TerminalOutput, type TerminalMessage } from '@/components/terminal/TerminalOutput';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useToast } from "@/hooks/use-toast";
import { explainCode, type ExplainCodeInput } from '@/ai/flows/explain-code';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { codeExecutor } from '@/services/codeExecutor';

const initialCodeSamples: Record<string, string> = {
  python: 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")',
  javascript: 'const readline = require("readline");\nconst rl = readline.createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nrl.question("Enter your name: ", (name) => {\n  console.log(`Hello, ${name}!`);\n  rl.close();\n});',
  java: 'import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner scanner = new Scanner(System.in);\n    System.out.print("Enter your name: ");\n    String name = scanner.nextLine();\n    System.out.println("Hello, " + name + "!");\n    scanner.close();\n  }\n}',
  typescript: `// TypeScript - Multiple input example  
// Input: John 25
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your name: ', (userName: string) => {
  rl.question('Enter your age: ', (userAge: string) => {
    console.log(\`Hello, \${userName}! You are \${userAge} years old.\`);
    rl.close();
  });
});`,
  cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    cout << "Enter your name: ";\n    getline(cin, name);\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}',
  c: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char name[100];\n    printf("Enter your name: ");\n    fgets(name, sizeof(name), stdin);\n    name[strcspn(name, "\\n")] = 0;\n    printf("Hello, %s!\\n", name);\n    return 0;\n}',
  go: 'package main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n    "strings"\n)\n\nfunc main() {\n    fmt.Print("Enter your name: ")\n    reader := bufio.NewReader(os.Stdin)\n    name, _ := reader.ReadString(\'\\n\')\n    name = strings.TrimSpace(name)\n    fmt.Printf("Hello, %s!\\n", name)\n}',
  rust: 'use std::io;\n\nfn main() {\n    println!("Enter your name:");\n    let mut input = String::new();\n    io::stdin().read_line(&mut input)\n        .expect("Failed to read line");\n    let name = input.trim();\n    println!("Hello, {}!", name);\n}',
  html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; background-color: #282c34; color: #abb2bf; }\n    input, button { padding: 8px; margin: 5px; border-radius: 4px; border: 1px solid #61afef; background-color: #21252b; color: #abb2bf; }\n    button { cursor: pointer; background-color: #61afef; color: #282c34; }\n  </style>\n</head>\n<body>\n  <h1>Welcome to Interactive HTML!</h1>\n  <p>Enter your name: <input type="text" id="nameInput" placeholder="Your Name"></p>\n  <button onclick="greet()">Greet</button>\n  <p id="greetingOutput" style="margin-top:10px;"></p>\n\n  <script>\n    function greet() {\n      const name = document.getElementById("nameInput").value || "Guest";\n      document.getElementById("greetingOutput").textContent = "Hello, " + name + " from HTML!";\n    }\n  </script>\n</body>\n</html>',
  css: 'body {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0;\n  color: #333;\n  margin: 20px;\n  padding: 20px;\n  border: 1px solid #ccc;\n  border-radius: 8px;\n}\n\nh1 {\n  color: #3F51B5;\n  text-align: center;\n}\n\n.container {\n  background-color: white;\n  padding: 15px;\n  border-radius: 4px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n}',
};

const defaultWelcomeMessage: TerminalMessage = {
  id: 'welcome',
  type: 'system',
  content: 'Welcome to CodeCraft Studio! Select a language and start coding. Real code execution powered by Docker.',
  timestamp: new Date().toLocaleTimeString(),
};

export default function CodeCraftStudioPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState(initialCodeSamples.python);
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessage[]>([defaultWelcomeMessage]);
  const [showInputPrompt, setShowInputPrompt] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [executionInput, setExecutionInput] = useState('');
  const [isServiceHealthy, setIsServiceHealthy] = useState(false);
  
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  const { toast } = useToast();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const prevSelectedLanguageRef = useRef<string | undefined>();

  // Check code execution service health
  useEffect(() => {
    const checkServiceHealth = async () => {
      const healthy = await codeExecutor.checkHealth();
      setIsServiceHealthy(healthy);
      if (!healthy) {
        addTerminalMessage('error', 'Code execution service is not available. Please ensure Docker containers are running.');
      } else {
        addTerminalMessage('system', 'Code execution service is ready.');
      }
    };
    
    checkServiceHealth();
    // Check health every 30 seconds
    const healthInterval = setInterval(checkServiceHealth, 30000);
    return () => clearInterval(healthInterval);
  }, []);

  useEffect(() => {
    console.log("Editor page: useEffect for auth check triggered.");
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      console.log("Editor page: localStorage 'isLoggedIn' status from localStorage:", loggedIn);
      
      setIsAuthenticated(loggedIn);
      setIsLoadingAuth(false); 

      if (!loggedIn) {
        console.log("Editor page: Not authenticated, redirecting to /login.");
        router.replace('/login');
      } else {
        console.log("Editor page: Authenticated, proceeding to render editor.");
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
          document.documentElement.classList.toggle('dark', storedTheme === 'dark');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
          localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
        }
      }
    }
  }, [router]);

  const addTerminalMessage = useCallback((type: TerminalMessage['type'], content: string) => {
    setTerminalMessages(prev => [...prev.slice(-100), {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      type, 
      content,
      timestamp: (type !== 'user-input' && type !== 'input-prompt') ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}) : undefined,
    }]);
  }, []); 

  useEffect(() => {
    if (isAuthenticated) {
      setCode(initialCodeSamples[selectedLanguage] || `// Start coding in ${selectedLanguage}...`);
      if (prevSelectedLanguageRef.current !== undefined && prevSelectedLanguageRef.current !== selectedLanguage) {
        addTerminalMessage('system', `Switched to ${selectedLanguage} environment. Sample code loaded.`);
      }
      prevSelectedLanguageRef.current = selectedLanguage;
    }
  }, [selectedLanguage, isAuthenticated, addTerminalMessage]);
  
  const handleEditorDidMount = (editor: any, monacoInstance: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    if (isAuthenticated) {
      editor.focus();
      if (monacoInstance) { 
          editor.addCommand(
            monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
            () => {
              if (!isExecuting && isAuthenticated) handleRunCode(); 
            }
          );
        }
    }
  };

  const handleLanguageChange = (language: string) => {
    if (!isAuthenticated) {
        toast({ title: "Not Authenticated", description: "Please log in to change language.", variant: "destructive" });
        return;
    }
    setSelectedLanguage(language);
  };

  const handleRunCode = useCallback(async () => {
    if (!isAuthenticated) {
        toast({ title: "Not Authenticated", description: "Please log in to run code.", variant: "destructive" });
        return;
    }

    if (!isServiceHealthy) {
        toast({ title: "Service Unavailable", description: "Code execution service is not available.", variant: "destructive" });
        addTerminalMessage('error', 'Code execution service is not available. Please ensure Docker containers are running.');
        return;
    }

    if (!code.trim()) {
        toast({ title: "Empty Code", description: "Please write some code to execute.", variant: "destructive" });
        return;
    }

    // Handle HTML/CSS differently as they don't execute in the traditional sense
    if (selectedLanguage === 'html') {
        addTerminalMessage('output', 'HTML code is rendered in browsers. Copy this code to an HTML file and open it in a browser to see the result.');
        addTerminalMessage('log', 'HTML code processed.');
        return;
    }
    
    if (selectedLanguage === 'css') {
        addTerminalMessage('output', 'CSS code is used for styling HTML. Apply this CSS to an HTML document to see its effects.');
        addTerminalMessage('log', 'CSS code processed.');
        return;
    }

    setIsExecuting(true);
    addTerminalMessage('log', `Executing ${selectedLanguage} code...`);
    
    // Check if code contains multiple input calls for different languages
    let multipleInputsRequired = false;
    let inputCount = 0;

    if (selectedLanguage === 'python') {
      inputCount = (code.match(/input\s*\(/g) || []).length;
      multipleInputsRequired = inputCount > 1;
    } else if (selectedLanguage === 'java') {
      inputCount = (code.match(/scanner\.(nextLine|next)\s*\(/gi) || []).length;
      multipleInputsRequired = inputCount > 1;
    } else if (selectedLanguage === 'javascript') {
      inputCount = (code.match(/rl\.question/gi) || []).length;
      multipleInputsRequired = inputCount > 1;
    } else if (selectedLanguage === 'typescript') {
      inputCount = (code.match(/rl\.question/gi) || []).length;
      multipleInputsRequired = inputCount > 1;
    }
    
    if (multipleInputsRequired) {
        addTerminalMessage('input-prompt', `Your ${selectedLanguage} code requires ${inputCount} inputs. Enter them separated by spaces:`);
        addTerminalMessage('system', `Example: John 25 (for name and age)`);
        addTerminalMessage('system', `Or enter the same value for all: 12`);
        setShowInputPrompt(true);
        return;
    }

    // For single input or no input required
    const inputRequiredLanguages = ['python', 'java', 'javascript', 'typescript'];
    const hasInputCall = 
      (selectedLanguage === 'python' && code.includes('input(')) ||
      (selectedLanguage === 'java' && code.match(/scanner\.(nextLine|next)/i)) ||
      (selectedLanguage === 'javascript' && code.includes('question')) ||
      (selectedLanguage === 'typescript' && code.includes('question'));

    if (inputRequiredLanguages.includes(selectedLanguage) && hasInputCall) {
        addTerminalMessage('input-prompt', `Enter input for your ${selectedLanguage} program (if any), then press Enter:`);
        setShowInputPrompt(true);
        return;
    }

    // Execute directly for code that doesn't need input
    await executeCode('');
  }, [selectedLanguage, code, addTerminalMessage, isAuthenticated, isServiceHealthy, toast]);
  
  const executeCode = async (input: string) => {
    try {
      // For multiple input languages, process the input properly
      let processedInput = input;
      
      // Languages that commonly use multiple inputs
      const multiInputLanguages = ['python', 'java', 'javascript', 'typescript'];
      
      if (multiInputLanguages.includes(selectedLanguage) && input) {
        // Check if user provided space-separated inputs
        const inputs = input.trim().split(/\s+/);
        
        // Count input calls in the code
        let inputCount = 0;
        if (selectedLanguage === 'python') {
          inputCount = (code.match(/input\s*\(/g) || []).length;
        } else if (selectedLanguage === 'java') {
          inputCount = (code.match(/scanner\.(nextLine|next)\s*\(/gi) || []).length;
        } else if (selectedLanguage === 'javascript') {
          inputCount = (code.match(/rl\.question|readline/gi) || []).length;
        } else if (selectedLanguage === 'typescript') {
          inputCount = (code.match(/rl\.question|readline/gi) || []).length;
        }
        
        if (inputs.length === inputCount && inputs.length > 1) {
          // Convert space-separated to newline-separated
          processedInput = inputs.join('\n');
          addTerminalMessage('system', `Converted space-separated inputs to: ${inputs.join(', ')}`);
        } else if (inputs.length === 1 && inputCount > 1) {
          // Single input provided but multiple needed - replicate it
          processedInput = Array(inputCount).fill(inputs[0]).join('\n');
          addTerminalMessage('system', `Using "${inputs[0]}" for all ${inputCount} inputs`);
        }
      }

      const result = await codeExecutor.executeCode(code, selectedLanguage, processedInput);
      
      if (result.success) {
        if (result.output) {
          addTerminalMessage('output', result.output);
        }
        if (result.stderr) {
          addTerminalMessage('error', result.stderr);
        }
        addTerminalMessage('system', `Execution completed (${result.runtime}) - Exit code: ${result.exitCode}`);
        
        if (result.exitCode === 0) {
          toast({ title: "Code Executed Successfully!", description: "Check the terminal for output." });
        } else {
          toast({ title: "Code Execution Completed", description: `Process exited with code ${result.exitCode}`, variant: "destructive" });
        }
      } else {
        addTerminalMessage('error', result.stderr || 'Execution failed');
        toast({ title: "Execution Failed", description: "Check the terminal for error details.", variant: "destructive" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addTerminalMessage('error', `Execution error: ${errorMessage}`);
      toast({ title: "Execution Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsExecuting(false);
      setShowInputPrompt(false);
    }
  };


  const handleTerminalInputCommand = async (input: string) => {
    if (!isAuthenticated) {
        toast({ title: "Not Authenticated", description: "Please log in to provide input.", variant: "destructive" });
        return;
    }
    
    setShowInputPrompt(false);
    addTerminalMessage('user-input', input || "(no input provided)");
    
    // If we're waiting for execution input, execute the code
    if (isExecuting) {
        await executeCode(input);
    } else {
        // Handle terminal commands
        const command = input.toLowerCase().trim();
        switch (command) {
            case 'clear':
                handleClearTerminal();
                break;
            case 'run':
                handleRunCode();
                break;
            case 'health':
                const healthy = await codeExecutor.checkHealth();
                setIsServiceHealthy(healthy);
                addTerminalMessage('output', `Service health: ${healthy ? 'healthy' : 'unhealthy'}`);
                break;
            case 'help':
                addTerminalMessage('ai-explanation', 
                    'Available commands:\n' +
                    '• clear - Clear terminal\n' +
                    '• run - Execute current code\n' +
                    '• health - Check service health\n' +
                    '• help - Show this help\n\n' +
                    'For multiple inputs, separate with new lines:\n' +
                    'John\n25\n\n' +
                    'Or use single line with spaces: John 25'
                );
                break;
            default:
                addTerminalMessage('error', `Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }
  };

  const handleDownloadCode = () => {
    if (!isAuthenticated) {
      toast({ title: "Not Authenticated", description: "Please log in to download code.", variant: "destructive" });
      return;
    }
    if (!code.trim()) {
      toast({ title: "Empty Code", description: "There's no code to download.", variant: "destructive" });
      return;
    }
    const fileExtensionMap: Record<string, string> = {
      python: 'py', javascript: 'js', java: 'java', typescript: 'ts', 
      html: 'html', css: 'css', cpp: 'cpp', c: 'c', go: 'go', rust: 'rs'
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
    if (!isAuthenticated) {
      toast({ title: "Not Authenticated", description: "Please log in to use AI features.", variant: "destructive" });
      return;
    }
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
    if (!isAuthenticated) {
        toast({ title: "Not Authenticated", description: "Please log in to clear terminal.", variant: "destructive" });
        return;
    }
    setTerminalMessages([
        { 
            id: `${Date.now()}-cleared`, 
            type: 'system', 
            content: 'Terminal cleared.', 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'})
        }
    ]);
    setShowInputPrompt(false);
    setIsExecuting(false);
    toast({ title: "Terminal Cleared" });
  };

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden items-center justify-center">
        <div className="space-y-4 p-8 rounded-lg bg-card shadow-xl text-center">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-4 w-56 mx-auto" />
            <p className="text-muted-foreground mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
         <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden items-center justify-center">
            <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
    );
  }

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