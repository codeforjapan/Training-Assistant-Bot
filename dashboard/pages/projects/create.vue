<template>
  <div class="page-container d-flex flex-column flex-grow-1 pb-4">
    <v-form v-model="formStatus.valid" class="mt-4">
      <v-text-field
        v-model="name"
        :rules="[rules.require]"
        :label="$t('プロジェクト名')"
        variant="outlined"
      ></v-text-field>
      <label>{{ $t('シナリオ') }}</label>
      <v-radio-group v-model="scenarioType" inline>
        <v-radio :label="$t('テンプレートから')" value="template"></v-radio>
        <v-radio :label="$t('既存プロジェクトから')" value="project"></v-radio>
      </v-radio-group>
      <v-select
        v-if="scenarioType === 'template'"
        v-model="scenarioId"
        :label="$t('シナリオテンプレート')"
        :rules="[rules.require]"
        :items="scenarios"
        :placeholder="$t('シナリオを選択してください')"
        item-title="name"
        item-value="id"
        variant="outlined"
      ></v-select>
      <v-select
        v-else-if="scenarioType === 'project'"
        v-model="projectScenarioId"
        :rules="[rules.require]"
        :label="$t('プロジェクトシナリオ')"
        :items="projectScenarios"
        :placeholder="$t('シナリオを選択してください')"
        item-title="name"
        item-value="id"
        variant="outlined"
      ></v-select>
      <v-menu
        v-model="menu2"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ props }">
          <v-text-field
            :model-value="eventDateStartStr"
            :label="$t('開始日')"
            variant="outlined"
            readonly
            v-bind="props"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="eventDateStart"
          locale="ja-JP"
          @update:model-value="menu2 = false"
        ></v-date-picker>
      </v-menu>
      <v-menu
        v-model="menu3"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ props }">
          <v-text-field
            :model-value="eventDateEndStr"
            :label="$t('終了日')"
            variant="outlined"
            readonly
            v-bind="props"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="eventDateEnd"
          :min="eventDateStart"
          locale="ja-JP"
          @update:model-value="menu3 = false"
        ></v-date-picker>
      </v-menu>
      <v-textarea
        v-model="group"
        :rules="[rules.duplicate]"
        :label="$t('グループ・エリア名')"
        :placeholder="'グループ１\nグループ２\nグループ３'"
        variant="outlined"
      ></v-textarea>
      <v-checkbox
        v-model="isDisasterTraining"
        :label="$t('プロジェクトに参加していないユーザの投稿を許可')"
        hide-details
      ></v-checkbox>
      <v-checkbox
        v-model="enableGender"
        :label="$t('男女アンケート有効化')"
        hide-details
      ></v-checkbox>
      <v-checkbox
        v-model="enableGeneration"
        :label="$t('年代アンケート有効化')"
        hide-details
      ></v-checkbox>
      <v-radio-group v-model="targets" :label="$t('参加招待')" class="mt-8">
        <v-radio :label="$t('友達全員')" value="all"></v-radio>
        <v-radio :label="$t('グループ')" value="group"></v-radio>
      </v-radio-group>
      <v-select
        v-model="targetGroups"
        :items="groups"
        :disabled="targets !== 'group'"
        item-title="name"
        item-value="id"
        multiple
        variant="outlined"
      ></v-select>
      <v-btn
        block
        color="#6479C0"
        :dark="formStatus.valid"
        :disabled="!formStatus.valid"
        :loading="formStatus.submitting"
        size="x-large"
        elevation="0"
        style="font-size: 24px"
        @click="submit"
        >作成
      </v-btn>
    </v-form>
  </div>
</template>

<script lang="ts" setup>
import moment from 'moment';
import { list as listScenarioTemplate } from '@/models/scenario_template';
import type { ScenarioTemplate } from '@/models/scenario_template';
import { create as createProject } from '@/models/project';
import { list as listGroup } from '@/models/group';
import type { Group } from '@/models/group';
import { list as listScenario } from '@/models/scenario';
import type { Scenario } from '@/models/scenario';
import { useCopyProjectState } from '~/composables/useCopyProjectState';

const i18n = useI18n();
const router = useRouter();

const formStatus = reactive({ valid: false, submitting: false });

const projectState = useCopyProjectState();
const copiedProject = projectState.copiedProject.value;
const name = ref('');
const scenarioId = ref('');
const scenarios = ref<ScenarioTemplate[]>([]);
const eventDateStart = ref(new Date());
const eventDateStartStr = computed(() => {
  return moment(eventDateStart.value).format('YYYY-MM-DD');
});
const eventDateEnd = ref(new Date());
const eventDateEndStr = computed(() => {
  return moment(eventDateEnd.value).format('YYYY-MM-DD');
});
const menu2 = ref();
const menu3 = ref();
const group = ref('');
const isDisasterTraining = ref(false);
const enableGeneration = ref(true);
const enableGender = ref(true);
const projectGroups = computed(() => {
  return group.value.split('\n').map((g) => g.trim());
});
const rules = {
  require: (v: string) => !!v || i18n.t('必須です'),
  duplicate: (v: string) => {
    if (!v) {
      return true;
    }
    const same = projectGroups.value.some(
      (g, idx) => projectGroups.value.indexOf(g) !== idx,
    );
    return same ? i18n.t('グループ・エリア名が重複しています') : true;
  },
};

const scenarioType = ref('template');
const projectScenarioId = ref('');
const projectScenarios = ref<any[]>([]);
listScenario().then((scenarios: any[]) => {
  projectScenarios.value = scenarios.map((scenario: Scenario) => {
    return {
      id: scenario.id,
      name: scenario.project
        ? `${scenario.project.eventDateStart.format('YYYY年MM月DD日')} ${
            scenario.project.name
          }`
        : scenario.name,
    };
  });
  if (copiedProject) {
    const scenario = scenarios.find((s) => s.id === copiedProject.scenario.id);
    if (
      scenario &&
      scenario.scenarioTasks &&
      scenario.scenarioTasks[0] &&
      scenario.scenarioTasks[0].tasks
    ) {
      const startTask = scenario.scenarioTasks[0].tasks.find(
        (t: any) => t.type === 'project-notification',
      );
      if (startTask && startTask.targets) {
        targets.value = 'group';
        targetGroups.value.push(...startTask.targets);
      }
    }
  }
});
listScenarioTemplate().then((templates) => {
  scenarios.value = templates;
});

const submit = async () => {
  formStatus.submitting = true;
  const project = await createProject({
    name: name.value,
    scenarioId: scenarioId.value || 0,
    projectScenarioId: projectScenarioId.value || 0,
    eventDateStart: eventDateStart.value,
    eventDateEnd: eventDateEnd.value,
    groups: projectGroups.value.filter((f) => f),
    targetGroups: targets.value === 'all' ? [] : targetGroups.value,
    isDisasterTraining: isDisasterTraining.value,
    disableGender: !enableGender.value,
    disableGeneration: !enableGeneration.value,
  });
  formStatus.submitting = false;
  if (project) {
    router.push(`/projects/${project.id}`);
  }
};

const targets = ref('all');
const groups = ref<Group[]>([]);
const getGroups = async () => {
  groups.value = await listGroup();
};
getGroups();
const targetGroups = ref<number[]>([]);

if (copiedProject) {
  name.value = copiedProject.name;
  group.value =
    copiedProject.setting.groups && Array.isArray(copiedProject.setting.groups)
      ? copiedProject.setting.groups.join('\n')
      : '';
  eventDateStart.value = new Date();
  eventDateEnd.value = new Date();
  scenarioType.value = 'project';
  projectScenarioId.value = copiedProject.scenario.id;
  isDisasterTraining.value = copiedProject.isDisasterTraining;
  scenarioId.value = '';
  projectState.resetProject();
}

watch(eventDateStart, () => {
  if (
    eventDateStart.value &&
    eventDateEnd.value &&
    moment(eventDateStart.value).isAfter(moment(eventDateEnd.value))
  ) {
    eventDateEnd.value = eventDateStart.value;
  }
});
</script>

<style lang="scss" scoped></style>
