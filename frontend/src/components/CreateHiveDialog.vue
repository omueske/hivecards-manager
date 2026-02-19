<template>
  <q-dialog v-model="visible">
    <q-card style="min-width: 320px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Create Hive</div>
      </q-card-section>
      <q-card-section>
        <q-form ref="formRef" @submit.prevent="submit">
          <q-input v-model="form.apiaryId" label="Apiary ID" required dense />
          <q-input v-model="form.hiveNumber" label="Hive Number" required dense />
          <q-select
            v-model="form.status"
            :options="['active', 'inactive', 'archived']"
            label="Status"
            dense
          />
          <q-input v-model.number="form.frameCount" label="Frame Count" type="number" dense />
          <q-input v-model="form.installationDate" label="Installation Date" type="date" dense />
          <q-input v-model="form.notes" label="Notes" type="textarea" dense />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancel" flat @click="close" />
        <q-btn label="Create" color="primary" @click="submit" icon="check" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { DefaultService } from '../api-client/services/DefaultService';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'created']);

export default {
  props: ['modelValue'],
  setup(props: any, { emit }: any) {
    const visible = ref(!!props.modelValue);

    watch(
      () => props.modelValue,
      (v) => (visible.value = v),
    );
    watch(visible, (v) => emit('update:modelValue', v));

    const form = ref<any>({
      apiaryId: '',
      hiveNumber: '',
      status: 'active',
      frameCount: 0,
      installationDate: '',
      notes: '',
    });
    const formRef = ref<any>(null);

    function close() {
      visible.value = false;
    }

    async function submit() {
      try {
        const valid = await formRef.value?.validate?.();
        if (valid === false) return;
        const res = await DefaultService.postApiV1Hives(form.value as any);
        emit('created', res);
        close();
        // notify success
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'positive', message: 'Hive created' }),
        );
      } catch (e: any) {
        console.error(e);
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'negative', message: e?.message || 'Create failed' }),
        );
      }
    }

    return { visible, form, close, submit };
  },
};
</script>
