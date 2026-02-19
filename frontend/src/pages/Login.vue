<template>
  <div
    class="login-wrap"
    style="display: flex; align-items: flex-start; justify-content: center; padding: 24px"
  >
    <div style="max-width: 560px; width: 100%">
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
        <h1 style="font-size: 32px; margin: 8px 0">
          {{ mode === 'login' ? t('auth.login') : t('auth.register') }}
        </h1>

        <form @submit.prevent="onSubmit" aria-labelledby="login-heading">
          <div style="margin-bottom: 12px">
            <label for="email">{{ t('auth.email') }}</label>
            <input
              id="email"
              type="email"
              v-model="email"
              required
              aria-required="true"
              aria-label="Email address"
              style="width: 100%; padding: 8px; margin-top: 4px"
            />
          </div>

          <div style="margin-bottom: 12px">
            <label for="password">{{ t('auth.password') }}</label>
            <input
              id="password"
              type="password"
              v-model="password"
              required
              aria-required="true"
              aria-label="Password"
              style="width: 100%; padding: 8px; margin-top: 4px"
            />
          </div>

          <div v-if="mode === 'register'" style="margin-bottom: 12px">
            <label for="username">{{ t('auth.username') }}</label>
            <input
              id="username"
              type="text"
              v-model="username"
              aria-label="Username"
              style="width: 100%; padding: 8px; margin-top: 4px"
            />
          </div>

          <div style="display: flex; gap: 8px; align-items: center; margin-top: 12px">
            <button type="submit" :disabled="loading" aria-busy="false" style="padding: 8px 12px">
              {{
                loading ? 'Please wait...' : mode === 'login' ? t('auth.login') : t('auth.register')
              }}
            </button>
            <button type="button" @click="onCancel" style="padding: 8px 12px">
              {{ t('form.cancel') }}
            </button>
            <button
              type="button"
              @click="toggleMode"
              style="
                margin-left: auto;
                background: transparent;
                border: none;
                color: #06c;
                cursor: pointer;
              "
            >
              {{
                mode === 'login'
                  ? 'No account? ' + t('auth.register')
                  : 'Have an account? ' + t('auth.login')
              }}
            </button>
          </div>
        </form>

        <div v-if="error" role="alert" style="color: #c00; margin-top: 12px">{{ error }}</div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AuthLogin, AuthTokens } from '../api-client';
import { DefaultService } from '../api-client/services/DefaultService';
import { useUserStore } from '../stores/user';
import { useRouter, useRoute } from 'vue-router';

export default {
  setup() {
    const mode = ref<'login' | 'register'>('login');
    const email = ref<string>('');
    const password = ref<string>('');
    const username = ref<string>('');
    const error = ref<string>('');
    const loading = ref<boolean>(false);
    const formRef = ref<any>(null);
    const store = useUserStore();
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    // if redirected after registration, prefill email and show a notice
    if ((route.query as any).registered) {
      const pre = (route.query as any).email;
      if (pre) email.value = String(pre);
      // @ts-ignore
      import('quasar').then(({ Notify }) =>
        Notify.create({ type: 'positive', message: 'Registration successful — please login' }),
      );
    }

    function toggleMode() {
      mode.value = mode.value === 'login' ? 'register' : 'login';
      error.value = '';
    }

    function onCancel() {
      email.value = '';
      password.value = '';
      username.value = '';
      error.value = '';
    }

    async function onSubmit() {
      error.value = '';
      // basic client-side validation
      if (!validateFields()) return;
      loading.value = true;
      try {
        if (mode.value === 'register') {
          const valid = await formRef.value?.validate?.();
          if (valid === false) return;
          const mod = await import('../api-client/services/DefaultService');
          const fn =
            (mod as any).postApiV1AuthRegister ??
            (mod as any).DefaultService?.postApiV1AuthRegister;
          await fn({
            email: email.value,
            password: password.value,
            username: username.value,
          } as any);
          // after successful register, attempt to auto-login
          const loginFn =
            (mod as any).postApiV1AuthLogin ?? (mod as any).DefaultService?.postApiV1AuthLogin;
          if (loginFn) {
            const loginRes = (await loginFn({
              email: email.value,
              password: password.value,
            } as AuthLogin)) as unknown as AuthTokens;
            const token = loginRes.accessToken;
            if (token) {
              store.setToken(token);
              try {
                localStorage.setItem('hc_has_refresh', '1');
              } catch (e) {}
            }
            // server sets refresh token as httpOnly cookie
          }
          // after register: redirect to login view so user can sign in manually
          // show a success notification and navigate to login (keep email in query)
          // @ts-ignore
          import('quasar').then(({ Notify }) =>
            Notify.create({ type: 'positive', message: 'Registered — please log in' }),
          );
          router.push({ path: '/login', query: { registered: '1', email: email.value } });
          return;
        } else {
          const mod = await import('../api-client/services/DefaultService');
          const fn =
            (mod as any).postApiV1AuthLogin ?? (mod as any).DefaultService?.postApiV1AuthLogin;
          const res = (await fn({
            email: email.value,
            password: password.value,
          } as AuthLogin)) as unknown as AuthTokens;
          const token = res.accessToken;
          if (token) {
            store.setToken(token);
            try {
              localStorage.setItem('hc_has_refresh', '1');
            } catch (e) {}
          }
          // server sets refresh token as httpOnly cookie
          const dest = (route.query.redirect as string) || '/';
          router.push(dest);
        }
      } catch (e: any) {
        error.value = e?.response?.data?.message || e?.message || 'Authentication failed';
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'negative', message: error.value }),
        );
      } finally {
        loading.value = false;
      }
    }

    function validateFields() {
      // simple email + password + username checks
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.value)) {
        error.value = 'Please enter a valid email address';
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'negative', message: error.value }),
        );
        return false;
      }
      if (password.value.length < 8) {
        error.value = 'Password must be at least 8 characters';
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'negative', message: error.value }),
        );
        return false;
      }
      if (mode.value === 'register' && !username.value.trim()) {
        error.value = 'Please choose a username';
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'negative', message: error.value }),
        );
        return false;
      }
      return true;
    }

    return {
      mode,
      email,
      password,
      username,
      error,
      loading,
      onSubmit,
      toggleMode,
      onCancel,
      formRef,
      t,
    };
  },
};
</script>
