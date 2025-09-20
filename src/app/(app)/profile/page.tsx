
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, updateDoc } from 'firebase/firestore';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [dialogState, setDialogState] = useState<{ open: boolean; title: string; description: string; variant: 'success' | 'destructive' }>({ open: false, title: '', description: '', variant: 'success' });


  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDialogState({
        open: true,
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        variant: 'success',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout Error:', error);
      setDialogState({
        open: true,
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!displayName.trim() || displayName.trim().length < 3) {
      setDialogState({
        open: true,
        title: 'Invalid Name',
        description: 'Name must be at least 3 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { displayName: displayName.trim() });

      setDialogState({ open: true, title: 'Profile Updated', description: 'Your name has been updated.', variant: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile Update Error:', error);
      setDialogState({
        open: true,
        title: 'Update Failed',
        description: 'Could not update your name. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async () => {
    if (!user) return;
    setIsSaving(true);
    const newSeed = Math.random().toString(36).substring(2, 10);
    const newAvatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${newSeed}`;

    try {
      await updateProfile(user, { photoURL: newAvatarUrl });
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { photoURL: newAvatarUrl });
      setDialogState({ open: true, title: 'Avatar Changed!', description: 'Your new avatar is now active.', variant: 'success' });
    } catch (error) {
      console.error('Avatar Update Error:', error);
       setDialogState({
        open: true,
        title: 'Update Failed',
        description: 'Could not update your avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'GU';
    return name.substring(0, 2).toUpperCase();
  };

  const formatUid = (uid: string | undefined): string => {
    if (!uid) return '******';
    return uid.substring(0, 6).toUpperCase().padStart(6, '0');
  };

  return (
    <>
    <div className="container mx-auto max-w-2xl">
      <h1 className="mb-8 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        My Profile
      </h1>

      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-br from-primary/80 to-primary/60 p-6 text-primary-foreground">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white/50">
              <AvatarImage src={user?.photoURL || ''} data-ai-hint="person face" />
              <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-headline text-2xl">
                  {user?.displayName || 'Guest User'}
                </CardTitle>
                <CheckCircle className="h-6 w-6 text-sky-300 fill-white" />
              </div>
              <p className="text-white/80">UID: {formatUid(user?.uid)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1"
                  disabled={isSaving}
                />
              </div>
              <Button onClick={handleAvatarChange} variant="outline" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                Change Avatar
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Account Details</h3>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Full UID:</strong> {user?.uid}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Actions</h3>
                <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    Log Out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    <Dialog open={dialogState.open} onOpenChange={(open) => setDialogState({...dialogState, open})}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
            {dialogState.variant === 'success' ? <CheckCircle className="h-16 w-16 text-green-500" /> : <CheckCircle className="h-16 w-16 text-red-500" />}
          <DialogTitle className="font-headline text-2xl">{dialogState.title}</DialogTitle>
          <DialogDescription>
            {dialogState.description}
          </DialogDescription>
        </DialogHeader>
        <Button onClick={() => setDialogState({ ...dialogState, open: false })}>Okay</Button>
      </DialogContent>
    </Dialog>
    </>
  );
}
