"use client";

import type { FC } from 'react';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, Download, Sparkles, Settings, Trash2 } from 'lucide-react';

interface AppHeaderProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onRunCode: () => void;
  onDownloadCode: () => void;
  onExplainCode: () => void;
  onClearTerminal: () => void;
  isExecuting: boolean;
  isExplaining: boolean;
}

export const AppHeader: FC<AppHeaderProps> = ({
  selectedLanguage,
  onLanguageChange,
  onRunCode,
  onDownloadCode,
  onExplainCode,
  onClearTerminal,
  isExecuting,
  isExplaining,
}) => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <LogoIcon className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">CodeCraft Studio</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[130px] md:w-[150px] bg-background text-foreground focus:ring-primary h-9">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground">
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
          </SelectContent>
        </Select>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onRunCode} disabled={isExecuting} className="hover:bg-primary/10 hover:text-primary border-primary/50">
                <Play className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border">
              <p>Run Code (Ctrl/Cmd + Enter)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onDownloadCode} className="hover:bg-primary/10 hover:text-primary">
                <Download className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border">
              <p>Download Code</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onExplainCode} disabled={isExplaining} className="hover:bg-accent/20 text-accent-foreground border-accent/50">
                <Sparkles className="h-5 w-5 text-accent" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border">
              <p>Explain Code (AI)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onClearTerminal} className="hover:bg-destructive/10 hover:text-destructive-foreground border-destructive/50">
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border">
              <p>Clear Terminal</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-primary">
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border">
              <p>Settings (Coming Soon)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};
