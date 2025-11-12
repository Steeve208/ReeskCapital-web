'use client';

import { useState } from 'react';
import { useFollowBonusQueue, useApproveRequest, useRejectRequest, useBulkAction } from '@/hooks/use-follow-bonus';
import { Button, Badge } from '@rsc/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@rsc/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  Filter,
  RefreshCw,
  FileText,
  CheckSquare,
  Square
} from 'lucide-react';
import { format } from 'date-fns';

export function FollowBonusQueue() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: queueData, isLoading, refetch } = useFollowBonusQueue(
    { status: filter === 'all' ? undefined : filter, search: search || undefined },
    currentPage,
    20
  );

  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();
  const bulkActionMutation = useBulkAction();

  const handleApprove = async (requestId: string) => {
    const notes = prompt('Add approval notes (optional):');
    if (notes === null) return; // User cancelled

    await approveMutation.mutateAsync({ requestId, notes: notes || undefined });
  };

  const handleReject = async (requestId: string) => {
    const notes = prompt('Rejection reason (required):');
    if (!notes || !notes.trim()) {
      alert('Rejection reason is required');
      return;
    }

    await rejectMutation.mutateAsync({ requestId, notes });
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) return;

    const notes = prompt('Add approval notes for all selected requests (optional):');
    if (notes === null) return;

    await bulkActionMutation.mutateAsync({
      requestIds: selectedRequests,
      action: 'approve',
      notes: notes || undefined,
    });

    setSelectedRequests([]);
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) return;

    const notes = prompt('Rejection reason for all selected requests (required):');
    if (!notes || !notes.trim()) {
      alert('Rejection reason is required');
      return;
    }

    await bulkActionMutation.mutateAsync({
      requestIds: selectedRequests,
      action: 'reject',
      notes,
    });

    setSelectedRequests([]);
  };

  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedRequests.length === queueData?.requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(queueData?.requests.map(r => r.id) || []);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Follow Bonus Verification Queue</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review and process follow bonus requests
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            {selectedRequests.length > 0 && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={bulkActionMutation.isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve ({selectedRequests.length})
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkReject}
                  disabled={bulkActionMutation.isLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject ({selectedRequests.length})
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or handle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRequests.length === queueData?.requests.length && queueData.requests.length > 0}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Handles</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : !queueData?.requests.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                queueData.requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={() => toggleRequestSelection(request.id)}
                        disabled={request.status !== 'PENDING'}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-muted-foreground">
                          {format(new Date(request.createdAt), 'HH:mm')}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{request.fullName}</div>
                        <div className="text-muted-foreground">{request.contactEmail}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{request.xHandle || '—'}</div>
                        <div className="text-muted-foreground">{request.telegramUsername || '—'}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {request.walletAddress.slice(0, 6)}...{request.walletAddress.slice(-4)}
                      </code>
                    </TableCell>

                    <TableCell>
                      {request.attachments.length > 0 ? (
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View ({request.attachments.length})
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">No proof</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={request.status !== 'PENDING' || approveMutation.isLoading}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          disabled={request.status !== 'PENDING' || rejectMutation.isLoading}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {queueData?.pagination && queueData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, queueData.pagination.total)} of {queueData.pagination.total} results
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <span className="text-sm">
                Page {currentPage} of {queueData.pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(queueData.pagination.totalPages, prev + 1))}
                disabled={currentPage === queueData.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
