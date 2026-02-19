<template>
  <q-dialog v-model="visible" teleport="body">
    <q-card style="min-width: 320px; max-width: 90vw" class="rounded-card">
      <q-card-section>
        <div class="text-h6">{{ editing ? t('hive.edit') : t('hive.create') }}</div>
      </q-card-section>
      <q-card-section>
        <q-form ref="formRef" @submit.prevent="submit">
          <div style="display: flex; gap: 8px; align-items: center">
            <q-select
              v-model="form.apiaryId"
              :options="apiaryOptions"
              option-label="label"
              option-value="value"
              :label="t('form.location')"
              dense
              style="flex: 1"
              use-input
              input-debounce="300"
              :loading="loadingApiaries"
              emit-value
              map-options
              clearable
            />
            <input
              type="color"
              v-model="newApiaryColor"
              :title="t('form.color')"
              style="width: 36px; height: 36px; border: 0; padding: 0"
            />
            <q-btn size="sm" flat icon="add" :label="t('form.new')" @click.prevent="createApiary" />
          </div>
          <q-input v-model="form.hiveNumber" :label="t('hive.create') + ' #'" required dense />
          <q-select
            v-model="form.status"
            :options="['active', 'inactive', 'archived']"
            :label="t('form.status')"
            dense
          />
          <q-input v-model.number="form.frameCount" :label="t('hive.frames')" type="number" dense />
          <q-input
            v-model="form.installationDate"
            :label="t('form.installationDate')"
            type="date"
            dense
          />
          <q-input v-model="form.notes" :label="t('form.notes')" type="textarea" dense />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn :label="t('form.cancel')" flat @click="close" class="hive-btn hive-btn--ghost" />
        <q-btn :label="editing ? t('form.save') : t('form.submit')" class="hive-btn" @click="submit" icon="check" rounded />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { DefaultService } from '../api-client/services/DefaultService';

export default {
  props: ['visible', 'hive'],
  emits: ['update:visible', 'created', 'updated'],
  setup(props: any, { emit }: any) {
    const { t } = useI18n();
    const visible = ref(!!props.visible);

    watch(
      () => props.visible,
      (v) => (visible.value = v),
    );
    watch(visible, (v) => emit('update:visible', v));

    const form = ref<any>({
      apiaryId: '',
      hiveNumber: '',
      status: 'active',
      frameCount: 0,
      installationDate: '',
      notes: '',
    });
    // if editing, populate form from props.hive
    watch(
      () => props.hive,
      (h) => {
        if (h) {
          form.value = {
            apiaryId: h.apiaryId || '',
            hiveNumber: h.hiveNumber || '',
            status: h.status || 'active',
            frameCount: h.frameCount ?? 0,
            installationDate: h.installationDate
              ? new Date(h.installationDate).toISOString().slice(0, 10)
              : '',
            notes: h.notes || '',
          };
        }
      },
      { immediate: true },
    );
    const formRef = ref<any>(null);
    const apiaryOptions = ref<any[]>([]);
    const loadingApiaries = ref(false);
    const newApiaryColor = ref<string>('#FFCA28');

    async function loadApiaries() {
      loadingApiaries.value = true;
      try {
        const res = await DefaultService.getApiV1Apiaries();
        apiaryOptions.value = (res || []).map((a: any) => ({
          label: a.name || a.title || a.id || a._id,
          value: a.id || a._id,
        }));
      } catch (e) {
        apiaryOptions.value = [];
      } finally {
        loadingApiaries.value = false;
      }
    }

    function close() {
      visible.value = false;
    }

    async function submit() {
      try {
        const valid = await formRef.value?.validate?.();
        if (valid === false) return;
        // ensure date is ISO formatted if provided
        const payload = { ...form.value } as any;
        if (payload.installationDate) {
          payload.installationDate = new Date(payload.installationDate).toISOString();
        }
        let res: any;
        if (props.hive && (props.hive.id || props.hive._id)) {
          const id = props.hive.id || props.hive._id;
          res = await DefaultService.putApiV1Hives(id, payload as any);
          emit('updated', res);
        } else {
          res = await DefaultService.postApiV1Hives(payload as any);
          emit('created', res);
        }
        close();
        // notify success
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({
            type: 'positive',
            message: props.hive ? t('messages.hive_updated') : t('messages.hive_created'),
          }),
        );
      } catch (e: any) {
        console.error('CreateHiveDialog submit error:', e);
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({
            type: 'negative',
            message: e?.response?.data?.message || e?.message || t('messages.failed'),
          }),
        );
      }
    }

    async function createApiary() {
      const name = prompt(t('form.new_location'));
      if (!name) return;
      try {
        const payload: any = { name };
        if (newApiaryColor.value) payload.color = newApiaryColor.value;
        const res = await DefaultService.postApiV1Apiaries(payload as any);
        const id = (res as any).id || (res as any)._id || (res as any).id?.toString?.();
        form.value.apiaryId = id;
        // add to cached options
        apiaryOptions.value = [
          { label: (res as any).name || (res as any).title || id, value: id },
          ...apiaryOptions.value,
        ];
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'positive', message: t('messages.location_created') }),
        );
      } catch (e: any) {
        console.error('createApiary error', e);
        // @ts-ignore
        import('quasar').then(({ Notify }) =>
          Notify.create({ type: 'negative', message: e?.message || t('messages.failed') }),
        );
      }
    }

    // load apiaries when dialog is opened
    watch(visible, (v) => {
      if (v) loadApiaries();
    });

    const editing = ref<boolean>(!!props.hive);
    watch(
      () => props.hive,
      (h) => (editing.value = !!h),
    );

    return {
      visible,
      form,
      formRef,
      close,
      submit,
      createApiary,
      apiaryOptions,
      loadingApiaries,
      t,
      editing,
      newApiaryColor,
    };
  },
};
</script>
