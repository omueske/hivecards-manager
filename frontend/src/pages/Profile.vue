<template>
  <div>
    <h2>{{ $t('auth.profile') }}</h2>
    <div v-if="loading">{{ $t('messages.loading') }}</div>
    <div v-else>
      <q-card>
        <q-card-section>
          <q-form @submit.prevent="submit">
            <div class="q-gutter-md">
              <q-input v-model="form.email" :label="$t('auth.email')" dense readonly />
              <q-input v-model="form.username" :label="$t('auth.username')" dense />
              <q-input
                v-model="form.password"
                :label="$t('auth.password')"
                dense
                type="password"
                placeholder="(leave blank to keep)"
              />
              <div>
                <q-btn :label="t('form.save')" type="submit" color="primary" :disable="loading" />
                <q-btn flat :label="t('form.cancel')" @click="cancel" :disable="loading" />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getToken } from '../auth/token';
import { OpenAPI } from '../api-client/core/OpenAPI';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const router = useRouter();
const { t } = useI18n();
const loading = ref(true);
const form = ref({ email: '', username: '', password: '' });
const $q = useQuasar();

async function fetchProfile() {
  loading.value = true;
  try {
    const token = getToken();
    const base = OpenAPI.BASE || (import.meta as any).env?.VITE_API_BASE || '';
    const res = await fetch(base + '/api/v1/users/me', {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      form.value.email = data.email || '';
      form.value.username = data.username || '';
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false;
  }
}

async function submit() {
  loading.value = true;
  try {
    const token = getToken();
    const payload: any = { username: form.value.username };
    if (form.value.password && form.value.password.length) payload.password = form.value.password;
    const base = OpenAPI.BASE || (import.meta as any).env?.VITE_API_BASE || '';
    const res = await fetch(base + '/api/v1/users/me', {
      method: 'PUT',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchProfile();
      $q.notify({ type: 'positive', message: t('messages.profile_saved') });
      // navigate home after update
      router.push('/');
    } else {
      $q.notify({ type: 'negative', message: t('messages.save_failed') });
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false;
  }
}

function cancel() {
  router.push('/');
}

onMounted(fetchProfile);
</script>

<style scoped>
</style>
