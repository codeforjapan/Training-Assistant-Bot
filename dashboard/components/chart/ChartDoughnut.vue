<template>
  <Doughnut :options="chartOptions" :data="chartData"></Doughnut>
</template>
<script lang="ts" setup>
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);
const props = defineProps<{ chartData: any; title: string }>();
const chartOptions = ref({
  cutout: 45,
  title: {
    display: true,
    position: 'bottom',
    text: props.title,
  },
  events: [],
  legend: {
    display: false,
  },
  tooltips: {
    enabled: false,
  },
});
</script>
