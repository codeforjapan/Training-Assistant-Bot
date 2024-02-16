<template>
  <div class="page-container d-flex flex-column flex-grow-1">
    <PageLoading v-if="!isInitialized"> </PageLoading>
    <div v-else class="flex-shrink-0">
      <v-card flat color="transparent mt-5">
        <v-card-text class="px-0 pt-5">
          <div class="text-right">
            <v-btn
              size="x-large"
              color="#CECECE"
              flat
              width="300"
              :disabled="!needSave"
              @click="save"
            >
              {{ $t('保存') }}</v-btn
            >
            <v-btn
              class="ml-2"
              size="x-large"
              color="#CECECE"
              flat
              width="300"
              :disabled="needSave"
              @click="addTask"
              ><v-icon size="large" class="mr-4">mdi-plus-circle</v-icon>
              {{ $t('アナウンスを追加') }}</v-btn
            >
          </div>
          <draggable
            v-model="scenario.scenarioTasks"
            tag="div"
            class="my-6 scenario-list"
            handle=".handle"
            item-key="id"
            :move="canMove"
          >
            <template #item="{ element }">
              <div
                :key="element.id"
                class="d-flex justify-end align-center py-4 px-6 mb-2"
                style="background-color: #ebe8e8"
              >
                <v-icon
                  x-large
                  class="mr-4"
                  :class="{
                    hidden: element.isInitial,
                    handle: !element.isInitial,
                  }"
                  >mdi-menu</v-icon
                >
                <div class="flex-grow-1" style="font-size: 24px">
                  {{ element.name }}
                </div>
                <v-btn
                  class="flex-shrink-0 mr-7"
                  width="150"
                  size="x-large"
                  flat
                  color="#CECECE"
                  @click="editAnnounce(element)"
                >
                  <v-icon size="large" class="mr-4"
                    >mdi-square-edit-outline</v-icon
                  >
                  {{ $t('編集') }}
                </v-btn>
                <v-btn
                  icon="mdi-close-circle"
                  size="x-large"
                  flat
                  density="compact"
                  variant="text"
                  class="mx-4"
                  :class="{ hidden: !element.removable }"
                  @click="remove(element)"
                >
                </v-btn>
              </div>
            </template>
          </draggable>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import draggable from 'vuedraggable';
import {
  type Scenario,
  show as showScenario,
  update as updateScenario,
} from '@/models/scenario';
import {
  type ScenarioTask,
  create as createScenarioTask,
} from '@/models/scenario_tasks';

const i18n = useI18n();
const route = useRoute();
const router = useRouter();

const id = Number(route.params.id);
const isInitialized = ref(false);
const scenario = ref<Scenario | null>(null);
const title = computed(() => {
  if (scenario.value) {
    return `${i18n.t('シナリオ編集')} - ${scenario.value.name}`;
  }
  return '';
});

const originalTasks = ref<ScenarioTask[]>([]);
const pageState = useCurrentPageState();
const getScenarioInformation = async () => {
  scenario.value = await showScenario(id);
  originalTasks.value = scenario.value.scenarioTasks.slice();
  isInitialized.value = true;
  const title = `${i18n.t('シナリオ編集')} - ${scenario.value.name}`;
  pageState.setState({ title });
};
getScenarioInformation();

const editAnnounce = (scenarioTask: ScenarioTask) => {
  router.push(`/announce/${scenarioTask.id}/edit`);
};

const needSave = computed(() => {
  if (!scenario.value) {
    return false;
  }
  return (
    JSON.stringify(originalTasks.value) !==
    JSON.stringify(scenario.value.scenarioTasks)
  );
});
const isSaving = ref(false);
const save = async () => {
  if (!scenario.value) {
    return;
  }
  isSaving.value = true;
  scenario.value.scenarioTasks = scenario.value.scenarioTasks.map(
    (task, idx) => {
      task.order = idx + 1;
      return task;
    },
  );
  const success = await updateScenario(scenario.value).catch(console.error);
  if (success) {
    originalTasks.value = scenario.value.scenarioTasks;
  }
  isSaving.value = false;
};

const remove = (task: ScenarioTask) => {
  if (!scenario.value) {
    return;
  }
  const idx = scenario.value.scenarioTasks.indexOf(task);
  scenario.value.scenarioTasks.splice(idx, 1);
};

const addTask = async () => {
  if (!scenario.value) {
    return;
  }
  const scenarioTask = await createScenarioTask(
    scenario.value.id,
    scenario.value.scenarioTasks.length + 1,
    i18n.t('新規アナウンス') as string,
  ).catch(console.error);
  if (scenarioTask) {
    editAnnounce(scenarioTask);
  }
};

const canMove = (evt: any) => {
  if (
    evt.draggedContext.element.isInitial ||
    evt.relatedContext.element.isInitial
  ) {
    return false;
  }
};
</script>

<style lang="scss" scoped>
.hidden {
  visibility: hidden;
}
</style>
