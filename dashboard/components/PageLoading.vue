<template>
  <div class="fill-height d-flex flex-column justify-center align-center">
    <v-progress-circular
      size="100"
      color="grey"
      indeterminate
    ></v-progress-circular>
    <span class="mt-8">{{ $t('読み込み中...') }}</span>
  </div>
</template>
