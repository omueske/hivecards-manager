<template>
  <div
    style="display: flex; align-items: flex-start; justify-content: center; padding: 24px"
  >
    <div style="max-width: 480px; width: 100%">
      <header
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        "
      >
        <div>Hivecards</div>
        <nav><a href="/">Home</a></nav>
      </header>

      <main>
        <h1 style="font-size: 32px; margin: 8px 0">{{ t('auth.login') }}</h1>

        <div
          v-if="emailVerified"
          style="
            background: #eafaea;
            border: 1px solid #2a7a2a;
            border-radius: 4px;
            padding: 12px 16px;
            margin-bottom: 20px;
            color: #1a5a1a;
            font-size: 0.95em;
          "
        >
          {{ t('auth.email_verified_notice') }}
        </div>
        <form @submit.prevent="onSubmit" aria-labelledby="login-heading">
          <div style="margin-bottom: 16px">
            <label for="email">{{ t('auth.email') }}</label>
            <input
              id="email"
              type="email"
              v-model="email"
              required
              autocomplete="email"
              aria-required="true"
              style="width: 100%; padding: 8px; margin-top: 4px; box-sizing: border-box"
            />
          </div>

          <div style="margin-bottom: 8px">
            <div style="display: flex; justify-content: space-between; align-items: baseline">
              <label for="password">{{ t('auth.password') }}</label>
              <router-link
                to="/forgot-password"
                style="font-size: 0.85em"
              >{{ t('auth.forgot_password_link') }}</router-link>
            </div>
            <div style="position: relative; margin-top: 4px">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                required
                autocomplete="current-password"
                aria-required="true"
                style="width: 100%; padding: 8px; padding-right: 88px; box-sizing: border-box"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                style="
                  position: absolute;
                  right: 8px;
                  top: 50%;
                  transform: translateY(-50%);
                  background: none;
                  border: none;
                  cursor: pointer;
                  color: #555;
                  font-size: 0.82em;
                  padding: 0;
                  white-space: nowrap;
                "
              >
                {{ showPassword ? t('auth.hide_password') : t('auth.show_password') }}
              </button>
            </div>
          </div>

          <div style="margin-bottom: 20px"></div>

          <button
            type="submit"
            :disabled="loading"
            style="width: 100%; padding: 10px; font-size: 1em; cursor: pointer"
          >
            {{ loading ? t('auth.logging_in') : t('auth.login') }}
          </button>
        </form>

        <div v-if="error" role="alert" style="margin-top: 12px">
          <span style="color: #c00">{{ error }}</span>
          <span v-if="emailNotVerified" style="display: block; margin-top: 6px; font-size: 0.9em">
            {{ t('auth.email_not_verified_hint') }}
          </span>
        </div>

        <p style="margin-top: 20px; text-align: center; font-size: 0.9em">
          {{ t('auth.no_account') }}
          <router-link to="/register">{{ t('auth.register') }}</router-link>
        </p>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import type { AuthLogin, AuthTokens } from '../api-client';
import { DefaultService } from '../api-client/services/DefaultService';
import { useUserStore } from '../stores/user';
import { useRouter, useRoute } from 'vue-router';

export default {
  setup() {
    const email = ref<string>('');
    const password = ref<string>('');
    const showPassword = ref(false);
    const error = ref<string>('');
    const emailNotVerified = ref(false);
    const loading = ref<boolean>(false);
    const store = useUserStore();
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();
    const $q = useQuasar();

    const emailVerified = ref(route.query.verified === '1');

    async function onSubmit() {
      error.value = '';
      emailNotVerified.value = false;
      loading.value = true;
      try {
        const res = (await DefaultService.postApiV1AuthLogin({
          email: email.value,
          password: password.value,
        } as AuthLogin)) as unknown as AuthTokens;
        const token = res.accessToken;
        if (token) {
          store.setToken(token);
          try {
            localStorage.setItem('hc_has_refresh', '1');
          } catch {}
        }
        const dest = (route.query.redirect as string) || '/';
        router.push(dest);
      } catch (e: any) {
        const msg: string =
          e?.body?.message || e?.response?.data?.message || e?.message || '';
        if (msg.toLowerCase().includes('not verified')) {
          emailNotVerified.value = true;
          error.value = t('auth.email_not_verified');
        } else {
          error.value = msg || t('auth.login_failed');
        }
        $q.notify({ type: 'negative', message: error.value });
      } finally {
        loading.value = false;
      }
    }

    return {
      email,
      password,
      showPassword,
      error,
      emailNotVerified,
      loading,
      emailVerified,
      onSubmit,
      t,
    };
  },
};
</script>
