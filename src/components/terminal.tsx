'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  File,
  Folder,
  ChevronRight,
  Terminal as TerminalIcon,
  Cpu,
  MemoryStick,
  HelpCircle,
  RotateCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCommandSuggestion } from '@/app/actions';
import {
  type FSNode,
  createFileSystem,
  resolvePath,
  getNode,
  DirectoryNode,
} from '@/lib/file-system';

type Line = {
  id: number;
  content: React.ReactNode;
};

const COMMANDS = ['ls', 'cd', 'pwd', 'mkdir', 'rm', 'cpu', 'mem', 'clear', 'help', 'history'];

export default function Terminal() {
  const { toast } = useToast();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [fs, setFs] = useState<DirectoryNode>(createFileSystem());
  const [isProcessing, setIsProcessing] = useState(false);

  const [cpuUsage, setCpuUsage] = useState(0);
  const [memUsage, setMemUsage] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLine = useCallback((content: React.ReactNode) => {
    setLines(prev => [...prev, { id: Date.now() + Math.random(), content }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    setCpuUsage(Math.floor(Math.random() * 20) + 5);
    setMemUsage(Math.floor(Math.random() * 40) + 30);
    addLine(
      <div>
        <h3 className="text-lg font-bold text-primary-foreground mb-2">Python Shell Assistant</h3>
        <p>Welcome to the AI-powered terminal.</p>
        <p>
          Type <span className="font-semibold text-accent-foreground">help</span> to see available commands.
        </p>
        <p>For non-supported commands, AI will try to suggest a shell command.</p>
        <p>Example: <span className="italic">"list files sorted by size"</span></p>
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusInput = () => inputRef.current?.focus();

  const handleCommand = async (command: string) => {
    const [cmd, ...args] = command.split(' ').filter(Boolean);
    const fullCommand = (
      <div className="flex items-center gap-2">
        <span className="text-accent">{currentPath}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span>{command}</span>
      </div>
    );
    addLine(fullCommand);

    switch (cmd) {
      case 'help':
        addLine(
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
            <span className="font-bold col-span-full mb-1">Available commands:</span>
            {COMMANDS.map(c => (
              <span key={c}>{c}</span>
            ))}
          </div>
        );
        break;
      case 'clear':
        setLines([]);
        break;
      case 'history':
        addLine(
          <div className="flex flex-col">
            {history.map((h, i) => (
              <span key={i}>
                {i}: {h}
              </span>
            ))}
          </div>
        );
        break;
      case 'pwd':
        addLine(currentPath);
        break;
      case 'ls':
        const targetPath = args[0] ? resolvePath(currentPath, args[0], fs) : currentPath;
        const node = getNode(fs, targetPath);
        if (node?.type === 'dir') {
          addLine(
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(node.children).map(([name, childNode]) => (
                <div key={name} className="flex items-center gap-2">
                  {childNode.type === 'dir' ? (
                    <Folder className="w-4 h-4 text-primary" />
                  ) : (
                    <File className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>{name}</span>
                </div>
              ))}
            </div>
          );
        } else {
          addLine(<span className="text-destructive">ls: '{args[0] || '.'}': No such file or directory</span>);
        }
        break;
      case 'cd':
        if (!args[0]) {
          setCurrentPath(resolvePath(currentPath, '~', fs));
          break;
        }
        const newPath = resolvePath(currentPath, args[0], fs);
        const newNode = getNode(fs, newPath);
        if (newNode?.type === 'dir') {
          setCurrentPath(newPath);
        } else {
          addLine(<span className="text-destructive">cd: '{args[0]}': No such file or directory</span>);
        }
        break;
      case 'mkdir':
        // Not implemented to keep client-side FS simple
        addLine(<span className="text-destructive">mkdir: Read-only file system.</span>)
        break;
      case 'rm':
        addLine(<span className="text-destructive">rm: Read-only file system.</span>)
        break;
      case 'cpu':
        const newCpu = Math.floor(Math.random() * 30) + 5;
        setCpuUsage(newCpu);
        addLine(
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span>CPU Usage: {newCpu}%</span>
          </div>
        );
        break;
      case 'mem':
        const newMem = Math.floor(Math.random() * 50) + 30;
        setMemUsage(newMem);
        addLine(
          <div className="flex items-center gap-2">
            <MemoryStick className="w-4 h-4 text-primary" />
            <span>Memory Usage: {newMem}%</span>
          </div>
        );
        break;
      default:
        addLine(
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        );
        const suggestion = await getCommandSuggestion(command);
        setLines(prev => prev.slice(0, prev.length - 1)); // Remove "Thinking..."
        addLine(
          <div>
            <p className="text-muted-foreground">
              Command not found. AI suggests:
            </p>
            <p className="p-2 bg-muted rounded-md font-semibold">{suggestion}</p>
          </div>
        );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isProcessing || !input.trim()) return;

    setIsProcessing(true);
    const commandToProcess = input;
    setHistory(prev => [commandToProcess, ...prev]);
    setHistoryIndex(-1);
    setInput('');

    await handleCommand(commandToProcess);
    setIsProcessing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = Math.max(historyIndex - 1, 0);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const parts = input.split(' ');
      const partial = parts.pop() || '';
      const baseCmd = parts[0];

      let potentialCompletions: string[] = [];

      if (parts.length === 0 || (parts.length > 0 && input.endsWith(' '))) {
        potentialCompletions = COMMANDS.filter(cmd => cmd.startsWith(partial));
      } else if (['cd', 'ls', 'rm'].includes(baseCmd)) {
        const node = getNode(fs, currentPath);
        if (node?.type === 'dir') {
          potentialCompletions = Object.keys(node.children).filter(name => name.startsWith(partial));
        }
      }

      if (potentialCompletions.length === 1) {
        setInput([...parts, potentialCompletions[0]].join(' ') + ' ');
      } else if (potentialCompletions.length > 1) {
        addLine(
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {potentialCompletions.map(comp => (
              <span key={comp}>{comp}</span>
            ))}
          </div>
        );
      }
    }
  };

  return (
    <Card
      className="w-full max-w-4xl h-[85vh] flex flex-col font-code shadow-2xl"
      onClick={focusInput}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-5 h-5" />
          <CardTitle className="text-base font-headline">Python Shell Assistant</CardTitle>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
      </CardHeader>
      <CardContent ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-3">
        {lines.map(line => (
          <div key={line.id}>{line.content}</div>
        ))}
        {isProcessing && <div className="animate-pulse">...</div>}
      </CardContent>
      <CardFooter className="p-0 border-t">
        <div className="flex items-center w-full px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-accent">{currentPath}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <form onSubmit={handleSubmit} className="flex-grow">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 ml-2"
              autoFocus
              disabled={isProcessing}
              placeholder={isProcessing ? "Processing..." : ""}
            />
          </form>
        </div>
      </CardFooter>
    </Card>
  );
}
