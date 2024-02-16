import moment from 'moment';
import { User } from './user';

export interface Group {
  id: number;
  name: string;
  description: string;
  createdAt: moment.Moment;
  users: User[];
}

const createGroup = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    createdAt: moment(data.createdAt),
    users: data.users || [],
  } as Group;
};

export const list = async () => {
  const $api = useApi();
  const data = await $api<Group[]>('/groups').catch(() => []);
  return data.map((d: any) => {
    return d;
  });
};

export const create = async (name?: string) => {
  const $api = useApi();
  const data = await $api('/groups', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return createGroup(data);
};

export const show = async (id: number) => {
  const $api = useApi();
  const data = await $api(`/groups/${id}`);
  return createGroup(data);
};

export const update = async (id: number, name: string, members: number[]) => {
  const $api = useApi();
  const data = await $api(`/groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, members }),
  });
  return createGroup(data);
};
