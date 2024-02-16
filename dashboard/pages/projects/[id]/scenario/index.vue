<template>
  <div class="page-container d-flex flex-column flex-grow-1">
    <PageLoading v-if="!isInitialized"> </PageLoading>
    <div v-else class="flex-shrink-0">
      <v-card flat color="transparent mt-5">
        <v-card-title
          class="text-h5"
          style="border-bottom: 1px solid #000000"
          >{{ title }}</v-card-title
        >
        <v-card-text class="px-0 pt-5">
          <div class="text-right">
            <v-btn
              size="x-large"
              color="#CECECE"
              flat
              width="300"
              :to="`/projects/${id}/scenario/edit`"
              nuxt
              ><v-icon large class="mr-4">mdi-square-edit-outline</v-icon>
              {{ $t('シナリオを編集') }}</v-btn
            >
          </div>
          <div class="my-6 scenario-list">
            <div
              v-for="scenarioTask in scenario?.scenarioTasks ?? []"
              :key="scenarioTask.id"
              class="d-flex justify-end align-center py-4 px-6 mb-2"
              style="background-color: #ebe8e8"
            >
              <div class="flex-grow-1" style="font-size: 24px">
                {{ scenarioTask.name }}
              </div>
              <v-btn
                class="flex-shrink-0 white--text"
                :disabled="!!scenarioTask.finishedAt"
                width="150"
                size="x-large"
                flat
                shaped
                color="#6479C0"
                @click="sendMessage(scenarioTask)"
              >
                <v-icon v-if="!scenarioTask.finishedAt" class="mr-4"
                  >mdi-send</v-icon
                >
                {{ scenarioTask.finishedAt ? $t('送信済み') : $t('送信') }}
              </v-btn>
            </div>
          </div>
          <div class="text-right">
            <v-btn
              size="x-large"
              color="#CECECE"
              flat
              width="300"
              @click="resetTasks"
            >
              {{ $t('送信履歴をリセット') }}</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import moment from 'moment';
import {
  type Scenario,
  show as showScenario,
  sendMessage as sendScenarioMessage,
  resetTasks as resetScenarioTasks,
} from '~/models/scenario';
import { type ScenarioTask } from '~/models/scenario_tasks';

const i18n = useI18n();
const route = useRoute();

const id = Number(route.params.id);
const isInitialized = ref(false);
const scenario = ref<Scenario | null>(null);
const title = computed(() => {
  if (scenario.value) {
    return `${i18n.t('シナリオ送信')} - ${scenario.value.name}`;
  }
  return '';
});

const getScenarioInformation = async () => {
  scenario.value = await showScenario(id);
  isInitialized.value = true;
};
getScenarioInformation();

const sendMessage = async (scenarioTask: ScenarioTask) => {
  const result = await sendScenarioMessage(
    scenarioTask.scenarioId,
    scenarioTask.id,
  ).catch((e: any) => {
    console.error(e);
    return false;
  });
  if (result) {
    scenarioTask.finishedAt = moment();
  }
};

const resetTasks = async () => {
  if (!scenario.value) {
    return;
  }
  const updatedScenario = await resetScenarioTasks(scenario.value.id).catch(
    (e: any) => {
      console.error(e);
      return null;
    },
  );
  if (updatedScenario) {
    scenario.value = updatedScenario;
  }
};
</script>

<style lang="scss" scoped>
div.scenario-list button[disabled].theme--light.v-btn.v-btn--disabled {
  background-color: #6479c071 !important;
  color: white !important;
}
</style>
