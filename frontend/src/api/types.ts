export type NodeItem = { name: string };

export type NamespaceItem = { name: string };

export type PodListItem = {
  name: string;
  namespace: string;
};

export type PodDetails = {
  name: string;
  namespace: string;
  status?: string;
  nodeName?: string;
  age?: string; // якщо бекенд дає готове, ок; якщо ні — порахуємо з startTime
  restarts?: number;
  labels?: Record<string, string>;
  containers?: Array<{
    name: string;
    image?: string;
    ready?: boolean;
    restartCount?: number;
  }>;
};
