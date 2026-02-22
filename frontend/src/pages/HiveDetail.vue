<template>
  <div class="q-pa-md">
    <!-- Back button + Print -->
    <div class="row items-center justify-between q-mb-md no-print">
      <q-btn flat dense icon="arrow_back" :label="t('toolbar.back')" @click="goBack" />
      <q-btn v-if="hive" flat dense icon="print" :label="t('toolbar.print')" @click="printPage" />
    </div>

    <!-- Print-only header -->
    <div class="print-only print-header">
      <div class="print-title">Stockkarte</div>
      <div class="print-meta">Hivecards &bull; {{ new Date().toLocaleDateString('de-DE') }}</div>
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="2em" />
    </div>

    <template v-else-if="hive">
      <!-- ===== STOCKKARTE GRUNDDATEN ===== -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h5">{{ hive.hiveNumber }}</div>
            <q-badge
              :color="
                hive.status === 'active'
                  ? 'positive'
                  : hive.status === 'archived'
                  ? 'grey'
                  : 'warning'
              "
              class="q-pa-xs"
              >{{ hive.status }}</q-badge
            >
          </div>
          <div class="text-caption text-grey q-mt-xs">
            {{
              apiary
                ? apiary.name
                : hive.apiaryId
                ? t('messages.apiary_missing')
                : t('messages.no_location')
            }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6 col-sm-3" v-if="hive.frameCount">
              <div class="text-caption text-grey">{{ t('hive.frames') }}</div>
              <div>{{ hive.frameCount }}</div>
            </div>
            <div class="col-6 col-sm-3" v-if="hive.installationDate">
              <div class="text-caption text-grey">{{ t('form.installationDate') }}</div>
              <div>{{ formatDate(hive.installationDate) }}</div>
            </div>
            <div class="col-6 col-sm-3" v-if="hive.hiveBoxType">
              <div class="text-caption text-grey">{{ t('hive.hiveBoxType') }}</div>
              <div>{{ hive.hiveBoxType }}</div>
            </div>
            <div class="col-6 col-sm-3" v-if="hive.hiveType">
              <div class="text-caption text-grey">{{ t('hive.hiveType') }}</div>
              <div>{{ hive.hiveType }}</div>
            </div>
          </div>
          <div v-if="hive.notes" class="q-mt-sm text-body2 text-grey-8">{{ hive.notes }}</div>
        </q-card-section>

        <!-- Königin -->
        <q-separator />
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle2">🐝 {{ t('hive.queen_section') }}</div>
            <div class="row no-print">
              <q-btn
                flat
                dense
                round
                icon="edit"
                size="sm"
                :disable="!currentQueen"
                @click="openQueenEdit"
              />
              <q-btn flat dense round icon="add" size="sm" @click="openQueenCreate" />
            </div>
          </div>

          <!-- Aktuelle Königin -->
          <template v-if="currentQueen">
            <div class="row q-col-gutter-md">
              <div class="col-6 col-sm-3" v-if="currentQueen.name">
                <div class="text-caption text-grey">{{ t('queen.name') }}</div>
                <div>{{ currentQueen.name }}</div>
              </div>
              <div class="col-6 col-sm-3" v-if="currentQueen.queenYear">
                <div class="text-caption text-grey">{{ t('hive.queenYear') }}</div>
                <div>{{ currentQueen.queenYear }}</div>
              </div>
              <div class="col-6 col-sm-3" v-if="currentQueen.queenColor">
                <div class="text-caption text-grey">{{ t('hive.queenColor') }}</div>
                <div>{{ currentQueen.queenColor }}</div>
              </div>
              <div class="col-6 col-sm-3" v-if="currentQueen.queenOrigin">
                <div class="text-caption text-grey">{{ t('hive.queenOrigin') }}</div>
                <div>{{ currentQueen.queenOrigin }}</div>
              </div>
              <div class="col-6 col-sm-3" v-if="(currentQueen as any).matingType">
                <div class="text-caption text-grey">{{ t('hive.matingType') }}</div>
                <div>{{ (currentQueen as any).matingType }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey">{{ t('hive.queenMarked') }}</div>
                <div>{{ (currentQueen as any).queenMarked ? '✅' : '❌' }}</div>
              </div>
            </div>
          </template>
          <div v-else class="text-grey text-caption q-mt-xs">
            {{ t('hive.queen_none') }}
          </div>

          <!-- Vergangene Königinnen -->
          <div v-if="pastQueens.length > 0" class="q-mt-sm">
            <div class="text-caption text-grey q-mb-xs">{{ t('queen.past') }}</div>
            <div v-for="q in pastQueens" :key="(q as any).id" class="text-caption text-grey-7">
              {{ q.name || `K-${q.queenYear ?? '?'}` }}
              ({{ formatDate((q as any).hiveHistory?.find((e: any) => e.hiveId === hiveId)?.from) }}
              –
              {{ formatDate((q as any).hiveHistory?.find((e: any) => e.hiveId === hiveId && e.to)?.to)
              }})
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ===== CHRONOLOGIE ===== -->
      <div class="row items-center justify-between q-mb-sm no-print">
        <div class="row items-center q-gutter-x-sm">
          <div class="text-h6">{{ t('inspection.title') }}</div>
          <q-btn
            icon="add"
            :label="t('inspection.add')"
            color="primary"
            rounded
            size="sm"
            @click="openCreate"
          />
        </div>
        <q-btn-toggle
          v-model="listView"
          dense
          flat
          :options="[
            { icon: 'timeline', value: false },
            { icon: 'list', value: true },
          ]"
        />
      </div>
      <!-- Print-only section title -->
      <div class="print-only text-h6 q-mb-sm">{{ t('inspection.title') }}</div>

      <div v-if="inspectionsLoading" class="text-center q-pa-md"><q-spinner size="1.5em" /></div>

      <div v-else-if="inspections.length === 0" class="text-grey text-center q-pa-md">
        {{ t('inspection.none') }}
      </div>

      <!-- TIMELINE VIEW -->
      <q-timeline color="primary" v-else-if="!listView" class="no-print">
        <q-timeline-entry
          v-for="entry in inspections"
          :key="entry.id || entry.date"
          :title="formatDate(entry.date)"
          :subtitle="typeLabel(entry.type)"
          :icon="typeIcon(entry.type)"
          :color="typeColor(entry.type)"
        >
          <div>
            <div v-if="entry.time" class="text-caption text-grey q-mb-xs">
              🕐 {{ entry.time }} Uhr
            </div>
            <div v-if="entry.notes" class="q-mb-xs">{{ entry.notes }}</div>
            <!-- Durchsicht -->
            <div v-if="entry.type === 'inspection'" class="text-caption q-mt-xs row q-gutter-x-md">
              <span v-if="entry.queenSeen !== undefined && entry.queenSeen !== null">
                {{ t('inspection.queenSeen') }}: {{ entry.queenSeen ? '✅' : '❌' }}
              </span>
              <span v-if="entry.broodStatus"
                >{{ t('inspection.broodStatus') }}: {{ entry.broodStatus }}</span
              >
              <span v-if="entry.frameCount != null"
                >{{ t('hive.frames') }}: {{ entry.frameCount }}</span
              >
            </div>
            <!-- Behandlung -->
            <div v-if="entry.type === 'treatment'" class="text-caption q-mt-xs row q-gutter-x-md">
              <span v-if="entry.treatmentAgent"
                >{{ t('inspection.treatmentAgent') }}:
                <strong>{{ entry.treatmentAgent }}</strong></span
              >
              <span v-if="entry.treatmentAmount"
                >{{ t('inspection.treatmentAmount') }}: {{ entry.treatmentAmount }}</span
              >
            </div>
            <!-- Fütterung -->
            <div v-if="entry.type === 'feeding'" class="text-caption q-mt-xs row q-gutter-x-md">
              <span v-if="entry.feedingAgent"
                >{{ t('inspection.feedingAgent') }}: <strong>{{ entry.feedingAgent }}</strong></span
              >
              <span v-if="entry.feedingAmount"
                >{{ t('inspection.feedingAmount') }}: {{ entry.feedingAmount }}</span
              >
            </div>
            <!-- Ernte -->
            <div v-if="entry.type === 'harvest'" class="text-caption q-mt-xs">
              <span v-if="entry.harvestAmount"
                >{{ t('inspection.harvestAmount') }}:
                <strong>{{ entry.harvestAmount }}</strong></span
              >
            </div>
            <!-- Varroa -->
            <div
              v-if="
                entry.varroaCount != null &&
                (entry.type === 'inspection' || entry.type === 'treatment')
              "
              class="text-caption"
            >
              {{ t('inspection.varroaCount') }}: {{ entry.varroaCount }}
            </div>
            <div v-if="entry.weather" class="text-caption text-grey">☁️ {{ entry.weather }}</div>
          </div>
          <div class="row q-gutter-x-xs q-mt-xs">
            <q-btn flat dense size="xs" icon="edit" @click="openEdit(entry)" />
            <q-btn
              flat
              dense
              size="xs"
              icon="delete"
              color="negative"
              @click="confirmDelete(entry)"
            />
          </div>
        </q-timeline-entry>
      </q-timeline>

      <!-- LIST / TABLE VIEW -->
      <q-table
        v-else
        :rows="inspections"
        :columns="tableColumns"
        row-key="id"
        flat
        bordered
        dense
        :rows-per-page-options="[0]"
        hide-pagination
        class="inspection-table"
      >
        <!-- Datum -->
        <template #body-cell-date="props">
          <q-td :props="props">{{ formatDate(props.row.date) }}</q-td>
        </template>
        <!-- Typ -->
        <template #body-cell-type="props">
          <q-td :props="props">
            <q-icon
              :name="typeIcon(props.row.type)"
              :color="typeColor(props.row.type)"
              size="xs"
              class="q-mr-xs"
            />
            {{ typeLabel(props.row.type) }}
          </q-td>
        </template>
        <!-- Königin -->
        <template #body-cell-queenSeen="props">
          <q-td :props="props" class="text-center">
            <span v-if="props.row.type === 'inspection' && props.row.queenSeen !== undefined">
              {{ props.row.queenSeen ? '✅' : '❌' }}
            </span>
            <span v-else class="text-grey">–</span>
          </q-td>
        </template>
        <!-- Details (typ-spezifisch) -->
        <template #body-cell-details="props">
          <q-td :props="props">
            <template v-if="props.row.type === 'inspection'">
              <span v-if="props.row.broodStatus" class="q-mr-sm">{{ props.row.broodStatus }}</span>
              <span v-if="props.row.frameCount != null"
                >{{ props.row.frameCount }} {{ t('hive.frames') }}</span
              >
            </template>
            <template v-else-if="props.row.type === 'treatment'">
              <span v-if="props.row.treatmentAgent">{{ props.row.treatmentAgent }}</span
              ><span v-if="props.row.treatmentAmount" class="q-ml-xs text-grey-7">{{
                props.row.treatmentAmount
              }}</span>
            </template>
            <template v-else-if="props.row.type === 'feeding'">
              <span v-if="props.row.feedingAgent">{{ props.row.feedingAgent }}</span
              ><span v-if="props.row.feedingAmount" class="q-ml-xs text-grey-7">{{
                props.row.feedingAmount
              }}</span>
            </template>
            <template v-else-if="props.row.type === 'harvest'">
              <span v-if="props.row.harvestAmount">{{ props.row.harvestAmount }}</span>
            </template>
            <span v-else>–</span>
          </q-td>
        </template>
        <!-- Varroa -->
        <template #body-cell-varroaCount="props">
          <q-td :props="props" class="text-center">
            {{ props.row.varroaCount != null ? props.row.varroaCount : '–' }}
          </q-td>
        </template>
        <!-- Aktionen -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="no-print">
            <q-btn flat dense size="xs" icon="edit" @click="openEdit(props.row)" />
            <q-btn
              flat
              dense
              size="xs"
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            />
          </q-td>
        </template>
      </q-table>

      <!-- Print-only table (always shown on print, regardless of toggle) -->
      <table class="print-only print-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Typ</th>
            <th>Notiz</th>
            <th>Details</th>
            <th>👑 Königin / Brut</th>
            <th>Varroa</th>
            <th>Wetter</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in inspections" :key="(entry as any).id || entry.date">
            <td>
              {{ formatDate(entry.date) }}<span v-if="entry.time"> {{ entry.time }}</span>
            </td>
            <td>{{ typeLabel(entry.type) }}</td>
            <td>{{ entry.notes || '–' }}</td>
            <td>
              <template v-if="entry.type === 'inspection'">
                <span v-if="entry.broodStatus">{{ entry.broodStatus }} </span>
                <span v-if="entry.frameCount != null">{{ entry.frameCount }} Waben</span>
              </template>
              <template v-else-if="entry.type === 'treatment'">
                {{ entry.treatmentAgent
                }}<span v-if="entry.treatmentAmount"> {{ entry.treatmentAmount }}</span>
              </template>
              <template v-else-if="entry.type === 'feeding'">
                {{ entry.feedingAgent
                }}<span v-if="entry.feedingAmount"> {{ entry.feedingAmount }}</span>
              </template>
              <template v-else-if="entry.type === 'harvest'">
                {{ entry.harvestAmount }}
              </template>
              <span v-else>–</span>
            </td>
            <td class="text-center">
              <template v-if="entry.type === 'inspection' && entry.queenSeen !== undefined">
                {{ entry.queenSeen ? '✅' : '❌' }}
                <span v-if="entry.broodStatus"> {{ entry.broodStatus }}</span>
              </template>
              <span v-else>–</span>
            </td>
            <td class="text-center">{{ entry.varroaCount != null ? entry.varroaCount : '–' }}</td>
            <td>{{ entry.weather || '–' }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <div v-else>
      <p>{{ t('messages.hive_not_found') }}</p>
    </div>

    <!-- New/Edit Inspection Dialog -->
    <InspectionDialog
      v-if="hive"
      v-model:visible="inspectionDialogVisible"
      :hive-id="hiveId"
      :inspection="editingInspection ?? undefined"
      @created="onCreated"
      @updated="onUpdated"
    />

    <!-- Queen Create/Edit Dialog -->
    <QueenDialog
      v-if="hive"
      v-model:visible="queenDialogVisible"
      :queen="editingQueen ?? undefined"
      @created="onQueenCreated"
      @updated="onQueenUpdated"
    />

    <!-- Delete Confirmation -->
    <q-dialog v-model="deleteDialogVisible">
      <q-card>
        <q-card-section>{{ t('inspection.confirm_delete') }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn flat color="negative" :label="t('inspection.delete')" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { Hive } from '../api-client';
import type { Inspection } from '../api-client/models/Inspection';
import type { Queen } from '../api-client/models/Queen';
import { DefaultService } from '../api-client/services/DefaultService';
import InspectionDialog from '../components/InspectionDialog.vue';
import QueenDialog from '../components/QueenDialog.vue';

export default {
  components: { InspectionDialog, QueenDialog },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();
    const hiveId = route.params.id as string;
    const hive = ref<Hive | null>(null);
    const loading = ref(true);
    const apiary = ref<any | null>(null);

    const inspections = ref<Inspection[]>([]);
    const inspectionsLoading = ref(false);
    const inspectionDialogVisible = ref(false);
    const editingInspection = ref<Inspection | null>(null);
    const deleteDialogVisible = ref(false);
    const pendingDelete = ref<Inspection | null>(null);
    const queenDialogVisible = ref(false);
    const editingQueen = ref<Queen | null>(null);
    const queens = ref<Queen[]>([]);

    onMounted(async () => {
      loading.value = true;
      try {
        const res = await DefaultService.getApiV1Hives1(hiveId);
        hive.value = res as unknown as Hive;
        const rawAid = (hive.value as any)?.apiaryId;
        if (rawAid) {
          let aid: string | null = null;
          if (typeof rawAid === 'string') aid = rawAid;
          else if (rawAid && typeof rawAid === 'object')
            aid = rawAid.$oid || rawAid._id || String(rawAid);
          if (aid && /^[a-fA-F0-9]{24}$/.test(aid)) {
            try {
              apiary.value = await DefaultService.getApiV1Apiaries1(aid);
            } catch {
              /* ignore */
            }
          }
        }
      } catch {
        hive.value = null;
      } finally {
        loading.value = false;
      }
      await Promise.all([loadInspections(), loadQueens()]);
    });

    async function loadInspections() {
      inspectionsLoading.value = true;
      try {
        const res = await DefaultService.getApiV1Inspections(hiveId, undefined, undefined, 1, 100);
        inspections.value = ((res as any).items || []) as Inspection[];
      } catch {
        inspections.value = [];
      } finally {
        inspectionsLoading.value = false;
      }
    }

    async function loadQueens() {
      try {
        const res = await DefaultService.getApiV1Queens(hiveId);
        queens.value = res as any as Queen[];
      } catch {
        queens.value = [];
      }
    }

    const currentQueen = computed(
      () =>
        queens.value.find((q) =>
          (q.hiveHistory ?? []).some((e: any) => e.hiveId === hiveId && !e.to),
        ) ?? null,
    );

    const pastQueens = computed(() =>
      queens.value.filter(
        (q) =>
          (q.hiveHistory ?? []).some((e: any) => e.hiveId === hiveId && !!e.to) &&
          !(q.hiveHistory ?? []).some((e: any) => e.hiveId === hiveId && !e.to),
      ),
    );

    const listView = ref(false);

    const tableColumns: any[] = [
      { name: 'date', label: 'Datum', field: 'date', align: 'left', sortable: true },
      { name: 'type', label: 'Typ', field: 'type', align: 'left' },
      { name: 'notes', label: 'Notiz', field: 'notes', align: 'left' },
      { name: 'details', label: 'Details', field: 'details', align: 'left' },
      { name: 'queenSeen', label: '👑', field: 'queenSeen', align: 'center' },
      { name: 'varroaCount', label: 'Varroa', field: 'varroaCount', align: 'center' },
      { name: 'weather', label: '☁️', field: 'weather', align: 'left' },
      { name: 'actions', label: '', field: 'actions', align: 'right' },
    ];

    function openCreate() {
      editingInspection.value = null;
      inspectionDialogVisible.value = true;
    }
    function openEdit(e: Inspection) {
      editingInspection.value = e;
      inspectionDialogVisible.value = true;
    }
    function openQueenCreate() {
      editingQueen.value = null;
      queenDialogVisible.value = true;
    }
    function openQueenEdit() {
      editingQueen.value = currentQueen.value;
      queenDialogVisible.value = true;
    }
    function confirmDelete(e: Inspection) {
      pendingDelete.value = e;
      deleteDialogVisible.value = true;
    }

    async function doDelete() {
      if (!pendingDelete.value) return;
      try {
        await DefaultService.deleteApiV1Inspections((pendingDelete.value as any).id);
        inspections.value = inspections.value.filter(
          (i: any) => i.id !== (pendingDelete.value as any).id,
        );
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'positive', message: t('inspection.deleted') }),
        );
      } catch (e: any) {
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'negative', message: e?.message || t('messages.failed') }),
        );
      } finally {
        deleteDialogVisible.value = false;
        pendingDelete.value = null;
      }
    }

    function onCreated(e: Inspection) {
      inspections.value = [e, ...inspections.value].sort((a: any, b: any) =>
        b.date > a.date ? 1 : -1,
      );
    }
    function onUpdated(u: Inspection) {
      const idx = inspections.value.findIndex((i: any) => i.id === (u as any).id);
      if (idx >= 0) inspections.value.splice(idx, 1, u);
      inspections.value.sort((a: any, b: any) => (b.date > a.date ? 1 : -1));
    }

    function onQueenUpdated(updatedQueen: Queen) {
      const idx = queens.value.findIndex((q: any) => q.id === (updatedQueen as any).id);
      if (idx >= 0) queens.value.splice(idx, 1, updatedQueen);
    }

    async function onQueenCreated(newQueen: Queen) {
      // Auto-assign the new queen to this hive
      try {
        const assigned = await DefaultService.postApiV1QueensAssign((newQueen as any).id, {
          hiveId,
          from: new Date().toISOString(),
        });
        queens.value.unshift(assigned as Queen);
      } catch {
        queens.value.unshift(newQueen);
      }
    }

    function printPage() {
      window.print();
    }

    function goBack() {
      router.back();
      setTimeout(() => {
        const p = router.currentRoute.value?.fullPath || '';
        if (p === '/login' || p.startsWith('/login?')) router.replace('/');
      }, 60);
    }

    function formatDate(d?: string) {
      if (!d) return '-';
      try {
        return new Date(d).toLocaleDateString('de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      } catch {
        return d;
      }
    }

    const TYPE_META: Record<string, { icon: string; color: string }> = {
      inspection: { icon: 'search', color: 'primary' },
      treatment: { icon: 'healing', color: 'negative' },
      feeding: { icon: 'lunch_dining', color: 'orange' },
      harvest: { icon: 'local_florist', color: 'amber' },
      note: { icon: 'notes', color: 'grey' },
    };

    const typeLabel = (type?: string) => t(`inspection.type_${type || 'note'}` as any);
    const typeIcon = (type?: string) => TYPE_META[type ?? 'note']?.icon ?? 'notes';
    const typeColor = (type?: string) => TYPE_META[type ?? 'note']?.color ?? 'grey';

    return {
      hiveId,
      hive,
      loading,
      apiary,
      inspections,
      inspectionsLoading,
      inspectionDialogVisible,
      editingInspection,
      deleteDialogVisible,
      queenDialogVisible,
      editingQueen,
      queens,
      currentQueen,
      pastQueens,
      listView,
      tableColumns,
      openCreate,
      openEdit,
      confirmDelete,
      doDelete,
      onCreated,
      onUpdated,
      openQueenCreate,
      openQueenEdit,
      onQueenCreated,
      onQueenUpdated,
      goBack,
      printPage,
      formatDate,
      typeLabel,
      typeIcon,
      typeColor,
      t,
    };
  },
};
</script>

<style scoped>
/* ===== PRINT STYLES ===== */
.print-only {
  display: none;
}

@media print {
  /* Hide all interactive chrome */
  .no-print {
    display: none !important;
  }

  /* Show print-only elements */
  .print-only {
    display: block !important;
  }

  /* Remove padding/shadow from the page wrapper */
  .q-pa-md {
    padding: 0 !important;
  }

  /* Remove card box shadows */
  .q-card {
    box-shadow: none !important;
    border: 1px solid #ccc;
    page-break-inside: avoid;
  }
  .q-card.q-mb-md {
    margin-bottom: 12pt !important;
  }

  /* Print header */
  .print-header {
    display: flex !important;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 2px solid #333;
    margin-bottom: 12pt;
    padding-bottom: 4pt;
  }
  .print-title {
    font-size: 18pt;
    font-weight: bold;
  }
  .print-meta {
    font-size: 9pt;
    color: #555;
  }

  /* Timeline hidden on print, table always visible */
  .no-print.q-timeline {
    display: none !important;
  }

  /* Print table */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    margin-top: 6pt;
  }
  .print-table th,
  .print-table td {
    border: 1px solid #bbb;
    padding: 4pt 6pt;
    text-align: left;
    vertical-align: top;
  }
  .print-table th {
    background: #f0f0f0;
    font-weight: bold;
  }
  .print-table tr:nth-child(even) td {
    background: #fafafa;
  }
  .text-center {
    text-align: center;
  }

  /* Page settings */
  @page {
    size: A4 landscape;
    margin: 15mm 12mm;
  }
}
</style>
