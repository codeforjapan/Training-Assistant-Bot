<template>
  <v-app>
    <v-app-bar flat height="150px" class="pl-4 pt-3" absolute> </v-app-bar>
    <v-main>
      <v-container fluid class="fill-height">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts"></script>

<style lang="scss" scoped>
.theme--light.v-app-bar.v-toolbar.v-sheet,
.container {
  background-color: #f8f8f8;
  color: #707070;
}

.logo {
  span.name {
    margin-top: -10px;
  }
}
</style>
