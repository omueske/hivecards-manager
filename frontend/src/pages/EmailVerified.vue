<template>
  <div style="display: flex; align-items: center; justify-content: center; min-height: 80vh; padding: 24px">
    <div style="max-width: 480px; width: 100%; text-align: center">
      <div
        style="
          font-size: 72px;
          line-height: 1;
          margin-bottom: 24px;
        "
      >✅</div>

      <h1 style="font-size: 28px; margin: 0 0 12px">
        {{ t('auth.verify_title') }}
      </h1>

      <p style="font-size: 1.05em; color: #444; margin: 0 0 32px">
        {{ t('auth.verify_message') }}
      </p>

      <a
        href="/login"
        style="
          display: inline-block;
          background: #2a7a2a;
          color: #fff;
          padding: 12px 32px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 1em;
          font-weight: 600;
        "
      >
        {{ t('auth.verify_to_login') }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'EmailVerified',
  setup() {
    const { t } = useI18n()
    return { t }
  },
})
</script>
