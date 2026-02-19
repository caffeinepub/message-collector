import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, login, isInitializing, isLoggingIn } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-coral-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Alert className="border-coral-200 bg-coral-50 dark:bg-coral-950/20">
            <Shield className="h-5 w-5 text-coral-600" />
            <AlertTitle className="text-coral-900 dark:text-coral-100">Authentication Required</AlertTitle>
            <AlertDescription className="text-coral-800 dark:text-coral-200 mt-2">
              Please log in to access your conversations and messages.
            </AlertDescription>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="mt-4 w-full bg-coral-600 hover:bg-coral-700 text-white"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login with Internet Identity'
              )}
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
