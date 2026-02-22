<template>
  <q-dialog :model-value="visible" @update:model-value="emit('update:visible', $event)">
    <q-card style="min-width: 340px; max-width: 480px; width: 100%">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ queen ? t('queen.edit') : t('queen.create') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="emit('update:visible', false)" />
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="submit" class="q-gutter-sm">
          <q-input
            v-model="form.name"
            :label="t('queen.name')"
            dense
            outlined
            clearable
            :hint="t('queen.name_hint')"
          />
          <q-input
            v-model.number="form.queenYear"
            :label="t('hive.queenYear')"
            type="number"
            dense
            outlined
            clearable
          />
          <div class="row items-center q-gutter-sm">
            <q-select
              v-model="form.queenColor"
              :options="colorOptions"
              :label="t('hive.queenColor')"
              dense
              outlined
              clearable
              style="flex: 1"
            />
            <div
              v-if="colorDot"
              :style="{ background: colorDot.hex, width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #ccc', flexShrink: 0 }"
              :title="colorDot.name"
            />
          </div>
          <q-input
            v-model="form.queenOrigin"
            :label="t('hive.queenOrigin')"
            dense
            outlined
            clearable
          />
          <q-select
            v-model="form.matingType"
            :options="matingOptions"
            :label="t('hive.matingType')"
            dense
            outlined
            clearable
          />
          <q-select
            v-model="form.status"
            :options="statusOptions"
            :label="t('queen.status')"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
          />
          <q-toggle v-model="form.queenMarked" :label="t('hive.queenMarked')" />
          <q-input
            v-model="form.notes"
            :label="t('form.notes')"
            type="textarea"
            rows="2"
            dense
            outlined
            clearable
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('form.cancel')" @click="emit('update:visible', false)" />
        <q-btn
          color="primary"
          rounded
          :label="t('form.save')"
          :loading="saving"
          icon="check"
          @click="submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { DefaultService } from '../api-client/services/DefaultService';
import type { Queen } from '../api-client/models/Queen';

export default {
  props: ['visible', 'queen'],
  emits: ['update:visible', 'created', 'updated'],
  setup(props: any, { emit }: any) {
    const { t } = useI18n();
    const saving = ref(false);

    const colorOptions = [
      'Weiß',
      'Gelb',
      'Rot',
      'Grün',
      'Blau',
    ];

    const COLOR_MAP: Record<number, { name: string; hex: string }> = {
      1: { name: 'Weiß', hex: '#FFFFFF' },
      6: { name: 'Weiß', hex: '#FFFFFF' },
      2: { name: 'Gelb', hex: '#FFD700' },
      7: { name: 'Gelb', hex: '#FFD700' },
      3: { name: 'Rot', hex: '#E53935' },
      8: { name: 'Rot', hex: '#E53935' },
      4: { name: 'Grün', hex: '#43A047' },
      9: { name: 'Grün', hex: '#43A047' },
      0: { name: 'Blau', hex: '#1E88E5' },
      5: { name: 'Blau', hex: '#1E88E5' },
    };

    function yearToColor(year: number | null): string | null {
      if (!year || year < 1000) return null;
      const entry = COLOR_MAP[year % 10];
      return entry ? entry.name : null;
    }
    const matingOptions = ['Standbegattet', 'Belegstelle', 'instrumentell'];
    const statusOptions = [
      { label: t('queen.status_active'), value: 'active' },
      { label: t('queen.status_spare'), value: 'spare' },
      { label: t('queen.status_dead'), value: 'dead' },
      { label: t('queen.status_sold'), value: 'sold' },
    ];

    const defaultForm = () => ({
      name: '',
      queenYear: new Date().getFullYear() as number | null,
      queenColor: '',
      queenOrigin: '',
      matingType: '',
      queenMarked: false,
      status: 'spare',
      notes: '',
    });

    const form = ref(defaultForm());

    // Auto-calculate color from year
    watch(
      () => form.value.queenYear,
      (year) => {
        const auto = yearToColor(year);
        if (auto) form.value.queenColor = auto;
      },
    );

    const colorDot = computed(() => {
      if (!form.value.queenColor) return null;
      const key = Object.values(COLOR_MAP).find((c) => c.name === form.value.queenColor);
      return key ?? null;
    });

    watch(
      () => props.visible,
      (v) => {
        if (v) {
          if (props.queen) {
            const q: Queen = props.queen;
            form.value = {
              name: q.name || '',
              queenYear: q.queenYear ?? null,
              queenColor: q.queenColor || '',
              queenOrigin: q.queenOrigin || '',
              matingType: (q as any).matingType || '',
              queenMarked: (q as any).queenMarked ?? false,
              status: q.status || 'spare',
              notes: q.notes || '',
            };
          } else {
            form.value = defaultForm();
          }
        }
      },
      { immediate: true },
    );

    async function submit() {
      saving.value = true;
      try {
        const payload: any = {
          name: form.value.name || undefined,
          queenYear: form.value.queenYear ?? undefined,
          queenColor: form.value.queenColor || undefined,
          queenOrigin: form.value.queenOrigin || undefined,
          matingType: form.value.matingType || undefined,
          queenMarked: form.value.queenMarked,
          status: form.value.status,
          notes: form.value.notes || undefined,
        };

        if (props.queen) {
          const updated = await DefaultService.putApiV1Queens((props.queen as any).id, payload);
          emit('updated', updated);
          // @ts-ignore
          import('quasar').then(({ Notify }) =>
            Notify.create({ type: 'positive', message: t('messages.updated') }),
          );
        } else {
          const created = await DefaultService.postApiV1Queens(payload);
          emit('created', created);
          // @ts-ignore
          import('quasar').then(({ Notify }) =>
            Notify.create({ type: 'positive', message: t('queen.created') }),
          );
        }
        emit('update:visible', false);
      } catch (e: any) {
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'negative', message: e?.message || t('messages.failed') }),
        );
      } finally {
        saving.value = false;
      }
    }

    return { t, form, saving, colorOptions, matingOptions, statusOptions, submit, emit, colorDot };
  },
};
</script>
