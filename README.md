# Vue2 Helpers

[![jsdelivr CDN](https://data.jsdelivr.com/v1/package/npm/@logue/vue2-helpers/badge)](https://www.jsdelivr.com/package/npm/@logue/vue2-helpers)
[![NPM Downloads](https://img.shields.io/npm/dm/@logue/vue2-helpers.svg?style=flat)](https://www.npmjs.com/package/@logue/vue2-helpers)
[![Open in unpkg](https://img.shields.io/badge/Open%20in-unpkg-blue)](https://uiwjs.github.io/npm-unpkg/#/pkg/@logue/vue2-helpers/file/README.md)
[![npm version](https://img.shields.io/npm/v/@logue/vue2-helpers.svg)](https://www.npmjs.com/package/@logue/vue2-helpers)
[![Open in Gitpod](https://shields.io/badge/Open%20in-Gitpod-green?logo=Gitpod)](https://gitpod.io/#https://github.com/logue/@logue/vue2-helpers)

A util package to use Vue 2 with Composition API easily.
This fork supports [Vuetify2](https://vuetifyjs.com/).

[@vue/composition-api](https://github.com/vuejs/composition-api) is required separately when using under Vue 2.7.

## ⬇️ Install

```sh
npm i -S @logue/vue2-helpers
```

or

```sh
yarn add -D @logue/vue2-helpers
```

## 📃 Usage

```javascript
import { createVuexHelpers } from '@logue/vue2-helpers';
import { useRouter } from 'vue-router/composable';

const { useState } = createVuexHelpers<
    RootState, RootGetters, RootMutations, RootActions
>();
// Get a reactive and mutable ref object "stateA"
const { stateA } = useState('module', ['stateA']);

const router = useRouter();
router.push('/login');
```

## ✨ API

### vue2-helpers

| Features                                                                                                                                                                                                        | Description                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `createVuexHelpers`&lt;<br />&nbsp;&nbsp;&nbsp;&nbsp;RootState, RootGetters, RootMutations, RootActions<br />&gt;(): {<br>&nbsp;&nbsp;&nbsp;&nbsp;`useState`, `useGetters`, `useMutations`, `useActions`<br />} | The helper methods in return value are<br />used to replace `mapState`, `mapGetters`,<br />`mapMutations`, `mapActions` |

### vue2-helpers/vuex

| Features                                                               | Description              |
| ---------------------------------------------------------------------- | ------------------------ |
| `createStore`&lt;S&gt;(options: StoreOptions&lt;S&gt;): Store&lt;S&gt; |                          |
| `useStore`&lt;S = any&gt;(): Store&lt;S&gt;                            | Get Vuex store instance. |

### vue2-helpers/vue-router

| Features                                                  | Description         |
| --------------------------------------------------------- | ------------------- |
| `createRouter`(options: RouterOptions): Router            |                     |
| `onBeforeRouteLeave`(leaveGuard: NavigationGuard): void   |                     |
| `onBeforeRouteUpdate`(updateGuard: NavigationGuard): void |                     |
| `useRoute`(): RouteLocationNormalized                     | Get Route instance  |
| `useRouter`(): Router                                     | Get Router instance |
| router.`isReady`(): Promise\<void\>                       |                     |

### vue2-helpers/vuetify

| Features                  | Description           |
| ------------------------- | --------------------- |
| `useVuetify`(): Framework | Get Vuetify Instance. |

## License

[MIT](LICENSE)

## ☎️ Contact

- WeChat: ambit_tsai
- QQ Group: 663286147
- E-mail: ambit_tsai@qq.com

Modified by Logue.
