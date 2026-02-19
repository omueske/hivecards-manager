<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="text-h5">{{ t('queen.title') }}</div>
      <q-space />
      <q-btn
        icon="add"
        :label="t('queen.create')"
        color="primary"
        rounded
        @click="openCreate"
      />
    </div>

    <!-- Filter chips -->
    <div class="row q-gutter-sm q-mb-md">
      <q-chip
        v-for="s in statusFilters"
        :key="s.value"
        :selected="activeFilter === s.value"
        :color="s.color"
        text-color="white"
        clickable
        @click="activeFilter = activeFilter === s.value ? null : s.value"
      >{{ s.label }}</q-chip>
    </div>

    <div v-if="loading" class="text-center q-pa-lg"><q-spinner size="2em" /></div>

    <div v-else-if="filtered.length === 0" class="text-grey text-center q-pa-xl">
      {{ t('queen.none') }}
    </div>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="queen in filtered"
        :key="(queen as any).id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6">{{ queen.name || `K-${queen.queenYear ?? '?'}` }}</div>
              <q-badge :color="statusColor(queen.status)" class="q-pa-xs">
                {{ t(`queen.status_${queen.status ?? 'spare'}`) }}
              </q-badge>
            </div>

            <div class="row q-col-gutter-xs q-mt-sm">
              <div class="col-6" v-if="queen.queenYear">
                <div class="text-caption text-grey">{{ t('hive.queenYear') }}</div>
                <div>{{ queen.queenYear }}</div>
              </div>
              <div class="col-6" v-if="queen.queenColor">
                <div class="text-caption text-grey">{{ t('hive.queenColor') }}</div>
                <div>{{ queen.queenColor }}</div>
              </div>
              <div class="col-6" v-if="queen.queenOrigin">
                <div class="text-caption text-grey">{{ t('hive.queenOrigin') }}</div>
                <div>{{ queen.queenOrigin }}</div>
              </div>
              <div class="col-6" v-if="queen.matingType">
                <div class="text-caption text-grey">{{ t('hive.matingType') }}</div>
                <div>{{ queen.matingType }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">{{ t('hive.queenMarked') }}</div>
                <div>{{ queen.queenMarked ? '✅' : '❌' }}</div>
              </div>
            </div>

            <!-- Current hive -->
            <div v-if="currentHiveOf(queen)" class="q-mt-sm text-caption">
              🐝 {{ t('queen.in_hive') }}: <strong>{{ currentHiveOf(queen) }}</strong>
            </div>

            <!-- History -->
            <div v-if="pastHives(queen).length > 0" class="q-mt-xs text-caption text-grey">
              {{ t('queen.past_hives') }}:
              <span v-for="(h, i) in pastHives(queen)" :key="i">
                {{ hiveName(h.hiveId) }}
                ({{ formatDate(h.from) }}–{{ formatDate(h.to) }})
                <span v-if="i < pastHives(queen).length - 1">, </span>
              </span>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat dense size="sm" icon="swap_horiz" :label="t('queen.assign')" @click="openAssign(queen)" />
            <q-btn flat dense size="sm" icon="edit" @click="openEdit(queen)" />
            <q-btn flat dense size="sm" icon="delete" color="negative" @click="confirmDelete(queen)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Create / Edit Dialog -->
    <QueenDialog
      v-model:visible="dialogVisible"
      :queen="editingQueen ?? undefined"
      @created="onCreated"
      @updated="onUpdated"
    />

    <!-- Assign Dialog -->
    <q-dialog v-model="assignDialogVisible">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">{{ t('queen.assign') }}</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-select
            v-model="assignHiveId"
            :options="hiveOptions"
            :label="t('form.location')"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
          />
          <q-input
            v-model="assignDate"
            :label="t('queen.assign_date')"
            type="date"
            dense
            outlined
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn color="primary" :label="t('form.save')" :loading="assignSaving" rounded @click="doAssign" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation -->
    <q-dialog v-model="deleteDialogVisible">
      <q-card>
        <q-card-section>{{ t('queen.confirm_delete') }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn flat color="negative" :label="t('queen.delete')" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { DefaultService } from '../api-client/services/DefaultService';
import type { Queen } from '../api-client/models/Queen';
import QueenDialog from '../components/QueenDialog.vue';

export default {
  components: { QueenDialog },
  setup() {
    const { t } = useI18n();

    const queens = ref<Queen[]>([]);
    const hives = ref<any[]>([]);
    const loading = ref(true);
    const activeFilter = ref<string | null>(null);

    const dialogVisible = ref(false);
    const editingQueen = ref<Queen | null>(null);
    const assignDialogVisible = ref(false);
    const assigningQueen = ref<Queen | null>(null);
    const assignHiveId = ref('');
    const assignDate = ref(new Date().toISOString().slice(0, 10));
    const assignSaving = ref(false);
    const deleteDialogVisible = ref(false);
    const deletingQueen = ref<Queen | null>(null);

    const statusFilters = [
      { value: 'active', label: 'Aktiv', color: 'positive' },
      { value: 'spare',  label: 'Reserve', color: 'info' },
      { value: 'dead',   label: 'Tot', color: 'grey' },
      { value: 'sold',   label: 'Verkauft', color: 'orange' },
    ];

    const filtered = computed(() =>
      activeFilter.value
        ? queens.value.filter((q) => q.status === activeFilter.value)
        : queens.value,
    );

    const hiveOptions = computed(() =>
      hives.value.map((h) => ({ label: h.hiveNumber, value: String(h._id || h.id) })),
    );

    onMounted(async () => {
      loading.value = true;
      try {
        const [qRes, hRes] = await Promise.allSettled([
          DefaultService.getApiV1Queens(),
          DefaultService.getApiV1Hives(undefined, undefined, 1, 200),
        ]);
        queens.value = (qRes.status === 'fulfilled' ? qRes.value : []) as Queen[];
        const hivesRaw = hRes.status === 'fulfilled' ? (hRes.value as any) : null;
        hives.value = hivesRaw?.items ?? (Array.isArray(hivesRaw) ? hivesRaw : []);
      } finally {
        loading.value = false;
      }
    });

    function hiveName(hiveId?: string): string {
      if (!hiveId) return '?';
      const h = hives.value.find((x) => String(x._id || x.id) === hiveId);
      return h ? h.hiveNumber : hiveId;
    }

    function currentHiveOf(queen: Queen): string | null {
      const open = (queen.hiveHistory ?? []).find((e) => !e.to);
      return open ? hiveName(open.hiveId) : null;
    }

    function pastHives(queen: Queen) {
      return (queen.hiveHistory ?? []).filter((e) => !!e.to);
    }

    function formatDate(d?: string) {
      if (!d) return '?';
      try { return new Date(d).toLocaleDateString('de-DE', { year: '2-digit', month: '2-digit', day: '2-digit' }); }
      catch { return d; }
    }

    function statusColor(s?: string) {
      return { active: 'positive', spare: 'info', dead: 'grey', sold: 'orange-7' }[s ?? 'spare'] ?? 'grey';
    }

    function openCreate() { editingQueen.value = null; dialogVisible.value = true; }
    function openEdit(q: Queen) { editingQueen.value = q; dialogVisible.value = true; }

    function openAssign(q: Queen) {
      assigningQueen.value = q;
      assignHiveId.value = '';
      assignDate.value = new Date().toISOString().slice(0, 10);
      assignDialogVisible.value = true;
    }

    async function doAssign() {
      if (!assigningQueen.value || !assignHiveId.value) return;
      assignSaving.value = true;
      try {
        const updated = await DefaultService.postApiV1QueensAssign(
          (assigningQueen.value as any).id,
          { hiveId: assignHiveId.value, from: assignDate.value },
        );
        const idx = queens.value.findIndex((q) => (q as any).id === (assigningQueen.value as any).id);
        if (idx >= 0) queens.value.splice(idx, 1, updated as Queen);
        assignDialogVisible.value = false;
        // @ts-ignore
        import('quasar').then(({ Notify }) => Notify.create({ type: 'positive', message: t('queen.assigned') }));
      } catch (e: any) {
        // @ts-ignore
        import('quasar').then(({ Notify }) => Notify.create({ type: 'negative', message: e?.message || t('messages.failed') }));
      } finally { assignSaving.value = false; }
    }

    function confirmDelete(q: Queen) { deletingQueen.value = q; deleteDialogVisible.value = true; }

    async function doDelete() {
      if (!deletingQueen.value) return;
      try {
        await DefaultService.deleteApiV1Queens((deletingQueen.value as any).id);
        queens.value = queens.value.filter((q) => (q as any).id !== (deletingQueen.value as any).id);
        // @ts-ignore
        import('quasar').then(({ Notify }) => Notify.create({ type: 'positive', message: t('queen.deleted') }));
      } catch (e: any) {
        // @ts-ignore
        import('quasar').then(({ Notify }) => Notify.create({ type: 'negative', message: e?.message || t('messages.failed') }));
      } finally { deleteDialogVisible.value = false; deletingQueen.value = null; }
    }

    function onCreated(q: Queen) { queens.value.unshift(q); }
    function onUpdated(q: Queen) {
      const idx = queens.value.findIndex((x) => (x as any).id === (q as any).id);
      if (idx >= 0) queens.value.splice(idx, 1, q);
    }

    return {
      t, queens, hives, loading, activeFilter, filtered, statusFilters, hiveOptions,
      dialogVisible, editingQueen,
      assignDialogVisible, assignHiveId, assignDate, assignSaving,
      deleteDialogVisible,
      hiveName, currentHiveOf, pastHives, formatDate, statusColor,
      openCreate, openEdit, openAssign, doAssign,
      confirmDelete, doDelete, onCreated, onUpdated,
    };
  },
};
</script>
