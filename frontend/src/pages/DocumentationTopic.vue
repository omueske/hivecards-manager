<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        @click="router.push('/documentation')"
        class="q-mr-sm"
      />
      <div class="text-h5">{{ currentTitle }}</div>
    </div>

    <q-card flat bordered>
      <q-card-section>
        <div v-if="html" v-html="html" class="doc-markdown" />
        <div v-else class="text-negative">{{ t('docs.topicNotFound') }}</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { marked } from 'marked';
import gettingStartedDe from '../docs/getting-started.de.md?raw';
import gettingStartedEn from '../docs/getting-started.en.md?raw';
import dailyWorkDe from '../docs/daily-work.de.md?raw';
import dailyWorkEn from '../docs/daily-work.en.md?raw';
import queensGuideDe from '../docs/queens-guide.de.md?raw';
import queensGuideEn from '../docs/queens-guide.en.md?raw';
import breedingBookDe from '../docs/breeding-book-guide.de.md?raw';
import breedingBookEn from '../docs/breeding-book-guide.en.md?raw';
import faqDe from '../docs/faq.de.md?raw';
import faqEn from '../docs/faq.en.md?raw';
import manualDe from '../docs/user-manual.de.md?raw';
import manualEn from '../docs/user-manual.en.md?raw';

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();

const docsBySlug: Record<string, { de: string; en: string; titleKey: string }> = {
  'getting-started': {
    de: gettingStartedDe,
    en: gettingStartedEn,
    titleKey: 'docs.gettingStartedTitle',
  },
  'daily-work': {
    de: dailyWorkDe,
    en: dailyWorkEn,
    titleKey: 'docs.dailyWorkTitle',
  },
  'queens-guide': {
    de: queensGuideDe,
    en: queensGuideEn,
    titleKey: 'docs.queensTitle',
  },
  'breeding-book-guide': {
    de: breedingBookDe,
    en: breedingBookEn,
    titleKey: 'docs.breedingBookTitle',
  },
  faq: {
    de: faqDe,
    en: faqEn,
    titleKey: 'docs.faqTitle',
  },
  'complete-manual': {
    de: manualDe,
    en: manualEn,
    titleKey: 'docs.completeManualTitle',
  },
};

const slug = computed(() => String(route.params.topic || ''));

const currentTopic = computed(() => docsBySlug[slug.value]);

const currentTitle = computed(() => {
  if (!currentTopic.value) return t('docs.topicNotFound');
  return t(currentTopic.value.titleKey);
});

const html = computed(() => {
  if (!currentTopic.value) return '';
  const source = locale.value === 'de' ? currentTopic.value.de : currentTopic.value.en;
  return marked.parse(source) as string;
});
</script>
