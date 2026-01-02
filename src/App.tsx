import { ThemeProvider } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Dashboard } from '@/pages/Dashboard';
import { Toaster } from 'sonner';

function App() {
  return (
    <ThemeProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground justify-center items-center">
        <div className="flex h-full w-full max-w-[960px] max-h-[640px] overflow-hidden border shadow-2xl rounded-3xl bg-card">
          <Sidebar />
          <main className="relative flex flex-1 flex-col overflow-hidden">
            <Dashboard />
            <BottomNav />
          </main>
        </div>
        <Toaster position="top-center" richColors />
      </div>
    </ThemeProvider>
  );
}

export default App;
