<template>
  <q-page padding>
    <div class="q-mb-lg">
      <div class="text-h4 q-mb-xs">{{ t('dashboard.welcome') }}</div>
      <div class="text-body1 text-grey-7">{{ t('dashboard.subtitle') }}</div>
    </div>

    <!-- Quick-Stats -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-6 col-sm-4">
        <q-card flat bordered class="stat-card cursor-pointer" @click="router.push('/hives')">
          <q-card-section class="text-center">
            <q-icon name="hive" size="2rem" color="amber-8" />
            <div class="text-h4 q-mt-xs">{{ stats.hives }}</div>
            <div class="text-caption text-grey-6">{{ t('hive.title') }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4">
        <q-card flat bordered class="stat-card cursor-pointer" @click="router.push('/apiaries')">
          <q-card-section class="text-center">
            <q-icon name="location_on" size="2rem" color="teal-6" />
            <div class="text-h4 q-mt-xs">{{ stats.apiaries }}</div>
            <div class="text-caption text-grey-6">{{ t('apiary.title') }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4">
        <q-card flat bordered class="stat-card cursor-pointer" @click="router.push('/queens')">
          <q-card-section class="text-center">
            <q-icon name="emoji_nature" size="2rem" color="pink-6" />
            <div class="text-h4 q-mt-xs">{{ stats.queens }}</div>
            <div class="text-caption text-grey-6">{{ t('dashboard.stat_queens') }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4">
        <q-card flat bordered class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="search" size="2rem" color="blue-6" />
            <div class="text-h4 q-mt-xs">{{ stats.inspections }}</div>
            <div class="text-caption text-grey-6">{{ t('dashboard.stat_inspections') }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4">
        <q-card flat bordered class="stat-card">
          <q-card-section class="text-center">
            <q-icon name="healing" size="2rem" color="red-6" />
            <div class="text-h4 q-mt-xs">{{ stats.treatments }}</div>
            <div class="text-caption text-grey-6">{{ t('dashboard.stat_treatments') }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Quick access teasers -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-6">
        <q-card
          flat
          bordered
          class="changelog-teaser cursor-pointer full-height"
          @click="router.push('/changelog')"
        >
          <q-card-section class="row items-center q-pa-md">
            <q-icon name="history" size="1.6rem" color="amber-8" class="q-mr-md" />
            <div class="col">
              <div class="text-subtitle1 text-weight-bold">{{ t('dashboard.changelog_title') }}</div>
              <div class="text-caption text-grey-6">{{ t('dashboard.changelog_subtitle') }}</div>
            </div>
            <q-icon name="chevron_right" color="grey-5" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card
          flat
          bordered
          class="changelog-teaser cursor-pointer full-height"
          @click="router.push('/breeding-book')"
        >
          <q-card-section class="row items-center q-pa-md">
            <q-icon name="menu_book" size="1.6rem" color="blue-7" class="q-mr-md" />
            <div class="col">
              <div class="text-subtitle1 text-weight-bold">{{ t('dashboard.breeding_book_title') }}</div>
              <div class="text-caption text-grey-6">{{ t('dashboard.breeding_book_subtitle') }}</div>
            </div>
            <q-icon name="chevron_right" color="grey-5" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Workflow Steps -->
    <div class="text-h6 q-mb-md">{{ t('dashboard.how_it_works') }}</div>
    <div class="row q-col-gutter-md">
      <div v-for="step in steps" :key="step.step" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="step-card full-height">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-avatar
                :color="step.color"
                text-color="white"
                size="36px"
                class="q-mr-sm step-num"
                >{{ step.step }}</q-avatar
              >
              <q-icon :name="step.icon" :color="step.color" size="1.5rem" />
            </div>
            <div class="text-subtitle1 text-weight-bold q-mb-xs">{{ step.title }}</div>
            <div class="text-body2 text-grey-7">{{ step.desc }}</div>
          </q-card-section>
          <q-card-actions>
            <q-btn
              flat
              dense
              :color="step.color"
              :label="step.action"
              :icon="step.actionIcon"
              @click="router.push(step.route)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { DefaultService } from '../api-client/services/DefaultService';

export default {
  setup() {
    const { t } = useI18n();
    const router = useRouter();

    const stats = ref({ hives: 0, apiaries: 0, queens: 0, inspections: 0, treatments: 0 });

    onMounted(async () => {
      try {
        const svc: any = DefaultService;
        const [hivesRes, apiariesRes, queensRes, insRes] = await Promise.allSettled([
          svc.getApiV1Hives?.() ?? Promise.resolve(undefined),
          svc.getApiV1Apiaries?.() ?? Promise.resolve(undefined),
          svc.getApiV1Queens?.() ?? Promise.resolve(undefined),
          svc.getApiV1Inspections?.(undefined, undefined, undefined, 1, 100) ??
            Promise.resolve(undefined),
        ]);

        if (hivesRes.status === 'fulfilled') {
          stats.value.hives =
            (hivesRes.value as any)?.pagination?.total ??
            (hivesRes.value as any)?.items?.length ??
            0;
        }
        if (apiariesRes.status === 'fulfilled') {
          stats.value.apiaries = Array.isArray(apiariesRes.value) ? apiariesRes.value.length : 0;
        }
        if (queensRes.status === 'fulfilled') {
          stats.value.queens = Array.isArray(queensRes.value) ? queensRes.value.length : 0;
        }
        if (insRes.status === 'fulfilled') {
          const items: any[] = (insRes.value as any)?.items ?? [];
          stats.value.inspections = items.filter((i) => i.type === 'inspection').length;
          stats.value.treatments = items.filter((i) => i.type === 'treatment').length;
        }
      } catch {
        /* ignore */
      }
    });

    const steps = computed(() => [
      {
        step: 1,
        icon: 'location_on',
        color: 'teal',
        title: t('dashboard.step1_title'),
        desc: t('dashboard.step1_desc'),
        action: t('dashboard.step1_action'),
        actionIcon: 'arrow_forward',
        route: '/apiaries',
      },
      {
        step: 2,
        icon: 'hive',
        color: 'amber-8',
        title: t('dashboard.step2_title'),
        desc: t('dashboard.step2_desc'),
        action: t('dashboard.step2_action'),
        actionIcon: 'arrow_forward',
        route: '/hives',
      },
      {
        step: 3,
        icon: 'emoji_nature',
        color: 'pink-6',
        title: t('dashboard.step3_title'),
        desc: t('dashboard.step3_desc'),
        action: t('dashboard.step3_action'),
        actionIcon: 'arrow_forward',
        route: '/queens',
      },
      {
        step: 4,
        icon: 'search',
        color: 'blue',
        title: t('dashboard.step4_title'),
        desc: t('dashboard.step4_desc'),
        action: t('dashboard.step4_action'),
        actionIcon: 'arrow_forward',
        route: '/hives',
      },
      {
        step: 5,
        icon: 'picture_as_pdf',
        color: 'deep-orange',
        title: t('dashboard.step5_title'),
        desc: t('dashboard.step5_desc'),
        action: t('dashboard.step5_action'),
        actionIcon: 'arrow_forward',
        route: '/hives',
      },
    ]);

    return { t, router, stats, steps };
  },
};
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
}
.step-card {
  border-radius: 12px;
  transition: box-shadow 120ms;
}
.step-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.step-num {
  font-weight: 700;
  font-size: 1rem;
}
.changelog-teaser {
  border-radius: 12px;
  transition: box-shadow 120ms;
}
.changelog-teaser:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
</style>
