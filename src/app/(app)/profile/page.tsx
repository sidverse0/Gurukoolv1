'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';


export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout Error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
      });
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'GU';
    return name.substring(0, 2).toUpperCase();
  }

  // A simple hashing function to create a 6-digit alphanumeric code from UID
  const formatUid = (uid: string | undefined): string => {
    if (!uid) return '******';
    
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        const char = uid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }

    // Use a large prime number to mix the hash
    const mixedHash = Math.abs(hash * 27700159);
    
    // Take modulo to fit in 6 characters (36^6) and convert to base 36
    return mixedHash.toString(36).slice(0, 6).toUpperCase().padStart(6, '0');
  };

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="mb-8 font-headline text-3xl font-bold tracking-tight md:text-4xl">
        My Profile
      </h1>

      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage
                src={`https://api.dicebear.com/8.x/bottts/svg?seed=${user?.uid}`}
                data-ai-hint="person face"
              />
              <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-2xl">
                {user?.displayName || user?.email?.split('@')[0] || 'Guest User'}
              </CardTitle>
              <p className="text-muted-foreground">UID: {formatUid(user?.uid)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
             <div>
              <h3 className="text-lg font-semibold text-foreground">
                Account Details
              </h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                 <p><strong>Email:</strong> {user?.email}</p>
                 <p><strong>Full UID:</strong> {user?.uid}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Actions
              </h3>
              <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button variant="outline" disabled>Edit Profile</Button>
                <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
