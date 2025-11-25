import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
  type Ref,
} from 'vue-demi';

import { h } from './h-demi';

/** Insert position for teleported content */
type InsertPosition = 'after' | 'before';

/** Teleport component props */
interface TeleportProps {
  /** Target selector for teleportation */
  to: string;
  /** Insert position relative to target */
  where: InsertPosition;
  /** Whether teleportation is disabled */
  disabled: boolean;
}

/** Mutation observer options */
const OBSERVER_CONFIG: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
};

/** Component class name */
const COMPONENT_CLASS = 'vue-teleport';

/** Hidden element styles */
const HIDDEN_STYLES = 'visibility: hidden; display: none;';

/**
 * Teleport Component.
 *
 * Original version by Mechazawa's 'vue2-teleport.
 * Composition api version By Logue.
 */
export const Teleport = defineComponent<TeleportProps>({
  /** Component Name */
  name: 'Teleport',
  /** Props Definition */
  props: {
    to: {
      type: String,
      required: true,
    },
    where: {
      type: String as PropType<InsertPosition>,
      default: 'after' as InsertPosition,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  } as const,
  /**
   * Setup
   *
   * @param props - Props
   */
  setup(props: TeleportProps) {
    const teleport: Ref<HTMLDivElement | undefined> = ref();
    const nodes: Ref<Node[]> = ref([]);
    const waiting: Ref<boolean> = ref(false);
    const observer: Ref<MutationObserver | null> = ref(null);
    const childObserver: Ref<MutationObserver | null> = ref(null);
    const parent: Ref<ParentNode | null> = ref(null);

    /**
     * Create a document fragment from stored nodes
     * Using a fragment is faster because it'll trigger only a single reflow
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
     */
    const getFragment = (): DocumentFragment => {
      const fragment = document.createDocumentFragment();
      nodes.value.forEach(node => fragment.appendChild(node));
      return fragment;
    };

    /**
     * Find target element and insert teleported content
     */
    const move = (): void => {
      waiting.value = false;
      parent.value = document.querySelector(props.to);

      if (parent.value == null) {
        disable();
        waiting.value = true;
        return;
      }

      const fragment = getFragment();
      if (props.where === 'before') {
        parent.value.prepend(fragment);
      } else {
        parent.value.appendChild(fragment);
      }
    };

    /**
     * Move teleported content back to original position
     */
    const disable = (): void => {
      teleport.value?.appendChild(getFragment());
      parent.value = null;
    };

    /**
     * Move content if teleportation is enabled
     */
    const maybeMove = (): void => {
      if (!props.disabled) {
        move();
      }
    };

    /**
     * Handle mutations in the DOM tree
     */
    const onMutations = (mutations: MutationRecord[]): void => {
      let shouldMove = false;

      for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const removedNodes = Array.from(mutation.removedNodes);
        const filteredAddedNodes = addedNodes.filter(
          node => !nodes.value.includes(node)
        );

        // Check if parent was removed from DOM
        if (parent.value != null && removedNodes.includes(parent.value)) {
          disable();
          waiting.value = !props.disabled;
        } else if (waiting.value && filteredAddedNodes.length > 0) {
          shouldMove = true;
        }
      }

      if (shouldMove) {
        move();
      }
    };

    /**
     * Handle child nodes changes in teleport element
     */
    const onChildMutations = (mutations: MutationRecord[]): void => {
      const childChangeRecord = mutations.find(
        mutation => mutation.target === teleport.value
      );

      if (childChangeRecord != null && teleport.value != null) {
        nodes.value = Array.from(teleport.value.childNodes);
        maybeMove();
      }
    };

    /**
     * Initialize and start mutation observers
     */
    const bootObserver = (): void => {
      // Setup DOM tree observer
      if (observer.value == null) {
        observer.value = new MutationObserver(onMutations);
        observer.value.observe(document.body, OBSERVER_CONFIG);
      }

      // Setup child nodes observer
      if (childObserver.value == null && teleport.value != null) {
        childObserver.value = new MutationObserver(onChildMutations);
        childObserver.value.observe(teleport.value, {
          childList: true,
          subtree: false,
        });
      }
    };

    /**
     * Stop and clean up mutation observers
     */
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

    // Watch for target selector changes
    watch(() => props.to, maybeMove);

    // Watch for position changes
    watch(() => props.where, maybeMove);

    // Watch for disabled state changes
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

    // Initialize on mount
    onMounted(() => {
      if (teleport.value != null) {
        nodes.value = Array.from(teleport.value.childNodes);
      }
      if (!props.disabled) {
        bootObserver();
      }
      maybeMove();
    });

    // Cleanup on unmount
    onBeforeUnmount(() => {
      disable();
      teardownObserver();
    });

    return {
      teleport,
      nodes,
      waiting,
      observer,
      parent,
    };
  },
  render() {
    return h(
      'div',
      {
        ref: 'teleport',
        class: COMPONENT_CLASS,
        style: !(this.$props as TeleportProps).disabled ? HIDDEN_STYLES : '',
      },
      this.$slots.default
    );
  },
});

const install = (app: any): void => app.component('Teleport', Teleport);

export { Teleport as default, install };
