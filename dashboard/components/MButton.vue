<template>
  <v-btn
    height="90"
    elevation="0"
    color="#EBE8E8"
    style="font-size: 24px; border: 1px solid #707070"
    append-icon="mdi-chevron-right-circle"
    v-bind="$attrs"
  >
    <slot />
  </v-btn>
</template>

<style scoped lang="scss">
button,
a {
  grid-template-columns: auto 1fr auto;
}
:deep(.v-btn__content) {
  justify-content: start;
}
</style>
