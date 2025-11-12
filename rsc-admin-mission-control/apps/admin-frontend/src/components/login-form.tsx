'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@rsc/ui';
import { toast } from '@/components/ui/use-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'Login Failed',
          description: result.error,
          variant: 'destructive',
        });
      } else if (result?.ok) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to RSC Admin Mission Control',
        });
        router.push('/');
      }
    } catch (error) {
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md p-8">
        <div className="bg-card rounded-lg border shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              RSC Admin
            </h1>
            <p className="text-muted-foreground">
              Mission Control Dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="admin@rsc-chain.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Available Admin Accounts
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-muted/50 rounded p-2">
                <div className="font-medium text-primary">orion.ops@rsc-chain.com</div>
                <div className="text-muted-foreground">Password: admin123 (SUPER_ADMIN)</div>
                <div className="text-muted-foreground">Department: Executive Operations</div>
              </div>

              <div className="bg-muted/50 rounded p-2">
                <div className="font-medium text-primary">nova.ops@rsc-chain.com</div>
                <div className="text-muted-foreground">Password: nova2024 (OPS_LEAD)</div>
                <div className="text-muted-foreground">Department: Operations Lead</div>
              </div>

              <div className="bg-muted/50 rounded p-2">
                <div className="font-medium text-primary">centauri.ops@rsc-chain.com</div>
                <div className="text-muted-foreground">Password: centauri2024 (ANALYST)</div>
                <div className="text-muted-foreground">Department: Manual Review Team</div>
              </div>

              <div className="bg-muted/50 rounded p-2">
                <div className="font-medium text-primary">lyra.ops@rsc-chain.com</div>
                <div className="text-muted-foreground">Password: lyra2024 (AUDITOR)</div>
                <div className="text-muted-foreground">Department: Compliance & Audit</div>
              </div>

              <div className="bg-muted/50 rounded p-2">
                <div className="font-medium text-primary">phoenix.ops@rsc-chain.com</div>
                <div className="text-muted-foreground">Password: phoenix2024 (VIEWER)</div>
                <div className="text-muted-foreground">Department: Technical Support</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Each account has different permissions and access levels
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
