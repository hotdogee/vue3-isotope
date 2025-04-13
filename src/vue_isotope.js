import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  onBeforeUpdate,
  onUpdated,
  watch,
  nextTick,
  h,
  useSlots,
  getCurrentInstance,
  cloneVNode,
  isVNode,
} from 'vue';
import _ from 'lodash';
import Isotope from 'isotope-layout';

// Helper function to add class to VNode props
// Note: This is a simplified approach. Handling classes on VNodes in Vue 3
// can be complex, especially with dynamic classes. This might need refinement
// depending on how classes are originally applied to the child components.
function addClassToVNode(vnode, className) {
  if (!isVNode(vnode)) return;

  let newProps = vnode.props ? { ...vnode.props } : {};
  let currentClass = newProps.class || '';
  // Ensure class is treated as a string for simplicity here
  if (Array.isArray(currentClass)) {
    currentClass = currentClass.join(' ');
  } else if (typeof currentClass === 'object') {
    // Handle object syntax if necessary, converting to string
    currentClass = Object.keys(currentClass)
      .filter((key) => currentClass[key])
      .join(' ');
  }

  if (!currentClass.includes(className)) {
    newProps.class = (currentClass + ' ' + className).trim();
  }
  vnode.props = newProps; // Directly modify props - ensure this is safe or clone if needed
}

export default defineComponent({
  name: 'isotope',

  props: {
    options: {
      type: Object,
      default: () => ({
        // Use factory function for default objects/arrays
        layoutMode: 'masonry',
        masonry: {
          gutter: 10,
        },
      }),
    },
    itemSelector: {
      type: String,
      default: 'item',
    },
    list: {
      type: Array,
      required: true,
      default: () => [], // Provide a default factory function
    },
  },

  emits: ['sort', 'filter', 'layout', 'arrange', 'shuffle'], // Define emitted events

  setup(props, { emit, slots }) {
    const instance = getCurrentInstance(); // Get component instance for context if needed
    const isotopeContainer = ref(null); // Ref for the container element
    const iso = ref(null); // Ref for the Isotope instance
    const itemVmMap = new Map(); // Map to store underlying data for elements

    // --- State Refs ---
    // Refs previously managed implicitly via `this`
    const children = ref([]);
    const removedKeys = ref(new Set()); // Use Set for efficient tracking of removed keys
    const listeners = ref([]);
    const filterListener = ref(null);
    const oldChildren = ref([]); // Store references to DOM nodes before update

    // --- Computed Properties ---
    const compiledOptions = computed(() => {
      const options = _.merge({}, props.options, {
        itemSelector: `.${props.itemSelector}`, // Use template literal
        // isJQueryFiltering: false, // Deprecated/Removed in Isotope v3? Check Isotope docs.
      });

      // Process getSortData if it exists
      if (options.getSortData) {
        _.forOwn(options.getSortData, (value, key) => {
          if (_.isString(value)) {
            // Adapt access based on the mapped data
            options.getSortData[key] = (itemElement) => {
              const underlyingData = itemVmMap.get(itemElement);
              return underlyingData ? underlyingData.vm[value] : undefined;
            };
          } else if (_.isFunction(value)) {
            // Wrap original function to provide mapped data
            options.getSortData[key] = (itemElement) => {
              const underlyingData = itemVmMap.get(itemElement);
              return underlyingData ? value(underlyingData.vm, underlyingData.index) : undefined;
            };
          }
        });
      }

      // Process getFilterData similarly
      if (options.getFilterData) {
        _.forOwn(options.getFilterData, (value, key) => {
          if (_.isFunction(value)) {
            options.getFilterData[key] = (itemElement) => {
              const underlyingData = itemVmMap.get(itemElement);
              return underlyingData ? value(underlyingData.vm, underlyingData.index) : undefined;
            };
          }
        });
      }

      return options;
    });

    // Internal options ref for modification (like adding filter function)
    const internalOptions = ref({});

    // --- Methods ---
    function getItemVm(elmt) {
      return itemVmMap.get(elmt); // Get data from map
    }

    function link() {
      itemVmMap.clear(); // Clear map before relinking
      const defaultSlots = slots.default ? slots.default() : [];
      defaultSlots.forEach((vnode, index) => {
        if (vnode && vnode.el) {
          // Check if the VNode has been rendered to an element
          // Map the DOM element (vnode.el) to its corresponding data item and index
          itemVmMap.set(vnode.el, { vm: props.list[index], index });
        }
      });
    }

    function unlisten() {
      listeners.value.forEach((unwatch) => unwatch());
      listeners.value = [];
      if (filterListener.value) {
        filterListener.value();
        filterListener.value = null;
      }
    }

    function listen() {
      unlisten(); // Ensure old listeners are removed first

      const sortDataConfigs = compiledOptions.value.getSortData;
      if (!sortDataConfigs) return;

      const newListeners = [];
      _.forEach(sortDataConfigs, (sortConfigFn, sortKey) => {
        // sortConfigFn is already adapted
        if (_.isFunction(sortConfigFn)) {
          props.list.forEach((item, index) => {
            const underlyingData = { vm: item, index }; // Recreate context for watcher
            const unwatch = watch(
              () => sortConfigFn(underlyingData), // Watch the result of the sort function for this item
              () => {
                if (iso.value) {
                  iso.value.updateSortData();
                  requestUpdate();
                }
              }
            );
            newListeners.push(unwatch);
          });
        }
        // Handle string-based sort data if needed (though compiledOptions converts them)
        else if (_.isString(sortConfigFn)) {
          // sortConfigFn is actually the property name string here
          props.list.forEach((item, index) => {
            const unwatch = watch(
              () => _.get(item, sortConfigFn), // Watch the specific property
              () => {
                if (iso.value) {
                  iso.value.updateSortData();
                  requestUpdate();
                }
              }
            );
            newListeners.push(unwatch);
          });
        }
      });
      listeners.value = newListeners;
    }

    function arrange(option) {
      if (iso.value) {
        iso.value.arrange(option);
        emit('arrange', option);
      }
    }

    function buildFilterFunction(name) {
      if (
        !compiledOptions.value ||
        !compiledOptions.value.getFilterData ||
        !compiledOptions.value.getFilterData[name]
      ) {
        console.warn(`Filter function '${name}' not found in options.getFilterData`);
        return () => true; // Default permissive filter
      }

      const filterFn = compiledOptions.value.getFilterData[name]; // Already adapted function

      // Remove previous listener if exists
      if (filterListener.value) {
        filterListener.value();
      }

      // Watch the results of the filter function for all items
      filterListener.value = watch(
        () => props.list.map((el, index) => filterFn(itemVmMap.get(el))), // Needs element mapping
        () => {
          requestUpdate();
        },
        { deep: true } // Might need deep watch depending on filter logic
      );

      return (itemElement) => filterFn(itemElement); // Isotope expects function taking the item element
    }

    function sort(name) {
      let options = _.isString(name) ? { sortBy: name } : name;
      arrange(options);
      emit('sort', name);
    }

    function filter(name) {
      const filterFunc = buildFilterFunction(name);
      arrange({ filter: filterFunc });
      emit('filter', name);
    }

    function unfilter() {
      if (filterListener.value) {
        filterListener.value();
        filterListener.value = null;
      }
      arrange({ filter: '*' }); // Use '*' for 'show all' in Isotope
      emit('filter', null);
    }

    function layout(name) {
      let options = _.isString(name) ? { layoutMode: name } : name;
      arrange(options);
      emit('layout', options); // Emit the processed options
    }

    function shuffle() {
      if (iso.value) {
        iso.value.shuffle();
        emit('shuffle');
        emit('sort', null); // Indicate sorting is cleared
      }
    }

    function getFilteredItemElements() {
      return iso.value ? iso.value.filteredItems.map((item) => item.element) : [];
    }

    function getElementItems() {
      // In Isotope v3+, `items` array holds item instances.
      return iso.value ? iso.value.items.map((item) => item.element) : [];
    }

    let willUpdate = false;
    function requestUpdate() {
      if (!iso.value || willUpdate) return;

      willUpdate = true;
      nextTick(() => {
        if (iso.value) {
          iso.value.arrange();
        }
        willUpdate = false;
      });
    }

    // --- Lifecycle Hooks ---
    onMounted(() => {
      if (!isotopeContainer.value) return;

      // Initialize internalOptions based on computedOptions
      internalOptions.value = _.cloneDeep(compiledOptions.value); // Clone to allow modification

      // Build filter if initially set
      if (
        internalOptions.value.filter &&
        _.isString(internalOptions.value.filter) &&
        internalOptions.value.getFilterData
      ) {
        internalOptions.value.filter = buildFilterFunction(internalOptions.value.filter);
      } else if (internalOptions.value.filter === '*') {
        // Allow Isotope's '*' filter selector
      } else {
        internalOptions.value.filter = '*'; // Default to show all if not specified or function invalid
      }

      nextTick(() => {
        link(); // Link data before initializing Isotope

        iso.value = new Isotope(isotopeContainer.value, internalOptions.value);

        // Optional: Expose isotope instance if needed, e.g., via ref or provide/inject
        // instance.exposed.iso = iso.value; // Requires defining `expose`

        listen(); // Start listening for data changes after initialization
      });
    });

    onBeforeUpdate(() => {
      // Store current DOM children before Vue updates the DOM
      if (isotopeContainer.value) {
        oldChildren.value = Array.from(isotopeContainer.value.children);
      }

      // --- Logic to track removed VNodes ---
      // Vue 3's reconciliation makes direct _vnode manipulation unsafe.
      // We need to compare the new set of children (from slots) with the previous set.
      const currentKeys = new Set();
      const defaultSlots = slots.default ? slots.default() : [];
      defaultSlots.forEach((vnode) => {
        if (vnode && vnode.key != null) {
          currentKeys.add(vnode.key);
        }
      });

      const previousKeys = new Set(children.value.map((vnode) => vnode.key));
      removedKeys.value.clear(); // Clear previous removals
      previousKeys.forEach((key) => {
        if (!currentKeys.has(key)) {
          removedKeys.value.add(key); // Track keys of removed VNodes
        }
      });

      // Update children ref for the next update cycle comparison
      children.value = defaultSlots.filter((vnode) => vnode && vnode.key != null);

      // Unlisten watchers before potential data changes cause updates
      unlisten();
    });

    onUpdated(() => {
      if (!iso.value || !isotopeContainer.value) return;

      const newElements = Array.from(isotopeContainer.value.children);

      // Find added and removed DOM elements
      const addedElements = newElements.filter((el) => !oldChildren.value.includes(el));
      const removedElements = oldChildren.value.filter((el) => !newElements.includes(el));

      link(); // Relink VNodes/elements to data after DOM update

      if (removedElements.length > 0) {
        iso.value.remove(removedElements);
        // Clean up map entries for removed elements
        removedElements.forEach((el) => itemVmMap.delete(el));
      }

      if (addedElements.length > 0) {
        iso.value.insert(addedElements);
      }

      if (removedElements.length > 0 || addedElements.length > 0) {
        requestUpdate(); // Arrange if items were added/removed
      }

      // Relisten after updates ensure watchers are on the current data
      listen();

      // Clear refs for next cycle
      oldChildren.value = [];
    });

    onBeforeUnmount(() => {
      unlisten(); // Clean up watchers
      if (iso.value) {
        iso.value.destroy(); // Destroy Isotope instance
        iso.value = null;
      }
      itemVmMap.clear();
    });

    // --- Render Function ---
    // We need to manage children carefully for Isotope
    const render = () => {
      const defaultSlots = slots.default ? slots.default() : [];
      const validChildren = [];

      // Filter and prepare children, adding itemSelector class and ensuring keys
      defaultSlots.forEach((vnode, index) => {
        if (vnode && vnode.type) {
          // Basic check for a valid VNode
          if (vnode.key == null) {
            // Warn if key is missing, crucial for list diffing and Isotope
            console.warn(
              `Isotope children must be keyed. Child at index ${index} is missing a key.`
            );
            // Optionally assign a temporary key, though this is not ideal:
            // vnode.key = `__isotope_temp_${index}`;
            validChildren.push(vnode); // Still push, but it might cause issues
          } else {
            // Clone VNode to safely add class and potentially link data ref
            const clonedVnode = cloneVNode(vnode);
            addClassToVNode(clonedVnode, props.itemSelector);

            // Attempt to map element to data *early* if possible, though element (`.el`)
            // is usually only available *after* render. Rely on link() mostly.
            // if (clonedVnode.el) {
            //   itemVmMap.set(clonedVnode.el, { vm: props.list[index], index });
            // }

            validChildren.push(clonedVnode);
          }
        }
      });

      // Update the internal children ref used for diffing in onBeforeUpdate
      // Do this *before* potentially filtering for rendering (if needed)
      // children.value = [...validChildren]; // This might be redundant if done in onBeforeUpdate

      // Render the container div with the processed children
      return h('div', { ref: isotopeContainer }, validChildren);
    };

    // --- Expose Public Methods ---
    // Use `expose` if specific methods need to be called from the parent
    // context.$expose({ sort, filter, unfilter, layout, shuffle, getFilteredItemElements, getElementItems, arrange });
    // Note: expose is usually not needed if methods are only used internally or via events

    // Return render function and potentially exposed methods/refs
    return render; // In setup, returning a render function overrides the template
  },
});
