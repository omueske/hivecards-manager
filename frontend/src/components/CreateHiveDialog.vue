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
          <div style="display: flex; gap: 4px; align-items: center">
            <q-btn flat dense round icon="remove" @click.prevent="() => { const n = parseInt(form.hiveNumber); if (!isNaN(n) && n > 1) form.hiveNumber = String(n - 1); }" />
            <q-input v-model="form.hiveNumber" :label="t('hive.create') + ' #'" required dense style="flex: 1" />
            <q-btn flat dense round icon="add" @click.prevent="() => { const n = parseInt(form.hiveNumber); form.hiveNumber = String(isNaN(n) ? 1 : n + 1); }" />
          </div>
          <q-select
            v-model="form.status"
            :options="['active', 'inactive', 'archived']"
            :label="t('form.status')"
            dense
          />
          <div style="display: flex; gap: 4px; align-items: center">
            <q-btn flat dense round icon="remove" @click.prevent="() => { if (form.frameCount > 0) form.frameCount-- }" />
            <q-input v-model.number="form.frameCount" :label="t('hive.frames')" type="number" dense style="flex: 1" />
            <q-btn flat dense round icon="add" @click.prevent="() => form.frameCount++" />
          </div>
          <q-input
            v-model="form.installationDate"
            :label="t('form.installationDate')"
            :placeholder="'TT.MM.JJJJ'"
            mask="##.##.####"
            dense
          />
          <q-input v-model="form.notes" :label="t('form.notes')" type="textarea" dense />

          <!-- Beute -->
          <div class="text-subtitle2 q-mt-md q-mb-xs text-grey-7">{{ t('hive.hive_section') }}</div>
          <q-select
            v-model="form.hiveBoxType"
            :options="['Zander', 'Dadant', 'Langstroth', 'DNM', 'Sonstiges']"
            :label="t('hive.hiveBoxType')"
            dense clearable
          />
          <q-select
            v-model="form.hiveType"
            :options="['Wirtschaftsvolk', 'Jungvolk', 'Ableger']"
            :label="t('hive.hiveType')"
            dense clearable
          />

          <!-- Königin -->
          <div class="text-subtitle2 q-mt-md q-mb-xs text-grey-7">🐝 {{ t('hive.queen_section') }}</div>
          <q-select
            v-model="selectedQueenId"
            :options="queenOptions"
            :label="t('queen.select')"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            clearable
            :loading="loadingQueens"
            :hint="t('queen.select_hint')"
          />
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
import type { Queen } from '../api-client/models/Queen';

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

    function isoToDisplay(iso: string): string {
      if (!iso) return '';
      const [y, m, d] = iso.slice(0, 10).split('-');
      return `${d}.${m}.${y}`;
    }

    function displayToIso(display: string): string {
      const parts = display.split('.');
      if (parts.length !== 3 || parts[2].length !== 4) return '';
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    const form = ref<any>({
      apiaryId: '',
      hiveNumber: '',
      status: 'active',
      frameCount: 20,
      installationDate: '',
      notes: '',
      hiveBoxType: '',
      hiveType: 'Wirtschaftsvolk',
    });
    const selectedQueenId = ref<string | null>(null);
    const queens = ref<Queen[]>([]);
    const loadingQueens = ref(false);
    const queenOptions = ref<{ label: string; value: string }[]>([]);
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
              ? isoToDisplay(new Date(h.installationDate).toISOString())
              : '',
            notes: h.notes || '',
            hiveBoxType: h.hiveBoxType || '',
            hiveType: h.hiveType || '',
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

    async function loadQueens(hiveId?: string) {
      loadingQueens.value = true;
      try {
        const all = await DefaultService.getApiV1Queens() as unknown as Queen[];
        queens.value = all;
        // Build options: spare queens + current queen of this hive
        queenOptions.value = all
          .filter((q: Queen) => {
            if (q.status === 'spare') return true;
            // include queen currently assigned to this hive
            if (hiveId && (q.hiveHistory ?? []).some((e: any) => e.hiveId === hiveId && !e.to)) return true;
            return false;
          })
          .map((q: Queen) => ({
            label: `${q.name || `K-${q.queenYear ?? '?'}`} (${q.queenColor || '–'})`,
            value: (q as any).id as string,
          }));
        // Pre-select current queen if editing
        if (hiveId) {
          const current = all.find((q: Queen) =>
            (q.hiveHistory ?? []).some((e: any) => e.hiveId === hiveId && !e.to)
          );
          selectedQueenId.value = current ? (current as any).id : null;
        } else {
          selectedQueenId.value = null;
        }
      } catch { queens.value = []; queenOptions.value = []; }
      finally { loadingQueens.value = false; }
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
          const iso = displayToIso(payload.installationDate);
          payload.installationDate = iso ? new Date(iso).toISOString() : undefined;
        }
        let res: any;
        if (props.hive && (props.hive.id || props.hive._id)) {
          const id = props.hive.id || props.hive._id;
          res = await DefaultService.putApiV1Hives(id, payload as any);
          // Handle queen assignment
          await applyQueenAssignment(id, res);
          emit('updated', res);
        } else {
          res = await DefaultService.postApiV1Hives(payload as any);
          const newId = (res as any).id || (res as any)._id;
          if (newId) await applyQueenAssignment(newId, res);
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

    async function applyQueenAssignment(hiveId: string, _hiveRes: any) {
      if (!selectedQueenId.value) return;
      // Check if selected queen is already assigned to this hive
      const q = queens.value.find((x: any) => x.id === selectedQueenId.value);
      if (!q) return;
      const alreadyAssigned = (q.hiveHistory ?? []).some(
        (e: any) => e.hiveId === hiveId && !e.to
      );
      if (!alreadyAssigned) {
        await DefaultService.postApiV1QueensAssign(selectedQueenId.value, { hiveId });
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

    // load apiaries + queens when dialog is opened
    watch(visible, (v) => {
      if (v) {
        loadApiaries();
        const hiveId = props.hive?.id || props.hive?._id;
        loadQueens(hiveId);
      }
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
      selectedQueenId,
      queenOptions,
      loadingQueens,
    };
  },
};
</script>
