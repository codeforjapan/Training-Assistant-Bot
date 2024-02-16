import moment from 'moment';
import { createScenarioTask } from '@/models/scenario_tasks';
import type { ScenarioTask } from '@/models/scenario_tasks';
import { parseServerResponse as parseServerProjectResponse } from '~/models/project';
import type { Project } from '~/models/project';

export interface Scenario {
  id: number;
  name: string;
  scenarioTasks: ScenarioTask[];
  createdAt: moment.Moment;
  updatedAt: moment.Moment;
  project?: Project;
}

export const show = async (projectId: number): Promise<Scenario> => {
  const $api = useApi();
  const data = await $api<Scenario>(`/projects/${projectId}/scenario`);
  return {
    id: data.id,
    name: data.name,
    scenarioTasks: data.scenarioTasks.map(createScenarioTask),
    createdAt: moment(data.createdAt),
    updatedAt: moment(data.updatedAt),
  };
};

export const sendMessage = async (
  scenarioId: number,
  scenarioTaskId: number,
) => {
  const $api = useApi();
  await $api(`/scenarios/${scenarioId}/tasks/${scenarioTaskId}/send`, {
    method: 'POST',
  });
  return true;
};

export const resetTasks = async (scenarioId: number) => {
  const $api = useApi();
  const data = await $api<Scenario>(`/scenarios/${scenarioId}/reset`, {
    method: 'POST',
  });
  return {
    id: data.id,
    name: data.name,
    scenarioTasks: data.scenarioTasks.map(createScenarioTask),
    createdAt: moment(data.createdAt),
    updatedAt: moment(data.updatedAt),
  };
};

export const update = (scenario: Scenario) => {
  const $api = useApi();
  return $api(`/scenarios/${scenario.id}`, {
    method: 'PUT',
    body: JSON.stringify({ scenarioTasks: scenario.scenarioTasks }),
  });
};

export const list = async () => {
  const $api = useApi();
  const data = await $api<Scenario[]>(`/scenarios`);
  return data.map((d: any) => {
    d.project = parseServerProjectResponse(d.project);
    return d;
  });
};
