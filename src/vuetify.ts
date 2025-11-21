import { getCurrentInstance, Vue2 } from 'vue-demi';
import Vuetify from 'vuetify/lib';

import { OUT_OF_SCOPE, warn } from './utils';

import type { Framework, UserVuetifyPreset } from 'vuetify';
import type { Breakpoint } from 'vuetify/types/services/breakpoint';
import type { Theme } from 'vuetify/types/services/theme';

/** Create Vuetify Instance */
export function createVuetify(options?: UserVuetifyPreset): Vuetify {
  Vue2?.use(Vuetify);
  return new Vuetify(options);
}

/** Vuetify Instance */
export function useVuetify(): Framework {
  /** Vue instance */
  const instance = getCurrentInstance();
  if (instance?.proxy) {
    return instance?.proxy.$vuetify;
  }
  warn(`[vue2-helpers/vuetify] ${OUT_OF_SCOPE}`);
  return undefined as any;
}

/** Use Display */
export function useDisplay(): Breakpoint {
  return useVuetify().breakpoint;
}

/** Theme */
export function useTheme(): Theme {
  return useVuetify().theme;
}
