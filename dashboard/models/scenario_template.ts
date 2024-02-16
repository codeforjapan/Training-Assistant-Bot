import moment from 'moment';

export interface ScenarioTemplate {
  id: number;
  name: string;
  createdAt: moment.Moment;
  updatedAt: moment.Moment;
}

export const list = async (): Promise<ScenarioTemplate[]> => {
  const $api = useApi();
  const data = await $api<ScenarioTemplate[]>(`/scenario-templates`).catch(
    () => [],
  );
  return data.map(
    (d: any) =>
      ({
        id: d.id,
        name: d.name,
        createdAt: moment(d.createdAt),
        updatedAt: moment(d.updatedAt),
      }) as ScenarioTemplate,
  );
};
