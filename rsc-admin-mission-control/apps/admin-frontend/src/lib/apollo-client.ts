import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getSession } from 'next-auth/react';

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/api/graphql`,
});

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();

  return {
    headers: {
      ...headers,
      authorization: session?.adminToken ? `Bearer ${session.adminToken}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }

  // Handle authentication errors
  if (graphQLErrors?.some(error => error.message.includes('authorization'))) {
    // Redirect to login or refresh token
    window.location.href = '/auth/login';
    return;
  }

  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          followBonusQueue: {
            keyArgs: ['filter'],
            merge(existing, incoming) {
              if (!existing) return incoming;
              return {
                ...incoming,
                requests: [...existing.requests, ...incoming.requests],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
