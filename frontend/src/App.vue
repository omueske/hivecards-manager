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
const store = useUserStore();
const token = store.token;
function logout() {
  store.clear();
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
  background: #1976d2;
  color: white;
  padding: 8px 12px;
}
q-toolbar-title {
  font-weight: 600;
  margin-right: 12px;
}
q-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 8px;
}
q-page-container {
  display: block;
  padding: 16px;
}
</style>
