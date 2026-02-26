<template>
  <q-page padding>
    <div class="row items-center q-mb-md q-gutter-x-xs">
      <div class="text-h5 q-mr-sm">{{ t('apiary.title') }}</div>
      <q-btn flat dense round icon="refresh" @click="load">
        <q-tooltip>{{ t('toolbar.refresh') }}</q-tooltip>
      </q-btn>
      <q-btn flat dense round icon="add" color="secondary" @click="openCreate">
        <q-tooltip>{{ t('apiary.create') }}</q-tooltip>
      </q-btn>
    </div>

    <!-- Create / Edit Dialog -->
    <q-dialog v-model="dialogVisible">
      <q-card style="min-width: 340px">
        <q-card-section>
          <div class="text-h6">{{ editingId ? t('apiary.edit') : t('apiary.create') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-sm">
          <q-input
            v-model="form.name"
            :label="`${t('form.location')} *`"
            dense
            autofocus
            @keyup.enter="save"
          />
          <div class="row items-center q-gutter-sm q-mt-xs">
            <div>
              <label class="text-caption text-grey-7">{{ t('form.color') }}</label>
              <div class="q-mt-xs">
                <input
                  v-model="form.color"
                  type="color"
                  style="
                    width: 64px;
                    height: 36px;
                    border-radius: 4px;
                    border: 1px solid rgba(0, 0, 0, 0.24);
                    cursor: pointer;
                    padding: 2px;
                  "
                />
              </div>
            </div>
            <div
              :style="{
                background: form.color || '#B0BEC5',
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.12)',
              }"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn
            color="primary"
            :label="t('form.save')"
            :loading="saving"
            :disable="!form.name.trim()"
            @click="save"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirm Dialog -->
    <q-dialog v-model="confirmDeleteVisible">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ t('apiary.delete') }}</div>
        </q-card-section>
        <q-card-section>
          {{ t('messages.confirm_delete_location') }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('form.cancel')" v-close-popup />
          <q-btn
            color="negative"
            :label="t('hive.delete')"
            :loading="deleting"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-center q-mt-xl">
      <q-spinner size="48px" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!apiaries.length">
      <q-card flat bordered>
        <q-card-section class="text-center text-grey q-py-xl">
          <q-icon name="location_on" size="48px" class="q-mb-sm" />
          <div>{{ t('apiary.none') }}</div>
          <q-btn class="q-mt-md" color="primary" :label="t('apiary.create')" @click="openCreate" />
        </q-card-section>
      </q-card>
    </div>

    <!-- Apiary cards -->
    <div v-else class="row q-gutter-md">
      <q-card
        v-for="a in apiaries"
        :key="a.id"
        class="col-auto apiary-card"
        style="min-width: 280px; max-width: 360px"
      >
        <q-card-section class="row items-center no-wrap q-pb-sm">
          <div
            :style="{
              width: '6px',
              alignSelf: 'stretch',
              borderRadius: '4px',
              background: apiaryColor(a.id, a.color),
              marginRight: '14px',
              flexShrink: 0,
              minHeight: '40px',
            }"
          />
          <div class="col">
            <div class="text-h6">{{ a.name }}</div>
            <div class="text-caption text-grey">
              {{ t('apiary.hive_count', { n: hiveCounts[a.id] ?? 0 }) }}
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat dense icon="edit" :label="t('apiary.edit_short')" @click="openEdit(a)" />
          <q-btn
            flat
            dense
            icon="delete"
            color="negative"
            :label="t('hive.delete')"
            @click="askDelete(a.id)"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { OpenAPI } from '../api-client/core/OpenAPI';
import { DefaultService } from '../api-client/services/DefaultService';
import { getToken } from '../auth/token';
import { useQuasar } from 'quasar';
import { apiaryColor } from '../utils/apiaryColor';

const { t } = useI18n();
const $q = useQuasar();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);

const apiaries = ref<any[]>([]);
const hiveCounts = ref<Record<string, number>>({});

const dialogVisible = ref(false);
const confirmDeleteVisible = ref(false);

const editingId = ref<string | null>(null);
const deletingId = ref<string | null>(null);
const form = ref({ name: '', color: '#FFCA28' });

async function authedFetch(url: string, opts: RequestInit = {}) {
  const tok = getToken();
  return window.fetch(OpenAPI.BASE + url, {
    ...opts,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
      ...(opts.headers || {}),
    },
  });
}

async function load() {
  loading.value = true;
  try {
    const [apiaryRes, hiveRes] = await Promise.all([
      DefaultService.getApiV1Apiaries(),
      DefaultService.getApiV1Hives(undefined, undefined, undefined).catch(() => ({ items: [] })),
    ]);
    apiaries.value = (apiaryRes || []).map((a: any) => {
      const rawId = a.id || a._id;
      const id =
        typeof rawId === 'string'
          ? rawId
          : rawId?.$oid || rawId?.toString?.() || String(rawId ?? '');
      return { ...a, id };
    });

    // Compute hive counts per apiary
    const items: any[] = (hiveRes as any)?.items || hiveRes || [];
    const counts: Record<string, number> = {};
    for (const h of items) {
      const aid = h.apiaryId;
      if (aid) counts[aid] = (counts[aid] || 0) + 1;
    }
    hiveCounts.value = counts;
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.message || t('messages.failed') });
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  form.value = { name: '', color: '#FFCA28' };
  dialogVisible.value = true;
}

function openEdit(a: any) {
  editingId.value = a.id;
  form.value = { name: a.name || '', color: a.color || '#FFCA28' };
  dialogVisible.value = true;
}

async function save() {
  if (!form.value.name.trim()) return;
  saving.value = true;
  try {
    if (editingId.value) {
      const res = await authedFetch(`/api/v1/apiaries/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify({ name: form.value.name, color: form.value.color }),
      });
      if (!res.ok) throw new Error(await res.text());
      $q.notify({ type: 'positive', message: t('messages.updated') });
    } else {
      const res = await authedFetch('/api/v1/apiaries', {
        method: 'POST',
        body: JSON.stringify({ name: form.value.name, color: form.value.color }),
      });
      if (!res.ok) throw new Error(await res.text());
      $q.notify({ type: 'positive', message: t('messages.location_created') });
    }
    dialogVisible.value = false;
    load();
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.message || t('messages.failed') });
  } finally {
    saving.value = false;
  }
}

function askDelete(id: string) {
  deletingId.value = id;
  confirmDeleteVisible.value = true;
}

async function confirmDelete() {
  if (!deletingId.value) return;
  deleting.value = true;
  try {
    const res = await authedFetch(`/api/v1/apiaries/${deletingId.value}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    $q.notify({ type: 'positive', message: t('messages.deleted') });
    confirmDeleteVisible.value = false;
    load();
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e?.message || t('messages.failed') });
  } finally {
    deleting.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.apiary-card {
  transition: box-shadow 150ms ease;
}
.apiary-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
</style>
