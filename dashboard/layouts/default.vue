<template>
  <v-layout class="app-container">
    <v-app-bar app fixed flat height="60" theme="light">
      <div class="flex-shrink-0" style="width: 180px"></div>
      <v-app-bar-title
          class="flex-grow-1 text-center"
          style="font-size: 24px"
      >{{ title }}
      </v-app-bar-title
      >
      <div class="flex-shrink-0" style="width: 180px">
        <v-btn
            v-if="showBackButton"
            class="flex-shrink-0"
            dark
            variant="text"
            width="180px"
            size="x-large"
            @click.stop="backToMenu"
        >
          <v-icon size="large">mdi-chevron-left-circle</v-icon>
          <span class="ml-4">{{ $t('Menu') }}</span>
        </v-btn>
      </div>
    </v-app-bar>
    <v-main>
      <v-container
          fluid
          class="fill-height flex-column justify-start align-stretch pa-0"
      >
        <CurrentPage
            :current-page="currentPage.title"
            :is-top="currentPage.isTop"
            class="flex-grow-0 flex-shrink-0"
        ></CurrentPage>
        <slot/>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
const i18n = useI18n();
const route = useRoute();
const router = useRouter();
const showBackButton = computed(() => {
  return route.path !== '/';
});
const backToMenu = () => {
  router.push('/');
};

const title = computed(() => {
  return process.env.COMMUNITY_NAME;
});
const {state} = useCurrentPageState();
const currentPage = computed(() => {
  if (route.path === '/') {
    return {title: i18n.t('ダッシュボード'), isTop: true};
  } else if (route.path === '/projects/create') {
    return {title: i18n.t('プロジェクト作成'), isTop: false};
  }
  return {title: state.value.title, isTop: false};
});
</script>

<style lang="scss" scoped>
.v-theme--light.v-app-bar.v-toolbar {
  background-color: #525252;
  color: white;
}

.app-container {
  height: 100vh;
}

:deep(.v-container) {

  & > div.page-container {
    margin-top: 80px;
    padding: 0 40px;
    background-color: #f8f8f8;
  }
}
</style>
