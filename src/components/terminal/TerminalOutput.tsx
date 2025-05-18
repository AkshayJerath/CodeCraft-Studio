"use client";

import type { FC, KeyboardEvent } from 'react';
import React, { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface TerminalMessage {
  id: string;
  type: 'log' | 'input-prompt' | 'user-input' | 'output' | 'error' | 'ai-explanation' | 'system';
  content: string;
  timestamp?: string; 
}

interface TerminalOutputProps {
  messages: TerminalMessage[];
  onInputCommand: (command: string) => void;
  showInputPrompt: boolean;
}

export const TerminalOutput: FC<TerminalOutputProps> = ({ messages, onInputCommand, showInputPrompt }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (scrollAreaRef.current) {
      // Attempt to select the viewport using a more robust method
      const viewport = scrollAreaRef.current.querySelector('div[style*="overflow: scroll;"]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      } else {
        // Fallback for when the specific style isn't found, query by data attribute
        const dataViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if(dataViewport) dataViewport.scrollTop = dataViewport.scrollHeight;
      }
    }
  }, [messages]);


  useEffect(() => {
    if (showInputPrompt && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInputPrompt]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputSubmit = () => {
    if (inputValue.trim() || !inputValue) { // Allow empty input submission if needed
      onInputCommand(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleInputSubmit();
    }
  };

  const getMessageStyles = (type: TerminalMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-destructive';
      case 'output':
        return 'text-accent'; 
      case 'ai-explanation':
        return 'text-primary-foreground bg-primary/20 p-2 rounded-md border border-primary/50';
      case 'user-input':
        return 'text-foreground/80 italic';
      case 'system':
        return 'text-muted-foreground text-xs';
      case 'input-prompt':
         return 'text-foreground';
      case 'log':
      default:
        return 'text-foreground/90';
    }
  };

  return (
    <div className="flex h-full flex-col bg-card p-3 rounded-lg shadow-inner">
      <ScrollArea className="flex-grow mb-2" ref={scrollAreaRef}>
        <div className="space-y-1.5 p-2">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "whitespace-pre-wrap font-mono text-xs md:text-sm",
                getMessageStyles(msg.type),
                // Subtle animation for new messages
                "animate-in fade-in slide-in-from-bottom-2 duration-300" 
              )}
            >
              {msg.timestamp && <span className="text-muted-foreground/70 mr-2 text-xs">{msg.timestamp}</span>}
              {(msg.type === 'input-prompt' || msg.type === 'user-input') && <ChevronRight className="inline h-3 w-3 mr-1" />}
              {msg.content}
            </div>
          ))}
        </div>
      </ScrollArea>
      {showInputPrompt && (
        <div className="mt-auto flex items-center gap-2 border-t border-border/50 pt-2">
          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your input here..."
            className="flex-grow bg-background/70 focus:ring-primary text-sm h-9"
            aria-label="Terminal input"
          />
          <Button onClick={handleInputSubmit} size="sm" variant="default" className="h-9">
            <Send className="mr-1.5 h-4 w-4" /> Submit
          </Button>
        </div>
      )}
    </div>
  );
};
