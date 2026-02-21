<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <template v-if="isLoggedIn">
          <button class="burger-btn" @click="burgerMenu = !burgerMenu" aria-label="Menu">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div v-if="burgerMenu" class="burger-nav" role="navigation">
            <button
              class="burger-nav-item"
              @click="burgerMenu = false; router.push('/')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              {{ $t ? $t('nav.home') : 'Start' }}
            </button>
            <button
              class="burger-nav-item"
              @click="
                burgerMenu = false;
                router.push('/hives');
              "
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L2 9h3v10h5v-6h4v6h5V9h3L12 3z" />
              </svg>
              {{ $t ? $t('nav.hives') : 'Völker' }}
            </button>
            <button
              class="burger-nav-item"
              @click="
                burgerMenu = false;
                router.push('/apiaries');
              "
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                />
              </svg>
              {{ $t ? $t('nav.apiaries') : 'Standorte' }}
            </button>
            <button
              class="burger-nav-item"
              @click="
                burgerMenu = false;
                router.push('/queens');
              "
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 5c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z"/></svg>
              {{ $t ? $t('nav.queens') : 'Königinnen' }}
            </button>
          </div>
        </template>
        <q-toolbar-title>Hivecards</q-toolbar-title>
        <q-space />
        <q-select
          dense
          square
          outlined
          style="width: 120px; margin-right: 8px"
          :options="langOptions"
          v-model="lang"
          option-label="label"
        />
        <template v-if="isLoggedIn">
          <q-btn
            flat
            round
            dense
            class="avatar-btn"
            @click="menu = !menu"
            aria-haspopup="true"
            aria-expanded="menu"
          >
            <div class="avatar" role="img" aria-label="User">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </q-btn>
          <div v-if="menu" class="avatar-menu" role="menu">
            <button class="avatar-menu-item" @click="(menu = false), router.push('/profile')">
              {{ $t ? $t('auth.profile') : 'Profile' }}
            </button>
            <button class="avatar-menu-item" @click="onLogoutClicked">
              {{ $t ? $t('auth.logout') : 'Logout' }}
            </button>
          </div>
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="isLoggedIn && $route.path !== '/login'" bordered class="bg-white text-grey-8">
      <q-tabs
        align="justify"
        indicator-color="primary"
        active-color="primary"
        class="bg-white text-grey-7"
        dense
      >
        <q-route-tab to="/" exact icon="home" :label="$t ? $t('nav.home') : 'Start'" />
        <q-route-tab to="/hives" icon="hive" :label="$t ? $t('nav.hives') : 'Hives'" />
        <q-route-tab to="/queens" icon="emoji_nature" :label="$t ? $t('nav.queens') : 'Königinnen'" />
        <q-route-tab
          to="/apiaries"
          icon="location_on"
          :label="$t ? $t('nav.apiaries') : 'Locations'"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useUserStore } from './stores/user';
import { useRouter } from 'vue-router';
import { onMounted, watch, computed, ref } from 'vue';
import { setLocale } from './i18n';
const store = useUserStore();
const router = useRouter();
const menu = ref(false);
const burgerMenu = ref(false);
const isLoggedIn = computed(() => !!store.token);
const langOptions = [
  { label: 'Deutsch', value: 'de' },
  { label: 'English', value: 'en' },
];
const savedLang = localStorage.getItem('hc_lang') || 'de';
const lang = ref(langOptions.find((o) => o.value === savedLang) ?? langOptions[0]);

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/email-verified'];

onMounted(() => {
  // Use window.location.pathname because router.currentRoute may not be resolved yet
  // on initial page load when using createWebHistory
  const currentPath = window.location.pathname;
  if (!store.token && !PUBLIC_ROUTES.includes(currentPath)) {
    router.replace('/login');
  }
});

watch(
  () => store.token,
  (val) => {
    if (!val && !PUBLIC_ROUTES.includes(router.currentRoute.value.path)) {
      router.replace('/login');
    }
  },
);

watch(lang, (v) => {
  if (v?.value) {
    setLocale(v.value as 'en' | 'de');
  }
});

async function logout() {
  await store.clear();
  router.push('/login');
}

async function onLogoutClicked() {
  menu.value = false;
  try {
    const mod = await import('./api-client/services/DefaultService');
    const fn = (mod as any).postApiV1AuthLogout ?? (mod as any).DefaultService?.postApiV1AuthLogout;
    if (fn) await fn();
  } catch (e) {
    // ignore
  }
  try {
    localStorage.removeItem('hc_has_refresh');
  } catch (e) {}
  await logout();
}

function base64UrlDecode(input: string) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4;
  if (pad) input += '='.repeat(4 - pad);
  try {
    return decodeURIComponent(
      atob(input)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
  } catch (e) {
    return '';
  }
}

const initials = computed(() => {
  const t = store.token;
  if (!t) return '';
  const parts = t.split('.');
  if (parts.length < 2) return '';
  const payloadRaw = base64UrlDecode(parts[1]);
  if (!payloadRaw) return '';
  try {
    const payload = JSON.parse(payloadRaw) as Record<string, any>;
    const name = String(
      payload.username || payload.name || payload.email || payload.sub || '',
    ).trim();
    if (!name) return '';

    // Prefer alphabetic initials (Unicode letters). Use first letters of up to two words.
    const words = name.split(/\s+/).filter(Boolean);
    const letter = (s: string) => {
      const m = s.match(/\p{L}/u);
      return m ? m[0] : '';
    };

    const pickFromWord = (w: string) => {
      const m = w.match(/\p{L}/gu);
      return m && m.length > 0 ? m[0] : '';
    };

    const first = pickFromWord(words[0] || '');
    const second = pickFromWord(words[1] || '') || pickFromWord(words.slice(0).join(' '));

    const out = ((first || '') + (second || '')).slice(0, 2).toUpperCase();
    // If no alphabetic characters found, return empty to avoid numeric initials like "69".
    return out.match(/\p{L}/u) ? out : '';
  } catch (e) {
    return '';
  }
});
</script>

<style>
#app {
  font-family: Arial, Helvetica, sans-serif;
  padding: 16px;
}
header {
  margin-bottom: 12px;
}

/* Fallback styles in case Quasar CSS isn't applied in the browser dev environment. */
q-toolbar,
q-header,
q-layout {
  display: block;
}
q-toolbar {
  background: linear-gradient(90deg, #f6b93b 0%, #ffb86b 100%);
  color: #3e2723;
  padding: 8px 12px;
}
q-toolbar-title {
  font-weight: 600;
  margin-right: 12px;
}
q-btn {
  background: transparent;
  border: none;
  color: #3e2723;
  cursor: pointer;
  margin-left: 8px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3e2723;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 8px;
}
q-page-container {
  display: block;
  padding: 16px;
}

.q-toolbar {
  position: relative;
}

.burger-btn {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 6px 8px;
  margin-right: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.burger-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}
.burger-nav {
  position: absolute;
  left: 8px;
  top: 56px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14);
  z-index: 2000;
  min-width: 200px;
  padding: 4px 0;
}
.burger-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 16px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}
.burger-nav-item:hover {
  background: #f5f5f5;
}

.avatar-menu {
  position: absolute;
  right: 12px;
  top: 56px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  z-index: 2000;
  min-width: 160px;
}
.avatar-menu-item {
  display: block;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
}
.avatar-menu-item:hover {
  background: #f5f5f5;
}

@media print {
  .q-header,
  .q-footer,
  .q-drawer {
    display: none !important;
  }
  .q-page-container {
    padding: 0 !important;
  }
}
</style>
