import React from 'react';
import { LayoutGrid, Settings, User, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: LayoutGrid, label: 'Grid', id: 'grid' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export const Sidebar: React.FC = () => {
  const [active, setActive] = React.useState('grid');
  const { theme, toggleTheme } = useTheme();

  const handleNavClick = (id: string) => {
    setActive(id);
    // Dispatch custom event for navigation
    window.dispatchEvent(new CustomEvent('navigate', { detail: id }));
  };

  return (
    <aside className="hidden h-full w-48 flex-col border-r bg-card p-4 md:flex">
      <div className="mb-6 flex items-center space-x-2">
        <div className="h-6 w-6 rounded-lg bg-primary" />
        <span className="text-lg font-bold tracking-tight">TimeBlocks</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={cn(
              "flex w-full items-center space-x-2 rounded-lg px-3 py-2 transition-all",
              active === item.id 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon size={16} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start space-x-2"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          <span className="text-xs">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </Button>
      </div>
    </aside>
  );
};
