'use client';

import { useFollowBonusStats } from '@/hooks/use-follow-bonus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@rsc/ui';
import { Clock, CheckCircle, XCircle, Database } from 'lucide-react';

export function DashboardStats() {
  const { data: stats, isLoading } = useFollowBonusStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No stats available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Requests',
      value: stats.total.toLocaleString(),
      icon: Database,
      color: 'text-blue-500',
    },
    {
      title: 'Pending',
      value: stats.pending.toLocaleString(),
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Approved',
      value: stats.approved.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Rejected',
      value: stats.rejected.toLocaleString(),
      icon: XCircle,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.approvalRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Approved / Total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats.rejectionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Rejected / Total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Proofs per Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stats.averageProofs}
            </div>
            <p className="text-xs text-muted-foreground">
              Attachments uploaded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="warning">Pending</Badge>
              <span className="text-sm text-muted-foreground">
                {stats.pending} requests awaiting review
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="success">Approved</Badge>
              <span className="text-sm text-muted-foreground">
                {stats.approved} requests processed
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="destructive">Rejected</Badge>
              <span className="text-sm text-muted-foreground">
                {stats.rejected} requests declined
              </span>
            </div>
          </div>

          {stats.lastSubmission && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Last submission: {stats.lastSubmission.toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
