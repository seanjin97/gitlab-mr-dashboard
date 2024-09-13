/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query GetOpenMergeRequests($projectPath: ID!) {\n    project(fullPath: $projectPath) {\n      id\n      mergeRequests(state: opened, first: 5, sort: CREATED_DESC) {\n        nodes {\n          id\n          title\n          description\n          createdAt\n          author {\n            name\n            avatarUrl\n          }\n          shouldBeRebased\n          webUrl\n          pipelines(first: 1) {\n            nodes {\n              id\n              status\n              stages {\n                nodes {\n                  name\n                  status\n                  jobs {\n                    nodes {\n                      id\n                      name\n                      status\n                      startedAt\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetOpenMergeRequestsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOpenMergeRequests($projectPath: ID!) {\n    project(fullPath: $projectPath) {\n      id\n      mergeRequests(state: opened, first: 5, sort: CREATED_DESC) {\n        nodes {\n          id\n          title\n          description\n          createdAt\n          author {\n            name\n            avatarUrl\n          }\n          shouldBeRebased\n          webUrl\n          pipelines(first: 1) {\n            nodes {\n              id\n              status\n              stages {\n                nodes {\n                  name\n                  status\n                  jobs {\n                    nodes {\n                      id\n                      name\n                      status\n                      startedAt\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').GetOpenMergeRequestsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
