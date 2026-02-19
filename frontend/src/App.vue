<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Hivecards</q-toolbar-title>
        <q-space />
        <q-btn flat to="/">Home</q-btn>
        <template v-if="token">
          <q-btn flat @click="logout">Logout</q-btn>
        </template>
        <template v-else>
          <q-btn flat to="/login">Login</q-btn>
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useUserStore } from './stores/user';
import { useRouter } from 'vue-router';
const store = useUserStore();
const token = store.token;
const router = useRouter();
function logout() {
  store.clear();
  router.push('/login');
}
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
q-page-container {
  display: block;
  padding: 16px;
}
</style>
