
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
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
                src="https://picsum.photos/seed/user-avatar/200"
                data-ai-hint="person face"
              />
              <AvatarFallback>GU</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-2xl">
                Guest User
              </CardTitle>
              <p className="text-muted-foreground">guest.user@edustream.com</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Actions
              </h3>
              <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button variant="outline">Edit Profile</Button>
                <Button variant="destructive">Log Out</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
