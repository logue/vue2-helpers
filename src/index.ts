/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable no-unused-vars */
import type Vue from 'vue';
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

import { computed, getCurrentInstance, type ComputedRef } from 'vue-demi';

import { OUT_OF_SCOPE } from './utils';
type ActionReturnType<T extends (...args: any) => any> = Promise<
  T extends (...args: any) => Promise<infer U> ? U : ReturnType<T>
>;

interface ResultMap<T> {
  state: ComputedRef<T>;
  getters: ComputedRef<T extends (...args: any) => infer U ? U : never>;
  mutations: T extends (a: any) => any
    ? () => void
    : T extends (a: any, b: infer U) => any
      ? (payload: U) => void
      : never;
  actions: T extends (a: any) => any
    ? () => ActionReturnType<T>
    : T extends (a: any, b: infer U) => any
      ? (payload: U) => ActionReturnType<T>
      : never;
}

type ResultMapKey = keyof ResultMap<any>;

// TODO: 由于项目 TS 版本不支持 Template Literal Types，因此无法实现多层模块名 a/b/c 的推导
type HelperReturnType<RMK extends ResultMapKey, K extends string, Type> = {
  [key in K]: ResultMap<key extends keyof Type ? Type[key] : never>[RMK];
};

interface Helper<RMK extends ResultMapKey, RootType> {
  <K extends string>(keys: K[]): HelperReturnType<RMK, K, RootType>;

  <K extends string, N extends string>(
    namespace: N,
    keys: K[]
  ): HelperReturnType<RMK, K, N extends keyof RootType ? RootType[N] : object>;

  <K extends string>(
    map: Record<K, string | Function>
  ): HelperReturnType<RMK, K, RootType>;

  <K extends string, N extends string>(
    namespace: N,
    map: Record<K, string | Function>
  ): HelperReturnType<RMK, K, N extends keyof RootType ? RootType[N] : object>;
}

/**
 * Vuex Helper functions
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
 * Get Vuex state
 *
 * @param args - state name
 */
function useState(...args: [any]): Record<string, any> {
  const states = mapState(...args);
  const result: Record<string, any> = {};
  Object.keys(states).forEach(key => (result[key] = computed(states[key]!)));
  return result;
}

/**
 * Get Vuex Getters
 *
 * @param args - getter name
 */
function useGetters(...args: [any]): Record<string, any> {
  const getters = mapGetters(...args);
  const result: Record<string, any> = {};
  Object.keys(getters).forEach(key => (result[key] = computed(getters[key]!)));
  return result;
}

/**
 * Get Vue Instance
 */
function getVueInstance(): Vue {
  const vm = getCurrentInstance();
  if (vm != null) {
    return vm.proxy;
  }
  throw new Error(OUT_OF_SCOPE);
}

/**
 * Get Vuex Mutations.
 *
 * @param args - mutation name
 * @returns
 */
function useMutations(...args: [any]): Record<string, any> {
  const vm = getVueInstance();
  const result: Record<string, any> = {};
  const mutations = mapMutations(...args);
  Object.keys(mutations).forEach(
    key => (result[key] = mutations[key]!.bind(vm))
  );
  return result;
}

/**
 * Get Vuex actions
 * @param args - Vuex Action
 * @returns
 */
function useActions(...args: [any]): Record<string, any> {
  const vm = getVueInstance();
  const result: Record<string, any> = {};
  const actions = mapActions(...args);
  Object.keys(actions).forEach(key => (result[key] = actions[key]!.bind(vm)));
  return result;
}
