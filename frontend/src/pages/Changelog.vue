<template>
  <q-page class="changelog-page">
    <div class="changelog-container">
      <div class="changelog-header">
        <q-btn flat round dense icon="arrow_back" @click="router.back()" class="back-btn" />
        <h1>{{ $t('nav.changelog') }}</h1>
      </div>
      <div class="changelog-body" v-html="html" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
// Vite ?raw import — returns the file contents as a plain string at build time
import raw from '../../../CHANGELOG.md?raw'

const router = useRouter()

const html = computed(() => marked.parse(raw) as string)
</script>

<style scoped>
.changelog-page {
  background: #fafafa;
  min-height: 100vh;
}

.changelog-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.changelog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.changelog-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.back-btn {
  color: #555;
}

/* Rendered markdown styles */
.changelog-body :deep(h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1a1a1a;
}

.changelog-body :deep(h2) {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 32px 0 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #f0a500;
  color: #1a1a1a;
}

.changelog-body :deep(h3) {
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 20px 0 8px;
  color: #555;
}

.changelog-body :deep(ul) {
  margin: 0 0 8px 0;
  padding-left: 20px;
}

.changelog-body :deep(li) {
  margin: 4px 0;
  font-size: 0.92rem;
  color: #333;
  line-height: 1.5;
}

.changelog-body :deep(code) {
  background: #f0f0f0;
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 0.85em;
  color: #c0392b;
}

.changelog-body :deep(a) {
  color: #f0a500;
}

.changelog-body :deep(hr) {
  border: none;
  border-top: 1px solid #e8e8e8;
  margin: 24px 0;
}

.changelog-body :deep(p) {
  font-size: 0.92rem;
  color: #555;
  margin: 0 0 8px;
}
</style>
