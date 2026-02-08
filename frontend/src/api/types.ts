export type NodeItem = {
  name: string;
  status: string;
  roles: string[];
  kubeletVersion?: string | null;
  ageSeconds?: number | null;
  labels: Record<string, string>;
};

export type NamespaceItem = {
  name: string;
  status: string;
  ageSeconds?: number | null;
  labels: Record<string, string>;
};

export type PodListItem = {
  name: string;
  namespace: string;
  status: string;
  nodeName?: string | null;
  restarts: number;
  ageSeconds?: number | null;
  labels: Record<string, string>;
};

export type PodDetails = {
  name: string;
  namespace: string;
  status: string;
  nodeName?: string | null;
  podIP?: string | null;
  hostIP?: string | null;
  restarts: number;
  ageSeconds?: number | null;
  labels: Record<string, string>;
  containers: Array<{ name: string; image?: string | null }>;
  containerStatuses: Array<{
    name: string;
    ready: boolean;
    restartCount: number;
    image?: string | null;
  }>;
};
