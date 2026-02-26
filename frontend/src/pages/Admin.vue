<template>
  <div>
    <h2>Adminbereich</h2>

    <q-card style="margin-bottom: 16px">
      <q-card-section>
        <div class="text-subtitle1" style="margin-bottom: 8px">Dashboard</div>
        <div v-if="loadingStats">Lade Statistiken…</div>
        <div v-else>
          <div>Benutzer gesamt: {{ stats.users.total }}</div>
          <div>Admins: {{ stats.users.admin }}</div>
          <div>Verifiziert: {{ stats.users.verified }}</div>
          <div>Ressourcen gesamt: {{ stats.resources.total }}</div>
          <div style="font-size: 0.9em; color: #666; margin-top: 4px">
            Apiaries {{ stats.resources.apiaries }}, Hives {{ stats.resources.hives }}, Queens
            {{ stats.resources.queens }}, Inspections {{ stats.resources.inspections }}, Agents
            {{ stats.resources.treatmentAgents }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card style="margin-bottom: 16px">
      <q-card-section>
        <div class="text-subtitle1" style="margin-bottom: 8px">Benutzer anlegen</div>
        <q-form @submit.prevent="createUser" class="q-gutter-sm">
          <q-input v-model="createForm.email" label="E-Mail" dense />
          <q-input v-model="createForm.username" label="Username" dense />
          <q-input v-model="createForm.password" type="password" label="Passwort" dense />
          <q-select
            v-model="createForm.role"
            :options="roleOptions"
            label="Rolle"
            dense
            emit-value
            map-options
          />
          <q-toggle v-model="createForm.emailVerified" label="E-Mail verifiziert" />
          <q-btn type="submit" color="primary" label="Anlegen" :loading="savingCreate" />
        </q-form>
      </q-card-section>
    </q-card>

    <q-card style="margin-bottom: 16px">
      <q-card-section>
        <div class="text-subtitle1" style="margin-bottom: 8px">Benutzer verwalten</div>
        <div v-if="loadingUsers">Lade Benutzer…</div>
        <table v-else class="admin-table">
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
            <tr v-for="user in users" :key="user.id" :class="{ selected: selectedUserId === user.id }">
              <td>{{ user.email }}</td>
              <td>
                <input v-model="user.username" style="width: 160px" />
              </td>
              <td>
                <select v-model="user.role">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>
                <input type="checkbox" v-model="user.emailVerified" />
              </td>
              <td>
                <button @click="saveUser(user)">Speichern</button>
                <button @click="selectUser(user.id)">Ressourcen</button>
                <button @click="removeUser(user)" :disabled="user.id === myUserId">Löschen</button>
              </td>
            </tr>
          </tbody>
        </table>
      </q-card-section>
    </q-card>

    <q-card v-if="selectedUserId">
      <q-card-section>
        <div class="text-subtitle1" style="margin-bottom: 8px">
          Ressourcen von Benutzer {{ selectedUserId }}
        </div>
        <div v-if="loadingResources">Lade Ressourcen…</div>
        <div v-else>
          <div style="font-size: 0.9em; color: #666; margin-bottom: 8px">
            Apiaries {{ resources.counts.apiaries }}, Hives {{ resources.counts.hives }}, Queens
            {{ resources.counts.queens }}, Inspections {{ resources.counts.inspections }}, Agents
            {{ resources.counts.treatmentAgents }}
          </div>

          <div class="resource-grid">
            <div v-for="type in resourceTypes" :key="type" class="resource-col">
              <h4>{{ type }}</h4>
              <ul>
                <li v-for="item in resources[type]" :key="item._id || item.id">
                  <span>{{ item.name || item.hiveNumber || item.date || item._id }}</span>
                  <button @click="startEditResource(type, item)">Bearbeiten</button>
                </li>
              </ul>
            </div>
          </div>

          <div v-if="editingResource">
            <h4 style="margin-top: 12px">Ressource bearbeiten (JSON Patch)</h4>
            <textarea v-model="resourceEditor" rows="10" style="width: 100%"></textarea>
            <div style="margin-top: 8px">
              <button @click="saveResource">Speichern</button>
              <button @click="cancelResourceEdit">Abbrechen</button>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
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

const loadingStats = ref(false);
const loadingUsers = ref(false);
const loadingResources = ref(false);
const savingCreate = ref(false);

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

const resourceTypes = ['apiaries', 'hives', 'queens', 'inspections', 'treatmentAgents'];
const editingResource = ref<{ type: string; id: string } | null>(null);
const resourceEditor = ref('');

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

async function loadStats() {
  loadingStats.value = true;
  try {
    stats.value = await adminFetch('/api/v1/admin/stats');
  } finally {
    loadingStats.value = false;
  }
}

async function loadUsers() {
  loadingUsers.value = true;
  try {
    users.value = await adminFetch('/api/v1/admin/users');
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
  } finally {
    savingCreate.value = false;
  }
}

async function saveUser(user: UserItem) {
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
}

async function removeUser(user: UserItem) {
  if (!confirm(`Benutzer ${user.email} wirklich löschen?`)) return;
  await adminFetch(`/api/v1/admin/users/${user.id}`, { method: 'DELETE' });
  if (selectedUserId.value === user.id) {
    selectedUserId.value = '';
  }
  await Promise.all([loadUsers(), loadStats()]);
}

async function selectUser(userId: string) {
  selectedUserId.value = userId;
  loadingResources.value = true;
  try {
    resources.value = await adminFetch(`/api/v1/admin/users/${userId}/resources`);
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
}

onMounted(async () => {
  await Promise.all([loadStats(), loadUsers()]);
});
</script>

<style scoped>
.admin-table {
  border-collapse: collapse;
  width: 100%;
}

.admin-table th,
.admin-table td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: left;
}

.admin-table tr.selected {
  background: #fff8e1;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.resource-col {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px;
}

.resource-col ul {
  margin: 0;
  padding-left: 16px;
  max-height: 220px;
  overflow: auto;
}

.resource-col li {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
</style>
