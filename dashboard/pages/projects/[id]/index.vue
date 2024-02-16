<template>
  <div class="page-container d-flex flex-column flex-grow-1">
    <div class="flex-shrink-0">
      <v-card flat color="transparent mt-5">
        <v-card-title class="headline">{{
          $t('選択されているシナリオ')
        }}</v-card-title>
        <v-card-text>
          <div
            class="d-flex align-center"
            style="
              font-size: 24px;
              border: 1px solid #707070;
              height: 90px;
              background-color: #ebe8e8;
            "
          >
            <div
              class="text-left pl-8 flex-grow-1"
              style="font-size: 24px; color: black"
            >
              {{ scenario.name }}
            </div>
            <div class="mr-6">
              <v-btn
                block
                color="#6479C0"
                dark
                size="x-large"
                class="elevation-0"
                style="font-size: 24px"
                :to="`/projects/${id}/scenario`"
                nuxt
                >{{ $t('シナリオ送信') }}</v-btn
              >
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    <div v-if="!disableReport" class="flex-shrink-0">
      <ProjectList
        :reports="reports"
        :center="center"
        :project-id="id"
        @remove="onRemoveReport"
      ></ProjectList>
    </div>
    <div class="flex-shrink-0">
      <ProjectStatistic
        :data="statisticData"
        :show-confirmed-chart="showConfirmedChart"
        :show-generation-chart="showGenerationChart"
        :show-gender-chart="showGenderChart"
        :show-report-ranking="showReportRanking"
        :ranking-data="rankingData"
        :can-reset-confirmation="disableReport"
        @reset-confirmation="onResetConfirmation"
      ></ProjectStatistic>
    </div>
    <div class="flex-shrink-0 d-flex mb-8">
      <v-btn
        class="flex-grow-1"
        height="60"
        style="border: 1px solid #525252"
        color="#CECECE"
        flat
        size="x-large"
        @click="copyProject"
      >
        <v-icon size="x-large" class="mr-8">mdi-content-copy</v-icon>
        {{ $t('このプロジェクトをコピーする') }}
      </v-btn>
      <v-spacer
        style="width: 60px"
        class="flex-shrink-0 flex-grow-0"
      ></v-spacer>
      <v-btn
        class="flex-grow-1"
        height="60"
        style="border: 1px solid #525252"
        color="#CECECE"
        flat
        size="x-large"
        @click="showDeleteConfirmDialog"
      >
        <v-icon size="x-large" class="mr-8">mdi-delete</v-icon>
        {{ $t('このプロジェクトを削除する') }}
      </v-btn>
    </div>
    <v-dialog v-model="dialog" persistent max-width="50vw">
      <v-card>
        <v-card-title class="headline">
          {{ $t('確認') }}
        </v-card-title>
        <v-card-text>
          {{
            $t('本当にこのプロジェクトを削除してよろしいですか？')
          }}</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="" variant="text" @click="dialog = false">
            {{ $t('キャンセル') }}
          </v-btn>
          <v-btn color="red" variant="text" @click="deleteProject">
            {{ $t('削除') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  type ProjectDetail,
  show as showProject,
  statistic as getProjectStatistic,
  destroy as destroyProject,
  resetConfirmation,
} from '~/models/project';
import { type Report, list as listReports } from '~/models/report';
import { type User, list as listUsers } from '~/models/user';

const i18n = useI18n();
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const id = Number(route.params.id);
const project = ref<ProjectDetail | undefined>();
const disableReport = computed(() => {
  return project.value?.scenario?.disableReport;
});
const scenario = computed(() =>
  project.value && project.value.scenario ? project.value.scenario : {},
);
const defaultMapCenter = config.public.defaultMapCenter
  ? config.public.defaultMapCenter.split(',').map((n) => Number(n.trim()))
  : [34.811065, 135.341085];
const center = computed(() =>
  project.value && project.value.setting && project.value.setting.location
    ? [project.value.setting.location.lat, project.value.setting.location.lon]
    : defaultMapCenter,
);
const statisticData = reactive({
  participants: [] as any[],
  gender: { man: 0, woman: 0 },
  generation: { u30: 0, u50: 0, u70: 0, o70: 0 },
});

const showConfirmedChart = computed(() => {
  return !!(
    project.value &&
    project.value.setting &&
    project.value.setting.groups &&
    project.value.setting.groups.length > 0
  );
});
const showGenerationChart = computed(() => {
  return !!(
    project.value &&
    project.value.setting &&
    !project.value.setting.disableGeneration
  );
});
const showGenderChart = computed(() => {
  return !!(
    project.value &&
    project.value.setting &&
    !project.value.setting.disableGender
  );
});

const reports = ref<Report[]>([]);

const pollingTimer = reactive({
  statistic: 0,
  report: 0,
});
onBeforeUnmount(() => {
  window.clearInterval(pollingTimer.statistic);
  window.clearInterval(pollingTimer.report);
});

const getReports = async () => {
  reports.value = await listReports(id).catch((e: any) => {
    console.error(e);
    return [];
  });
};
const getStatistic = async () => {
  const data = await getProjectStatistic(id).catch((e: any) => {
    console.error(e);
    return false;
  });
  if (typeof data !== 'object') {
    return;
  }
  if (project.value && project.value.setting.groups) {
    statisticData.participants = project.value.setting.groups.map((group) => {
      const d = data.participants.find((d) => d.group === group);
      return {
        group,
        total: d ? d.total : 0,
        confirmed: d ? d.confirmed : 0,
      };
    });
  } else {
    statisticData.participants = data.participants;
  }
  statisticData.gender = data.gender;
  statisticData.generation = data.generation;
};

const pageState = useCurrentPageState();
const fetchData = async () => {
  const detail = await showProject(id).catch((e: any) => {
    console.error(e);
  });
  if (!detail) {
    // TODO show dialog
    return;
  }
  project.value = detail;
  const startDate = detail.eventDateStart.format(
    i18n.t('YYYY年MM月DD日') as string,
  );
  const endDate = detail.eventDateEnd.format(
    i18n.t('YYYY年MM月DD日') as string,
  );
  const dateTitle =
    startDate === endDate ? `${startDate}` : `${startDate} - ${endDate}`;
  const title = `${i18n.t('プロジェクト')} - ${detail.name} (${dateTitle})`;
  pageState.setState({ title });
  pollingTimer.statistic = window.setInterval(getStatistic, 60 * 1000);
  pollingTimer.report = window.setInterval(getReports, 60 * 1000);
};
fetchData()
  .then(() => {
    getStatistic();
  })
  .catch(() => {
    getStatistic();
  });
getReports();

const dialog = ref(false);
const showDeleteConfirmDialog = () => {
  dialog.value = true;
};
const deleteProject = async () => {
  await destroyProject(id);
  dialog.value = false;
  router.push('/');
};

const { setProject } = useCopyProjectState();
const copyProject = () => {
  if (!project.value) {
    return;
  }
  setProject(project.value);
  router.push('/projects/create');
};

const showReportRanking = computed(
  () => config.public.showReportRanking === 'true' && !disableReport.value,
);
const users = ref<User[]>([]);
listUsers()
  .then((data) => (users.value = data))
  .catch(console.error);
const rankingData = computed(() => {
  const data: { id: number; name: string; total: number }[] = [];
  reports.value.forEach((report) => {
    const exist = data.find((d) => d.id === report.userId);
    if (exist) {
      exist.total++;
    } else {
      const user = users.value.find((u) => u.id === report.userId);
      if (user) {
        data.push({ id: user.id, name: user.name, total: 1 });
      }
    }
  });
  data.sort((a, b) => b.total - a.total);
  return data;
});

const onRemoveReport = () => {
  getReports();
};

const onResetConfirmation = async () => {
  try {
    await resetConfirmation(id);
    await getStatistic();
  } catch (e) {
    console.error(e);
  }
};
</script>
