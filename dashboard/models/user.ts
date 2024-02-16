import moment from 'moment';

export interface User {
  id: number;
  name: string;
  username: string;
  isAdmin: boolean;
  isConfirmed: boolean;
  isBlocked: boolean;
  createdAt: moment.Moment;
}

export const list = async () => {
  const $api = useApi();
  const data = await $api<User[]>('/users').catch(() => []);
  return data
    .filter((d) => d.username !== 'admin')
    .map((d) => {
      return {
        id: d.id,
        name: d.name,
        username: d.username,
        isAdmin: d.isAdmin,
        isConfirmed: d.isConfirmed,
        isBlocked: d.isBlocked,
        createdAt: moment(d.createdAt),
      };
    });
};
