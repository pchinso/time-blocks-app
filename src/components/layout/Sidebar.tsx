import React from 'react';
import { Calendar, LayoutGrid, Settings, User, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: LayoutGrid, label: 'Grid', id: 'grid' },
  { icon: Calendar, label: 'Plan', id: 'plan' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export const Sidebar: React.FC = () => {
  const [active, setActive] = React.useState('grid');
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-card p-6 md:flex">
      <div className="mb-8 flex items-center space-x-2">
        <div className="h-8 w-8 rounded-lg bg-primary" />
        <span className="text-xl font-bold tracking-tight">TimeBlocks</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={cn(
              "flex w-full items-center space-x-3 rounded-xl px-4 py-3 transition-all",
              active === item.id 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </Button>
      </div>
    </aside>
  );
};
