<template>
  <div style="display: flex; align-items: flex-start; justify-content: center; padding: 24px">
    <div style="max-width: 480px; width: 100%">
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
        <div>Hivecards</div>
      </header>

      <main>
        <h1 style="font-size: 32px; margin: 8px 0">{{ t('auth.reset_password') }}</h1>

        <!-- Invalid/missing token state -->
        <div
          v-if="!token"
          style="color: #c00"
        >
          {{ t('auth.reset_token_missing') }}
        </div>

        <!-- Success state -->
        <div
          v-else-if="done"
          style="
            background: #eafaea;
            border: 1px solid #2a7a2a;
            border-radius: 4px;
            padding: 16px;
            color: #1a5a1a;
          "
        >
          <p style="margin: 0 0 12px">{{ t('auth.reset_success') }}</p>
          <router-link to="/login">{{ t('auth.login') }}</router-link>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="onSubmit">
          <div style="margin-bottom: 8px">
            <label for="rp-password">{{ t('auth.new_password') }}</label>
            <div style="position: relative; margin-top: 4px">
              <input
                id="rp-password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                required
                autocomplete="new-password"
                style="width: 100%; padding: 8px; padding-right: 88px; box-sizing: border-box"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                style="
                  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
                  background: none; border: none; cursor: pointer; color: #555;
                  font-size: 0.82em; padding: 0; white-space: nowrap;
                "
              >
                {{ showPassword ? t('auth.hide_password') : t('auth.show_password') }}
              </button>
            </div>
          </div>

          <ul style="list-style: none; padding: 0; margin: 0 0 16px; font-size: 0.85em">
            <li :style="{ color: password.length >= 8 ? '#2a7a2a' : '#888' }">
              {{ password.length >= 8 ? '✓' : '○' }} {{ t('auth.pw_rule_length') }}
            </li>
          </ul>

          <div style="margin-bottom: 20px">
            <label for="rp-confirm">{{ t('auth.confirm_password') }}</label>
            <input
              id="rp-confirm"
              :type="showPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              required
              autocomplete="new-password"
              :style="{
                width: '100%', padding: '8px', boxSizing: 'border-box',
                borderColor: confirmPassword ? (passwordsMatch ? '#2a7a2a' : '#c00') : undefined,
              }"
              style="margin-top: 4px"
            />
            <div
              v-if="confirmPassword && !passwordsMatch"
              style="color: #c00; font-size: 0.85em; margin-top: 4px"
            >
              {{ t('auth.passwords_mismatch') }}
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading || !canSubmit"
            :style="{ opacity: canSubmit ? 1 : 0.6 }"
            style="width: 100%; padding: 10px; font-size: 1em; cursor: pointer"
          >
            {{ loading ? t('auth.saving') : t('auth.reset_password_submit') }}
          </button>
        </form>

        <div v-if="error" role="alert" style="color: #c00; margin-top: 12px">{{ error }}</div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const token = ref((route.query.token as string) || '');
    const password = ref('');
    const confirmPassword = ref('');
    const showPassword = ref(false);
    const loading = ref(false);
    const done = ref(false);
    const error = ref('');
    const { t } = useI18n();

    const passwordsMatch = computed(
      () => password.value === confirmPassword.value && confirmPassword.value.length > 0,
    );
    const canSubmit = computed(
      () => password.value.length >= 8 && passwordsMatch.value,
    );

    async function onSubmit() {
      error.value = '';
      if (!canSubmit.value) return;
      loading.value = true;
      try {
        await fetch('/api/v1/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value, password: password.value }),
        }).then(async r => {
          if (!r.ok) {
            const body = await r.json().catch(() => ({}));
            throw new Error(body?.message || r.statusText);
          }
        });
        done.value = true;
      } catch (e: any) {
        error.value = e?.message || t('auth.request_failed');
      } finally {
        loading.value = false;
      }
    }

    return {
      token, password, confirmPassword, showPassword,
      loading, done, error, passwordsMatch, canSubmit,
      onSubmit, t,
    };
  },
};
</script>
