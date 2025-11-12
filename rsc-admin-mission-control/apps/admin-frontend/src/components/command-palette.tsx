'use client';

import { useState, useEffect } from 'react';
import { Button } from '@rsc/ui';
import { Search, Command } from 'lucide-react';

// Simple command palette component
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { name: 'Approve next pending', shortcut: 'Shift + A' },
    { name: 'Reject next pending', shortcut: 'Shift + R' },
    { name: 'Refresh queue', shortcut: 'Shift + F' },
    { name: 'Export CSV', shortcut: 'Shift + E' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="shadow-lg"
        >
          <Command className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Command Palette</span>
          <kbd className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-card rounded-lg border shadow-2xl w-full max-w-md mx-4">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Type a command..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {filteredCommands.map((command, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center justify-between"
            >
              <span>{command.name}</span>
              <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {command.shortcut}
              </kbd>
            </div>
          ))}
        </div>

        <div className="border-t p-4 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>↑↓ Navigate</span>
            <span>Enter Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
