import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { toast } from '@/components/ui/use-toast';

// GraphQL queries and mutations
const FOLLOW_BONUS_QUEUE_QUERY = gql`
  query FollowBonusQueue($filter: FollowBonusFilter, $page: Int, $pageSize: Int) {
    followBonusQueue(filter: $filter, page: $page, pageSize: $pageSize) {
      requests {
        id
        userId
        fullName
        contactEmail
        xHandle
        telegramUsername
        walletAddress
        status
        attachments
        amount
        reviewedBy
        reviewedAt
        reviewNotes
        createdAt
        user {
          id
          email
          username
          balance
        }
      }
      pagination {
        page
        pageSize
        total
        totalPages
      }
    }
  }
`;

const FOLLOW_BONUS_STATS_QUERY = gql`
  query FollowBonusStats($filter: FollowBonusFilter) {
    followBonusStats(filter: $filter) {
      total
      pending
      approved
      rejected
      approvalRate
      rejectionRate
      averageProofs
      lastSubmission
    }
  }
`;

const APPROVE_REQUEST_MUTATION = gql`
  mutation ApproveFollowBonusRequest($requestId: ID!, $notes: String) {
    approveFollowBonusRequest(requestId: $requestId, notes: $notes) {
      id
      status
      reviewedAt
      reviewNotes
    }
  }
`;

const REJECT_REQUEST_MUTATION = gql`
  mutation RejectFollowBonusRequest($requestId: ID!, $notes: String!) {
    rejectFollowBonusRequest(requestId: $requestId, notes: $notes) {
      id
      status
      reviewedAt
      reviewNotes
    }
  }
`;

const BULK_ACTION_MUTATION = gql`
  mutation BulkFollowBonusAction($requestIds: [String!]!, $action: String!, $notes: String) {
    bulkFollowBonusAction(requestIds: $requestIds, action: $action, notes: $notes) {
      successful
      failed
      results {
        id
        status
        reviewedAt
        reviewNotes
      }
      errors {
        requestId
        error
      }
    }
  }
`;

export interface FollowBonusFilter {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface FollowBonusRequest {
  id: string;
  userId?: string;
  fullName: string;
  contactEmail: string;
  xHandle: string;
  telegramUsername?: string;
  walletAddress: string;
  status: string;
  attachments: string[];
  amount: number;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  user?: {
    id: string;
    email: string;
    username?: string;
    balance: number;
  };
}

export interface FollowBonusStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  rejectionRate: number;
  averageProofs: number;
  lastSubmission?: Date;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FollowBonusQueueResponse {
  requests: FollowBonusRequest[];
  pagination: PaginationInfo;
}

// React Query hooks
export function useFollowBonusQueue(filter?: FollowBonusFilter, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['followBonusQueue', filter, page, pageSize],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: FOLLOW_BONUS_QUEUE_QUERY,
        variables: { filter, page, pageSize },
        fetchPolicy: 'cache-first',
      });
      return data.followBonusQueue as FollowBonusQueueResponse;
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useFollowBonusStats(filter?: FollowBonusFilter) {
  return useQuery({
    queryKey: ['followBonusStats', filter],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: FOLLOW_BONUS_STATS_QUERY,
        variables: { filter },
        fetchPolicy: 'cache-first',
      });
      return data.followBonusStats as FollowBonusStats;
    },
    staleTime: 60000, // 1 minute
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes?: string }) => {
      const { data } = await apolloClient.mutate({
        mutation: APPROVE_REQUEST_MUTATION,
        variables: { requestId, notes },
      });
      return data.approveFollowBonusRequest;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['followBonusQueue'] });
      queryClient.invalidateQueries({ queryKey: ['followBonusStats'] });

      toast({
        title: 'Request Approved',
        description: `Request ${variables.requestId} has been approved successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve the request.',
        variant: 'destructive',
      });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      const { data } = await apolloClient.mutate({
        mutation: REJECT_REQUEST_MUTATION,
        variables: { requestId, notes },
      });
      return data.rejectFollowBonusRequest;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['followBonusQueue'] });
      queryClient.invalidateQueries({ queryKey: ['followBonusStats'] });

      toast({
        title: 'Request Rejected',
        description: `Request ${variables.requestId} has been rejected.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject the request.',
        variant: 'destructive',
      });
    },
  });
}

export function useBulkAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestIds,
      action,
      notes
    }: {
      requestIds: string[];
      action: 'approve' | 'reject';
      notes?: string;
    }) => {
      const { data } = await apolloClient.mutate({
        mutation: BULK_ACTION_MUTATION,
        variables: { requestIds, action, notes },
      });
      return data.bulkFollowBonusAction;
    },
    onSuccess: (data) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['followBonusQueue'] });
      queryClient.invalidateQueries({ queryKey: ['followBonusStats'] });

      const { successful, failed } = data;
      toast({
        title: 'Bulk Action Completed',
        description: `Successfully processed ${successful} requests${failed > 0 ? `, ${failed} failed` : ''}.`,
        variant: failed > 0 ? 'destructive' : 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Action Failed',
        description: error.message || 'Failed to process bulk action.',
        variant: 'destructive',
      });
    },
  });
}
