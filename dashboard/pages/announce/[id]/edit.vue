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
              :loading="isSaving"
              :disabled="!canAdd || !scenarioTask"
              @click="save"
            >
              {{ $t('保存') }}</v-btn
            >
          </div>
          <div class="mb-8">
            <label>{{ $t('タイトル') }}</label>
            <v-text-field
              v-model="title"
              variant="outlined"
              class="mt-2"
              style="background-color: white"
              hide-details
            ></v-text-field>
          </div>

          <div>
            <div class="d-flex align-center">
              <label>{{ $t('アナウンス') }}</label>
              <v-spacer />
              <v-btn
                size="x-large"
                color="#CECECE"
                flat
                width="150"
                :disabled="!canAdd"
                @click="add"
              >
                <v-icon size="large" class="mr-4">mdi-plus-circle</v-icon>
                {{ $t('追加') }}</v-btn
              >
            </div>
            <draggable
              tag="div"
              :list="editingScenarioTasks"
              handle=".handle"
              :move="canMove"
              item-key="id"
            >
              <template #item="{ element }">
                <div class="mt-3 elevation-4" style="background-color: white">
                  <AnnounceTask
                    v-model="element.text"
                    :task="element"
                    @remove="remove(element)"
                  >
                  </AnnounceTask>
                  <div
                    v-if="element.type === 'project-notification'"
                    class="px-8"
                  >
                    <v-radio-group v-model="targets" inline>
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
                      :placeholder="$t('グループを選択してください')"
                    ></v-select>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import draggable from 'vuedraggable';
import {
  type ScenarioTask,
  show as showScenarioTask,
  update as updateScenarioTask,
} from '~/models/scenario_tasks';
import { type Group, list as listGroup } from '~/models/group';

const i18n = useI18n();
const route = useRoute();

const id = Number(route.params.id);
const isInitialized = ref(false);
const isSaving = ref(false);
const scenarioTask = ref<ScenarioTask | null>(null);

const title = ref('');
const editingScenarioTasks = ref<any[]>([]);

const targets = ref('all');
const groups = ref<Group[]>([]);
const getGroups = async () => {
  groups.value = await listGroup();
};
const targetGroups = ref<number[]>([]);

const pageState = useCurrentPageState();
const getScenarioTaskInformation = async () => {
  scenarioTask.value = await showScenarioTask(id);
  isInitialized.value = true;
  pageState.setState({ title: i18n.t('アナウンス編集') });
  editingScenarioTasks.value = scenarioTask.value.tasks.map((task, idx) => {
    task.tmpId = idx + 1;
    return task;
  });
  title.value = scenarioTask.value.name;
  if (scenarioTask.value.tasks?.[0]?.type === 'project-notification') {
    await getGroups();
    const currentTargets = scenarioTask.value.tasks[0].targets || [];
    targetGroups.value.push(...currentTargets);
    targets.value = targetGroups.value.length > 0 ? 'group' : 'all';
  }
};
getScenarioTaskInformation();

const canMove = (evt: any) => {
  const selfRequiredOrder = evt.draggedContext.element.requiredOrder;
  const targetRequiredOrder = evt.relatedContext.element.requiredOrder;
  if (targetRequiredOrder === 0 || selfRequiredOrder === 0) {
    return false;
  }

  if (!selfRequiredOrder) {
    return true;
  }
  const futureIndex = evt.draggedContext.futureIndex;
  const currentIndex = evt.draggedContext.index;
  if (futureIndex < currentIndex) {
    const checkTargets = editingScenarioTasks.value.slice(
      futureIndex,
      currentIndex,
    );
    return checkTargets.every((task) =>
      task.requiredOrder ? task.requiredOrder > selfRequiredOrder : true,
    );
  } else if (futureIndex > currentIndex) {
    const checkTargets = editingScenarioTasks.value.slice(
      currentIndex + 1,
      futureIndex + 1,
    );
    return checkTargets.every((task) =>
      task.requiredOrder ? task.requiredOrder < selfRequiredOrder : true,
    );
  }
};

const canAdd = computed(() => {
  return editingScenarioTasks.value.every((task) => task.text);
});

const add = () => {
  if (canAdd) {
    editingScenarioTasks.value.push({
      tmpId: editingScenarioTasks.value.length + 1,
      type: 'message',
      text: '',
    });
  }
};

const remove = (task: any) => {
  const idx = editingScenarioTasks.value.indexOf(task);
  editingScenarioTasks.value.splice(idx, 1);
};

const save = async () => {
  if (scenarioTask.value) {
    isSaving.value = true;
    scenarioTask.value.name = title.value;
    scenarioTask.value.tasks = editingScenarioTasks.value;
    if (scenarioTask.value.tasks[0].type === 'project-notification') {
      scenarioTask.value.tasks[0].targets =
        targets.value === 'all' ? [] : targetGroups.value;
    }
    await updateScenarioTask(scenarioTask.value).catch(console.error);
    isSaving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.hidden {
  visibility: hidden;
}

label {
  font-size: 24px;
}

.scenario-task-container {
  background-color: white;

  .handle {
    cursor: move;
  }

  .scenario-type {
    background-color: #ecf3f4;
    color: #6479c0;
    width: 130px;
    text-align: center;
  }
}
</style>
