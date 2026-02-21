import { api } from "./client";

export type MonitoringOverview = {
  nodes_total: number;
  nodes_ready: number;
  pods_running: number;
  restarts_15m: number;
};

export async function getMonitoringOverview(): Promise<MonitoringOverview> {
  const { data } = await api.get<MonitoringOverview>("/monitoring/overview");
  return data;
}
