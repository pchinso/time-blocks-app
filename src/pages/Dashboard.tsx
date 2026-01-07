import React, { useState, useEffect } from 'react';
import { BubbleGrid } from '@/components/blocks/BubbleGrid';
import { Settings } from './Settings';
import { Profile } from './Profile';

export const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'grid' | 'settings' | 'profile'>('grid');

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const view = customEvent.detail;
      if (view === 'grid' || view === 'settings' || view === 'profile') {
        setActiveView(view);
      }
    };

    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {activeView === 'grid' && <BubbleGrid />}
      {activeView === 'settings' && <Settings />}
      {activeView === 'profile' && <Profile />}
    </div>
  );
};
