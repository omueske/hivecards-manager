<template>
  <q-page padding>
    <q-toolbar class="q-mb-md">
      <q-btn flat round dense icon="menu" />
      <q-toolbar-title>Hives</q-toolbar-title>
      <div class="row items-center">
        <q-btn flat dense round icon="refresh" aria-label="Refresh" @click="fetch" class="q-mr-sm">
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          color="secondary"
          icon="add"
          label="Create"
          @click="openCreate"
          class="q-mr-sm"
        >
          <q-tooltip>Create Hive</q-tooltip>
        </q-btn>
        <q-space />
        <q-btn flat to="/" icon="home" />
        <q-btn flat icon="logout" @click="logout" />
      </div>
    </q-toolbar>

    <div class="app-content">
      <div v-if="!token">
        <q-card>
          <q-card-section>
            Please <router-link to="/login">login</router-link> first.
          </q-card-section>
        </q-card>
      </div>

      <div v-else>
        <div class="q-gutter-md">
          <q-spinner v-if="loading" size="40px" class="q-mt-md" />

          <div v-else-if="hives.length" class="row q-gutter-md">
            <div v-for="h in hives" :key="h.id" class="col-12 col-sm-6 col-md-4">
              <q-card clickable class="my-card" @click="goTo(h.id)">
                <q-card-section>
                  <div class="text-h6">
                    {{ h.hiveNumber }} <span class="text-subtitle2">— {{ h.status }}</span>
                  </div>
                  <div class="text-caption">
                    Apiary: {{ h.apiaryId }} • Frames: {{ h.frameCount ?? '-' }}
                  </div>
                  <div class="q-mt-sm">{{ h.notes }}</div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                  <q-btn flat icon="info" label="Details">
                    <q-tooltip>View hive details</q-tooltip>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>
          </div>

          <div v-else>
            <q-card>
              <q-card-section>No hives yet</q-card-section>
            </q-card>
          </div>
        </div>

        <CreateHiveDialog v-model:visible="createVisible" @created="onCreated" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Hive } from '../api-client';
import { DefaultService } from '../api-client/services/DefaultService';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import CreateHiveDialog from '../components/CreateHiveDialog.vue';

const hives = ref<Hive[]>([]);
const store = useUserStore();
const token = store.token;
const router = useRouter();
const createVisible = ref(false);
const loading = ref(false);

async function fetch() {
  loading.value = true;
  try {
    const res = await DefaultService.getApiV1Hives();
    hives.value = (res as any).items || [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (token) fetch();
});

function goTo(id: string) {
  router.push(`/hives/${id}`);
}

function openCreate() {
  createVisible.value = true;
}

function logout() {
  store.setToken('');
  router.push('/login');
}

function onCreated() {
  fetch();
  import('quasar').then(({ Notify }) =>
    Notify.create({ type: 'positive', message: 'Hive created' }),
  );
}
</script>
