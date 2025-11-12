'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminDashboard } from '@/components/admin-dashboard';
import { LoginForm } from '@/components/login-form';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session?.adminToken) {
      // Not authenticated, show login
      return;
    }

    // Authenticated, show dashboard
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.adminToken) {
    return <LoginForm />;
  }

  return <AdminDashboard />;
}
