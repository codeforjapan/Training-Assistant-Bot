import moment from 'moment';
import { useApi } from '~/composables/useApi';

export interface Project {
  id: number;
  name: string;
  description: string;
  eventDateStart: moment.Moment;
  eventDateEnd: moment.Moment;
  setting: {
    groups?: string[];
    location?: { lat: number; lon: number };
    disableGender?: boolean;
    disableGeneration?: boolean;
  };
  isDisasterTraining: boolean;
  createdAt: moment.Moment;
  updatedAt: moment.Moment;
}

export interface ProjectDetail extends Project {
  scenario: {
    id: number;
    name: string;
    disableReport: boolean;
  };
}

export interface ProjectStatistic {
  participants: any[];
  gender: {
    man: number;
    woman: number;
  };
  generation: {
    u30: number;
    u50: number;
    u70: number;
    o70: number;
  };
}

const parseSetting = (setting: any) => {
  const validSetting: any = {};
  if (!setting) {
    return validSetting;
  }
  if (
    setting.groups &&
    Array.isArray(setting.groups) &&
    setting.groups.every((s: any) => typeof s === 'string')
  ) {
    validSetting.groups = setting.groups;
  }
  if (
    setting.location &&
    !isNaN(Number(setting.location.lat)) &&
    !isNaN(Number(setting.location.lon))
  ) {
    validSetting.location = setting.location;
  }
  validSetting.disableGender = !!setting.disableGender;
  validSetting.disableGeneration = !!setting.disableGeneration;
  return validSetting;
};

export const parseServerResponse = (serverResponse: any): Project => {
  return {
    id: serverResponse.id,
    name: serverResponse.name,
    description: serverResponse.description,
    eventDateStart: moment(serverResponse.eventDateStart),
    eventDateEnd: moment(serverResponse.eventDateEnd),
    isDisasterTraining: serverResponse.is_disaster_training,
    setting: parseSetting(serverResponse.setting),
    createdAt: moment(serverResponse.createdAt),
    updatedAt: moment(serverResponse.updatedAt),
  };
};

export const list = async (): Promise<Project[]> => {
  const $api = useApi();
  const response = await $api<Project[]>('/projects').catch(() => []);
  return response.map((d: any) => {
    return parseServerResponse(d);
  });
};

export const show = async (id: number): Promise<ProjectDetail | null> => {
  const $api = useApi();
  const data = await $api<ProjectDetail>(`/projects/${id}`);
  return data
    ? Object.assign({ scenario: data.scenario }, parseServerResponse(data))
    : null;
};

export const statistic = async (
  id: number,
): Promise<ProjectStatistic | undefined> => {
  const $api = useApi();
  try {
    return await $api<ProjectStatistic>(`/projects/${id}/statistic`);
  } catch {
    return undefined;
  }
};

export const create = (params: any): Promise<Project> => {
  const $api = useApi();
  return $api<Project>(`/projects`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const destroy = async (id: number) => {
  const $api = useApi();
  try {
    return await $api(`/projects/${id}`, { method: 'DELETE' });
  } catch {
    return false;
  }
};

export const resetConfirmation = async (id: number) => {
  const $api = useApi();
  try {
    return await $api(`/projects/${id}/confirmation`, { method: 'DELETE' });
  } catch {
    return false;
  }
};
