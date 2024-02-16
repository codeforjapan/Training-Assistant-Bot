export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    const res = await fetch('/api/auth/user');
    if (to.path === '/login') {
      if (res.ok) {
        return navigateTo('/');
      }
      return;
    }

    if (!res.ok) {
      return navigateTo('/login');
    }
  } catch (e) {
    return navigateTo('/login');
  }
});
