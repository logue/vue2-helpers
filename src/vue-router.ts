import { effectScope, getCurrentInstance, reactive, Vue2 } from 'vue-demi';
import VueRouter, {
  type NavigationGuard,
  type Route,
  type RouterOptions as RawRouterOptions,
  type RouteConfig as RouteRecordRaw,
} from 'vue-router';
import { OUT_OF_SCOPE, warn } from './utils';

export type { NavigationGuard, RouteRecordRaw };
export type {
  RouteMeta,
  RouteRecord,
  RedirectOption as RouteRecordRedirectOption,
  RawLocation as RouteLocationRaw,
} from 'vue-router';
export type RouterScrollBehavior = RawRouterOptions['scrollBehavior'];
export type RouteLocationNormalized = Route;
export type RouteLocationNormalizedLoaded = Route;
export type RouteRecordName = string | symbol;

export interface RouterOptions extends RawRouterOptions {
  routes: RouteRecordRaw[];
  scrollBehavior?: RouterScrollBehavior;
}

export interface Router extends VueRouter {
  isReady(): Promise<void>;

  /** @deprecated */
  app: VueRouter['app'];

  /** @deprecated use `currentRoute.matched` instead */
  getMatchedComponents: VueRouter['getMatchedComponents'];

  /** @deprecated use `isReady` instead */
  onReady: VueRouter['onReady'];
}

// @ts-ignore
VueRouter.prototype.isReady = function () {
  return new Promise((resolve, reject) => {
    this.onReady(resolve, reject);
  });
};

/** Create Vue Router */
export function createRouter(options?: RouterOptions) {
  Vue2?.use(VueRouter);
  return new VueRouter(options) as Router;
}

/** Get Router instance */
export function useRouter(): Router {
  const inst = getCurrentInstance();
  if (inst) {
    return inst.proxy.$router as Router;
  }
  warn(`[vue-router] ${OUT_OF_SCOPE}`);
  return undefined as any;
}

let currentRoute: RouteLocationNormalizedLoaded;

/** Get current route instance */
export function useRoute(): RouteLocationNormalizedLoaded {
  const inst = getCurrentInstance();
  if (!inst) {
    warn(`[vue-router] ${OUT_OF_SCOPE}`);
    return undefined as any;
  }
  if (!currentRoute) {
    const scope = effectScope(true);
    scope.run(() => {
      const { $router } = inst.proxy;
      currentRoute = reactive(assign({}, $router.currentRoute)) as any;
      $router.afterEach(to => {
        assign(currentRoute, to);
      });
    });
  }
  return currentRoute;
}

/**
 * Attach leave current route event
 *
 * @param leaveGuard - Navigation Guard
 * @returns
 */
export function onBeforeRouteLeave(leaveGuard: NavigationGuard) {
  const inst = getCurrentInstance();
  if (!inst) {
    warn(`[vue-router] ${OUT_OF_SCOPE}`);
    return;
  }
  const { options } = inst.proxy.constructor as any;
  const hooks: any = options.beforeRouteLeave || [];
  hooks.push(leaveGuard);
  options.beforeRouteLeave = hooks;
}

/**
 * Attach route before update event
 *
 * @param updateGuard - Navigation Guard
 * @returns
 */
export function onBeforeRouteUpdate(updateGuard: NavigationGuard) {
  const inst = getCurrentInstance();
  if (!inst) {
    warn(`[vue-router] ${OUT_OF_SCOPE}`);
    return;
  }
  const { options } = inst.proxy.constructor as any;
  const hooks: any = options.beforeRouteUpdate || [];
  hooks.push(updateGuard);
  options.beforeRouteUpdate = hooks;
}

/**
 *
 * @param target -
 * @param source -
 * @returns
 */
function assign(target: Record<string, any>, source: Record<string, any>) {
  for (const key of Object.keys(source)) {
    target[key] = source[key];
  }
  return target;
}
