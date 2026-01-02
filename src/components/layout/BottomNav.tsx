import React from 'react';
import { Calendar, LayoutGrid, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutGrid, label: 'Grid', id: 'grid' },
  { icon: Calendar, label: 'Plan', id: 'plan' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export const BottomNav: React.FC = () => {
  const [active, setActive] = React.useState('grid');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass mx-4 mb-4 flex h-16 items-center justify-around rounded-2xl px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-colors",
              active === item.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
