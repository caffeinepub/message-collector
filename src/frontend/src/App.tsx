import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthGate from './components/AuthGate';
import PinGate from './components/PinGate';
import ProfileSetup from './components/ProfileSetup';
import ConversationManager from './pages/ConversationManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
              <AuthGate>
                <ProfileSetup>
                  <PinGate>
                    <ConversationManager />
                  </PinGate>
                </ProfileSetup>
              </AuthGate>
            </main>
            <Footer />
            <Toaster />
          </div>
        </ThemeProvider>
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}

export default App;
