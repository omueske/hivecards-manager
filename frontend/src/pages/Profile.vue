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

      <!-- Session Info -->
      <q-card style="margin-top: 16px">
        <q-card-section>
          <div class="text-subtitle2" style="margin-bottom: 12px">{{ t('profile.session_title') }}</div>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; font-size: 0.9em; align-items: center">

            <span style="color: #888">{{ t('profile.email_verified') }}</span>
            <span>
              <q-badge v-if="profileData.emailVerified" color="positive" :label="t('profile.verified')" />
              <q-badge v-else color="warning" text-color="black" :label="t('profile.not_verified')" />
            </span>

            <span style="color: #888">{{ t('profile.token_expires') }}</span>
            <span>{{ tokenExpiresAt ?? '—' }}</span>

            <span style="color: #888">{{ t('profile.token_remaining') }}</span>
            <span :style="{ color: remainingColor }">{{ tokenRemainingLabel }}</span>

            <span style="color: #888">{{ t('profile.next_refresh') }}</span>
            <span>{{ nextRefreshLabel }}</span>

          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            flat
            dense
            size="sm"
            :label="t('profile.refresh_now')"
            icon="refresh"
            :loading="refreshing"
            @click="refreshNow"
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getToken, setToken } from '../auth/token';
import { scheduleRefresh } from '../auth/tokenRefresh';
import { OpenAPI } from '../api-client/core/OpenAPI';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const router = useRouter();
const { t } = useI18n();
const loading = ref(true);
const refreshing = ref(false);
const form = ref({ email: '', username: '', password: '' });
const profileData = ref({ emailVerified: false });
const $q = useQuasar();

// --- Token decode ---
function parseJwt(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch { return null; }
}

const now = ref(Math.floor(Date.now() / 1000));
let clockTimer: ReturnType<typeof setInterval> | null = null;

const tokenPayload = computed(() => {
  const t = getToken();
  return t ? parseJwt(t) : null;
});

const tokenExpiresAt = computed(() => {
  const exp = tokenPayload.value?.exp;
  if (!exp) return null;
  return new Date(exp * 1000).toLocaleTimeString();
});

const tokenRemainingSeconds = computed(() => {
  const exp = tokenPayload.value?.exp;
  if (!exp) return null;
  return exp - now.value;
});

const tokenRemainingLabel = computed(() => {
  const s = tokenRemainingSeconds.value;
  if (s === null) return '—';
  if (s <= 0) return t('profile.token_expired');
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
});

const remainingColor = computed(() => {
  const s = tokenRemainingSeconds.value;
  if (s === null) return undefined;
  if (s <= 0) return '#c00';
  if (s < 60) return '#e65100';
  if (s < 120) return '#f9a825';
  return '#2a7a2a';
});

const nextRefreshLabel = computed(() => {
  const exp = tokenPayload.value?.exp;
  if (!exp) return '—';
  const refreshAt = exp - 60; // 60 s before expiry
  const diff = refreshAt - now.value;
  if (diff <= 0) return t('profile.refresh_imminent');
  if (diff < 60) return `${diff}s`;
  const m = Math.floor(diff / 60);
  const rem = diff % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
});

// --- Profile fetch ---
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
      profileData.value.emailVerified = data.emailVerified ?? false;
    }
  } catch {}
  finally { loading.value = false; }
}

async function submit() {
  loading.value = true;
  try {
    const token = getToken();
    const payload: any = { username: form.value.username };
    if (form.value.password?.length) payload.password = form.value.password;
    const base = OpenAPI.BASE || (import.meta as any).env?.VITE_API_BASE || '';
    const res = await fetch(base + '/api/v1/users/me', {
      method: 'PUT',
      headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchProfile();
      $q.notify({ type: 'positive', message: t('messages.profile_saved') });
      router.push('/');
    } else {
      $q.notify({ type: 'negative', message: t('messages.save_failed') });
    }
  } catch {}
  finally { loading.value = false; }
}

async function refreshNow() {
  refreshing.value = true;
  try {
    const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000';
    const resp = await fetch(base + '/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (resp.ok) {
      const body = await resp.json();
      if (body?.accessToken) {
        setToken(body.accessToken);
        scheduleRefresh(body.accessToken);
        $q.notify({ type: 'positive', message: t('profile.refresh_success') });
      }
    } else {
      $q.notify({ type: 'negative', message: t('profile.refresh_failed') });
    }
  } catch {
    $q.notify({ type: 'negative', message: t('profile.refresh_failed') });
  } finally {
    refreshing.value = false;
  }
}

function cancel() { router.push('/'); }

onMounted(() => {
  fetchProfile();
  clockTimer = setInterval(() => { now.value = Math.floor(Date.now() / 1000); }, 1000);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});
</script>

<style scoped>
</style>
