<template>
  <q-page padding>
    <div class="row items-center q-mb-md q-gutter-x-xs">
      <div class="text-h5 q-mr-sm">{{ t('hive.title') }}</div>
      <q-btn flat dense round icon="refresh" aria-label="Refresh" @click="fetch">
        <q-tooltip>{{ t('toolbar.refresh') }}</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        round
        :color="showArchived ? 'primary' : undefined"
        icon="archive"
        @click="showArchived = !showArchived"
      >
        <q-tooltip>{{ t('toolbar.show_archived') }}</q-tooltip>
      </q-btn>
      <q-btn
        v-if="token"
        flat
        dense
        color="secondary"
        icon="add"
        :label="t('toolbar.create')"
        @click="openCreate"
      >
        <q-tooltip>{{ t('hive.create') }}</q-tooltip>
      </q-btn>
    </div>

    <div class="app-content">
      <!-- debug: token output removed -->
      <div v-if="!token">
        <q-card>
          <q-card-section>
            {{ t('messages.login_first') }} —
            <router-link to="/login">{{ t('auth.login') }}</router-link>
          </q-card-section>
        </q-card>
      </div>

      <div v-else>
        <div class="q-gutter-md">
          <q-spinner v-if="loading" size="40px" class="q-mt-md" />

          <div v-else-if="hives.length" class="q-gutter-md">
            <div
              v-for="(items, key) in grouped"
              :key="key"
              :class="['q-mb-md', { 'drop-target': dragOverKey === key }]"
              :style="{
                border: apiaryColors[key]
                  ? '2px solid ' + apiaryColors[key]
                  : '1px solid transparent',
                borderRadius: '8px',
                padding: '8px',
              }"
            >
              <div
                class="text-subtitle2 q-mb-sm"
                :style="{
                  fontWeight: 600,
                  padding: '8px',
                  borderRadius: '6px',
                  transition: 'box-shadow 120ms, background 120ms',
                  background: dragOverKey === key ? 'rgba(76,175,80,0.08)' : undefined,
                  boxShadow:
                    dragOverKey === key ? 'inset 0 0 0 2px rgba(76,175,80,0.12)' : undefined,
                  border:
                    dragOverKey === key
                      ? '1px dashed rgba(76,175,80,0.24)'
                      : '1px solid transparent',
                  borderLeft: apiaryColors[key] ? '4px solid ' + apiaryColors[key] : undefined,
                }"
                @dragover.prevent
                @dragenter.prevent="onDragEnter(key)"
                @dragleave="onDragLeave(key)"
                @drop.prevent="onDrop($event, key)"
              >
                <span>{{
                  (apiaries[key] && apiaries[key].name) ||
                  (key === '__no_location' ? t('messages.no_location') : key)
                }}</span>
                <span v-if="key !== '__no_location'" class="text-caption" style="margin-left: 8px"
                  >({{ t('messages.drop_here') }})</span
                >
              </div>
              <div class="row q-gutter-md">
                <div v-for="h in items" :key="h.id || h._id" class="col-12 col-sm-6 col-md-4">
                  <q-card
                    clickable
                    class="my-card"
                    @click="goTo(h.id || h._id)"
                    draggable="true"
                    @dragstart="onDragStart($event, h)"
                    :style="{ borderColor: apiaryColors[h.apiaryId] || undefined }"
                  >
                    <q-card-section>
                      <div class="text-h6">
                        {{ h.hiveNumber }} <span class="text-subtitle2">— {{ h.status }}</span>
                      </div>
                      <div class="text-caption">
                        {{ t('form.location') }}:
                        {{
                          (apiaries[h.apiaryId] && apiaries[h.apiaryId].name) || h.apiaryId || '—'
                        }}
                        • {{ t('hive.frames') }}: {{ h.frameCount ?? '-' }}
                      </div>
                      <div class="q-mt-sm">{{ h.notes }}</div>
                    </q-card-section>
                    <q-separator />
                    <q-card-actions align="right">
                      <q-btn
                        flat
                        icon="info"
                        :label="t('hive.details')"
                        @click.stop="goTo(h.id || h._id)"
                      >
                        <q-tooltip>{{ t('hive.details') }}</q-tooltip>
                      </q-btn>
                      <q-btn flat icon="edit" :label="t('hive.edit')" @click.stop="openEdit(h)">
                        <q-tooltip>{{ t('hive.edit') }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        icon="delete"
                        :label="t('hive.delete')"
                        color="negative"
                        @click.stop="deleteHive(h.id || h._id)"
                      >
                        <q-tooltip>{{ t('hive.delete') }}</q-tooltip>
                      </q-btn>
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <q-card>
              <q-card-section>{{ t('hive.no_hives') }}</q-card-section>
            </q-card>
          </div>
        </div>

        <CreateHiveDialog
          v-model:visible="createVisible"
          :hive="editHive"
          @created="onCreated"
          @updated="onUpdated"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, unref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import type { Hive } from '../api-client';
import { DefaultService } from '../api-client/services/DefaultService';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import CreateHiveDialog from '../components/CreateHiveDialog.vue';
import { apiaryColor } from '../utils/apiaryColor';

const { t } = useI18n();
const $q = useQuasar();
const hives = ref<Hive[]>([]);
const apiaries = ref<Record<string, any>>({});
const editHive = ref<any | null>(null);
const store = useUserStore();
const token = store.token;
const showArchived = ref(false);
const router = useRouter();
const createVisible = ref(false);
const loading = ref(false);
// language handled globally in App.vue
const homeIcon = 'home';

async function fetch() {
  loading.value = true;
  try {
    // when not showing archived, request only active hives from API
    const status = showArchived.value ? undefined : 'active';
    const res = await DefaultService.getApiV1Hives(undefined, undefined, status);
    console.log('HiveList.fetch: api response=', res);
    hives.value = (res as any).items || [];
    try {
      const ares = await DefaultService.getApiV1Apiaries();
      const map: Record<string, any> = {};
      const list = Array.isArray(ares) ? ares : ares?.items || [];
      (list || []).forEach((a: any) => {
        const rawId = a.id || a._id;
        const id =
          typeof rawId === 'string'
            ? rawId
            : rawId?.$oid || rawId?.toString?.() || String(rawId ?? '');
        map[id] = { ...a, id };
      });
      apiaries.value = map;
    } catch (e: any) {
      // If the backend doesn't expose apiaries yet, ignore 404 and continue silently.
      const status = e?.response?.status || e?.status;
      const msg = e?.message || '';
      if (status === 404 || /not\s*found/i.test(msg)) {
        apiaries.value = {};
      } else {
        console.warn('Failed to load apiaries', e);
      }
    }
  } catch (e: any) {
    console.error('HiveList.fetch error:', e);
    $q.notify({ type: 'negative', message: e?.message || 'Failed to load hives' });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (unref(store.token)) fetch();
});

// when user logs in later, load hives
watch(
  () => unref(store.token),
  (v) => {
    if (v) fetch();
  },
);

// language changes are handled at app-level

// reload list when archive toggle changes
watch(
  () => showArchived.value,
  () => fetch(),
);

const apiaryColors = computed(() => {
  const map: Record<string, string> = {};
  for (const k of Object.keys(apiaries.value)) {
    const entry = apiaries.value[k];
    map[k] = apiaryColor(k, entry?.color);
  }
  map['__no_location'] = '#B0BEC5';
  return map;
});

const grouped = computed(() => {
  const groups: Record<string, any[]> = {};
  for (const h of hives.value) {
    const key = h.apiaryId || '__no_location';
    if (!groups[key]) groups[key] = [];
    groups[key].push(h);
  }
  return groups;
});

const dragging = ref<string | null>(null);
const dragOverKey = ref<string | null>(null);

function onDragStart(e: DragEvent, hive: any) {
  const id = hive.id || hive._id;
  if (!id) return;
  dragging.value = id;
  try {
    e.dataTransfer?.setData('text/plain', id);
    e.dataTransfer?.setData('application/hive-id', id);
  } catch (err) {
    // ignore
  }
}

function openEdit(hive: any) {
  editHive.value = hive;
  createVisible.value = true;
}

function onDragEnter(key: string) {
  // only allow dropping onto real apiary groups
  if (key === '__no_location') return;
  dragOverKey.value = key;
}

function onDragLeave(key: string) {
  if (dragOverKey.value === key) dragOverKey.value = null;
}

async function onDrop(e: DragEvent, key: string) {
  const id = e.dataTransfer?.getData('text/plain') || dragging.value;
  dragging.value = null;
  dragOverKey.value = null;
  if (!id) return;
  const targetApiaryId = key === '__no_location' ? null : key;
  // find hive to check if same apiary
  const hive = hives.value.find((h) => (h.id || h._id) === id);
  if (!hive) return;
  const current = hive.apiaryId || '__no_location';
  if ((current === '__no_location' ? null : current) === targetApiaryId) return;
  try {
    await DefaultService.putApiV1Hives(id, { apiaryId: targetApiaryId } as any);
    $q.notify({ type: 'positive', message: t('messages.moved') });
    fetch();
  } catch (err: any) {
    console.error('move hive error', err);
    $q.notify({ type: 'negative', message: err?.message || t('messages.failed') });
  }
}

function goTo(id: string) {
  router.push(`/hives/${id}`);
}

function openCreate() {
  console.log('HiveList.openCreate called');
  editHive.value = null;
  createVisible.value = true;
}

async function logout() {
  // call server to clear httpOnly refresh cookie, then clear access token
  try {
    await DefaultService.postApiV1AuthLogout();
  } catch (e) {
    // ignore
  }
  store.clear();
  router.push('/login');
}

function onCreated() {
  fetch();
  $q.notify({ type: 'positive', message: t('messages.hive_created') });
}

function onUpdated() {
  fetch();
  $q.notify({ type: 'positive', message: t('messages.hive_updated') });
}

async function deleteHive(id: string) {
  if (!id) return;
  const ok = confirm(t('messages.confirm_delete'));
  if (!ok) return;
  try {
    await DefaultService.deleteApiV1Hives(id);
    $q.notify({ type: 'positive', message: t('messages.hive_deleted') });
    fetch();
  } catch (e: any) {
    console.error('deleteHive error', e);
    $q.notify({ type: 'negative', message: e?.message || t('messages.failed') });
  }
}
</script>

<style scoped>
.drop-target {
  background: rgba(76, 175, 80, 0.06) !important;
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.06), inset 0 0 0 2px rgba(76, 175, 80, 0.1) !important;
  border-radius: 8px !important;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
  transform: translateY(-4px);
  border: 2px dashed rgba(76, 175, 80, 0.26) !important;
  padding: 6px;
}
.drop-target .row {
  padding-top: 6px;
}
.my-card[draggable='true'] {
  cursor: grab;
}
.my-card[draggable='true']:active {
  cursor: grabbing;
}
</style>
