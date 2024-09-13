import { GraphQLClient } from 'graphql-request';

let client: GraphQLClient | null = null;

export function initializeClient(token: string) {
  client = new GraphQLClient('https://sgts.gitlab-dedicated.com/api/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getClient(): GraphQLClient {
  if (!client) {
    throw new Error(
      'GraphQL client has not been initialized. Call initializeClient() first.'
    );
  }
  return client;
}
