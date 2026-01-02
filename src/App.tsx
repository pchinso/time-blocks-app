import { ThemeProvider } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Dashboard } from '@/pages/Dashboard';
import { Toaster } from 'sonner';

function App() {
  return (
    <ThemeProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <Sidebar />
        <main className="relative flex flex-1 flex-col overflow-hidden">
          <Dashboard />
          <BottomNav />
        </main>
        <Toaster position="top-center" richColors />
      </div>
    </ThemeProvider>
  );
}

export default App;
