<template>
  <Pie :data="chartData" :options="options" />
</template>
<script lang="ts" setup>
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

defineProps<{ chartData: any }>();
const options = ref({
  responsive: true,
  maintainAspectRatio: false,
});
</script>

<style scoped lang="scss">
.scrollable-container {
  height: calc(100vh - 80px);
  overflow-y: auto;
}
</style>
