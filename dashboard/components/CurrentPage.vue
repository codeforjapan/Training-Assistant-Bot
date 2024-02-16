<template>
  <div class="current-page-component">
    <v-row align="center" no-gutters>
      <v-col cols="1" class="text-center">
        <v-btn v-show="!isTop" variant="text" @click="back">
          <v-icon size="40">mdi-chevron-left</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="11">
        <span style="font-size: 24px">{{ currentPage }}</span>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
type Props = {
  currentPage: string;
  isTop?: boolean;
};

defineProps<Props>();

const router = useRouter();
const back = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.current-page-component {
  position: fixed;
  display: block;
  width: 100%;
  z-index: 1000;
}
div.v-row {
  background-color: #cecece;
  height: 80px;
  border: 1px solid #707070;
}
</style>
