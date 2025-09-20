
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { CheckCircle, Loader2, LogOut, KeyRound, Trash2, Moon, Sun, AlertTriangle, User, Settings, GraduationCap, Heart, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/theme-provider';
import { useFavorites } from '@/hooks/use-favorites';
import { usePurchases } from '@/hooks/use-purchases';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { favorites } = useFavorites();
  const { purchasedBatchIds } = usePurchases();


  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [dialogState, setDialogState] = useState<{ open: boolean; title: string; description: string; variant: 'success' | 'destructive' }>({ open: false, title: '', description: '', variant: 'success' });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // No need for a dialog, the layout effect will redirect to login
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

  const handleSaveName = async () => {
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

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      setDialogState({ open: true, title: 'Email Sent', description: 'A password reset link has been sent to your email address.', variant: 'success' });
    } catch (error) {
      console.error('Password Reset Error:', error);
       setDialogState({ open: true, title: 'Request Failed', description: 'Could not send password reset email. Please try again later.', variant: 'destructive' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // First, delete user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);
      const favoritesDocRef = doc(db, 'favorites', user.uid);
      await deleteDoc(favoritesDocRef);
      
      // Then, delete the user from Authentication
      await deleteUser(user);

      // No need to show a dialog, the layout effect will handle redirection.
      // The user is gone, so no state can be updated.
    } catch (error: any) {
      console.error('Account Deletion Error:', error);
      setDialogState({
        open: true,
        title: 'Deletion Failed',
        description: error.code === 'auth/requires-recent-login'
          ? 'This is a sensitive operation. Please log out and log back in before deleting your account.'
          : 'Could not delete your account. Please try again.',
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

  return (
    <>
    <div className="container mx-auto max-w-4xl">
       <div className="mb-8 flex items-center gap-4">
        <div className="relative vip-avatar-frame">
          <Avatar className="h-24 w-24 border-4 border-transparent">
            <AvatarImage src={user?.photoURL || ''} data-ai-hint="person face" />
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <div className="flex items-center gap-2">
             <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
              {user?.displayName || 'Guest User'}
            </h1>
            <ShieldCheck className="h-7 w-7 text-green-500" />
          </div>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="flex flex-col items-center justify-center p-4 bg-primary/10">
          <GraduationCap className="h-8 w-8 text-primary" />
          <p className="mt-2 text-2xl font-bold">{purchasedBatchIds.length}</p>
          <p className="text-sm text-muted-foreground">Batches Purchased</p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4 bg-accent/10">
          <Heart className="h-8 w-8 text-accent" />
          <p className="mt-2 text-2xl font-bold">{favorites.length}</p>
          <p className="text-sm text-muted-foreground">Favorite Videos</p>
        </Card>
         <Card className="flex flex-col items-center justify-center p-4 bg-secondary">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <p className="mt-2 text-2xl font-bold">Verified</p>
          <p className="text-sm text-muted-foreground">Student Status</p>
        </Card>
      </div>


      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile"><User className="mr-2"/> Edit Profile</TabsTrigger>
          <TabsTrigger value="account"><Settings className="mr-2"/> Account</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Update Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1"
                  disabled={isSaving}
                />
              </div>
               <div className="flex flex-wrap gap-2">
                <Button onClick={handleSaveName} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                  Save Name
                </Button>
                <Button onClick={handleAvatarChange} variant="outline" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                  Change Avatar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="account" className="mt-4">
            <div className="space-y-6">
               <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' ? 'Dark mode is enabled' : 'Light mode is enabled'}
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  aria-label="Toggle dark mode"
                />
              </div>

               <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Send a password reset link to your email.
                  </p>
                </div>
                <Button variant="outline" onClick={handlePasswordReset}><KeyRound/> Reset</Button>
              </div>

               <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div>
                  <h3 className="font-medium text-destructive">Log Out</h3>
                  <p className="text-sm text-destructive/80">
                    End your current session.
                  </p>
                </div>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"><LogOut/></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be returned to the login screen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">Log Out</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div>
                  <h3 className="font-medium text-destructive">Delete Account</h3>
                  <p className="text-sm text-destructive/80">
                    Permanently delete your account and all data.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive"><Trash2/></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers. Type <strong className="text-foreground">{user?.email}</strong> to confirm.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input 
                      placeholder="Type email to confirm"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount} 
                        disabled={deleteConfirmation !== user?.email || isSaving}
                      >
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Delete Forever'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
    <Dialog open={dialogState.open} onOpenChange={(open) => setDialogState({...dialogState, open})}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
            {dialogState.variant === 'success' ? <CheckCircle className="h-16 w-16 text-green-500" /> : <AlertTriangle className="h-16 w-16 text-destructive" />}
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

    