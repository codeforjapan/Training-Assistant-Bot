<template>
  <div class="d-flex align-center pa-2 task-component">
    <v-icon size="x-large" class="mr-4 handle" :class="{ hidden: !canMove }"
      >mdi-menu</v-icon
    >
    <div class="scenario-type pa-2 mr-4">
      <div>{{ typeStr }}</div>
      <div>{{ typeStrSub }}</div>
    </div>
    <v-textarea
      v-model="model"
      variant="outlined"
      hide-details
      no-resize
      style="background-color: white"
      @input="$emit('input', $event)"
    ></v-textarea>
    <v-btn
      icon="mdi-close-circle"
      size="x-large"
      class="mx-4"
      flat
      variant="text"
      :class="{ hidden: !canRemove }"
      @click="$emit('remove')"
    >
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  task: any;
}

const props = defineProps<Props>();
const model = defineModel();

const i18n = useI18n();

const typeStr = computed(() => {
  const type = props.task.type;
  if (type === 'message') {
    return i18n.t('テキスト');
  } else if (type === 'ques') {
    return i18n.t('アンケート');
  } else if (type === 'project-notification') {
    return i18n.t('参加要請');
  } else if (type === 'report') {
    return i18n.t('報告');
  } else if (type === 'confirmation') {
    return i18n.t('安否確認');
  }
});
const typeStrSub = computed(() => {
  const type = props.task.type;
  if (type === 'ques') {
    const dataKey = props.task.dataKey;
    if (dataKey === 'group') {
      return i18n.t('(グループ)');
    } else if (dataKey === 'gender') {
      return i18n.t('(性別)');
    } else if (dataKey === 'generation') {
      return i18n.t('(年代)');
    }
  } else if (type === 'report') {
    const content = props.task.content;
    if (content === 'category') {
      return i18n.t('(カテゴリ)');
    } else if (content === 'location') {
      return i18n.t('(場所)');
    } else if (content === 'message') {
      return i18n.t('(詳細)');
    } else if (content === 'img') {
      return i18n.t('(画像)');
    } else if (content === 'finish') {
      return i18n.t('(完了)');
    }
  }
});

const canMove = props.task.requiredOrder !== 0;
const canRemove =
  props.task.requiredOrder === undefined && props.task.type === 'message';
</script>

<style lang="scss" scoped>
.hidden {
  visibility: hidden;
}

.task-component {
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
