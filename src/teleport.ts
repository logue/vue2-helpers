import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
  type Ref,
  type SetupContext,
} from 'vue-demi';

import { h } from './h-demi';

/**
 * Teleport Component.
 *
 * Original version by Mechazawa's 'vue2-teleport.
 * Composition api version By Logue.
 */
export const Teleport = defineComponent({
  /** Component Name */
  name: 'Teleport',
  /** Props Definition */
  props: {
    to: {
      type: String,
      required: true,
    },
    where: {
      type: String as PropType<'after' | 'before'>,
      default: 'after',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  /**
   * Setup
   *
   * @param props  - Props
   * @param _context - Context
   */
  setup(props, _context: SetupContext) {
    const teleport: Ref<HTMLDivElement | undefined> = ref();
    const nodes: Ref<Node[]> = ref([]);
    const waiting: Ref<boolean> = ref(false);
    const observer: Ref<MutationObserver | null> = ref(null);
    const childObserver: Ref<MutationObserver | null> = ref(null);
    const parent: Ref<ParentNode | null> = ref(null);

    watch(
      () => props.to,
      () => {
        maybeMove();
      }
    );

    watch(
      () => props.where,
      () => {
        maybeMove();
      }
    );

    watch(
      () => props.disabled,
      value => {
        if (value) {
          disable();
          teardownObserver();
        } else {
          bootObserver();
          move();
        }
      }
    );

    onMounted(() => {
      if (teleport.value != null) {
        // Store a reference to the nodes
        nodes.value = Array.from(teleport.value.childNodes);
      }
      if (!props.disabled) {
        bootObserver();
      }
      // Move slot content to target
      maybeMove();
    });

    onBeforeUnmount(() => {
      disable();
      teardownObserver();
    });

    const maybeMove = (): void => {
      if (!props.disabled) {
        move();
      }
    };

    const move = (): void => {
      waiting.value = false;
      parent.value = document.querySelector(props.to);
      if (parent.value == null) {
        disable();
        waiting.value = true;
        return;
      }
      if (props.where === 'before') {
        parent.value.prepend(getFragment());
      } else {
        parent.value.appendChild(getFragment());
      }
    };
    const disable = (): void => {
      teleport.value?.appendChild(getFragment());
      parent.value = null;
    };

    const getFragment = (): DocumentFragment => {
      // Using a fragment is faster because it'll trigger only a single reflow
      // See https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
      const fragment = document.createDocumentFragment();
      nodes.value.forEach(node => fragment.appendChild(node));
      return fragment;
    };

    const onMutations = (mutations: MutationRecord[]): void => {
      // Makes sure the move operation is only done once
      let shouldMove = false;
      mutations.forEach(mutation => {
        const filteredAddedNodes = Array.from(mutation.addedNodes).filter(
          node => !nodes.value.includes(node)
        );
        if (
          parent.value != null &&
          Array.from(mutation.removedNodes).includes(parent.value)
        ) {
          disable();
          waiting.value = !props.disabled;
        } else if (waiting.value && filteredAddedNodes.length > 0) {
          shouldMove = true;
        }
      });
      if (shouldMove) {
        move();
      }
    };

    const bootObserver = (): void => {
      if (observer.value == null) {
        observer.value = new MutationObserver((mutations: MutationRecord[]) => {
          onMutations(mutations);
        });
        observer.value.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: false,
          characterData: false,
        });
      }

      if (childObserver.value == null) {
        // watch childNodes change
        childObserver.value = new MutationObserver(
          (mutations: MutationRecord[]) => {
            const childChangeRecord = mutations.find(
              i => i.target === teleport.value
            );
            if (childChangeRecord != null && teleport.value != null) {
              nodes.value = Array.from(teleport.value.childNodes);
              maybeMove();
            }
          }
        );
      }
    };

    const teardownObserver = (): void => {
      if (observer.value != null) {
        observer.value.disconnect();
        observer.value = null;
      }
      if (childObserver.value != null) {
        childObserver.value.disconnect();
        childObserver.value = null;
      }
    };

    return {
      teleport,
      nodes,
      waiting,
      observer,
      parent,
    };
  },
  render() {
    // <template>
    //   <div ref="teleport" class="vue-teleport">
    //     <slot />
    //   </div>
    // </template>
    return h(
      'div',
      {
        ref: 'teleport',
        class: 'vue-teleport',
        style: !this.$props.disabled
          ? 'visibility: hidden; display: none;'
          : '',
      },
      this.$slots.default
    );
  },
});

const install = (app: any): void => app.component('Teleport', Teleport);

export { Teleport as default, install };
