export const useApi = () => {
  const config = useRuntimeConfig();

  return $fetch.create({
    baseURL: config.public.apiBase,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
    },
  });
};
