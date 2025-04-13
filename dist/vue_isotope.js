'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _vue = require('vue');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _isotopeLayout = require('isotope-layout');

var _isotopeLayout2 = _interopRequireDefault(_isotopeLayout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Helper function to add class to VNode props
// Note: This is a simplified approach. Handling classes on VNodes in Vue 3
// can be complex, especially with dynamic classes. This might need refinement
// depending on how classes are originally applied to the child components.
function addClassToVNode(vnode, className) {
  if (!(0, _vue.isVNode)(vnode)) return;

  var newProps = vnode.props ? _extends({}, vnode.props) : {};
  var currentClass = newProps.class || '';
  // Ensure class is treated as a string for simplicity here
  if (Array.isArray(currentClass)) {
    currentClass = currentClass.join(' ');
  } else if ((typeof currentClass === 'undefined' ? 'undefined' : _typeof(currentClass)) === 'object') {
    // Handle object syntax if necessary, converting to string
    currentClass = Object.keys(currentClass).filter(function (key) {
      return currentClass[key];
    }).join(' ');
  }

  if (!(currentClass.indexOf(className) !== -1)) {
    newProps.class = (currentClass + ' ' + className).trim();
  }
  vnode.props = newProps; // Directly modify props - ensure this is safe or clone if needed
}

exports.default = (0, _vue.defineComponent)({
  name: 'isotope',

  props: {
    options: {
      type: Object,
      default: function _default() {
        return {
          // Use factory function for default objects/arrays
          layoutMode: 'masonry',
          masonry: {
            gutter: 10
          }
        };
      }
    },
    itemSelector: {
      type: String,
      default: 'item'
    },
    list: {
      type: Array,
      required: true,
      default: function _default() {
        return [];
      } // Provide a default factory function
    }
  },

  emits: ['sort', 'filter', 'layout', 'arrange', 'shuffle'], // Define emitted events

  setup: function setup(props, _ref) {
    var emit = _ref.emit,
        slots = _ref.slots;

    var instance = (0, _vue.getCurrentInstance)(); // Get component instance for context if needed
    var isotopeContainer = (0, _vue.ref)(null); // Ref for the container element
    var iso = (0, _vue.ref)(null); // Ref for the Isotope instance
    var itemVmMap = new Map(); // Map to store underlying data for elements

    // --- State Refs ---
    // Refs previously managed implicitly via `this`
    var children = (0, _vue.ref)([]);
    var removedKeys = (0, _vue.ref)(new Set()); // Use Set for efficient tracking of removed keys
    var listeners = (0, _vue.ref)([]);
    var filterListener = (0, _vue.ref)(null);
    var oldChildren = (0, _vue.ref)([]); // Store references to DOM nodes before update

    // --- Computed Properties ---
    var compiledOptions = (0, _vue.computed)(function () {
      var options = _lodash2.default.merge({}, props.options, {
        itemSelector: '.' + props.itemSelector // Use template literal
        // isJQueryFiltering: false, // Deprecated/Removed in Isotope v3? Check Isotope docs.
      });

      // Process getSortData if it exists
      if (options.getSortData) {
        _lodash2.default.forOwn(options.getSortData, function (value, key) {
          if (_lodash2.default.isString(value)) {
            // Adapt access based on the mapped data
            options.getSortData[key] = function (itemElement) {
              var underlyingData = itemVmMap.get(itemElement);
              return underlyingData ? underlyingData.vm[value] : undefined;
            };
          } else if (_lodash2.default.isFunction(value)) {
            // Wrap original function to provide mapped data
            options.getSortData[key] = function (itemElement) {
              var underlyingData = itemVmMap.get(itemElement);
              return underlyingData ? value(underlyingData.vm, underlyingData.index) : undefined;
            };
          }
        });
      }

      // Process getFilterData similarly
      if (options.getFilterData) {
        _lodash2.default.forOwn(options.getFilterData, function (value, key) {
          if (_lodash2.default.isFunction(value)) {
            options.getFilterData[key] = function (itemElement) {
              var underlyingData = itemVmMap.get(itemElement);
              return underlyingData ? value(underlyingData.vm, underlyingData.index) : undefined;
            };
          }
        });
      }

      return options;
    });

    // Internal options ref for modification (like adding filter function)
    var internalOptions = (0, _vue.ref)({});

    // --- Methods ---
    function getItemVm(elmt) {
      return itemVmMap.get(elmt); // Get data from map
    }

    function link() {
      itemVmMap.clear(); // Clear map before relinking
      var defaultSlots = slots.default ? slots.default() : [];
      defaultSlots.forEach(function (vnode, index) {
        if (vnode && vnode.el) {
          // Check if the VNode has been rendered to an element
          // Map the DOM element (vnode.el) to its corresponding data item and index
          itemVmMap.set(vnode.el, { vm: props.list[index], index: index });
        }
      });
    }

    function unlisten() {
      listeners.value.forEach(function (unwatch) {
        return unwatch();
      });
      listeners.value = [];
      if (filterListener.value) {
        filterListener.value();
        filterListener.value = null;
      }
    }

    function listen() {
      unlisten(); // Ensure old listeners are removed first

      var sortDataConfigs = compiledOptions.value.getSortData;
      if (!sortDataConfigs) return;

      var newListeners = [];
      _lodash2.default.forEach(sortDataConfigs, function (sortConfigFn, sortKey) {
        // sortConfigFn is already adapted
        if (_lodash2.default.isFunction(sortConfigFn)) {
          props.list.forEach(function (item, index) {
            var underlyingData = { vm: item, index: index }; // Recreate context for watcher
            var unwatch = (0, _vue.watch)(function () {
              return sortConfigFn(underlyingData);
            }, // Watch the result of the sort function for this item
            function () {
              if (iso.value) {
                iso.value.updateSortData();
                requestUpdate();
              }
            });
            newListeners.push(unwatch);
          });
        }
        // Handle string-based sort data if needed (though compiledOptions converts them)
        else if (_lodash2.default.isString(sortConfigFn)) {
            // sortConfigFn is actually the property name string here
            props.list.forEach(function (item, index) {
              var unwatch = (0, _vue.watch)(function () {
                return _lodash2.default.get(item, sortConfigFn);
              }, // Watch the specific property
              function () {
                if (iso.value) {
                  iso.value.updateSortData();
                  requestUpdate();
                }
              });
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
      if (!compiledOptions.value || !compiledOptions.value.getFilterData || !compiledOptions.value.getFilterData[name]) {
        console.warn('Filter function \'' + name + '\' not found in options.getFilterData');
        return function () {
          return true;
        }; // Default permissive filter
      }

      var filterFn = compiledOptions.value.getFilterData[name]; // Already adapted function

      // Remove previous listener if exists
      if (filterListener.value) {
        filterListener.value();
      }

      // Watch the results of the filter function for all items
      filterListener.value = (0, _vue.watch)(function () {
        return props.list.map(function (el, index) {
          return filterFn(itemVmMap.get(el));
        });
      }, // Needs element mapping
      function () {
        requestUpdate();
      }, { deep: true // Might need deep watch depending on filter logic
      });

      return function (itemElement) {
        return filterFn(itemElement);
      }; // Isotope expects function taking the item element
    }

    function sort(name) {
      var options = _lodash2.default.isString(name) ? { sortBy: name } : name;
      arrange(options);
      emit('sort', name);
    }

    function filter(name) {
      var filterFunc = buildFilterFunction(name);
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
      var options = _lodash2.default.isString(name) ? { layoutMode: name } : name;
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
      return iso.value ? iso.value.filteredItems.map(function (item) {
        return item.element;
      }) : [];
    }

    function getElementItems() {
      // In Isotope v3+, `items` array holds item instances.
      return iso.value ? iso.value.items.map(function (item) {
        return item.element;
      }) : [];
    }

    var willUpdate = false;
    function requestUpdate() {
      if (!iso.value || willUpdate) return;

      willUpdate = true;
      (0, _vue.nextTick)(function () {
        if (iso.value) {
          iso.value.arrange();
        }
        willUpdate = false;
      });
    }

    // --- Lifecycle Hooks ---
    (0, _vue.onMounted)(function () {
      if (!isotopeContainer.value) return;

      // Initialize internalOptions based on computedOptions
      internalOptions.value = _lodash2.default.cloneDeep(compiledOptions.value); // Clone to allow modification

      // Build filter if initially set
      if (internalOptions.value.filter && _lodash2.default.isString(internalOptions.value.filter) && internalOptions.value.getFilterData) {
        internalOptions.value.filter = buildFilterFunction(internalOptions.value.filter);
      } else if (internalOptions.value.filter === '*') {
        // Allow Isotope's '*' filter selector
      } else {
        internalOptions.value.filter = '*'; // Default to show all if not specified or function invalid
      }

      (0, _vue.nextTick)(function () {
        link(); // Link data before initializing Isotope

        iso.value = new _isotopeLayout2.default(isotopeContainer.value, internalOptions.value);

        // Optional: Expose isotope instance if needed, e.g., via ref or provide/inject
        // instance.exposed.iso = iso.value; // Requires defining `expose`

        listen(); // Start listening for data changes after initialization
      });
    });

    (0, _vue.onBeforeUpdate)(function () {
      // Store current DOM children before Vue updates the DOM
      if (isotopeContainer.value) {
        oldChildren.value = Array.from(isotopeContainer.value.children);
      }

      // --- Logic to track removed VNodes ---
      // Vue 3's reconciliation makes direct _vnode manipulation unsafe.
      // We need to compare the new set of children (from slots) with the previous set.
      var currentKeys = new Set();
      var defaultSlots = slots.default ? slots.default() : [];
      defaultSlots.forEach(function (vnode) {
        if (vnode && vnode.key != null) {
          currentKeys.add(vnode.key);
        }
      });

      var previousKeys = new Set(children.value.map(function (vnode) {
        return vnode.key;
      }));
      removedKeys.value.clear(); // Clear previous removals
      previousKeys.forEach(function (key) {
        if (!currentKeys.has(key)) {
          removedKeys.value.add(key); // Track keys of removed VNodes
        }
      });

      // Update children ref for the next update cycle comparison
      children.value = defaultSlots.filter(function (vnode) {
        return vnode && vnode.key != null;
      });

      // Unlisten watchers before potential data changes cause updates
      unlisten();
    });

    (0, _vue.onUpdated)(function () {
      if (!iso.value || !isotopeContainer.value) return;

      var newElements = Array.from(isotopeContainer.value.children);

      // Find added and removed DOM elements
      var addedElements = newElements.filter(function (el) {
        return !(oldChildren.value.indexOf(el) !== -1);
      });
      var removedElements = oldChildren.value.filter(function (el) {
        return !(newElements.indexOf(el) !== -1);
      });

      link(); // Relink VNodes/elements to data after DOM update

      if (removedElements.length > 0) {
        iso.value.remove(removedElements);
        // Clean up map entries for removed elements
        removedElements.forEach(function (el) {
          return itemVmMap.delete(el);
        });
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

    (0, _vue.onBeforeUnmount)(function () {
      unlisten(); // Clean up watchers
      if (iso.value) {
        iso.value.destroy(); // Destroy Isotope instance
        iso.value = null;
      }
      itemVmMap.clear();
    });

    // --- Render Function ---
    // We need to manage children carefully for Isotope
    var render = function render() {
      var defaultSlots = slots.default ? slots.default() : [];
      var validChildren = [];

      // Filter and prepare children, adding itemSelector class and ensuring keys
      defaultSlots.forEach(function (vnode, index) {
        if (vnode && vnode.type) {
          // Basic check for a valid VNode
          if (vnode.key == null) {
            // Warn if key is missing, crucial for list diffing and Isotope
            console.warn('Isotope children must be keyed. Child at index ' + index + ' is missing a key.');
            // Optionally assign a temporary key, though this is not ideal:
            // vnode.key = `__isotope_temp_${index}`;
            validChildren.push(vnode); // Still push, but it might cause issues
          } else {
            // Clone VNode to safely add class and potentially link data ref
            var clonedVnode = (0, _vue.cloneVNode)(vnode);
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
      return (0, _vue.h)('div', { ref: isotopeContainer }, validChildren);
    };

    // --- Expose Public Methods ---
    // Use `expose` if specific methods need to be called from the parent
    // context.$expose({ sort, filter, unfilter, layout, shuffle, getFilteredItemElements, getElementItems, arrange });
    // Note: expose is usually not needed if methods are only used internally or via events

    // Return render function and potentially exposed methods/refs
    return render; // In setup, returning a render function overrides the template
  }
});