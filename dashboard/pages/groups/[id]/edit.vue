<template>
  <div class="page-container d-flex flex-column flex-grow-1">
    <PageLoading v-if="!isInitialized"></PageLoading>
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
              :disabled="!needSave"
              @click="save"
            >
              {{ $t('保存') }}
            </v-btn>
          </div>
          <div class="mb-8">
            <label>{{ $t('グループ名') }}</label>
            <v-text-field
              v-model="title"
              variant="outlined"
              class="mt-2"
              style="background-color: white"
              hide-details
            ></v-text-field>
          </div>

          <div class="align-center">
            <label>{{ $t('メンバー') }}</label>
            <v-list
              v-model:selected="members"
              flat
              class="list-container"
              select-strategy="leaf"
            >
              <v-list-item
                v-for="user in users"
                :key="user.id"
                :value="user.id"
              >
                <template v-slot:prepend="{ isActive }">
                  <v-list-item-action start>
                    <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
                  </v-list-item-action>
                </template>
                <v-list-item-title>{{ user.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  type Group,
  show as showGroup,
  update as updateGroup,
} from '~/models/group';
import { type User, list as listUser } from '~/models/user';

const i18n = useI18n();
const route = useRoute();

const id = Number(route.params.id);
const isInitialized = ref(false);
const users = ref<User[]>([]);
const group = ref<Group | null>(null);
const title = ref<string>('');
const members = ref<any[]>([]);

const pageState = useCurrentPageState();
const getGroupInformation = async () => {
  const results = await Promise.all([showGroup(id), listUser()]);
  group.value = results[0];
  users.value = results[1];
  isInitialized.value = true;
  if (group.value) {
    title.value = group.value.name;
    pageState.setState({
      title: `${i18n.t('グループ編集')} - ${group.value.name}`,
    });
    if (users.value) {
      members.value = group.value?.users.map((user: User) => {
        return user.id;
      });
    }
  }
};
getGroupInformation();

const isSaving = ref(false);
const needSave = computed(() => {
  if (!group.value) {
    return false;
  }
  const isTitleChanged = title.value !== group.value.name;
  const currentMembers = group.value?.users.map((user: User) => {
    return user.id;
  });
  const isMemberChanged =
    JSON.stringify(currentMembers) !== JSON.stringify(members.value);
  return isTitleChanged || isMemberChanged;
});
const save = async () => {
  if (!group.value || !users.value) {
    return;
  }
  group.value = await updateGroup(
    group.value.id,
    title.value,
    members.value,
  ).catch(console.error);
  if (group.value) {
    title.value = group.value.name;
    pageState.setState({
      title: `${i18n.t('グループ編集')} - ${group.value.name}`,
    });
    if (users.value) {
      members.value = group.value?.users.map((user: User) => {
        return user.id;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.hidden {
  visibility: hidden;
}

.list-container {
  height: 50vh;
  overflow-y: auto;
}
</style>
