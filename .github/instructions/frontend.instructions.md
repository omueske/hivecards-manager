---
name: 'Vue 3 Frontend Instructions'
description: 'Standards und Testgenerierung für Vue 3 mit Composition API'
applyTo:
  - '**/*.vue'
  - 'frontend/**'
  - 'client/**'
  - 'src/**'
globs:
  - '**/*.vue'
---

# Vue 3 Frontend Richtlinien

## Coding Standards

- **Composition API**: Immer <script setup lang="ts"> mit defineProps/defineEmits.
- **State**: Pinia Stores für globalen State; ref/reactive für lokal.
- **Router**: Vue Router mit lazy-loading; Guards für Auth.
- **HTTP**: Axios-Instanz mit BaseURL, Interceptors für Auth/Errors.
- **UI**: Tailwind CSS; Komponenten modular, reusable.
- **Props**: Typed mit interface, default-Werte via withDefaults.
- **Error Handling**: try-catch in async, VueUse Notify für User-Feedback.

## Testfallgenerierung (Vitest + @vue/test-utils)

- **Ziel**: 90% Coverage; Unit-Tests für Komponenten, Integrationstests für API-Flows.
- **Tools**: vi.mock für Axios/Pinia; mount/shallowMount.
- **Struktur**: describe('ComponentName', () => { test('Beschreibung', () => { Arrange, Act, Assert }); });
- **Pflicht-Testfälle**:
  - Rendering: Snapshot oder text().toContain().
  - Props: Verschiedene Werte (null, empty, valid).
  - Events: Emitted Events prüfen.
  - Async: await flushPromises(); API-Mocks (200, 404, 500).
  - User Interactions: fireEvent.click(), userEvent.
  - Edge Cases: Loading, Error-States, Empty Lists.

## Beispiele für generierte Tests

### Einfache Komponente (Button.vue)

```vue
test('renders button with text', () => { const wrapper = mount(Button, { props: { label: 'Click me'
} }); expect(wrapper.text()).toContain('Click me'); }); test('emits click event', async () => {
const wrapper = mount(Button); await wrapper.get('button').trigger('click');
expect(wrapper.emitted('click')).toBeTruthy(); });
```
