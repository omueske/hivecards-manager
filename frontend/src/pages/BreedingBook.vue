<template>
  <div class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">{{ t('breedingBook.title') }}</div>
      <q-space />
      <q-btn
        flat
        icon="upload_file"
        :label="t('breedingBook.importCsv')"
        @click="pickCsv"
        class="q-mr-sm"
      />
      <q-btn
        flat
        icon="download"
        :label="t('breedingBook.exportCsv')"
        @click="exportCsv"
        class="q-mr-sm"
      />
      <q-btn
        color="primary"
        icon="add"
        rounded
        :label="t('breedingBook.create')"
        @click="openCreate"
      />
      <input
        ref="csvInput"
        type="file"
        accept=".csv,text/csv"
        style="display: none"
        @change="onCsvSelected"
      />
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner size="2em" />
    </div>

    <div v-else-if="entries.length === 0" class="text-grey text-center q-pa-xl">
      {{ t('breedingBook.none') }}
    </div>

    <q-table
      v-else
      :rows="entries"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :pagination="{ rowsPerPage: 15 }"
    >
      <template #body-cell-queenNameSnapshot="props">
        <q-td :props="props">{{ props.row.queenNameSnapshot || '-' }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense icon="edit" @click="openEdit(props.row)" />
          <q-btn flat dense icon="delete" color="negative" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogVisible">
      <q-card style="min-width: 720px; max-width: 92vw">
        <q-card-section class="text-h6">
          {{ editing ? t('breedingBook.edit') : t('breedingBook.create') }}
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.queenId"
                :options="queenOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                clearable
                dense
                outlined
                :label="t('breedingBook.queen')"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.hiveId"
                :options="hiveOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                clearable
                dense
                outlined
                :label="t('breedingBook.hive')"
              />
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.code1a"
                dense
                outlined
                readonly
                :label="t('breedingBook.code1a')"
                :hint="t('breedingBook.code1aAutoHint')"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.nst"
                dense
                outlined
                type="number"
                :label="t('breedingBook.nst')"
              />
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4">
              <q-input v-model="form.l1a" dense outlined :label="t('breedingBook.l1a')" />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="form.lv1a"
                dense
                outlined
                type="number"
                :label="t('breedingBook.lv1a')"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="form.z1a"
                dense
                outlined
                type="number"
                :label="t('breedingBook.z1a')"
              />
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.nr1a"
                dense
                outlined
                type="number"
                :label="t('breedingBook.nr1a')"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.j1a"
                dense
                outlined
                type="number"
                :label="t('breedingBook.j1a')"
              />
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.anpaarTyp"
                :options="anpaarTypOptions"
                emit-value
                map-options
                dense
                outlined
                clearable
                :label="t('breedingBook.anpaarTyp')"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.line" dense outlined :label="t('breedingBook.line')" />
            </div>
          </div>

          <q-input
            v-model="form.entryDate"
            dense
            outlined
            readonly
            :label="t('breedingBook.entryDate')"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.entryDate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            v-model="form.notes"
            type="textarea"
            autogrow
            dense
            outlined
            :label="t('breedingBook.notes')"
          />

          <q-btn
            flat
            dense
            color="primary"
            :icon="showAdditionalFields ? 'expand_less' : 'expand_more'"
            :label="t('breedingBook.moreFields')"
            @click="showAdditionalFields = !showAdditionalFields"
          />

          <div v-if="showAdditionalFields" class="q-gutter-sm">
            <div
              v-for="field in additionalFieldDefs"
              :key="field.key"
              class="row q-col-gutter-sm items-center"
            >
              <div class="col-12 col-md-6">
                <q-input
                  v-if="field.type === 'date'"
                  v-model="additionalFieldValues[field.key]"
                  dense
                  outlined
                  readonly
                  :label="field.label"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="additionalFieldValues[field.key]" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-else
                  v-model="additionalFieldValues[field.key]"
                  dense
                  outlined
                  :type="field.type"
                  :label="field.label"
                />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn color="primary" rounded :loading="saving" :label="t('form.save')" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialogVisible">
      <q-card>
        <q-card-section>{{ t('breedingBook.confirmDelete') }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn flat color="negative" :label="t('breedingBook.delete')" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="previewDialogVisible">
      <q-card style="min-width: 760px; max-width: 95vw">
        <q-card-section class="text-h6">{{ t('breedingBook.previewTitle') }}</q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md q-mb-sm">
            <div class="col-4">
              <strong>{{ t('breedingBook.previewTotal') }}:</strong> {{ csvPreview.total }}
            </div>
            <div class="col-4">
              <strong>{{ t('breedingBook.previewValid') }}:</strong> {{ csvPreview.valid }}
            </div>
            <div class="col-4">
              <strong>{{ t('breedingBook.previewInvalid') }}:</strong> {{ csvPreview.invalid }}
            </div>
          </div>

          <q-table
            v-if="csvPreview.previewRows.length > 0"
            :rows="csvPreview.previewRows"
            :columns="previewColumns"
            row-key="lineNo"
            dense
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          />

          <div v-if="csvPreview.errors.length > 0" class="q-mt-md">
            <div class="text-subtitle2 q-mb-xs">{{ t('breedingBook.previewErrors') }}</div>
            <div class="text-negative" style="max-height: 120px; overflow: auto">
              <div v-for="(err, idx) in csvPreview.errors.slice(0, 10)" :key="idx">- {{ err }}</div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn
            color="primary"
            rounded
            :disable="csvPreview.valid === 0"
            :label="t('breedingBook.importConfirm')"
            @click="confirmCsvImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { getToken } from '../auth/token';
import { OpenAPI } from '../api-client/core/OpenAPI';

const { t } = useI18n();
const $q = useQuasar();

const loading = ref(true);
const saving = ref(false);
const entries = ref<any[]>([]);
const queens = ref<any[]>([]);
const hives = ref<any[]>([]);
const editing = ref<any | null>(null);
const deleting = ref<any | null>(null);
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const showAdditionalFields = ref(false);
const additionalFieldValues = ref<Record<string, string>>({});
const csvInput = ref<HTMLInputElement | null>(null);
const previewDialogVisible = ref(false);
const csvPendingContent = ref('');
const csvPreview = ref<{
  total: number;
  valid: number;
  invalid: number;
  errors: string[];
  previewRows: any[];
}>({
  total: 0,
  valid: 0,
  invalid: 0,
  errors: [],
  previewRows: [],
});
const breederDefaults = ref<{
  breederCountry?: string;
  breederAssociation?: number;
  breederNumber?: number;
  defaultApiaryNumber?: number;
  defaultMatingType?: number;
} | null>(null);

const form = ref<any>(emptyForm());

const columns = computed(() => [
  {
    name: 'entryDate',
    label: t('breedingBook.entryDate'),
    field: 'entryDate',
    align: 'left' as const,
  },
  { name: 'code1a', label: t('breedingBook.code1a'), field: 'code1a', align: 'left' as const },
  {
    name: 'queenNameSnapshot',
    label: t('breedingBook.queen'),
    field: 'queenNameSnapshot',
    align: 'left' as const,
  },
  { name: 'nst', label: t('breedingBook.nst'), field: 'nst', align: 'left' as const },
  {
    name: 'anpaarTyp',
    label: t('breedingBook.anpaarTyp'),
    field: 'anpaarTyp',
    align: 'left' as const,
  },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
]);

const queenOptions = computed(() =>
  queens.value.map((q) => ({ label: q.name || q.id, value: q.id })),
);

const hiveOptions = computed(() =>
  hives.value.map((h) => ({ label: h.hiveNumber || h.id, value: h.id || h._id })),
);

const anpaarTypOptions = computed(() => [
  { label: `1 - ${t('breedingBook.matingType1')}`, value: 1 },
  { label: `2 - ${t('breedingBook.matingType2')}`, value: 2 },
  { label: `3 - ${t('breedingBook.matingType3')}`, value: 3 },
  { label: `4 - ${t('breedingBook.matingType4')}`, value: 4 },
]);

const additionalFieldDefs = computed(() => {
  const fields: Array<{ key: string; label: string; type: 'text' | 'number' | 'date' }> = [
    { key: 'PAARTYP', label: t('breedingBook.fieldPaartyp'), type: 'number' },
    { key: 'SCHLUPF', label: t('breedingBook.fieldSchlupf'), type: 'date' },
    { key: 'BESAMT', label: t('breedingBook.fieldBesamt'), type: 'date' },
    { key: 'EIABLAGE', label: t('breedingBook.fieldEiablage'), type: 'date' },
    { key: 'BEMERKUNG_LP', label: t('breedingBook.fieldBemerkungLp'), type: 'text' },
    { key: 'BEMERKUNG_ABST', label: t('breedingBook.fieldBemerkungAbst'), type: 'text' },
  ];
  for (let idx = 1; idx <= 7; idx++) {
    fields.push(
      { key: `BIMI${idx}`, label: `${t('breedingBook.fieldBimi')} ${idx}`, type: 'number' },
      { key: `BIMIGR${idx}`, label: `${t('breedingBook.fieldBimigr')} ${idx}`, type: 'number' },
      { key: `BIMID${idx}`, label: `${t('breedingBook.fieldBimid')} ${idx}`, type: 'date' },
      { key: `BOMI${idx}`, label: `${t('breedingBook.fieldBomi')} ${idx}`, type: 'number' },
      { key: `BOMITG${idx}`, label: `${t('breedingBook.fieldBomitg')} ${idx}`, type: 'number' },
      { key: `BOMID${idx}`, label: `${t('breedingBook.fieldBomid')} ${idx}`, type: 'date' },
    );
  }
  return fields;
});

const previewColumns = computed(() => [
  { name: 'lineNo', label: t('breedingBook.previewLine'), field: 'lineNo', align: 'left' as const },
  { name: 'code1a', label: t('breedingBook.code1a'), field: 'code1a', align: 'left' as const },
  { name: 'nst', label: t('breedingBook.nst'), field: 'nst', align: 'left' as const },
  {
    name: 'anpaarTyp',
    label: t('breedingBook.anpaarTyp'),
    field: 'anpaarTyp',
    align: 'left' as const,
  },
  { name: 'status', label: t('form.status'), field: 'status', align: 'left' as const },
  { name: 'message', label: t('messages.failed'), field: 'message', align: 'left' as const },
]);

function emptyForm() {
  return {
    queenId: null,
    hiveId: null,
    code1a: '',
    l1a: '',
    lv1a: null,
    z1a: null,
    nr1a: null,
    j1a: null,
    nst: null,
    anpaarTyp: null,
    line: '',
    entryDate: '',
    notes: '',
  };
}

function buildCode1aFromForm(): string {
  const l1a = String(form.value.l1a ?? '')
    .trim()
    .toUpperCase();
  const lv1a = Number.isInteger(form.value.lv1a) ? String(form.value.lv1a) : '';
  const z1a = Number.isInteger(form.value.z1a) ? String(form.value.z1a) : '';
  const nr1a = Number.isInteger(form.value.nr1a) ? String(form.value.nr1a) : '';
  const j1a = Number.isInteger(form.value.j1a) ? String(form.value.j1a) : '';

  if (!l1a || !lv1a || !z1a || !nr1a || !j1a) return '';
  return `${l1a}-${lv1a}-${z1a}-${nr1a}-${j1a}`;
}

function applyBreederDefaultsToCreateForm() {
  const defaults = breederDefaults.value;
  if (!defaults) return;

  form.value.l1a = defaults.breederCountry ?? '';
  form.value.lv1a = Number.isInteger(defaults.breederAssociation)
    ? defaults.breederAssociation
    : null;
  form.value.z1a = Number.isInteger(defaults.breederNumber) ? defaults.breederNumber : null;
  form.value.nst = Number.isInteger(defaults.defaultApiaryNumber)
    ? defaults.defaultApiaryNumber
    : null;
  form.value.anpaarTyp = Number.isInteger(defaults.defaultMatingType)
    ? defaults.defaultMatingType
    : null;
  form.value.j1a = new Date().getFullYear();
  form.value.code1a = buildCode1aFromForm();
}

function toFieldString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return String(value);
}

function toInt(value?: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.trunc(n);
}

function mapImportFieldsToDefined(entry: any) {
  const out: Record<string, string> = {};
  const importFields = entry?.importFields;
  if (importFields && typeof importFields === 'object') {
    for (const [key, value] of Object.entries(importFields)) {
      out[key] = toFieldString(value);
    }
  }

  if (entry?.paarTyp !== null && entry?.paarTyp !== undefined && !out.PAARTYP) {
    out.PAARTYP = String(entry.paarTyp);
  }

  const bimiSeries = Array.isArray(entry?.bimiSeries) ? entry.bimiSeries : [];
  for (const item of bimiSeries) {
    const nr = Number(item?.nr);
    if (!Number.isInteger(nr) || nr < 1 || nr > 7) continue;
    if (item?.value !== null && item?.value !== undefined) out[`BIMI${nr}`] = String(item.value);
    if (item?.gramm !== null && item?.gramm !== undefined) out[`BIMIGR${nr}`] = String(item.gramm);
    if (item?.dateRaw) out[`BIMID${nr}`] = String(item.dateRaw);
  }

  const bomiSeries = Array.isArray(entry?.bomiSeries) ? entry.bomiSeries : [];
  for (const item of bomiSeries) {
    const nr = Number(item?.nr);
    if (!Number.isInteger(nr) || nr < 1 || nr > 7) continue;
    if (item?.value !== null && item?.value !== undefined) out[`BOMI${nr}`] = String(item.value);
    if (item?.days !== null && item?.days !== undefined) out[`BOMITG${nr}`] = String(item.days);
    if (item?.dateRaw) out[`BOMID${nr}`] = String(item.dateRaw);
  }

  additionalFieldValues.value = out;
}

function buildImportFieldsFromDefined(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of additionalFieldDefs.value) {
    const value = String(additionalFieldValues.value[field.key] ?? '').trim();
    if (!value) continue;
    out[field.key] = value;
  }
  return out;
}

function buildBimiSeriesFromDefined() {
  const series: Array<{ nr: number; value?: number; gramm?: number; dateRaw?: string }> = [];
  for (let nr = 1; nr <= 7; nr++) {
    const value = toInt(additionalFieldValues.value[`BIMI${nr}`]);
    const gramm = toInt(additionalFieldValues.value[`BIMIGR${nr}`]);
    const dateRaw = String(additionalFieldValues.value[`BIMID${nr}`] ?? '').trim();
    if (value === undefined && gramm === undefined && !dateRaw) continue;
    series.push({ nr, value, gramm, dateRaw: dateRaw || undefined });
  }
  return series;
}

function buildBomiSeriesFromDefined() {
  const series: Array<{ nr: number; value?: number; days?: number; dateRaw?: string }> = [];
  for (let nr = 1; nr <= 7; nr++) {
    const value = toInt(additionalFieldValues.value[`BOMI${nr}`]);
    const days = toInt(additionalFieldValues.value[`BOMITG${nr}`]);
    const dateRaw = String(additionalFieldValues.value[`BOMID${nr}`] ?? '').trim();
    if (value === undefined && days === undefined && !dateRaw) continue;
    series.push({ nr, value, days, dateRaw: dateRaw || undefined });
  }
  return series;
}

async function api(path: string, method = 'GET', body?: any) {
  const token = getToken();
  const base = OpenAPI.BASE || '';
  const res = await fetch(base + path, {
    method,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return await res.json();
}

async function loadAll() {
  loading.value = true;
  try {
    const [entriesRes, queensRes, hivesRes, meRes] = await Promise.all([
      api('/api/v1/breeding-book'),
      api('/api/v1/queens'),
      api('/api/v1/hives?page=1&limit=200'),
      api('/api/v1/users/me'),
    ]);

    entries.value = Array.isArray(entriesRes) ? entriesRes : [];
    queens.value = Array.isArray(queensRes) ? queensRes : [];

    const hivesRaw = hivesRes as any;
    hives.value = hivesRaw?.items ?? (Array.isArray(hivesRaw) ? hivesRaw : []);

    const me = meRes as any;
    breederDefaults.value = {
      breederCountry: me?.breederCountry,
      breederAssociation: me?.breederAssociation,
      breederNumber: me?.breederNumber,
      defaultApiaryNumber: me?.defaultApiaryNumber,
      defaultMatingType: me?.defaultMatingType,
    };
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.message || t('messages.failed') });
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  form.value = emptyForm();
  applyBreederDefaultsToCreateForm();
  additionalFieldValues.value = {};
  showAdditionalFields.value = false;
  dialogVisible.value = true;
}

function openEdit(entry: any) {
  editing.value = entry;
  form.value = {
    queenId: entry.queenId ?? null,
    hiveId: entry.hiveId ?? null,
    code1a: entry.code1a ?? '',
    l1a: entry.l1a ?? '',
    lv1a: entry.lv1a ?? null,
    z1a: entry.z1a ?? null,
    nr1a: entry.nr1a ?? null,
    j1a: entry.j1a ?? null,
    nst: entry.nst ?? null,
    anpaarTyp: entry.anpaarTyp ?? null,
    line: entry.line ?? '',
    entryDate: entry.entryDate ?? '',
    notes: entry.notes ?? '',
  };
  mapImportFieldsToDefined(entry);
  showAdditionalFields.value = Object.keys(additionalFieldValues.value).length > 0;
  dialogVisible.value = true;
}

watch(
  () => [form.value.l1a, form.value.lv1a, form.value.z1a, form.value.nr1a, form.value.j1a],
  () => {
    if (editing.value) return;
    form.value.code1a = buildCode1aFromForm();
  },
);

async function save() {
  saving.value = true;
  try {
    const importFields = buildImportFieldsFromDefined();
    const pairType = toInt(additionalFieldValues.value.PAARTYP);
    const bimiSeries = buildBimiSeriesFromDefined();
    const bomiSeries = buildBomiSeriesFromDefined();

    const payload = {
      ...form.value,
      paarTyp: pairType,
      bimiSeries,
      bomiSeries,
      importFields,
    };

    if (editing.value?.id) {
      await api(`/api/v1/breeding-book/${editing.value.id}`, 'PUT', payload);
      $q.notify({ type: 'positive', message: t('messages.updated') });
    } else {
      await api('/api/v1/breeding-book', 'POST', payload);
      $q.notify({ type: 'positive', message: t('messages.created') });
    }

    dialogVisible.value = false;
    await loadAll();
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.message || t('messages.failed') });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(entry: any) {
  deleting.value = entry;
  deleteDialogVisible.value = true;
}

async function doDelete() {
  if (!deleting.value?.id) return;
  try {
    await api(`/api/v1/breeding-book/${deleting.value.id}`, 'DELETE');
    deleteDialogVisible.value = false;
    deleting.value = null;
    await loadAll();
    $q.notify({ type: 'positive', message: t('messages.deleted') });
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.message || t('messages.failed') });
  }
}

function pickCsv() {
  csvInput.value?.click();
}

async function exportCsv() {
  try {
    const token = getToken();
    const base = OpenAPI.BASE || '';
    const res = await fetch(base + '/api/v1/breeding-book/export-csv', {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `HTTP ${res.status}`);
    }

    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition') || '';
    const fileNameMatch = disposition.match(/filename="?([^";]+)"?/i);
    const fileName = fileNameMatch?.[1] || 'breeding-book-export.csv';

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);

    $q.notify({ type: 'positive', message: t('breedingBook.exportDone') });
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.message || t('messages.failed') });
  }
}

async function onCsvSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const csvContent = await file.text();
    csvPendingContent.value = csvContent;
    const preview = await api('/api/v1/breeding-book/preview-csv', 'POST', { csvContent });
    csvPreview.value = {
      total: preview?.total ?? 0,
      valid: preview?.valid ?? 0,
      invalid: preview?.invalid ?? 0,
      errors: Array.isArray(preview?.errors) ? preview.errors : [],
      previewRows: Array.isArray(preview?.previewRows) ? preview.previewRows : [],
    };
    previewDialogVisible.value = true;
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.message || t('messages.failed') });
  } finally {
    input.value = '';
  }
}

async function confirmCsvImport() {
  if (!csvPendingContent.value) return;
  try {
    const result = await api('/api/v1/breeding-book/import-csv', 'POST', {
      csvContent: csvPendingContent.value,
    });
    await loadAll();
    previewDialogVisible.value = false;

    const imported = result?.imported ?? 0;
    const failed = result?.failed ?? 0;
    const total = result?.total ?? 0;
    $q.notify({
      type: failed > 0 ? 'warning' : 'positive',
      message: `${t('breedingBook.importDone')}: ${imported}/${total}`,
    });

    if (failed > 0 && Array.isArray(result?.errors)) {
      $q.notify({
        type: 'warning',
        message: result.errors.slice(0, 3).join(' | '),
      });
    }
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.message || t('messages.failed') });
  }
}

onMounted(loadAll);
</script>
