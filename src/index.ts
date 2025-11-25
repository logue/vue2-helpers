/**
 * Vuex Composition API Helpers
 *
 * Type-safe helpers for using Vuex with Vue Composition API
 */

import type Vue from 'vue';
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

import { computed, getCurrentInstance, type ComputedRef } from 'vue-demi';

import { OUT_OF_SCOPE } from './utils';

// Note: Parameter names in type definitions are used for documentation
// and are flagged as unused by ESLint but are necessary for type clarity

/**
 * Action return type that wraps non-promise returns in promises
 */
type ActionReturnType<T extends (...args: any[]) => any> = Promise<
  T extends (...args: any[]) => Promise<infer U> ? U : ReturnType<T>
>;

/**
 * Result map for each Vuex helper type
 */
interface ResultMap<T> {
  state: ComputedRef<T>;
  getters: ComputedRef<T extends (...args: any[]) => infer U ? U : never>;
  mutations: T extends (store: any) => any
    ? () => void
    : T extends (store: any, payload: infer U) => any
      ? (payload: U) => void
      : never;
  actions: T extends (context: any) => any
    ? () => ActionReturnType<T>
    : T extends (context: any, payload: infer U) => any
      ? (payload: U) => ActionReturnType<T>
      : never;
}

type ResultMapKey = keyof ResultMap<any>;

/**
 * Helper return type with proper key mapping
 * TODO: Template Literal Types are needed for multi-level module names (a/b/c)
 */
type HelperReturnType<RMK extends ResultMapKey, K extends string, Type> = {
  [key in K]: ResultMap<key extends keyof Type ? Type[key] : never>[RMK];
};

/**
 * Helper function interface with overloads for different call signatures
 */
interface Helper<RMK extends ResultMapKey, RootType> {
  <K extends string>(keys: K[]): HelperReturnType<RMK, K, RootType>;

  <K extends string, N extends string>(
    namespace: N,
    keys: K[]
  ): HelperReturnType<RMK, K, N extends keyof RootType ? RootType[N] : object>;

  <K extends string>(
    map: Record<K, string | ((...args: any[]) => any)>
  ): HelperReturnType<RMK, K, RootType>;

  <K extends string, N extends string>(
    namespace: N,
    map: Record<K, string | ((...args: any[]) => any)>
  ): HelperReturnType<RMK, K, N extends keyof RootType ? RootType[N] : object>;
}

/**
 * Vuex Helper functions factory
 * Creates type-safe Vuex composition helpers for state, getters, mutations, and actions
 *
 * @template RootState - Root state type
 * @template RootGetters - Root getters type
 * @template RootMutations - Root mutations type
 * @template RootActions - Root actions type
 * @returns Object containing useState, useGetters, useMutations, and useActions helpers
 */
export function createVuexHelpers<
  RootState,
  RootGetters,
  RootMutations,
  RootActions,
>(): {
  useState: Helper<'state', RootState>;
  useGetters: Helper<'getters', RootGetters>;
  useMutations: Helper<'mutations', RootMutations>;
  useActions: Helper<'actions', RootActions>;
} {
  return { useState, useGetters, useMutations, useActions };
}

/**
 * Get current Vue instance
 * @throws {Error} If called outside of setup function
 * @returns Vue instance proxy
 */
function getVueInstance(): Vue {
  const vm = getCurrentInstance();
  if (vm != null) {
    return vm.proxy;
  }
  throw new Error(OUT_OF_SCOPE);
}

/**
 * Map object keys to computed properties
 * @param mapper - Function that returns a mapped object (from mapState, mapGetters, etc.)
 * @returns Object with computed properties
 */
function mapToComputed(
  mapper: Record<string, () => any>
): Record<string, ComputedRef<any>> {
  const result: Record<string, ComputedRef<any>> = {};
  for (const key of Object.keys(mapper)) {
    const fn = mapper[key];
    if (fn != null) {
      result[key] = computed(fn);
    }
  }
  return result;
}

/**
 * Map object keys to bound methods
 * @param vm - Vue instance to bind methods to
 * @param mapper - Function that returns a mapped object (from mapMutations, mapActions, etc.)
 * @returns Object with bound methods
 */
function mapToBound(
  vm: Vue,
  mapper: Record<string, (...args: any[]) => any>
): Record<string, (...args: any[]) => any> {
  const result: Record<string, (...args: any[]) => any> = {};
  for (const key of Object.keys(mapper)) {
    const fn = mapper[key];
    if (fn != null) {
      result[key] = fn.bind(vm);
    }
  }
  return result;
}

/**
 * Get Vuex state as computed properties
 * @param args - Arguments for mapState (keys array or namespace + keys)
 * @returns Object with computed state properties
 */
function useState(...args: [any] | [any, any]): Record<string, any> {
  return args.length === 1
    ? mapToComputed(mapState(args[0]))
    : mapToComputed(mapState(args[0], args[1]));
}

/**
 * Get Vuex getters as computed properties
 * @param args - Arguments for mapGetters (keys array or namespace + keys)
 * @returns Object with computed getter properties
 */
function useGetters(...args: [any] | [any, any]): Record<string, any> {
  return args.length === 1
    ? mapToComputed(mapGetters(args[0]))
    : mapToComputed(mapGetters(args[0], args[1]));
}

/**
 * Get Vuex mutations as callable methods
 * @param args - Arguments for mapMutations (keys array or namespace + keys)
 * @returns Object with mutation methods bound to current instance
 */
function useMutations(...args: [any] | [any, any]): Record<string, any> {
  const vm = getVueInstance();
  return args.length === 1
    ? mapToBound(vm, mapMutations(args[0]))
    : mapToBound(vm, mapMutations(args[0], args[1]));
}

/**
 * Get Vuex actions as callable methods
 * @param args - Arguments for mapActions (keys array or namespace + keys)
 * @returns Object with action methods bound to current instance
 */
function useActions(...args: [any] | [any, any]): Record<string, any> {
  const vm = getVueInstance();
  return args.length === 1
    ? mapToBound(vm, mapActions(args[0]))
    : mapToBound(vm, mapActions(args[0], args[1]));
}
