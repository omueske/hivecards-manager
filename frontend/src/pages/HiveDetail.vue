<template>
  <div>
    <div class="row items-center q-mb-sm">
      <q-btn
        flat
        dense
        icon="arrow_back"
        :label="t('toolbar.back')"
        @click="goBack"
        aria-label="Back"
      />
    </div>

    <div v-if="loading">{{ t('messages.loading') }}</div>
    <div v-else-if="hive">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ hive.hiveNumber }} — {{ hive.status }}</div>
          <div>
            {{ t('form.location') }}:
            {{ apiary ? apiary.name : hive.apiaryId ? t('messages.apiary_missing') : '-' }}
          </div>
          <div>{{ t('hive.frames') }}: {{ hive.frameCount ?? '-' }}</div>
          <div>{{ t('form.installationDate') }}: {{ hive.installationDate ?? '-' }}</div>
          <div class="q-mt-md">{{ t('form.notes') }}: {{ hive.notes ?? '-' }}</div>
        </q-card-section>
      </q-card>
    </div>
    <div v-else>
      <p>{{ t('messages.hive_not_found') }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { Hive } from '../api-client';
import { DefaultService } from '../api-client/services/DefaultService';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();
    const id = route.params.id as string;
    const hive = ref<Hive | null>(null);
    const loading = ref(true);
    const apiary = ref<any | null>(null);

    onMounted(async () => {
      loading.value = true;
      try {
        const res = await DefaultService.getApiV1Hives1(id);
        hive.value = res as unknown as Hive;
        const rawAid = (hive.value as any)?.apiaryId;
        if (rawAid) {
          // normalize common ObjectId shapes: string, { $oid: string }, { _id: string }
          let aid: string | null = null;
          if (typeof rawAid === 'string') aid = rawAid;
          else if (rawAid && typeof rawAid === 'object') {
            aid = rawAid.$oid || rawAid._id || (rawAid.id as string) || String(rawAid);
          }

          // only call API if we have a 24-char hex id
          if (aid && /^[a-fA-F0-9]{24}$/.test(aid)) {
            try {
              apiary.value = await DefaultService.getApiV1Apiaries1(aid);
            } catch (err) {
              apiary.value = null;
            }
          } else {
            apiary.value = null;
          }
        }
      } catch (e) {
        hive.value = null;
      } finally {
        loading.value = false;
      }
    });

    function goBack() {
      // navigate back in history; if that would land on the login page,
      // replace it with home to avoid showing the login screen.
      router.back();
      setTimeout(() => {
        const p =
          router.currentRoute.value &&
          (router.currentRoute.value.fullPath || router.currentRoute.value.path);
        if (p === '/login' || p.startsWith('/login?')) {
          router.replace('/');
        }
      }, 60);
    }

    return { hive, loading, goBack, t, apiary };
  },
};
</script>

<style scoped>
</style>
