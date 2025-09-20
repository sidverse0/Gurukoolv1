
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogState, setDialogState] = useState<{ open: boolean; title: string; description: string; variant: 'success' | 'destructive' }>({ open: false, title: '', description: '', variant: 'success' });


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setDialogState({
        open: true,
        title: 'Logged in successfully!',
        description: 'Welcome back!',
        variant: 'success',
      });
      // Redirect after a short delay to allow the user to see the message
      setTimeout(() => router.push('/home'), 1000);
    } catch (error: any) {
      console.error('Login Error:', error);
      setDialogState({
        open: true,
        title: 'Login Failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <>
    <Card className="w-full max-w-sm">
      <form onSubmit={handleLogin}>
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Icons.Logo className="h-14 w-14" />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log In'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
    <Dialog open={dialogState.open} onOpenChange={(open) => setDialogState({...dialogState, open})}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
           {dialogState.variant === 'success' ? <CheckCircle className="h-16 w-16 text-green-500" /> : <AlertTriangle className="h-16 w-16 text-red-500" />}
          <DialogTitle className="font-headline text-2xl">{dialogState.title}</DialogTitle>
          <DialogDescription>
            {dialogState.description}
          </DialogDescription>
        </DialogHeader>
        <Button onClick={() => {
            setDialogState({ ...dialogState, open: false });
            if (dialogState.variant === 'success') {
                router.push('/home');
            }
        }}>Okay</Button>
      </DialogContent>
    </Dialog>
    </>
  );
}
