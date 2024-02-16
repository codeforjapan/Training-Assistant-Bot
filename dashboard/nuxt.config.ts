import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "@nuxtjs/i18n",
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  i18n: {
    locales: [
      {
        code: "ja",
        file: "ja.json",
      },
    ],
    lazy: true,
    langDir: "lang/",
    defaultLocale: "ja",
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
      defaultMapCenter:
        process.env.NUXT_PUBLIC_DEFAULT_MAP_CENTER || "35.681236,139.767125",
      showReportRanking: process.env.NUXT_PUBLIC_SHOW_REPORT_RANKING || "false",
    },
  },
});
