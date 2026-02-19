<template>
  <q-dialog v-model="visible" teleport="body">
    <q-card style="min-width: 320px; max-width: 95vw; width: 480px">
      <q-card-section>
        <div class="text-h6">{{ editing ? t('inspection.edit') : t('inspection.add') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form ref="formRef">
          <q-input
            v-model="form.date"
            :label="t('inspection.date')"
            type="date"
            dense
            required
            class="q-mb-sm"
          />

          <q-select
            v-model="form.type"
            :options="typeOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :label="t('inspection.type')"
            dense
            class="q-mb-sm"
          />

          <q-input
            v-model="form.notes"
            :label="t('inspection.notes')"
            type="textarea"
            dense
            autogrow
            class="q-mb-sm"
          />

          <q-input
            v-model="form.actionsTaken"
            :label="t('inspection.actionsTaken')"
            type="textarea"
            dense
            autogrow
            class="q-mb-sm"
          />

          <!-- Nur bei Durchsicht -->
          <template v-if="form.type === 'inspection'">
            <q-toggle v-model="form.queenSeen" :label="t('inspection.queenSeen')" class="q-mb-xs" />
            <q-input
              v-model="form.broodStatus"
              :label="t('inspection.broodStatus')"
              dense
              class="q-mb-sm"
            />
            <q-input
              v-model.number="form.frameCount"
              :label="t('inspection.frameCount')"
              type="number"
              dense
              class="q-mb-sm"
            />
          </template>

          <!-- Varroa -->
          <template v-if="form.type === 'inspection' || form.type === 'treatment'">
            <q-input
              v-model.number="form.varroaCount"
              :label="t('inspection.varroaCount')"
              type="number"
              dense
              class="q-mb-sm"
            />
          </template>

          <q-input
            v-model="form.weather"
            :label="t('inspection.weather')"
            dense
            class="q-mb-sm"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('form.cancel')" @click="close" />
        <q-btn
          :label="editing ? t('form.save') : t('form.submit')"
          color="primary"
          icon="check"
          rounded
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

const today = () => new Date().toISOString().slice(0, 10);

export default {
  props: {
    visible: { type: Boolean, default: false },
    hiveId: { type: String, required: true },
    inspection: { type: Object, default: null },
  },
  emits: ['update:visible', 'created', 'updated'],

  setup(props: any, { emit }: any) {
    const { t } = useI18n();

    const visible = ref(!!props.visible);
    watch(() => props.visible, (v) => (visible.value = v));
    watch(visible, (v) => emit('update:visible', v));

    const formRef = ref<any>(null);

    const initialForm = () => ({
      date: today(),
      type: 'note',
      notes: '',
      actionsTaken: '',
      queenSeen: false,
      broodStatus: '',
      varroaCount: null as number | null,
      frameCount: null as number | null,
      weather: '',
    });

    const form = ref(initialForm());

    watch(
      () => props.inspection,
      (ins) => {
        if (ins) {
          form.value = {
            date: ins.date ? ins.date.slice(0, 10) : today(),
            type: ins.type || 'note',
            notes: ins.notes || '',
            actionsTaken: ins.actionsTaken || '',
            queenSeen: !!ins.queenSeen,
            broodStatus: ins.broodStatus || '',
            varroaCount: ins.varroaCount ?? null,
            frameCount: ins.frameCount ?? null,
            weather: ins.weather || '',
          };
        } else {
          form.value = initialForm();
        }
      },
      { immediate: true },
    );

    // Reset form when dialog opens fresh (no editing)
    watch(visible, (v) => {
      if (v && !props.inspection) form.value = initialForm();
    });

    const editing = computed(() => !!props.inspection);

    const typeOptions = computed(() => [
      { label: t('inspection.type_inspection'), value: 'inspection' },
      { label: t('inspection.type_treatment'), value: 'treatment' },
      { label: t('inspection.type_feeding'), value: 'feeding' },
      { label: t('inspection.type_harvest'), value: 'harvest' },
      { label: t('inspection.type_note'), value: 'note' },
    ]);

    function close() {
      visible.value = false;
    }

    async function submit() {
      try {
        const payload: any = {
          hiveId: props.hiveId,
          date: form.value.date,
          type: form.value.type,
          notes: form.value.notes || undefined,
          actionsTaken: form.value.actionsTaken || undefined,
          queenSeen: form.value.type === 'inspection' ? form.value.queenSeen : undefined,
          broodStatus: form.value.broodStatus || undefined,
          varroaCount:
            form.value.varroaCount != null ? Number(form.value.varroaCount) : undefined,
          frameCount: form.value.frameCount != null ? Number(form.value.frameCount) : undefined,
          weather: form.value.weather || undefined,
        };

        let res: any;
        if (editing.value) {
          res = await DefaultService.putApiV1Inspections(props.inspection.id, payload);
          emit('updated', res);
        } else {
          res = await DefaultService.postApiV1Inspections(payload);
          emit('created', res);
        }

        close();
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({
            type: 'positive',
            message: editing.value ? t('inspection.updated') : t('inspection.created'),
          }),
        );
      } catch (e: any) {
        console.error('InspectionDialog submit error:', e);
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({
            type: 'negative',
            message: e?.response?.data?.message || e?.message || t('messages.failed'),
          }),
        );
      }
    }

    return { visible, form, formRef, editing, typeOptions, close, submit, t };
  },
};
</script>
