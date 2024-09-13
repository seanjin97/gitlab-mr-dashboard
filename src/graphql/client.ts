import { GraphQLClient } from 'graphql-request';

export const client = new GraphQLClient(
  'https://sgts.gitlab-dedicated.com/api/graphql',
  {
    headers: {
      Authorization: `Bearer `, // TODO
    },
  }
);
