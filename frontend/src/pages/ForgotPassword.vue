<template>
  <div style="display: flex; align-items: flex-start; justify-content: center; padding: 24px">
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
      </header>

      <main>
        <h1 style="font-size: 32px; margin: 8px 0">{{ t('auth.forgot_password') }}</h1>
        <p style="color: #555; margin: 0 0 24px; font-size: 0.95em">
          {{ t('auth.forgot_password_desc') }}
        </p>

        <div
          v-if="sent"
          style="
            background: #eafaea;
            border: 1px solid #2a7a2a;
            border-radius: 4px;
            padding: 16px;
            margin-bottom: 16px;
            color: #1a5a1a;
          "
        >
          {{ t('auth.forgot_password_sent') }}
        </div>

        <form v-else @submit.prevent="onSubmit">
          <div style="margin-bottom: 16px">
            <label for="fp-email">{{ t('auth.email') }}</label>
            <input
              id="fp-email"
              type="email"
              v-model="email"
              required
              autocomplete="email"
              style="width: 100%; padding: 8px; margin-top: 4px; box-sizing: border-box"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            style="width: 100%; padding: 10px; font-size: 1em; cursor: pointer"
          >
            {{ loading ? t('auth.sending') : t('auth.send_reset_link') }}
          </button>
        </form>

        <div v-if="error" role="alert" style="color: #c00; margin-top: 12px">{{ error }}</div>

        <p style="margin-top: 20px; text-align: center; font-size: 0.9em">
          <router-link to="/login">{{ t('auth.back_to_login') }}</router-link>
        </p>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { DefaultService } from '../api-client/services/DefaultService';

export default {
  setup() {
    const email = ref('');
    const sent = ref(false);
    const loading = ref(false);
    const error = ref('');
    const { t } = useI18n();

    async function onSubmit() {
      error.value = '';
      loading.value = true;
      try {
        const testStub = (globalThis as any).__TEST_DEFAULT_SERVICE__;
        if (testStub?.postApiV1AuthForgotPassword) {
          await testStub.postApiV1AuthForgotPassword({ email: email.value } as any);
          sent.value = true;
        } else {
          const fn = DefaultService.postApiV1AuthForgotPassword;
          if (fn) {
            await fn({ email: email.value } as any);
            sent.value = true;
          } else {
            // Fallback: direct fetch
            await fetch('/api/v1/auth/forgot-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email.value }),
            });
            sent.value = true;
          }
        }
      } catch (e: any) {
        error.value = e?.response?.data?.message || e?.message || t('auth.request_failed');
      } finally {
        loading.value = false;
      }
    }

    return { email, sent, loading, error, onSubmit, t };
  },
};
</script>
