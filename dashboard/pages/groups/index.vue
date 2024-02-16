<template>
  <div class="page-container d-flex flex-column flex-grow-1">
    <PageLoading v-if="!isInitialized"> </PageLoading>
    <div v-else class="flex-shrink-0">
      <v-card flat color="transparent mt-5">
        <v-card-title
          class="text-h5 d-flex align-center"
          style="border-bottom: 1px solid #000000"
        >
          <span>{{ $t('グループ一覧') }}</span>
          <v-spacer />
          <v-btn
            elevation="0"
            color="#6479C0"
            size="x-large"
            style="font-size: 24px"
            @click="addGroup"
            >{{ $t('新規作成') }}</v-btn
          ></v-card-title
        >
        <v-card-text class="group-list px-0 pt-5">
          <MButton
            v-for="group in groups"
            :key="group.id"
            :to="`/groups/${group.id}/edit`"
            nuxt
            class="text-none"
          >
            <span class="px-4">{{ group.name }}</span>
          </MButton>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  type Group,
  list as listGroup,
  create as createGroup,
} from '~/models/group';

const i18n = useI18n();
const router = useRouter();

const pageState = useCurrentPageState();
pageState.setState({
  title: i18n.t('グループ管理'),
});
const isInitialized = ref(false);
const groups = ref<Group[]>([]);

const getGroups = async () => {
  groups.value = await listGroup();
  isInitialized.value = true;
};
getGroups();

const addGroup = async () => {
  const group = await createGroup().catch(console.error);
  if (group) {
    router.push(`/groups/${group.id}/edit`);
  }
};
</script>

<style lang="scss" scoped>
.group-list {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 10px;
}
</style>
