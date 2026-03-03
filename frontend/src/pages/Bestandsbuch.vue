<template>
  <div class="q-pa-md bestandsbuch-page">
    <div class="row items-center q-gutter-sm q-mb-md no-print">
      <div class="text-h5">{{ t('bestandsbuch.title') }}</div>
      <q-space />
      <q-select
        v-model="selectedYear"
        :options="yearOptions"
        dense
        outlined
        style="min-width: 120px"
        :label="t('bestandsbuch.year')"
        @update:model-value="loadEntries"
      />
      <q-btn
        color="primary"
        icon="add"
        rounded
        :label="t('bestandsbuch.create')"
        @click="openCreate"
      />
      <q-btn flat icon="print" :label="t('bestandsbuch.printYear')" @click="printPage" />
    </div>

    <div class="print-only print-header q-mb-md">
      <div class="text-h5">{{ t('bestandsbuch.title') }} {{ selectedYear }}</div>
      <div class="text-caption">Hivecards • {{ new Date().toLocaleDateString('de-DE') }}</div>
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="2em" />
    </div>

    <q-table
      v-else
      :rows="entries"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 20 }"
    >
      <template #body-cell-applicationDate="props">
        <q-td :props="props">{{ formatDate(props.row.applicationDate) }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" class="no-print">
          <q-btn flat dense icon="edit" @click="openEdit(props.row)" />
          <q-btn flat dense icon="delete" color="negative" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogVisible">
      <q-card style="min-width: 880px; max-width: 95vw">
        <q-card-section class="text-h6">
          {{ editing ? t('bestandsbuch.edit') : t('bestandsbuch.create') }}
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div class="text-subtitle2">{{ t('bestandsbuch.applicationDate') }}</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.applicationDate"
                type="date"
                outlined
                dense
                :label="t('bestandsbuch.applicationDate')"
              />
            </div>
          </div>

          <div class="text-subtitle2 q-mt-sm">
            {{ t('bestandsbuch.apiaryName') }} / {{ t('bestandsbuch.hive') }}
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-3">
              <q-select
                v-model="selectedApiaryId"
                :options="apiaryOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                dense
                outlined
                clearable
                :label="t('bestandsbuch.apiaryName')"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="form.hiveId"
                :options="hiveOptionsFiltered"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                dense
                outlined
                clearable
                :label="t('bestandsbuch.hive')"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                :model-value="form.hiveLabel || ''"
                outlined
                dense
                readonly
                :label="t('bestandsbuch.hiveLabel')"
              />
            </div>
          </div>

          <div class="text-subtitle2 q-mt-sm">{{ t('bestandsbuch.medicineName') }}</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-5">
              <q-select
                v-model="form.medicineName"
                :options="treatmentAgents"
                clearable
                outlined
                dense
                :label="t('bestandsbuch.medicineName')"
              />
            </div>
            <div class="col-12 col-md-1">
              <q-btn
                flat
                dense
                icon="add"
                :label="t('form.new')"
                @click="openAddMedicationDialog"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="form.amount" outlined dense :label="t('bestandsbuch.amount')" />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.administrationType"
                outlined
                dense
                :label="t('bestandsbuch.administrationType')"
              />
            </div>
          </div>

          <div class="text-subtitle2 q-mt-sm">{{ t('bestandsbuch.treatmentDuration') }}</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.withdrawalPeriod"
                outlined
                dense
                :label="t('bestandsbuch.withdrawalPeriod')"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.treatmentDuration"
                outlined
                dense
                :label="t('bestandsbuch.treatmentDuration')"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.treatedBy"
                outlined
                dense
                :label="t('bestandsbuch.treatedBy')"
              />
            </div>
          </div>

          <div class="text-subtitle2 q-mt-sm">{{ t('bestandsbuch.supplierNameAddress') }}</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.supplierNameAddress"
                outlined
                dense
                :label="t('bestandsbuch.supplierNameAddress')"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.prescribingVet"
                outlined
                dense
                :label="t('bestandsbuch.prescribingVet')"
              />
            </div>
          </div>

          <div class="text-subtitle2 q-mt-sm">{{ t('bestandsbuch.beekeeperName') }}</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.beekeeperName"
                outlined
                dense
                :label="t('bestandsbuch.beekeeperName')"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.streetHouseNumber"
                outlined
                dense
                :label="t('bestandsbuch.streetHouseNumber')"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                v-model="form.postalCode"
                outlined
                dense
                :label="t('bestandsbuch.postalCode')"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input v-model="form.city" outlined dense :label="t('bestandsbuch.city')" />
            </div>
          </div>

          <div class="text-subtitle2 q-mt-sm">{{ t('bestandsbuch.notes') }}</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4">
              <q-input v-model="form.phone" outlined dense :label="t('bestandsbuch.phone')" />
            </div>
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.notes"
                outlined
                dense
                type="textarea"
                autogrow
                :label="t('bestandsbuch.notes')"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn color="primary" rounded :loading="saving" :label="t('form.save')" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="addMedicationDialogVisible">
      <q-card style="min-width: 440px">
        <q-card-section class="text-h6">{{
          t('inspection.newTreatmentAgentLabel')
        }}</q-card-section>
        <q-card-section>
          <q-input
            v-model="newMedicationName"
            dense
            outlined
            autofocus
            :label="t('inspection.newTreatmentAgentLabel')"
            @keyup.enter="saveNewMedication"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn
            color="primary"
            :disable="!newMedicationName.trim()"
            :label="t('form.submit')"
            @click="saveNewMedication"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialogVisible">
      <q-card>
        <q-card-section>{{ t('bestandsbuch.confirmDelete') }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn flat color="negative" :label="t('bestandsbuch.delete')" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import type { BestandsbuchEntry } from '../api-client/models/BestandsbuchEntry';
import type { CreateBestandsbuchEntryRequest } from '../api-client/models/CreateBestandsbuchEntryRequest';
import { DefaultService } from '../api-client/services/DefaultService';

const { t } = useI18n();
const $q = useQuasar();

const loading = ref(true);
const saving = ref(false);
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const addMedicationDialogVisible = ref(false);
const newMedicationName = ref('');
const editing = ref<BestandsbuchEntry | null>(null);
const deleting = ref<BestandsbuchEntry | null>(null);

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const years = ref<number[]>([]);
const entries = ref<BestandsbuchEntry[]>([]);
const hives = ref<Array<{ id: string; hiveNumber: string; apiaryId?: string }>>([]);
const apiaries = ref<Array<{ id: string; name: string }>>([]);
const treatmentAgents = ref<string[]>([]);
const user = ref<{
  username?: string;
  streetHouseNumber?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  operationNumber?: string;
  dateInputMode?: 'full' | 'dayMonth' | 'week';
} | null>(null);
const selectedApiaryId = ref<string | undefined>(undefined);

const DEFAULT_TREATMENT_AGENTS = ['Ameisensäure 60%', 'Ameisensäure 85%', 'Oxuvar', 'Bienenwohl'];

const columns = computed(() => [
  { name: 'sequenceNo', label: t('bestandsbuch.sequenceNo'), field: 'sequenceNo', align: 'left' },
  {
    name: 'applicationDate',
    label: t('bestandsbuch.applicationDate'),
    field: 'applicationDate',
    align: 'left',
  },
  { name: 'hiveLabel', label: t('bestandsbuch.hiveLabel'), field: 'hiveLabel', align: 'left' },
  {
    name: 'medicineName',
    label: t('bestandsbuch.medicineName'),
    field: 'medicineName',
    align: 'left',
  },
  {
    name: 'administrationType',
    label: t('bestandsbuch.administrationType'),
    field: 'administrationType',
    align: 'left',
  },
  { name: 'amount', label: t('bestandsbuch.amount'), field: 'amount', align: 'left' },
  { name: 'treatedBy', label: t('bestandsbuch.treatedBy'), field: 'treatedBy', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]);

const yearOptions = computed(() => {
  const sorted = Array.from(new Set([currentYear, ...years.value])).sort((a, b) => b - a);
  return sorted;
});

const apiaryOptions = computed(() =>
  apiaries.value.map((item) => ({ value: item.id, label: item.name })),
);

const hiveOptions = computed(() => hives.value.map((h) => ({ value: h.id, label: h.hiveNumber })));

const hiveOptionsFiltered = computed(() => {
  if (!selectedApiaryId.value) return hiveOptions.value;
  return hives.value
    .filter((item) => item.apiaryId === selectedApiaryId.value)
    .map((h) => ({ value: h.id, label: h.hiveNumber }));
});

const form = ref<CreateBestandsbuchEntryRequest>(initialForm());

function initialForm(): CreateBestandsbuchEntryRequest {
  return {
    hiveId: undefined,
    applicationDate: new Date().toISOString().slice(0, 10),
    hiveLabel: '',
    apiaryName: '',
    operationNumber: user.value?.operationNumber || '',
    medicineName: '',
    supplierNameAddress: '',
    administrationType: '',
    amount: '',
    withdrawalPeriod: '',
    treatedBy: user.value?.username || '',
    prescribingVet: '',
    treatmentDuration: '',
    beekeeperName: user.value?.username || '',
    streetHouseNumber: user.value?.streetHouseNumber || '',
    postalCode: user.value?.postalCode || '',
    city: user.value?.city || '',
    phone: user.value?.phone || '',
    notes: '',
  };
}

function toId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object' && value !== null && '_id' in (value as any))
    return String((value as any)._id);
  if (typeof value === 'object' && value !== null && 'id' in (value as any))
    return String((value as any).id);
  return '';
}

watch(
  () => form.value.hiveId,
  (hiveId) => {
    if (!hiveId) {
      form.value.hiveLabel = '';
      return;
    }
    const hive = hives.value.find((item) => item.id === hiveId);
    if (!hive) return;
    const hiveNumber = hive.hiveNumber || '';
    const apiary = apiaries.value.find((item) => item.id === hive.apiaryId);
    const apiaryName = apiary?.name || '';
    selectedApiaryId.value = hive.apiaryId;
    form.value.apiaryName = apiaryName;
    form.value.hiveLabel = [apiaryName, hiveNumber].filter(Boolean).join(' - ');
  },
);

watch(selectedApiaryId, (apiaryId) => {
  if (!apiaryId) {
    form.value.apiaryName = '';
    return;
  }
  const apiary = apiaries.value.find((item) => item.id === apiaryId);
  form.value.apiaryName = apiary?.name || '';

  const currentHive = hives.value.find((item) => item.id === form.value.hiveId);
  if (currentHive && currentHive.apiaryId !== apiaryId) {
    form.value.hiveId = undefined;
    form.value.hiveLabel = '';
  }
});

onMounted(async () => {
  await Promise.all([loadMasterData(), loadYears()]);
  await loadEntries();
});

async function loadMasterData() {
  const [hivesRes, apiariesRes, agentsRes, meRes] = await Promise.allSettled([
    DefaultService.getApiV1Hives(undefined, undefined, undefined, 1, 500),
    DefaultService.getApiV1Apiaries(),
    DefaultService.getApiV1TreatmentAgents('treatment'),
    DefaultService.getApiV1UsersMe(),
  ]);

  const hivesData = hivesRes.status === 'fulfilled' ? (hivesRes.value as any)?.items || [] : [];
  hives.value = (Array.isArray(hivesData) ? hivesData : []).map((item: any) => ({
    id: toId(item.id ?? item._id),
    hiveNumber: String(item.hiveNumber || ''),
    apiaryId: toId(item.apiaryId),
  }));

  const apiariesData = apiariesRes.status === 'fulfilled' ? apiariesRes.value : [];
  apiaries.value = (Array.isArray(apiariesData) ? apiariesData : []).map((item: any) => ({
    id: toId(item.id ?? item._id),
    name: String(item.name || ''),
  }));

  const agentsData = agentsRes.status === 'fulfilled' ? agentsRes.value : [];
  const apiAgentNames = (Array.isArray(agentsData) ? agentsData : [])
    .map((item: any) => String(item?.name || '').trim())
    .filter(Boolean);
  treatmentAgents.value = Array.from(new Set([...DEFAULT_TREATMENT_AGENTS, ...apiAgentNames]));

  user.value = meRes.status === 'fulfilled' ? (meRes.value as any) : null;
}

async function loadYears() {
  try {
    const result = await DefaultService.getApiV1BestandsbuchYears();
    years.value = Array.isArray(result) ? result : [];
  } catch {
    years.value = [currentYear];
  }
}

async function loadEntries() {
  loading.value = true;
  try {
    const result = await DefaultService.getApiV1Bestandsbuch(selectedYear.value);
    entries.value = Array.isArray(result) ? result : [];
  } catch {
    entries.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  selectedApiaryId.value = undefined;
  form.value = initialForm();
  dialogVisible.value = true;
}

function openEdit(row: BestandsbuchEntry) {
  editing.value = row;
  form.value = {
    ...initialForm(),
    ...row,
  };
  const hive = hives.value.find((item) => item.id === row.hiveId);
  selectedApiaryId.value =
    hive?.apiaryId || apiaries.value.find((item) => item.name === row.apiaryName)?.id;
  dialogVisible.value = true;
}

function confirmDelete(row: BestandsbuchEntry) {
  deleting.value = row;
  deleteDialogVisible.value = true;
}

async function save() {
  saving.value = true;
  try {
    if (editing.value?.id) {
      await DefaultService.putApiV1Bestandsbuch(editing.value.id, form.value);
    } else {
      await DefaultService.postApiV1Bestandsbuch(form.value);
    }
    dialogVisible.value = false;
    await Promise.all([loadYears(), loadEntries()]);
    $q.notify({ type: 'positive', message: t('messages.updated') });
  } catch {
    $q.notify({ type: 'negative', message: t('messages.failed') });
  } finally {
    saving.value = false;
  }
}

async function doDelete() {
  if (!deleting.value?.id) return;
  try {
    await DefaultService.deleteApiV1Bestandsbuch(deleting.value.id);
    deleteDialogVisible.value = false;
    deleting.value = null;
    await Promise.all([loadYears(), loadEntries()]);
    $q.notify({ type: 'positive', message: t('messages.deleted') });
  } catch {
    $q.notify({ type: 'negative', message: t('messages.failed') });
  }
}

function openAddMedicationDialog() {
  newMedicationName.value = '';
  addMedicationDialogVisible.value = true;
}

async function saveNewMedication() {
  const name = newMedicationName.value.trim();
  if (!name) return;
  try {
    await DefaultService.postApiV1TreatmentAgents({ name, category: 'treatment' as any });
    treatmentAgents.value = Array.from(new Set([...treatmentAgents.value, name]));
    form.value.medicineName = name;
    addMedicationDialogVisible.value = false;
    $q.notify({ type: 'positive', message: t('inspection.newTreatmentAgentAdded') });
  } catch {
    $q.notify({ type: 'negative', message: t('messages.failed') });
  }
}

function printPage() {
  window.print();
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const mode = user.value?.dateInputMode || 'full';
  if (mode === 'dayMonth') {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }
  if (mode === 'week') {
    const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    current.setUTCDate(current.getUTCDate() + 4 - (current.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((current.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `KW ${String(weekNo).padStart(2, '0')}`;
  }

  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  :deep(.q-table__bottom) {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .bestandsbuch-page {
    padding: 0;
  }
}

.print-only {
  display: none;
}
</style>
