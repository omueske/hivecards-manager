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

              <q-card flat bordered class="q-pa-md q-mt-sm">
                <div class="text-subtitle2 q-mb-sm">{{ t('profile.contact_data') }}</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.streetHouseNumber"
                      :label="t('profile.street_house_number')"
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="form.postalCode" :label="t('profile.postal_code')" dense />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="form.city" :label="t('profile.city')" dense />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input v-model="form.phone" :label="t('profile.phone')" dense />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.operationNumber"
                      :label="t('profile.operation_number')"
                      dense
                    />
                  </div>
                </div>
              </q-card>

              <q-card flat bordered class="q-pa-md q-mt-sm bg-grey-1">
                <div class="text-subtitle2 q-mb-sm">{{ t('profile.breeder_defaults') }}</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="selectedAssociationCode"
                      :options="associationOptions"
                      :label="t('profile.breeder_association')"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      clearable
                      :disable="associationOptions.length === 0"
                      :hint="associationOptions.length === 0 ? t('messages.loading') : ''"
                      @update:model-value="onAssociationSelected"
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      :model-value="form.breederCountry || ''"
                      :label="t('profile.breeder_country')"
                      dense
                      maxlength="2"
                      readonly
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      :model-value="form.breederAssociation ?? ''"
                      :label="t('profile.breeder_association_number')"
                      type="number"
                      dense
                      readonly
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="form.breederNumber"
                      :label="t('profile.breeder_number')"
                      type="number"
                      dense
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="form.defaultApiaryNumber"
                      :label="t('profile.default_apiary_number')"
                      type="number"
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.defaultMatingType"
                      :options="matingTypeOptions"
                      :label="t('profile.default_mating_type')"
                      emit-value
                      map-options
                      dense
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-toggle v-model="form.isObmann" :label="t('profile.is_obmann')" />
                  </div>
                  <div class="col-12 col-md-6" v-if="form.isObmann">
                    <q-input
                      v-model.number="form.obmannNumber"
                      :label="t('profile.obmann_number')"
                      type="number"
                      dense
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.dateInputMode"
                      :options="dateModeOptions"
                      :label="t('profile.date_input_mode')"
                      emit-value
                      map-options
                      dense
                    />
                  </div>
                </div>
              </q-card>
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
          <div class="text-subtitle2" style="margin-bottom: 12px">
            {{ t('profile.session_title') }}
          </div>
          <div
            style="
              display: grid;
              grid-template-columns: auto 1fr;
              gap: 6px 16px;
              font-size: 0.9em;
              align-items: center;
            "
          >
            <span style="color: #888">{{ t('profile.role') }}</span>
            <span>
              <q-badge color="primary" :label="profileRoleLabel" />
            </span>

            <span style="color: #888">{{ t('profile.email_verified') }}</span>
            <span>
              <q-badge
                v-if="profileData.emailVerified"
                color="positive"
                :label="t('profile.verified')"
              />
              <q-badge
                v-else
                color="warning"
                text-color="black"
                :label="t('profile.not_verified')"
              />
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
const form = ref({
  email: '',
  username: '',
  password: '',
  streetHouseNumber: '',
  postalCode: '',
  city: '',
  phone: '',
  operationNumber: '',
  breederCountry: '',
  breederAssociation: null as number | null,
  breederNumber: null as number | null,
  defaultApiaryNumber: null as number | null,
  defaultMatingType: null as number | null,
  isObmann: false,
  obmannNumber: null as number | null,
  dateInputMode: 'full' as 'full' | 'dayMonth' | 'week',
});
const associations = ref<
  Array<{ code: string; country: string; associationNumber: number; name: string }>
>([]);
const profileData = ref({ emailVerified: false, role: 'user' as 'user' | 'admin' });
const $q = useQuasar();

const associationOptions = computed(() =>
  associations.value.map((item) => ({
    label: `${item.code} - ${item.name}`,
    value: item.code,
  })),
);

const selectedAssociationCode = ref<string | null>(null);

function normalizeAssociationCode(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'value' in value) {
    const nested = (value as { value?: unknown }).value;
    return typeof nested === 'string' ? nested : null;
  }
  return null;
}

function deriveAssociationCode(): string | null {
  if (!form.value.breederCountry || !Number.isInteger(form.value.breederAssociation)) {
    return null;
  }
  const code = `${form.value.breederCountry}-${form.value.breederAssociation}`;
  return associations.value.some((item) => item.code === code) ? code : null;
}

function applyAssociationCode(code: string | null) {
  if (!code) {
    form.value.breederCountry = '';
    form.value.breederAssociation = null;
    return;
  }
  const selected = associations.value.find((item) => item.code === code);
  if (!selected) return;
  form.value.breederCountry = selected.country;
  form.value.breederAssociation = selected.associationNumber;
}

function onAssociationSelected(value: unknown) {
  const code = normalizeAssociationCode(value);
  selectedAssociationCode.value = code;
  applyAssociationCode(code);
}

const matingTypeOptions = computed(() => [
  { label: t('profile.mating_type_1'), value: 1 },
  { label: t('profile.mating_type_2'), value: 2 },
  { label: t('profile.mating_type_3'), value: 3 },
  { label: t('profile.mating_type_4'), value: 4 },
]);

const dateModeOptions = computed(() => [
  { label: t('profile.date_mode_full'), value: 'full' },
  { label: t('profile.date_mode_day_month'), value: 'dayMonth' },
  { label: t('profile.date_mode_week'), value: 'week' },
]);

function getApiBase() {
  return OpenAPI.BASE || (import.meta as any).env?.VITE_API_BASE || '';
}

async function tryRefreshAccessToken() {
  const base = getApiBase();
  const refreshRes = await fetch(base + '/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!refreshRes.ok) return false;
  const body = await refreshRes.json();
  if (!body?.accessToken) return false;
  setToken(body.accessToken);
  scheduleRefresh(body.accessToken);
  return true;
}

async function authorizedFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBase();
  const token = getToken();
  const first = await fetch(base + path, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> | undefined),
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (first.status !== 401 && first.status !== 403) {
    return first;
  }

  const refreshed = await tryRefreshAccessToken();
  if (!refreshed) {
    return first;
  }

  const retryToken = getToken();
  return fetch(base + path, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> | undefined),
      Authorization: retryToken ? `Bearer ${retryToken}` : '',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
}

// --- Token decode ---
function parseJwt(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const now = ref(Math.floor(Date.now() / 1000));
let clockTimer: ReturnType<typeof setInterval> | null = null;

const tokenPayload = computed(() => {
  const t = getToken();
  return t ? parseJwt(t) : null;
});

const profileRole = computed<'user' | 'admin'>(() => {
  if (profileData.value.role === 'admin') return 'admin';
  return tokenPayload.value?.role === 'admin' ? 'admin' : 'user';
});

const profileRoleLabel = computed(() =>
  profileRole.value === 'admin' ? t('profile.role_admin') : t('profile.role_user'),
);

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
    const res = await authorizedFetch('/api/v1/users/me');
    if (res.ok) {
      const data = await res.json();
      form.value.email = data.email || '';
      form.value.username = data.username || '';
      form.value.breederCountry = data.breederCountry || '';
      form.value.streetHouseNumber = data.streetHouseNumber || '';
      form.value.postalCode = data.postalCode || '';
      form.value.city = data.city || '';
      form.value.phone = data.phone || '';
      form.value.operationNumber = data.operationNumber || '';
      form.value.breederAssociation = Number.isInteger(data.breederAssociation)
        ? data.breederAssociation
        : null;
      form.value.breederNumber = Number.isInteger(data.breederNumber) ? data.breederNumber : null;
      form.value.defaultApiaryNumber = Number.isInteger(data.defaultApiaryNumber)
        ? data.defaultApiaryNumber
        : null;
      form.value.defaultMatingType = Number.isInteger(data.defaultMatingType)
        ? data.defaultMatingType
        : null;
      form.value.isObmann = !!data.isObmann;
      form.value.obmannNumber = Number.isInteger(data.obmannNumber) ? data.obmannNumber : null;
      form.value.dateInputMode = ['full', 'dayMonth', 'week'].includes(data.dateInputMode)
        ? data.dateInputMode
        : 'full';
      selectedAssociationCode.value =
        typeof data.breederAssociationCode === 'string'
          ? data.breederAssociationCode
          : deriveAssociationCode();
      profileData.value.emailVerified = data.emailVerified ?? false;
      profileData.value.role = data.role === 'admin' ? 'admin' : 'user';
    }
  } catch {
  } finally {
    loading.value = false;
  }
}

async function fetchBreederAssociations() {
  try {
    const res = await authorizedFetch('/api/v1/users/breeder-associations');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        associations.value = data;
        selectedAssociationCode.value = selectedAssociationCode.value || deriveAssociationCode();
        applyAssociationCode(selectedAssociationCode.value);
      }
    } else {
      $q.notify({ type: 'negative', message: t('messages.failed') });
    }
  } catch {
    $q.notify({ type: 'negative', message: t('messages.failed') });
  }
}

async function submit() {
  loading.value = true;
  try {
    const payload: any = {
      username: form.value.username,
      streetHouseNumber: form.value.streetHouseNumber || undefined,
      postalCode: form.value.postalCode || undefined,
      city: form.value.city || undefined,
      phone: form.value.phone || undefined,
      operationNumber: form.value.operationNumber || undefined,
      breederAssociationCode: selectedAssociationCode.value ?? undefined,
      breederCountry: form.value.breederCountry || undefined,
      breederAssociation: form.value.breederAssociation ?? undefined,
      breederNumber: form.value.breederNumber ?? undefined,
      defaultApiaryNumber: form.value.defaultApiaryNumber ?? undefined,
      defaultMatingType: form.value.defaultMatingType ?? undefined,
      isObmann: !!form.value.isObmann,
      obmannNumber: form.value.isObmann ? form.value.obmannNumber ?? undefined : undefined,
      dateInputMode: form.value.dateInputMode,
    };
    if (form.value.password?.length) payload.password = form.value.password;
    const res = await authorizedFetch('/api/v1/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchProfile();
      $q.notify({ type: 'positive', message: t('messages.profile_saved') });
      router.push('/');
    } else {
      $q.notify({ type: 'negative', message: t('messages.save_failed') });
    }
  } catch {
  } finally {
    loading.value = false;
  }
}

async function refreshNow() {
  refreshing.value = true;
  try {
    const base = OpenAPI.BASE || ((import.meta as any).env?.VITE_API_BASE ?? '');
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

function cancel() {
  router.push('/');
}

onMounted(() => {
  fetchBreederAssociations();
  fetchProfile();
  clockTimer = setInterval(() => {
    now.value = Math.floor(Date.now() / 1000);
  }, 1000);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});
</script>

<style scoped>
</style>
