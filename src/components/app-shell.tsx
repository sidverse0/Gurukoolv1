
import { BottomNav } from './bottom-nav';
import { Header } from './header';
import { Sidebar } from './sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header />
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
