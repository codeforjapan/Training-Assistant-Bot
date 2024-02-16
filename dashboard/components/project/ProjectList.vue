<template>
  <v-card flat color="transparent mt-5">
    <v-card-title
      class="text-h5 d-flex align-center"
      style="border-bottom: 1px solid #000000"
    >
      <div class="flex-grow-1">{{ $t('報告一覧') }}</div>
      <div>
        <v-btn
          :href="`/api/projects/${projectId}/export`"
          height="60"
          style="font-size: 16px; border: 1px solid #525252"
          variant="tonal"
          size="x-large"
          rounded="0"
          link
        >
          <v-icon size="40" class="mr-8">mdi-download</v-icon>
          {{ $t('報告をエクスポート') }}
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text class="px-0 pt-5">
      <div class="map mb-4" style="height: 360px">
        <l-map
          ref="map"
          :zoom="18"
          :center="center"
          style="z-index: 1"
          @ready="onReadyMap"
        >
          <l-tile-layer
            :attribution="`&amp;copy; &lt;a href=&quot;https://osm.org/copyright&quot;&gt;OpenStreetMap&lt;/a&gt; contributors`"
            url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
          ></l-tile-layer>
          <l-control
            position="bottomright"
            class="leaflet-report-control leaflet-bar leaflet-control"
          >
            <div
              v-if="isMapFullscreen && selectedReport"
              class="report-container"
              :class="{ expanded: expandedReportPanel }"
            >
              <div class="d-flex">
                <v-btn
                  icon="mdi-arrow-expand"
                  flat
                  density="compact"
                  style="transform: rotate(90deg)"
                  @click="expandedReportPanel = !expandedReportPanel"
                >
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  icon="mdi-close"
                  flat
                  density="compact"
                  @click="selectedReport = undefined"
                >
                </v-btn>
              </div>
              <div class="message py-4 px-2">{{ selectedReportMessage }}</div>
              <div class="pic text-center pa-1">
                <img
                  v-if="selectedReportImg && expandedReportPanel"
                  :src="selectedReportImg.replace('thumbnail', 'original')"
                  alt="report image"
                />
                <img
                  v-else-if="selectedReportImg"
                  :src="selectedReportImg"
                  alt="report image"
                />
                <img v-else src="/img/no_image.svg" alt="report image" />
              </div>
            </div>
          </l-control>
          <template v-for="marker in markers" :key="marker.id"
            ><l-marker
              :lat-lng="marker.location"
              :options="{ opacity: 0.7 }"
              @click="onClickMarker(marker.id)"
            >
            </l-marker
          ></template>
          <l-marker
            v-if="selectedMaker"
            ref="marker"
            :key="`s_${selectedMaker?.id}`"
            :lat-lng="selectedMaker?.latLng || [0, 0]"
            :z-index-offset="100"
            @ready="onReadyMarker"
          >
            <l-popup :options="{ closeButton: false }">{{
              $t('選択中')
            }}</l-popup>
          </l-marker>
        </l-map>
      </div>
      <div class="wrapper pa-4">
        <div class="detail pa-4">
          <div class="message py-4 px-2">{{ selectedReportMessage }}</div>
          <div class="pic text-center">
            <img
              v-if="selectedReportImg"
              :src="selectedReportImg"
              alt="report image"
              @click="imgDialog.show = true"
            />
            <img v-else src="/img/no_image.svg" alt="report image" />
          </div>
        </div>
        <v-virtual-scroll
          ref="scroller"
          :items="reports"
          height="470px"
          item-height="50px"
          class="list"
        >
          <template v-slot="{ index, item }">
            <v-btn
              block
              height="50px"
              width="100%"
              class="mb-1 text-left report-container text-none"
              :ripple="false"
              :class="{ 'is-selected': selectedReport === item }"
              :color="index % 2 === 0 ? '#ecf3f4' : '#ECF3F496'"
              elevation="0"
              @click="onSelectReport(item)"
            >
              <div class="report">
                <div>
                  {{ item.createdAt.format($t('YYYY/MM/DD HH:mm')) }}
                </div>
                <div class="message">{{ item.message }}</div>
                <div>
                  <v-btn
                    icon="mdi-image-multiple"
                    flat
                    density="compact"
                    variant="text"
                    :style="{ visibility: item.img ? '' : 'hidden' }"
                  ></v-btn>
                  <v-btn
                    icon="mdi-map-marker"
                    flat
                    density="compact"
                    variant="text"
                    :style="{ visibility: item.location ? '' : 'hidden' }"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    flat
                    density="compact"
                    variant="text"
                    @click="showRemoveConfirmation(item)"
                  ></v-btn>
                </div>
              </div>
            </v-btn>
          </template>
        </v-virtual-scroll>
      </div>
    </v-card-text>
    <v-dialog v-model="imgDialog.show" max-width="80vw">
      <v-card max-height="80vh" style="overflow-y: scroll">
        <v-card-title class="d-flex">
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            flat
            density="compact"
            size="x-large"
            @click="imgDialog.show = false"
          >
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="py-2">
          <v-img
            :lazy-src="selectedReportImg"
            :src="selectedReportImg.replace('thumbnail', 'original')"
            alt="image"
            max-width="100%"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular
                  indeterminate
                  color="blue"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="removeDialog.show" max-width="50vw">
      <v-card>
        <v-card-title class="d-flex align-center">
          <div>削除確認</div>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            flat
            size="x-large"
            density="compact"
            @click="removeDialog.show = false"
          >
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="py-2">
          <p>本当にこの報告を削除してよろしいですか？</p>
          <div>
            【 {{ removeDialog.report ? removeDialog.report.message : '' }}】
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn elevation="0" @click="removeDialog.show = false"
            >キャンセル</v-btn
          >
          <v-btn elevation="0" color="red" @click="remove(removeDialog.report)"
            >削除</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts" setup>
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-fullscreen';
import { type Report, remove as removeReport } from '@/models/report';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import {
  LControl,
  LMap,
  LMarker,
  LPopup,
  LTileLayer,
} from '@vue-leaflet/vue-leaflet';

interface Props {
  reports: Report[];
  center: number[];
  projectId: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{ remove: [report: Report] }>();

const map = ref<any>(null);
const selectedReport = ref<Report | undefined>();
const onSelectReport = (report: Report) => {
  selectedReport.value = report;
  if (report && report.location && map.value) {
    map.value.leafletObject.panTo(report.location);
  }
};
const selectedReportImg = computed(() =>
  selectedReport.value && selectedReport.value.img
    ? selectedReport.value.img + '/thumbnail'
    : '',
);
const selectedReportMessage = computed(() =>
  selectedReport.value ? selectedReport.value.message : '',
);
const selectedMaker = computed(() =>
  selectedReport.value && selectedReport.value.location
    ? { id: selectedReport.value.id, latLng: selectedReport.value.location }
    : null,
);
const markers = computed(() => props.reports.filter((r) => r.location));
const marker = ref<any>(null);
const onReadyMarker = () => {
  if (marker.value && marker.value.leafletObject) {
    marker.value.leafletObject.openPopup();
  }
};
const onClickMarker = (id: number) => {
  const report = props.reports.find((report) => report.id === id);
  if (report) {
    onSelectReport(report);
    scrollTo(report);
  }
};

const scroller = ref<any>(null);
const scrollTo = (report: Report) => {
  const idx = props.reports.findIndex((r) => r === report);
  if (idx !== -1 && scroller.value) {
    scroller.value.$el.scrollTo(0, idx * 50);
  }
};

const imgDialog = reactive({ show: false });

const isMapFullscreen = ref(false);
const onReadyMap = () => {
  const leafletMap = map.value?.leafletObject;
  if (leafletMap) {
    leafletMap.addControl(
      new L.Control.Fullscreen({
        position: 'topright',
        title: {
          false: 'View Fullscreen',
          true: 'Exit Fullscreen',
        },
      }),
    );
    leafletMap.on('fullscreenchange', function () {
      isMapFullscreen.value = leafletMap.isFullscreen();
    });
  }
};

const expandedReportPanel = ref(false);

const removeDialog = ref<{ show: boolean; report: Report | undefined }>({
  show: false,
  report: undefined,
});
const showRemoveConfirmation = (report: Report) => {
  removeDialog.value = { show: true, report };
};

const remove = async (report?: Report) => {
  if (report) {
    await removeReport(report.id);
    selectedReport.value = undefined;
    emit('remove', report);
  }
  removeDialog.value = { show: false, report: undefined };
};
</script>

<style lang="scss" scoped>
.wrapper {
  height: 700px;
  background-color: white;
  border: 1px solid #707070;
  display: grid;
  grid-template-rows: 180px 1fr;
  grid-gap: 20px;

  & > div {
    overflow-y: auto;
  }

  .detail {
    display: grid;
    grid-template-rows: 100%;
    grid-template-columns: 65% 35%;
    grid-gap: 10px;
    background-color: #ecf3f4;

    .message {
      white-space: pre-wrap;
      background-color: white;
      font-size: 16px;
    }
  }

  .pic img {
    max-width: 100%;
    max-height: 100%;
  }

  .list {
    .report-container {
      width: 100%;
      flex: 0 0;

      & :deep(.v-btn__content) {
        width: 100%;
      }

      &.is-selected {
        background-color: #f4f4be !important;
        border-color: #f4f4be !important;
      }
    }

    .report {
      width: 100%;
      display: grid;
      grid-template-columns: 150px 1fr 80px;
      align-items: center;

      .message {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .pressed-button {
      background-color: #f4f4be;
    }
  }
}

:deep(.leaflet-report-control) {
  background-color: white;

  .report-container {
    width: 300px;
    height: 50vh;
    display: flex;
    flex-direction: column;

    &.expanded {
      width: 50vw;
      height: 80vh;
    }

    & > div {
      flex-shrink: 0;
    }

    .message {
      font-size: 16px;
    }

    .pic {
      flex-grow: 1;
      height: 0;
      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
  }
}
</style>
