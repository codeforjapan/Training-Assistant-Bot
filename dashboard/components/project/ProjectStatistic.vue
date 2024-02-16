<template>
  <v-card flat color="transparent mt-5">
    <v-card-title
      v-if="!disableStatistics"
      class="headline"
      style="border-bottom: 1px solid #000000"
      >{{ $t('統計') }}</v-card-title
    >
    <v-card-text class="px-0 pt-5">
      <v-row v-if="showConfirmedChart">
        <v-col md="12">
          <v-card>
            <v-card-title class="headline d-flex"
              ><div class="flex-grow-1">{{ $t('安否確認状況') }}</div>
              <v-btn
                v-if="canResetConfirmation"
                elevation="0"
                color="error"
                @click="$emit('reset-confirmation')"
                >リセット</v-btn
              >
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="py-10">
              <v-row>
                <v-col
                  v-for="data in confirmedCharsData"
                  :key="data.area"
                  :md="
                    Math.ceil(12 / confirmedCharsData.length) > 2
                      ? Math.ceil(12 / confirmedCharsData.length)
                      : 3
                  "
                >
                  <ChartDoughnutContainer :data="data"></ChartDoughnutContainer>
                </v-col>
              </v-row>
              <v-row>
                <v-col md="12">
                  <v-data-table
                    :headers="headers"
                    :items="participants"
                    disable-sort
                  >
                    <template #bottom> </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-if="showGenderChart" md="6">
          <v-card>
            <v-card-title class="headline">{{ $t('男女比') }}</v-card-title>
            <v-divider></v-divider>
            <v-card-text class="py-10">
              <ChartPie :chart-data="genderData"></ChartPie>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-if="showGenerationChart" md="6">
          <v-card>
            <v-card-title class="headline">{{ $t('世代') }}</v-card-title>
            <v-divider></v-divider>
            <v-card-text class="py-10">
              <ChartPie :chart-data="generationData"></ChartPie>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="showReportRanking">
        <v-col md="12">
          <v-card>
            <v-card-title>{{ $t('投稿数') }}</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-data-table :headers="rankingHeaders" :items="rankingData">
                <template #bottom> </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
interface Props {
  showConfirmedChart: boolean;
  showGenderChart: boolean;
  showGenerationChart: boolean;
  showReportRanking: boolean;
  data: {
    participants: { group: string; total: number; confirmed: number }[];
    gender: {
      man: number;
      woman: number;
    };
    generation: {
      u30: number;
      u50: number;
      u70: number;
      o70: number;
    };
  };
  rankingData: { name: string; total: number }[];
  canResetConfirmation?: boolean;
}
const props = defineProps<Props>();
const i18n = useI18n();

const headers = [
  {
    title: i18n.t('グループ名'),
    key: 'group',
    sortable: false,
  },
  {
    title: i18n.t('対象者数'),
    key: 'total',
    sortable: false,
  },
  {
    title: i18n.t('安否確認済み'),
    key: 'confirmed',
    sortable: false,
  },
  {
    title: i18n.t('未確認'),
    key: 'unknown',
    sortable: false,
  },
];

const participants = computed(() => {
  return props.data.participants.map((participant) => ({
    group: participant.group,
    total: participant.total,
    confirmed: participant.confirmed,
    unknown: participant.total - participant.confirmed,
  }));
});
const confirmedCharsData = computed(() => {
  return participants.value.map((item) => {
    return {
      colors: ['rgba(38, 185, 154, 1)', 'rgba(255, 255, 255, 0)'],
      data: [item.confirmed, item.total - item.confirmed],
      title: item.group,
    };
  });
});

const genderData = computed(() => ({
  labels: [i18n.t('男性'), i18n.t('女性')],
  datasets: [
    {
      backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
      data: [props.data.gender.man, props.data.gender.woman],
      borderWidth: 2,
    },
  ],
}));

const generationData = computed(() => ({
  labels: [
    i18n.t('29歳以下'),
    i18n.t('30〜49歳以下'),
    i18n.t('50〜69歳以下'),
    i18n.t('70歳以上'),
  ],
  datasets: [
    {
      backgroundColor: [
        'rgba(255, 229, 170, 1)',
        'rgba(167, 223, 223, 1)',
        'rgba(204, 176, 254, 1)',
        'rgba(255, 207, 160, 1)',
      ],
      data: [
        props.data.generation.u30,
        props.data.generation.u50,
        props.data.generation.u70,
        props.data.generation.o70,
      ],
      borderWidth: 2,
    },
  ],
}));

const disableStatistics = computed(
  () =>
    !props.showConfirmedChart &&
    !props.showGenderChart &&
    !props.showGenerationChart,
);

const rankingHeaders = [
  {
    title: i18n.t('名前'),
    key: 'name',
    sortable: false,
  },
  {
    title: i18n.t('投稿数'),
    key: 'total',
    sortable: false,
  },
];
</script>

<style lang="scss" scoped>
.wrapper {
  height: 700px;
  background-color: white;
  border: 1px solid #707070;
  display: grid;
  grid-template-rows: 50%;
  grid-gap: 20px;

  & > div {
    overflow-y: auto;
  }

  .detail {
    display: grid;
    grid-template-rows: 50%;
    grid-template-columns: 65%;
    grid-gap: 10px;
    background-color: #ecf3f4;

    .message {
      grid-column: 1/3;
      background-color: white;
    }
  }

  .list {
    .report {
      width: 100%;
      display: grid;
      grid-template-columns: 100px 140px 1fr 60px;
      align-items: center;
    }
  }
}
</style>
