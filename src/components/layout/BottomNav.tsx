import React from 'react';
import { Calendar, LayoutGrid, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutGrid, label: 'Grid', id: 'grid' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export const BottomNav: React.FC = () => {
  const [active, setActive] = React.useState('grid');

  const handleNavClick = (id: string) => {
    setActive(id);
    // Dispatch custom event for navigation
    window.dispatchEvent(new CustomEvent('navigate', { detail: id }));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass mx-2 mb-2 flex h-12 items-center justify-around rounded-xl px-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={cn(
              "flex flex-col items-center justify-center transition-colors",
              active === item.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon size={16} />
            <span className="text-[8px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
