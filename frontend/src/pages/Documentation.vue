<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn flat round dense icon="arrow_back" @click="router.back()" class="q-mr-sm" />
      <div class="text-h5">{{ t('nav.documentation') }}</div>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-xs">{{ t('docs.welcomeTitle') }}</div>
        <div class="text-body2">{{ t('docs.welcomeText') }}</div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div v-for="item in topics" :key="item.slug" class="col-12 col-md-6">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <q-badge v-if="item.recommended" color="primary" class="q-mb-sm">
              {{ t('docs.recommendedFirst') }}
            </q-badge>
            <div class="text-subtitle1">{{ t(item.titleKey) }}</div>
            <div class="text-body2 q-mt-xs">{{ t(item.descKey) }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              color="primary"
              flat
              :label="t('docs.openChapter')"
              @click="router.push(`/documentation/${item.slug}`)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const topics = [
  {
    slug: 'getting-started',
    titleKey: 'docs.gettingStartedTitle',
    descKey: 'docs.gettingStartedDesc',
    recommended: true,
  },
  {
    slug: 'daily-work',
    titleKey: 'docs.dailyWorkTitle',
    descKey: 'docs.dailyWorkDesc',
    recommended: true,
  },
  {
    slug: 'queens-guide',
    titleKey: 'docs.queensTitle',
    descKey: 'docs.queensDesc',
    recommended: true,
  },
  {
    slug: 'breeding-book-guide',
    titleKey: 'docs.breedingBookTitle',
    descKey: 'docs.breedingBookDesc',
    recommended: true,
  },
  {
    slug: 'bestandsbuch-guide',
    titleKey: 'docs.bestandsbuchTitle',
    descKey: 'docs.bestandsbuchDesc',
    recommended: true,
  },
  { slug: 'faq', titleKey: 'docs.faqTitle', descKey: 'docs.faqDesc' },
  {
    slug: 'complete-manual',
    titleKey: 'docs.completeManualTitle',
    descKey: 'docs.completeManualDesc',
  },
];
</script>

