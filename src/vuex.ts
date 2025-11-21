import Vuex, { Store, type StoreOptions } from 'vuex';

import { getCurrentInstance, Vue2 } from 'vue-demi';

import { OUT_OF_SCOPE, warn } from './utils';

/** Create Vuex Store */
export function createStore<S>(options: StoreOptions<S>): Store<S> {
  Vue2?.use(Vuex);
  return new Store<S>(options);
}

/** Get Vuex Instance */
export function useStore<S = any>(): Store<S> {
  const inst = getCurrentInstance();
  if (inst != null) {
    return inst.proxy.$store;
  } else {
    warn(`[vue2-helpers/vuex] ${OUT_OF_SCOPE}`);
  }
  return undefined as any;
}
