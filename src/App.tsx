import { useEffect, useState } from 'react';
import './App.css';
import { useQuery } from '@tanstack/react-query';
import { getClient, initializeClient } from '@/graphql/client.ts';
import { gql } from 'graphql-request';
import {
  CiJobStatus,
  Maybe,
  MergeRequest,
  PipelineStatusEnum,
  Project,
} from '@/graphql/graphql.ts';

import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Badge } from '@/components/ui/badge.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx';
import { ColourModeToggle } from '@/components/colour-mode-toggle.tsx';
import {
  NavigationMenu,
  NavigationMenuList,
} from '@radix-ui/react-navigation-menu';
import { NavigationMenuItem } from './components/ui/navigation-menu';
import {
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleDot,
  CirclePlay,
  CircleX,
  LoaderCircle,
  PlayCircle,
} from 'lucide-react';

const GET_OPEN_MERGE_REQUESTS = gql`
  query GetOpenMergeRequests($projectPath: ID!) {
    project(fullPath: $projectPath) {
      id
      mergeRequests(state: opened, first: 5, sort: CREATED_DESC) {
        nodes {
          id
          title
          description
          createdAt
          author {
            name
            avatarUrl
          }
          shouldBeRebased
          webUrl
          pipelines(last: 1) {
            nodes {
              id
              status
              stages {
                nodes {
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
  const [apiToken, setApiToken] = useState<string>('');
  const [projectPath, setProjectPath] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [expandedMR, setExpandedMR] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const storedToken = localStorage.getItem('gitlabApiToken');
    const storedProjectPath = localStorage.getItem('projectPath');

    if (storedToken && storedProjectPath) {
      setApiToken(storedToken);
      setProjectPath(storedProjectPath);
      initializeClient(storedToken);
      setIsConfigured(true);
    }
  }, []);

  const saveConfig = () => {
    if (apiToken && projectPath) {
      localStorage.setItem('gitlabApiToken', apiToken);
      localStorage.setItem('projectPath', projectPath);
      initializeClient(apiToken);
      setIsConfigured(true);
    }
  };

  const { data, isLoading, isError } = useQuery<{ project: Project }>({
    queryKey: ['mrs', projectPath],
    queryFn: () => {
      return getClient().request(GET_OPEN_MERGE_REQUESTS, { projectPath });
    },
    staleTime: 60000,
    enabled: isConfigured,
  });

  const toggleMRExpansion = (mrId?: string) => {
    if (mrId) {
      setExpandedMR(expandedMR === mrId ? null : mrId);
    } else {
      setExpandedMR(null);
    }
  };

  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center h-screen p-4 dark:bg-zinc-950 bg-zinc-50">
        <Card className="w-full max-w-[350px]">
          <CardHeader>
            <CardTitle>GitLab Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="GitLab API Token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
              />
              <Input
                placeholder="Project Path"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
              />
              <Button onClick={saveConfig} className="w-full">
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>An error occurred</div>;
  if (!data) return <div>No data available</div>;

  const mrs: Maybe<MergeRequest>[] = data.project.mergeRequests?.nodes || [];

  const renderPipelineStatusIcon = (pipelineStatus?: PipelineStatusEnum) => {
    switch (pipelineStatus) {
      case PipelineStatusEnum.SUCCESS:
        return <CircleCheck className="h-5 w-5" />;
      case PipelineStatusEnum.CANCELED:
      case PipelineStatusEnum.FAILED:
        return <CircleX className="h-5 w-5" />;
      case PipelineStatusEnum.MANUAL:
      case PipelineStatusEnum.SKIPPED:
        return <PlayCircle className="h-5 w-5" />;
      case PipelineStatusEnum.RUNNING:
        return <LoaderCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getPipelineStatusColour = (pipelineStatus?: PipelineStatusEnum) => {
    switch (pipelineStatus) {
      case PipelineStatusEnum.SUCCESS:
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case PipelineStatusEnum.CANCELED:
      case PipelineStatusEnum.FAILED:
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
      case PipelineStatusEnum.MANUAL:
      case PipelineStatusEnum.SKIPPED:
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      case PipelineStatusEnum.RUNNING:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100';
    }
  };

  const renderJobIcon = (jobStatus?: Maybe<CiJobStatus>) => {
    switch (jobStatus) {
      case CiJobStatus.SUCCESS:
        return <CircleCheck className="h-4 w-4" />;
      case CiJobStatus.CANCELED:
      case CiJobStatus.FAILED:
        return <CircleX className="h-4 w-4" />;
      case CiJobStatus.MANUAL:
      case CiJobStatus.SKIPPED:
        return <CirclePlay className="h-4 w-4" />;
      case CiJobStatus.RUNNING:
        return <LoaderCircle className="h-4 w-4" />;
      case CiJobStatus.CREATED:
        return <CircleDot className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getJobColour = (jobStatus?: Maybe<CiJobStatus>) => {
    switch (jobStatus) {
      case CiJobStatus.SUCCESS:
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case CiJobStatus.CANCELED:
      case CiJobStatus.FAILED:
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
      case CiJobStatus.MANUAL:
      case CiJobStatus.SKIPPED:
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      case CiJobStatus.RUNNING:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100';
    }
  };

  const renderStageIcon = (stageStatus?: Maybe<string>) => {
    switch (stageStatus) {
      case 'success':
        return <CircleCheck className="h-4 w-4" />;
      case 'failed':
        return <CircleX className="h-4 w-4" />;
      case 'skipped':
        return <CirclePlay className="h-4 w-4" />;
      case 'running':
        return <LoaderCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStageStatusColour = (stageStatus?: Maybe<string>) => {
    switch (stageStatus) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
      case 'skipped':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      case 'running':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100';
    }
  };

  const toggleStageExpansion = (mrId: string, stageName: string) => {
    setExpandedStages((prev) => ({
      ...prev,
      [`${mrId}-${stageName}`]: !prev[`${mrId}-${stageName}`],
    }));
  };

  return (
    <div className="p-8 w-full min-h-full dark:bg-zinc-950 bg-zinc-50">
      <NavigationMenu>
        <NavigationMenuList className="flex justify-between">
          <NavigationMenuItem>
            <h1 className="text-2xl font-bold mb-4 dark:text-white">
              Merge requests
            </h1>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <ColourModeToggle />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <Card className="dark:bg-zinc-900">
        {mrs.map((mr, index) => (
          <Collapsible
            key={mr?.id}
            open={expandedMR === mr?.id}
            onOpenChange={() => toggleMRExpansion(mr?.id)}
          >
            <CollapsibleTrigger asChild>
              <div className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                <div className="flex items-cen=ter justify-between">
                  <div className="flex-1">
                    <span className="font-medium dark:text-white">
                      {mr?.title}
                    </span>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      !{mr?.iid} opened{' '}
                      {new Date(mr?.createdAt).toLocaleString()} by{' '}
                      {mr?.author?.name}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {mr?.pipelines?.nodes && mr.pipelines.nodes.length > 0 && (
                      <div
                        className={`${getPipelineStatusColour(
                          mr.pipelines.nodes[0]?.status
                        )} rounded-full `}
                      >
                        {renderPipelineStatusIcon(
                          mr.pipelines.nodes[0]?.status
                        )}
                      </div>
                    )}
                    <Badge
                      variant={
                        mr?.shouldBeRebased ? 'destructive' : 'secondary'
                      }
                    >
                      {mr?.shouldBeRebased ? 'Needs Rebase' : 'Ready'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 bg-gray-50 dark:bg-zinc-800">
                <h3 className="font-semibold mb-2 dark:text-white">
                  Pipeline Jobs
                </h3>
                {mr?.pipelines?.nodes?.at(0)?.stages?.nodes?.map((stage) => (
                  <Collapsible
                    key={`${mr.id}-${stage?.name}`}
                    open={expandedStages[`${mr.id}-${stage?.name}`]}
                    onOpenChange={() =>
                      toggleStageExpansion(mr.id, stage?.name || '')
                    }
                  >
                    <CollapsibleTrigger className="flex items-center w-full py-2 text-left dark:text-white">
                      {expandedStages[`${mr.id}-${stage?.name}`] ? (
                        <ChevronDown className="mr-2 h-4 w-4" />
                      ) : (
                        <ChevronRight className="mr-2 h-4 w-4" />
                      )}
                      <h4 className="font-medium">{stage?.name}</h4>
                      <span
                        className={`${getStageStatusColour(stage?.status)} rounded-full ml-1 `}
                      >
                        {renderStageIcon(stage?.status)}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                        {stage?.jobs?.nodes?.map((job) => (
                          <div
                            key={job?.id}
                            className="flex items-center space-x-2 bg-white dark:bg-zinc-700 p-2 rounded shadow-sm"
                          >
                            <span
                              className={`${getJobColour(job?.status)} rounded-full `}
                            >
                              {renderJobIcon(job?.status)}
                            </span>
                            <span className="text-sm truncate dark:text-white">
                              {job?.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CollapsibleContent>
            {index < mrs.length - 1 && (
              <Separator className="dark:bg-zinc-700" />
            )}
          </Collapsible>
        ))}
      </Card>
    </div>
  );
}

export default App;
