import { useState, useEffect } from 'react';
import { useCheckPin, useSetPin } from '../hooks/useQueries';
import PinSetup from './PinSetup';
import PinEntry from './PinEntry';
import { Loader2 } from 'lucide-react';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [pinVerified, setPinVerified] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const checkPin = useCheckPin();
  const setPin = useSetPin();

  useEffect(() => {
    const verified = sessionStorage.getItem('pinVerified');
    if (verified === 'true') {
      setPinVerified(true);
      setIsChecking(false);
    } else {
      // Check if user has a PIN by attempting to verify with empty string
      checkPin.mutate('', {
        onError: (error: any) => {
          if (error.message?.includes('PIN not set')) {
            setShowSetup(true);
          }
          setIsChecking(false);
        },
        onSuccess: () => {
          setIsChecking(false);
        },
      });
    }
  }, []);

  const handlePinSetup = async (pin: string) => {
    try {
      await setPin.mutateAsync(pin);
      sessionStorage.setItem('pinVerified', 'true');
      setPinVerified(true);
      setShowSetup(false);
    } catch (error) {
      throw error;
    }
  };

  const handlePinVerify = async (pin: string) => {
    try {
      const isValid = await checkPin.mutateAsync(pin);
      if (isValid) {
        sessionStorage.setItem('pinVerified', 'true');
        setPinVerified(true);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  if (isChecking) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-coral-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Checking security...</p>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return <PinSetup onPinSet={handlePinSetup} />;
  }

  if (!pinVerified) {
    return <PinEntry onPinVerify={handlePinVerify} />;
  }

  return <>{children}</>;
}
