<template>
  <div class="q-gutter-md">
    <div class="text-h5">Adminbereich</div>

    <q-card>
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Dashboard</div>
        <div v-if="loadingStats">Lade Statistiken…</div>
        <div v-else class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3" v-for="tile in statTiles" :key="tile.label">
            <q-card bordered flat>
              <q-card-section>
                <div class="text-caption text-grey-7">{{ tile.label }}</div>
                <div class="text-h6">{{ tile.value }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Benutzer anlegen</div>
        <q-form @submit.prevent="createUser" class="row q-col-gutter-sm items-end">
          <div class="col-12 col-md-4">
            <q-input v-model="createForm.email" label="E-Mail" dense />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="createForm.username" label="Username" dense />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="createForm.password" type="password" label="Passwort" dense />
          </div>
          <div class="col-6 col-md-1">
            <q-select
              v-model="createForm.role"
              :options="roleOptions"
              label="Rolle"
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-6 col-md-1">
            <q-toggle v-model="createForm.emailVerified" label="Verifiziert" />
          </div>
          <div class="col-12">
            <q-btn type="submit" color="primary" label="Anlegen" :loading="savingCreate" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="row q-col-gutter-sm items-end q-mb-sm">
          <div class="col-12 col-md-5">
            <q-input
              v-model="userSearch"
              dense
              clearable
              label="Benutzer suchen (E-Mail/Username)"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="roleFilter"
              dense
              emit-value
              map-options
              :options="roleFilterOptions"
              label="Rollenfilter"
            />
          </div>
        </div>

        <div v-if="loadingUsers">Lade Benutzer…</div>
        <q-markup-table v-else dense flat bordered>
          <thead>
            <tr>
              <th>E-Mail</th>
              <th>Username</th>
              <th>Rolle</th>
              <th>Verifiziert</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              :class="{ 'bg-yellow-1': selectedUserId === user.id }"
            >
              <td>{{ user.email }}</td>
              <td style="min-width: 180px">
                <q-input v-model="user.username" dense outlined />
              </td>
              <td style="min-width: 130px">
                <q-select
                  v-model="user.role"
                  :options="roleOptions"
                  emit-value
                  map-options
                  dense
                  outlined
                />
              </td>
              <td>
                <q-badge
                  :color="user.emailVerified ? 'positive' : 'warning'"
                  :label="user.emailVerified ? 'ja' : 'nein'"
                />
                <q-toggle v-model="user.emailVerified" class="q-ml-sm" />
              </td>
              <td>
                <q-btn size="sm" color="primary" flat label="Speichern" @click="saveUser(user)" />
                <q-btn
                  size="sm"
                  color="secondary"
                  flat
                  label="Ressourcen"
                  @click="selectUser(user.id)"
                />
                <q-btn
                  size="sm"
                  color="negative"
                  flat
                  label="Löschen"
                  :disable="user.id === myUserId"
                  @click="removeUser(user)"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <q-card v-if="selectedUserId">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Ressourcen von Benutzer {{ selectedUserId }}</div>

        <q-tabs v-model="activeResourceType" dense inline-label class="text-primary">
          <q-tab
            v-for="type in resourceTypeDefs"
            :key="type.key"
            :name="type.key"
            :label="`${type.label} (${resourceCount(type.key)})`"
          />
        </q-tabs>

        <q-separator class="q-my-sm" />

        <div v-if="loadingResources">Lade Ressourcen…</div>
        <q-tab-panels v-else v-model="activeResourceType" animated>
          <q-tab-panel
            v-for="type in resourceTypeDefs"
            :key="type.key"
            :name="type.key"
            class="q-pa-none q-pt-sm"
          >
            <q-list bordered separator>
              <q-item v-for="item in resources[type.key]" :key="item._id || item.id">
                <q-item-section>
                  <q-item-label>{{ resourceLabel(item) }}</q-item-label>
                  <q-item-label caption>{{ item._id || item.id }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    size="sm"
                    flat
                    color="primary"
                    label="Bearbeiten"
                    @click="startEditResource(type.key, item)"
                  />
                </q-item-section>
              </q-item>
              <q-item v-if="!(resources[type.key] || []).length">
                <q-item-section>
                  <q-item-label caption>Keine Einträge</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>

        <div v-if="editingResource" class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">Ressource bearbeiten (JSON Patch)</div>
          <q-input v-model="resourceEditor" type="textarea" autogrow outlined />
          <div class="q-mt-sm q-gutter-sm">
            <q-btn color="primary" label="Speichern" @click="saveResource" />
            <q-btn flat label="Abbrechen" @click="cancelResourceEdit" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { OpenAPI } from '../api-client/core/OpenAPI';
import { getToken } from '../auth/token';

type UserItem = {
  id: string;
  email: string;
  username?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
};

const roleOptions = [
  { label: 'user', value: 'user' },
  { label: 'admin', value: 'admin' },
];
const roleFilterOptions = [{ label: 'alle', value: 'all' }, ...roleOptions];

const resourceTypeDefs = [
  { key: 'apiaries', label: 'Apiaries' },
  { key: 'hives', label: 'Hives' },
  { key: 'queens', label: 'Queens' },
  { key: 'inspections', label: 'Inspections' },
  { key: 'treatmentAgents', label: 'Agents' },
];

const $q = useQuasar();

const loadingStats = ref(false);
const loadingUsers = ref(false);
const loadingResources = ref(false);
const savingCreate = ref(false);
const userSearch = ref('');
const roleFilter = ref<'all' | 'user' | 'admin'>('all');
const activeResourceType = ref('apiaries');

const stats = ref({
  users: { total: 0, admin: 0, regular: 0, verified: 0 },
  resources: { apiaries: 0, hives: 0, queens: 0, inspections: 0, treatmentAgents: 0, total: 0 },
});

const users = ref<UserItem[]>([]);
const selectedUserId = ref('');
const resources = ref<any>({
  counts: { apiaries: 0, hives: 0, queens: 0, inspections: 0, treatmentAgents: 0 },
  apiaries: [],
  hives: [],
  queens: [],
  inspections: [],
  treatmentAgents: [],
});

const createForm = ref({
  email: '',
  username: '',
  password: '',
  role: 'user' as 'user' | 'admin',
  emailVerified: false,
});

const editingResource = ref<{ type: string; id: string } | null>(null);
const resourceEditor = ref('');

const statTiles = computed(() => [
  { label: 'Benutzer gesamt', value: stats.value.users.total },
  { label: 'Admins', value: stats.value.users.admin },
  { label: 'Verifizierte Benutzer', value: stats.value.users.verified },
  { label: 'Ressourcen gesamt', value: stats.value.resources.total },
]);

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase();
  return users.value.filter((user) => {
    if (roleFilter.value !== 'all' && user.role !== roleFilter.value) return false;
    if (!q) return true;
    return (
      user.email.toLowerCase().includes(q) ||
      String(user.username || '')
        .toLowerCase()
        .includes(q)
    );
  });
});

const base = computed(() => OpenAPI.BASE || ((import.meta as any).env?.VITE_API_BASE ?? ''));

const myUserId = computed(() => {
  try {
    const token = getToken();
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return String(payload?.sub || '');
  } catch {
    return '';
  }
});

async function adminFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const resp = await fetch(base.value + path, {
    ...init,
    credentials: 'include',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `HTTP ${resp.status}`);
  }

  if (resp.status === 204) return null;
  return resp.json();
}

function notifyError(message: string) {
  $q.notify({ type: 'negative', message });
}

function notifySuccess(message: string) {
  $q.notify({ type: 'positive', message });
}

function resourceCount(type: string) {
  return (resources.value?.[type] || []).length;
}

function resourceLabel(item: any) {
  return item?.name || item?.hiveNumber || item?.date || item?.notes || 'Eintrag';
}

async function loadStats() {
  loadingStats.value = true;
  try {
    stats.value = await adminFetch('/api/v1/admin/stats');
  } catch (e: any) {
    notifyError(e?.message || 'Statistiken konnten nicht geladen werden');
  } finally {
    loadingStats.value = false;
  }
}

async function loadUsers() {
  loadingUsers.value = true;
  try {
    users.value = await adminFetch('/api/v1/admin/users');
  } catch (e: any) {
    notifyError(e?.message || 'Benutzer konnten nicht geladen werden');
  } finally {
    loadingUsers.value = false;
  }
}

async function createUser() {
  savingCreate.value = true;
  try {
    await adminFetch('/api/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(createForm.value),
    });
    createForm.value = {
      email: '',
      username: '',
      password: '',
      role: 'user',
      emailVerified: false,
    };
    await Promise.all([loadUsers(), loadStats()]);
    notifySuccess('Benutzer angelegt');
  } catch (e: any) {
    notifyError(e?.message || 'Benutzer konnte nicht angelegt werden');
  } finally {
    savingCreate.value = false;
  }
}

async function saveUser(user: UserItem) {
  try {
    await adminFetch(`/api/v1/admin/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
      }),
    });
    await Promise.all([loadUsers(), loadStats()]);
    notifySuccess('Benutzer gespeichert');
  } catch (e: any) {
    notifyError(e?.message || 'Benutzer konnte nicht gespeichert werden');
  }
}

async function removeUser(user: UserItem) {
  if (!confirm(`Benutzer ${user.email} wirklich löschen?`)) return;
  try {
    await adminFetch(`/api/v1/admin/users/${user.id}`, { method: 'DELETE' });
    if (selectedUserId.value === user.id) {
      selectedUserId.value = '';
    }
    await Promise.all([loadUsers(), loadStats()]);
    notifySuccess('Benutzer gelöscht');
  } catch (e: any) {
    notifyError(e?.message || 'Benutzer konnte nicht gelöscht werden');
  }
}

async function selectUser(userId: string) {
  selectedUserId.value = userId;
  activeResourceType.value = 'apiaries';
  loadingResources.value = true;
  try {
    resources.value = await adminFetch(`/api/v1/admin/users/${userId}/resources`);
  } catch (e: any) {
    notifyError(e?.message || 'Ressourcen konnten nicht geladen werden');
  } finally {
    loadingResources.value = false;
  }
}

function startEditResource(type: string, item: any) {
  const id = String(item._id || item.id);
  const copy = { ...item };
  delete copy._id;
  delete copy.id;
  delete copy.userId;
  delete copy.createdAt;
  delete copy.updatedAt;
  editingResource.value = { type, id };
  resourceEditor.value = JSON.stringify(copy, null, 2);
}

function cancelResourceEdit() {
  editingResource.value = null;
  resourceEditor.value = '';
}

async function saveResource() {
  if (!editingResource.value || !selectedUserId.value) return;
  try {
    const patch = JSON.parse(resourceEditor.value);

    await adminFetch(
      `/api/v1/admin/users/${selectedUserId.value}/resources/${editingResource.value.type}/${editingResource.value.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(patch),
      },
    );

    await selectUser(selectedUserId.value);
    cancelResourceEdit();
    await loadStats();
    notifySuccess('Ressource gespeichert');
  } catch (e: any) {
    notifyError(e?.message || 'Ressource konnte nicht gespeichert werden');
  }
}

onMounted(async () => {
  await Promise.all([loadStats(), loadUsers()]);
});
</script>
