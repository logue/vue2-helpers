/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/**
 * h-demi - h function for Vue 2 and 3
 *
 * @see {@link https://github.com/vueuse/vue-demi/issues/65}
 * @experimental
 */

import {
  h as hDemi,
  isVue2,
  type VNode,
  type VNodeChildren,
  type VNodeData,
} from 'vue-demi';

/**
 * `on` functions glue of  Vue2 and Vue3
 *
 * @param ons `on` functions
 */
const adaptOnsV3 = (
  ons: Record<string, Function | Function[]>
): Record<string, () => void> => {
  if (!ons) return {};
  return Object.entries(ons).reduce((ret, [key, handler]) => {
    key = key.charAt(0).toUpperCase() + key.slice(1);
    key = `on${key}`;
    return { ...ret, [key]: handler };
  }, {});
};

/**
 * hDemi function.
 *
 * @param type - Tag name etc
 * @param options - VNode data.
 * @param children - Children dom or VNode component
 */
const h = (
  type: string | Record<any, any>,
  options: VNodeData = {},
  children: VNodeChildren = undefined
): VNode => {
  if (isVue2) {
    return hDemi(type, options, children);
  }
  const ons = options.on ? adaptOnsV3(options.on) : {};

  return hDemi(
    type,
    { ...options.props, ...options.domProps, ...ons },
    children
  );
};

/**
 * slots
 *
 * @param defaultSlots -
 */
const slot = (defaultSlots: any): any =>
  typeof defaultSlots === 'function' ? defaultSlots() : defaultSlots;

export { h, slot };
