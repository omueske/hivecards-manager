// jest setup for frontend tests (Vue + jsdom)
// configure Vue Test Utils and provide global mocks
import Vue from 'vue';
// make sure Vue global exists before importing vue-test-utils (it may reference it at load-time)
;(global as any).Vue = Vue;

import { config } from '@vue/test-utils';

// stub translation function used by i18n
config.global.mocks = {
  $t: (msg: string) => msg,
};

// ensure Vue is available on window as well
if (typeof window !== 'undefined' && !('Vue' in window)) {
  (window as any).Vue = Vue;
}

// jsdom globals are automatically provided by jest-environment-jsdom
// but you can add any additional helpers here if needed

