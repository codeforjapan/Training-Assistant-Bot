<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    style="position: relative"
  >
    <ChartDoughnut
      :chart-data="chartData"
      :title="title"
      style="height: 130px; width: 130px"
    ></ChartDoughnut>
    <label class="chart-value-label">{{ percentage }}%</label></v-container
  >
</template>

<script lang="ts" setup>
type Props = {
  data: {
    labels: string[];
    colors: string[];
    data: number[];
    title: string;
  };
};

const props = defineProps<Props>();
const title = computed(() => props.data.title);
const chartData = computed(() => ({
  datasets: [
    {
      backgroundColor: props.data.colors,
      data: props.data.data,
      borderWidth: 0,
    },
  ],
}));

const percentage = computed(() =>
  props.data.data[0] + props.data.data[1] > 0
    ? Math.floor(
        (props.data.data[0] / (props.data.data[0] + props.data.data[1])) * 100,
      )
    : 0,
);
</script>

<style scoped lang="scss">
.chart-value-label {
  position: absolute;
  top: 45%;
  font-weight: bold;
  font-size: 16px;
}
</style>
