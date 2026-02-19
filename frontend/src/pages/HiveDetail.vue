<template>
  <div>
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el to="/">Home</q-breadcrumbs-el>
      <q-breadcrumbs-el>{{ hive?.hiveNumber || '...' }}</q-breadcrumbs-el>
    </q-breadcrumbs>

    <div v-if="loading">Loading…</div>
    <div v-else-if="hive">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ hive.hiveNumber }} — {{ hive.status }}</div>
          <div>Apiary: {{ hive.apiaryId }}</div>
          <div>Frames: {{ hive.frameCount ?? '-' }}</div>
          <div>Installed: {{ hive.installationDate ?? '-' }}</div>
          <div class="q-mt-md">Notes: {{ hive.notes ?? '-' }}</div>
        </q-card-section>
      </q-card>
    </div>
    <div v-else>
      <p>Hive not found.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Hive } from '../api-client';
import { DefaultService } from '../api-client/services/DefaultService';

export default {
  setup() {
    const route = useRoute();
    const id = route.params.id as string;
    const hive = ref<Hive | null>(null);
    const loading = ref(true);

    onMounted(async () => {
      loading.value = true;
      try {
        const res = await DefaultService.getApiV1Hives1(id);
        hive.value = res as unknown as Hive;
      } catch (e) {
        hive.value = null;
      } finally {
        loading.value = false;
      }
    });

    return { hive, loading };
  },
};
</script>

<style scoped>
</style>
