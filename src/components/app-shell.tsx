
import { BottomNav } from './bottom-nav';
import { Header } from './header';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <Header />
      <main className="min-h-screen p-4 pb-20 md:p-6 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
