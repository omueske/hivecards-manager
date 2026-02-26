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
        <!-- Success: check inbox screen -->
        <div v-if="registered" style="text-align: center; padding: 24px 0">
          <div style="font-size: 48px; margin-bottom: 16px">📬</div>
          <h1 style="font-size: 26px; margin: 0 0 12px">{{ t('auth.check_inbox_title') }}</h1>
          <p style="color: #555; margin: 0 0 24px; line-height: 1.5">
            {{ t('auth.check_inbox_desc') }}
          </p>
          <router-link to="/login" style="font-size: 0.9em">
            {{ t('auth.back_to_login') }}
          </router-link>
        </div>

        <template v-else>
        <h1 style="font-size: 32px; margin: 8px 0">{{ t('auth.register') }}</h1>
        <p style="margin: 0 0 24px; color: #555; font-size: 0.95em">
          {{ t('auth.register_subtitle') }}
        </p>

        <form @submit.prevent="onSubmit">
          <!-- Email -->
          <div style="margin-bottom: 16px">
            <label for="reg-email">{{ t('auth.email') }}</label>
            <input
              id="reg-email"
              type="email"
              v-model="email"
              required
              autocomplete="email"
              style="width: 100%; padding: 8px; margin-top: 4px; box-sizing: border-box"
            />
          </div>

          <!-- Username (optional) -->
          <div style="margin-bottom: 16px">
            <label for="reg-username">
              {{ t('auth.username') }}
              <span style="color: #888; font-size: 0.82em; font-weight: normal">
                ({{ t('form.optional') }})
              </span>
            </label>
            <input
              id="reg-username"
              type="text"
              v-model="username"
              autocomplete="nickname"
              :placeholder="t('auth.username_placeholder')"
              style="width: 100%; padding: 8px; margin-top: 4px; box-sizing: border-box"
            />
          </div>

          <!-- Password with show/hide toggle -->
          <div style="margin-bottom: 8px">
            <label for="reg-password">{{ t('auth.password') }}</label>
            <div style="position: relative; margin-top: 4px">
              <input
                id="reg-password"
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

          <!-- Live password rules -->
          <ul
            style="
              list-style: none;
              padding: 0;
              margin: 0 0 16px;
              font-size: 0.85em;
              display: flex;
              flex-direction: column;
              gap: 2px;
            "
          >
            <li :style="{ color: passwordRules.length ? '#2a7a2a' : '#888' }">
              {{ passwordRules.length ? '✓' : '○' }} {{ t('auth.pw_rule_length') }}
            </li>
          </ul>

          <!-- Confirm password -->
          <div style="margin-bottom: 20px">
            <label for="reg-confirm-password">{{ t('auth.confirm_password') }}</label>
            <div style="position: relative; margin-top: 4px">
              <input
                id="reg-confirm-password"
                :type="showPassword ? 'text' : 'password'"
                v-model="confirmPassword"
                required
                autocomplete="new-password"
                :style="{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                  borderColor: confirmPassword
                    ? passwordsMatch
                      ? '#2a7a2a'
                      : '#c00'
                    : undefined,
                  outline: confirmPassword
                    ? passwordsMatch
                      ? '1px solid #2a7a2a'
                      : '1px solid #c00'
                    : undefined,
                }"
              />
            </div>
            <div
              v-if="confirmPassword && !passwordsMatch"
              style="color: #c00; font-size: 0.85em; margin-top: 4px"
            >
              {{ t('auth.passwords_mismatch') }}
            </div>
            <div
              v-if="confirmPassword && passwordsMatch"
              style="color: #2a7a2a; font-size: 0.85em; margin-top: 4px"
            >
              {{ t('auth.passwords_match') }}
            </div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading || !canSubmit"
            style="
              width: 100%;
              padding: 10px;
              font-size: 1em;
              cursor: pointer;
            "
            :style="{ opacity: canSubmit ? 1 : 0.6 }"
          >
            {{ loading ? t('auth.registering') : t('auth.register') }}
          </button>
        </form>

        <div v-if="error" role="alert" style="color: #c00; margin-top: 12px">
          {{ error }}
          <span v-if="errorIsEmailTaken">
            &mdash;
            <router-link to="/login">{{ t('auth.login') }}</router-link>
          </span>
        </div>

        <p style="margin-top: 20px; text-align: center; font-size: 0.9em">
          {{ t('auth.have_account') }}
          <router-link to="/login">{{ t('auth.login') }}</router-link>
        </p>
        </template>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { DefaultService } from '../api-client/services/DefaultService';

export default {
  setup() {
    const email = ref('');
    const username = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const showPassword = ref(false);
    const error = ref('');
    const errorIsEmailTaken = ref(false);
    const loading = ref(false);
    const registered = ref(false);
    const { t } = useI18n();

    const passwordRules = computed(() => ({
      length: password.value.length >= 8,
    }));

    const passwordValid = computed(() => passwordRules.value.length);
    const passwordsMatch = computed(
      () => password.value === confirmPassword.value && confirmPassword.value.length > 0,
    );
    const canSubmit = computed(
      () => email.value.length > 0 && passwordValid.value && passwordsMatch.value,
    );

    async function onSubmit() {
      error.value = '';
      errorIsEmailTaken.value = false;

      if (!passwordValid.value) {
        error.value = t('auth.pw_rule_length');
        return;
      }
      if (!passwordsMatch.value) {
        error.value = t('auth.passwords_mismatch');
        return;
      }

      loading.value = true;
      try {
        await DefaultService.postApiV1AuthRegister({
          email: email.value,
          password: password.value,
          username: username.value.trim() || undefined,
        } as any);

        // Show "check your inbox" screen — login only after email verification
        registered.value = true;
      } catch (e: any) {
        const msg: string = e?.body?.message || e?.response?.data?.message || e?.message || '';
        if (msg.toLowerCase().includes('already registered')) {
          error.value = t('auth.email_already_registered');
          errorIsEmailTaken.value = true;
        } else {
          error.value = msg || t('auth.register_failed');
        }
      } finally {
        loading.value = false;
      }
    }

    return {
      email,
      username,
      password,
      confirmPassword,
      showPassword,
      error,
      errorIsEmailTaken,
      loading,
      registered,
      passwordRules,
      passwordsMatch,
      canSubmit,
      onSubmit,
      t,
    };
  },
};
</script>
