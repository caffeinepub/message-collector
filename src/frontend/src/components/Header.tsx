import { MessageSquare } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LoginButton from './LoginButton';

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-coral-600" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Sansi App Collector</h1>
              <p className="text-xs text-muted-foreground">Secure Message Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
