import moment from 'moment';

export interface ScenarioTask {
  id: number;
  name: string;
  removable: boolean;
  order: number;
  isInitial: boolean;
  scenarioId: number;
  tasks: any[];
  finishedAt: moment.Moment;
  createdAt: moment.Moment;
  updatedAt: moment.Moment;
}

export const createScenarioTask = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    removable: data.removable,
    order: data.order,
    tasks: data.tasks,
    isInitial: data.isInitial,
    scenarioId: data.scenarioId,
    finishedAt: data.finishedAt ? moment(data.finishedAt) : null,
    createdAt: moment(data.createdAt),
    updatedAt: moment(data.updatedAt),
  } as ScenarioTask;
};

export const show = async (id: number) => {
  const $api = useApi();
  const data = await $api(`/scenario-tasks/${id}`).catch(() => []);
  return createScenarioTask(data);
};

export const update = (scenarioTask: ScenarioTask) => {
  const $api = useApi();
  return $api(`/scenario-tasks/${scenarioTask.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      tasks: scenarioTask.tasks,
      name: scenarioTask.name,
    }),
  });
};

export const create = async (
  scenarioId: number,
  order: number,
  name: string,
) => {
  const $api = useApi();
  const data = await $api(`/scenario-tasks`, {
    method: 'POST',
    body: JSON.stringify({ scenarioId, order, name }),
  });
  return createScenarioTask(data);
};
