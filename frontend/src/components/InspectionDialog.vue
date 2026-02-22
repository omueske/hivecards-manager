<template>
  <q-dialog v-model="visible" teleport="body">
    <q-card style="min-width: 320px; max-width: 95vw; width: 480px">
      <q-card-section>
        <div class="text-h6">{{ editing ? t('inspection.edit') : t('inspection.add') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form ref="formRef">
          <!-- Datum + Uhrzeit -->
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-8">
              <q-input
                v-model="form.date"
                :label="t('inspection.date')"
                type="date"
                dense
                required
              />
            </div>
            <div class="col-4">
              <q-input v-model="form.time" :label="t('inspection.time')" type="time" dense />
            </div>
          </div>

          <!-- Typ -->
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

          <!-- Nur bei Durchsicht -->
          <template v-if="form.type === 'inspection'">
            <q-toggle v-model="form.queenSeen" :label="t('inspection.queenSeen')" class="q-mb-xs" />

            <!-- Brut -->
            <div class="text-caption text-grey-7 q-mt-xs">{{ t('inspection.brood') }}</div>
            <div class="row q-gutter-md q-mb-xs q-pl-sm">
              <q-checkbox v-model="form.broodEgg" :label="t('inspection.broodEgg')" dense />
              <q-checkbox v-model="form.broodLarva" :label="t('inspection.broodLarva')" dense />
              <q-checkbox v-model="form.broodCapped" :label="t('inspection.broodCapped')" dense />
            </div>
            <q-input
              :model-value="broodResultText"
              :label="t('inspection.broodResult')"
              dense
              readonly
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

          <!-- Behandlung -->
          <template v-if="form.type === 'treatment'">
            <q-select
              v-model="form.treatmentAgent"
              :options="agentOptions"
              :label="t('inspection.treatmentAgent')"
              clearable
              dense
              class="q-mb-sm"
            >
              <template #after-options>
                <q-item clickable @click="openAddDialog('treatment')">
                  <q-item-section avatar><q-icon name="add" /></q-item-section>
                  <q-item-section>{{ t('inspection.addTreatmentAgent') }}</q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input
              v-model="form.treatmentAmount"
              :label="t('inspection.treatmentAmount')"
              dense
              class="q-mb-sm"
              placeholder="z.B. 150 ml"
            />
          </template>

          <!-- Fuetterung -->
          <template v-if="form.type === 'feeding'">
            <q-select
              v-model="form.feedingAgent"
              :options="feedOptions"
              :label="t('inspection.feedingAgent')"
              clearable
              dense
              class="q-mb-sm"
            >
              <template #after-options>
                <q-item clickable @click="openAddDialog('feeding')">
                  <q-item-section avatar><q-icon name="add" /></q-item-section>
                  <q-item-section>{{ t('inspection.addFeedingAgent') }}</q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input
              v-model="form.feedingAmount"
              :label="t('inspection.feedingAmount')"
              dense
              class="q-mb-sm"
              placeholder="z.B. 1 kg"
            />
          </template>

          <!-- Ernte -->
          <template v-if="form.type === 'harvest'">
            <q-input
              v-model="form.harvestAmount"
              :label="t('inspection.harvestAmount')"
              dense
              class="q-mb-sm"
              placeholder="z.B. 5 kg"
            />
          </template>

          <!-- Varroa bei Durchsicht + Behandlung -->
          <template v-if="form.type === 'inspection' || form.type === 'treatment'">
            <q-input
              v-model.number="form.varroaCount"
              :label="t('inspection.varroaCount')"
              type="number"
              dense
              class="q-mb-sm"
            />
          </template>

          <q-input v-model="form.weather" :label="t('inspection.weather')" dense class="q-mb-sm" />

          <q-input
            v-model="form.notes"
            :label="t('inspection.notes')"
            type="textarea"
            dense
            autogrow
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

  <!-- Dialog: neues Mittel / Futter hinzufuegen -->
  <q-dialog v-model="showAddDialog">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">
          {{
            addDialogCategory === 'feeding'
              ? t('inspection.newFeedingAgentLabel')
              : t('inspection.newTreatmentAgentLabel')
          }}
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input
          v-model="newAgentName"
          :label="
            addDialogCategory === 'feeding'
              ? t('inspection.newFeedingAgentLabel')
              : t('inspection.newTreatmentAgentLabel')
          "
          dense
          autofocus
          @keyup.enter="saveNewAgent"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="t('form.cancel')" v-close-popup />
        <q-btn
          color="primary"
          :label="t('form.submit')"
          :loading="addingAgent"
          :disable="!newAgentName.trim()"
          @click="saveNewAgent"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { DefaultService } from '../api-client/services/DefaultService';
import { OpenAPI } from '../api-client/core/OpenAPI';
import { getToken } from '../auth/token';

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
    watch(
      () => props.visible,
      (v) => (visible.value = v),
    );
    watch(visible, (v) => emit('update:visible', v));

    // --- Custom agents (treatment + feeding) ---
    const DEFAULT_AGENTS = ['Ameisensäure 60%', 'Ameisensäure 85%', 'Oxuvar', 'Bienenwohl'];
    const DEFAULT_FEED = ['Weizensirup', 'Futterteig', 'Zuckerlösung'];

    const customAgents = ref<string[]>([]);
    const customFeed = ref<string[]>([]);

    const agentOptions = computed(() => [...DEFAULT_AGENTS, ...customAgents.value]);
    const feedOptions = computed(() => [...DEFAULT_FEED, ...customFeed.value]);

    const showAddDialog = ref(false);
    const addDialogCategory = ref<'treatment' | 'feeding'>('treatment');
    const newAgentName = ref('');
    const addingAgent = ref(false);

    function openAddDialog(category: 'treatment' | 'feeding') {
      addDialogCategory.value = category;
      newAgentName.value = '';
      showAddDialog.value = true;
    }

    async function loadAgents(category: 'treatment' | 'feeding') {
      try {
        const base = OpenAPI.BASE || '';
        const token = getToken();
        const res = await fetch(`${base}/api/v1/treatment-agents?category=${category}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: { id: string; name: string }[] = await res.json();
          const names = data.map((d) => d.name);
          if (category === 'treatment') customAgents.value = names;
          else customFeed.value = names;
        }
      } catch (e) {
        console.error('Failed to load agents', e);
      }
    }

    async function saveNewAgent() {
      const name = newAgentName.value.trim();
      const category = addDialogCategory.value;
      if (!name) return;
      addingAgent.value = true;
      try {
        const base = OpenAPI.BASE || '';
        const token = getToken();
        const res = await fetch(`${base}/api/v1/treatment-agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, category }),
        });
        if (res.ok) {
          if (category === 'treatment') {
            customAgents.value = [...customAgents.value, name];
            form.value.treatmentAgent = name;
          } else {
            customFeed.value = [...customFeed.value, name];
            form.value.feedingAgent = name;
          }
          showAddDialog.value = false;
          newAgentName.value = '';
          const msgKey =
            category === 'feeding'
              ? 'inspection.newFeedingAgentAdded'
              : 'inspection.newTreatmentAgentAdded';
          // @ts-ignore
          import('quasar').then(({ Notify }) =>
            Notify.create({ type: 'positive', message: t(msgKey) }),
          );
        }
      } catch (e) {
        console.error('Failed to save agent', e);
      } finally {
        addingAgent.value = false;
      }
    }

    watch(
      visible,
      (v) => {
        if (v) {
          loadAgents('treatment');
          loadAgents('feeding');
        }
      },
      { immediate: true },
    );

    // --- Form ---
    const formRef = ref<any>(null);

    const initialForm = () => ({
      date: today(),
      time: '' as string,
      type: 'note',
      notes: '',
      queenSeen: false,
      broodEgg: false,
      broodLarva: false,
      broodCapped: false,
      varroaCount: null as number | null,
      frameCount: null as number | null,
      weather: '',
      treatmentAgent: '' as string,
      treatmentAmount: '' as string,
      feedingAgent: '' as string,
      feedingAmount: '' as string,
      harvestAmount: '' as string,
    });

    const form = ref(initialForm());

    const broodResultText = computed(() => {
      const parts: string[] = [];
      if (form.value.broodEgg) parts.push(t('inspection.broodEgg'));
      if (form.value.broodLarva) parts.push(t('inspection.broodLarva'));
      if (form.value.broodCapped) parts.push(t('inspection.broodCapped'));
      return parts.join(', ');
    });

    function parseBroodStatus(status: string) {
      return {
        broodEgg: /ei/i.test(status),
        broodLarva: /larve/i.test(status),
        broodCapped: /verdeckelt/i.test(status),
      };
    }

    watch(
      () => props.inspection,
      (ins) => {
        if (ins) {
          const brood = parseBroodStatus(ins.broodStatus || '');
          form.value = {
            date: ins.date ? ins.date.slice(0, 10) : today(),
            time: ins.time || '',
            type: ins.type || 'note',
            notes: ins.notes || '',
            queenSeen: !!ins.queenSeen,
            broodEgg: brood.broodEgg,
            broodLarva: brood.broodLarva,
            broodCapped: brood.broodCapped,
            varroaCount: ins.varroaCount ?? null,
            frameCount: ins.frameCount ?? null,
            weather: ins.weather || '',
            treatmentAgent: ins.treatmentAgent || '',
            treatmentAmount: ins.treatmentAmount || '',
            feedingAgent: ins.feedingAgent || '',
            feedingAmount: ins.feedingAmount || '',
            harvestAmount: ins.harvestAmount || '',
          };
        } else {
          form.value = initialForm();
        }
      },
      { immediate: true },
    );

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
          time: form.value.time || undefined,
          type: form.value.type,
          notes: form.value.notes || undefined,
          weather: form.value.weather || undefined,
          varroaCount: form.value.varroaCount != null ? Number(form.value.varroaCount) : undefined,
        };

        if (form.value.type === 'inspection') {
          payload.queenSeen = form.value.queenSeen;
          payload.broodStatus = broodResultText.value || undefined;
          payload.frameCount =
            form.value.frameCount != null ? Number(form.value.frameCount) : undefined;
        }

        if (form.value.type === 'treatment') {
          payload.treatmentAgent = form.value.treatmentAgent || undefined;
          payload.treatmentAmount = form.value.treatmentAmount || undefined;
        }

        if (form.value.type === 'feeding') {
          payload.feedingAgent = form.value.feedingAgent || undefined;
          payload.feedingAmount = form.value.feedingAmount || undefined;
        }

        if (form.value.type === 'harvest') {
          payload.harvestAmount = form.value.harvestAmount || undefined;
        }

        let res: any;
        if (editing.value) {
          const base = OpenAPI.BASE || '';
          const token = getToken();
          const response = await fetch(`${base}/api/v1/inspections/${props.inspection.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.message || `HTTP ${response.status}`);
          }
          res = await response.json();
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

    return {
      visible,
      form,
      formRef,
      editing,
      typeOptions,
      close,
      submit,
      t,
      broodResultText,
      agentOptions,
      feedOptions,
      showAddDialog,
      addDialogCategory,
      newAgentName,
      addingAgent,
      openAddDialog,
      saveNewAgent,
    };
  },
};
</script>
