import './App.css';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/graphql/client.ts';
import { gql } from 'graphql-request';
import { MergeRequest, Project } from '@/graphql/graphql.ts';

const GET_OPEN_MERGE_REQUESTS = gql`
  query GetOpenMergeRequests($projectPath: ID!) {
    project(fullPath: $projectPath) {
      id
      mergeRequests(state: opened, first: 10, sort: CREATED_DESC) {
        nodes {
          id
          title
          shouldBeRebased
          pipelines(first: 1) {
            nodes {
              id
              stages {
                nodes {
                  id
                  name
                  status
                  jobs {
                    nodes {
                      id
                      name
                      status
                      startedAt
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
function App() {
  const { data, isLoading, isError } = useQuery<Project>({
    queryKey: ['mrs'],
    queryFn: () => {
      const res: Promise<Project> = client.request(GET_OPEN_MERGE_REQUESTS, {
        projectPath: '', // TODO,
      });
      return res;
    },
  });

  if (isLoading) {
    return <>is loading</>;
  }

  if (isError) {
    return <>Error</>;
  }

  const { project } = data;
  const { mergeRequests } = project;
  const mrs: MergeRequest[] = mergeRequests.nodes;

  console.log(mergeRequests);
  return (
    <>
      {mrs.map((mr) => {
        return (
          <div key={mr.id}>
            <h1>{mr.title}</h1>
          </div>
        );
      })}
    </>
  );
}

export default App;
