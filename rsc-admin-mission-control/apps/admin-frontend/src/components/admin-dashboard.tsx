'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { Button } from '@rsc/ui';
import { FollowBonusQueue } from './follow-bonus-queue';
import { DashboardStats } from './dashboard-stats';
import { CommandPalette } from './command-palette';
import { LogOut, Settings, User } from 'lucide-react';

export function AdminDashboard() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                RSC Admin Mission Control
              </h1>
              <p className="text-sm text-muted-foreground">
                Enterprise administration dashboard
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {session?.user?.email}
                </span>
              </div>

              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Follow Bonus Queue */}
        <div className="mb-8">
          <FollowBonusQueue />
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
