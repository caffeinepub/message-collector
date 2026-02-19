import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PinEntryProps {
  onPinVerify: (pin: string) => Promise<boolean>;
}

export default function PinEntry({ onPinVerify }: PinEntryProps) {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length < 4) {
      toast.error('Please enter your PIN');
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await onPinVerify(pin);
      if (!isValid) {
        setAttempts((prev) => prev + 1);
        toast.error('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify PIN');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-coral-100 dark:bg-coral-950">
            <Lock className="h-6 w-6 text-coral-600" />
          </div>
          <CardTitle>Enter Your PIN</CardTitle>
          <CardDescription>
            Enter your PIN to access your conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={pin} onChange={setPin}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {attempts > 0 && (
                <p className="text-sm text-destructive text-center">
                  Failed attempts: {attempts}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-coral-600 hover:bg-coral-700 text-white"
              disabled={isVerifying || pin.length < 4}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Unlock'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
