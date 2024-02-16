<template>
  <div class="page-container d-flex flex-column flex-grow-1">
    <div class="flex-grow-1 flex-shrink-0">
      <v-card flat color="transparent mt-5">
        <v-card-title
          class="text-h5 d-flex align-center"
          style="border-bottom: 1px solid #000000"
        >
          <span>{{ $t('プロジェクト一覧') }}</span>
          <v-spacer />
          <v-btn
            elevation="0"
            color="#6479C0"
            dark
            size="x-large"
            style="font-size: 24px"
            :to="`/projects/create`"
            nuxt
            >{{ $t('新規作成') }}
          </v-btn>
        </v-card-title>
        <v-card-text class="project-list px-0 pt-5">
          <MButton
            v-for="project in projects"
            :key="project.id"
            @click="onSelectProject(project)"
          >
            <v-icon x-large style="vertical-align: top">mdi-calendar</v-icon>
            <span class="px-4"
              >{{ project.name }} ({{ getDateTitle(project) }})</span
            >
          </MButton>
        </v-card-text>
      </v-card>
    </div>
    <div class="flex-grow-1 flex-shrink-0">
      <v-card flat color="transparent mt-5">
        <v-card-title class="text-h5" style="border-bottom: 1px solid #000000"
          >{{ $t('メニュー') }}
        </v-card-title>
        <v-card-text class="menu-buttons px-0 pt-5">
          <MButton to="/groups" nuxt>{{ $t('グループ管理') }}</MButton>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Project } from '~/models/project';
import { list as listProject } from '~/models/project';

const i18n = useI18n();
const router = useRouter();

const projects = ref<Project[]>([]);
const fetchData = async () => {
  projects.value = await listProject().catch((e) => {
    console.error(e);
    return [];
  });
};

const getDateTitle = (project: Project) => {
  const startDate = project.eventDateStart.format(
    i18n.t('YYYY年MM月DD日') as string,
  );
  const endDate = project.eventDateEnd.format(
    i18n.t('YYYY年MM月DD日') as string,
  );
  return startDate === endDate ? `${startDate}` : `${startDate} - ${endDate}`;
};

const { setState } = useCurrentPageState();
const onSelectProject = (project: Project) => {
  const dateTitle = getDateTitle(project);
  const title = `${i18n.t('プロジェクト')} - ${dateTitle}${project.name}`;
  setState({ title });
  router.push(`/projects/${project.id}`);
};

fetchData();
</script>

<style lang="scss" scoped>
.project-list {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 20px;
  max-height: 40vh;
  overflow-y: auto;
}

.menu-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;

  button {
    border: 1px solid #707070 !important;
    font-size: 24px;
  }
}
</style>
