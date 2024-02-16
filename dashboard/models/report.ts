import moment from 'moment';

export interface Report {
  id: number;
  message: string;
  location?: { lat: number; lon: number };
  img?: string;
  userId?: number;
  createdAt: moment.Moment;
  updatedAt: moment.Moment;
}

export const list = async (projectId: number): Promise<Report[]> => {
  const $api = useApi();
  const data = await $api<Report[]>(`/projects/${projectId}/reports`).catch(
    () => [],
  );
  return data.map((d: any) => {
    const location = d.geom
      ? { lon: d.geom.coordinates[0], lat: d.geom.coordinates[1] }
      : undefined;
    return {
      id: d.id,
      message: d.message,
      location,
      img: d.img,
      createdAt: moment(d.createdAt),
      updatedAt: moment(d.updatedAt),
      userId: d.userId,
    } as Report;
  });
};

export const remove = async (id: number) => {
  const $api = useApi();
  return await $api(`/reports/${id}`, { method: 'DELETE' });
};
