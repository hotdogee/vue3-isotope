<script setup lang="ts">
import type { IsotopeOptions } from 'isotope-layout'
import Isotope from 'isotope-layout'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemDataType = any
// Match Isotope's own Elements type more closely
type Elements = Element | Element[] | HTMLElement | HTMLElement[] | string | NodeList

export interface SortDefinition {
  [key: string]:
    | ((item: ItemDataType, index?: number) => string | number)
    | ((elem: Element) => string | number)
    | string
}

export interface FilterDefinition {
  // Ensure filter functions return boolean, as expected by Isotope when mapped from data
  [key: string]: (item: ItemDataType, index?: number) => boolean
}

export interface ExtendedIsotopeOptions extends Omit<IsotopeOptions, 'getSortData'> {
  getSortData?: SortDefinition | undefined
  getFilterData?: FilterDefinition | undefined
  isJQueryFiltering?: boolean | undefined
}

// Create a separate interface that doesn't extend Isotope to avoid type conflicts
export interface IsotopeInstance extends Omit<Isotope, 'updateSortData'> {
  options?: ExtendedIsotopeOptions // from Outlayer options
  // https://github.com/metafizzy/outlayer/blob/fc751c12a0448c89a9da7caa88dd35de0a789f08/outlayer.js#L175
  items?: Array<{ element: Element }> // from Outlayer items
  updateSortData(elements?: Elements): void
  // destroy(): void
  // reloadItems?(): void
  arrange(options?: IsotopeOptions): void
  // shuffle(): void
  // getFilteredItemElements(): Element[]
}

// Custom deep equality function to replace lodash's isEqual
function deepEqual(a: unknown, b: unknown): boolean {
  // Check if primitives or if strictly equal (same reference)
  if (a === b) return true

  // Check if either is null/undefined but not both (we already checked a === b)
  if (a == null || b == null) return false

  // Check if same type
  if (typeof a !== typeof b) return false

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  // Handle objects (but not functions, DOM nodes, etc)
  if (typeof a === 'object' && typeof b === 'object') {
    // Skip non-plain objects like DOM nodes or different classes
    const aIsPlainObj = Object.getPrototypeOf(a) === Object.prototype
    const bIsPlainObj = Object.getPrototypeOf(b) === Object.prototype

    if (!aIsPlainObj || !bIsPlainObj) return false

    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)

    if (aKeys.length !== bKeys.length) return false

    return aKeys.every(
      (key) =>
        // Ensure key exists on both objects and values are deep equal
        Object.prototype.hasOwnProperty.call(b, key) &&
        deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    )
  }

  // Functions, Dates, RegExps, etc
  return false
}

export interface Props {
  list: ItemDataType[]
  itemSelector: string
  options: ExtendedIsotopeOptions
}

const props = withDefaults(defineProps<Props>(), {
  itemSelector: 'vue-isotope-item',
  options: () => ({
    layoutMode: 'masonry',
    masonry: {
      gutter: 10
    }
  })
})

// Define Emits (vue 3.3+)
const emit = defineEmits<{
  arrange: [options: IsotopeOptions]
  layout: [layoutMode: LayoutMode]
  filter: [filterName: string | ((item: ItemDataType, index?: number) => boolean) | null]
  sort: [sortBy: string | string[] | null]
  shuffle: []
}>()

// useTemplateRef (vue 3.5+)
const isotopeElement = useTemplateRef('isotopeElement')

// Isotope Instance Ref
const iso = ref<IsotopeInstance | null>(null)

// Watcher Management
const sortWatchers = ref<(() => void)[]>([])
const filterWatchers = ref<(() => void)[]>([])
const listWatcher = ref<(() => void) | null>(null)
const optionsWatcher = ref<(() => void) | null>(null)

// Internal state for debouncing updates
const willUpdate = ref(false)

// Helper to get child elements, filtering out text nodes, comments, etc.
function getValidChildren(element: HTMLElement | null): Element[] {
  if (!element) return []
  // Directly use element.children which only includes Element nodes
  return Array.from(element.children)
}

// Helper to add data-index attribute to each child element
function addDataIndexAttributes(element: HTMLElement | null) {
  if (!element) return
  const children = getValidChildren(element)
  children.forEach((child, idx) => {
    child.setAttribute('data-index', String(idx))
  })
}

// Computed options processor
const compiledOptions = computed<ExtendedIsotopeOptions>(() => {
  const options: ExtendedIsotopeOptions = {
    ...props.options,
    // Ensure itemSelector starts with '.' if it's intended as a class selector
    itemSelector: props.itemSelector?.startsWith('.')
      ? props.itemSelector
      : `.${props.itemSelector}`,
    isJQueryFiltering: false // Important for non-jQuery environments
  }

  // Convert string shortcuts to functions for getSortData
  if (options.getSortData) {
    options.getSortData = Object.entries(options.getSortData).reduce((acc, [key, value]) => {
      let fn: ((item: ItemDataType, index?: number) => string | number) | undefined
      if (typeof value === 'string') {
        const propName = value
        fn = (item: ItemDataType): string | number => {
          if (item && typeof item === 'object' && propName in item) {
            const propValue = (item as Record<string, unknown>)[propName]
            if (typeof propValue === 'string' || typeof propValue === 'number') {
              return propValue
            }
            return JSON.stringify(propValue ?? '')
          }
          return ''
        }
      } else if (typeof value === 'function') {
        // Assert that the provided function matches the expected signature for 'fn'
        fn = value as (item: ItemDataType, index?: number) => string | number
      }
      if (fn) {
        // Wrap so Isotope receives a function that takes a DOM element
        acc[key] = (elem: Element) => {
          const idx = Number(elem.getAttribute('data-index'))
          return !isNaN(idx) && props.list[idx] ? fn(props.list[idx], idx) : ''
        }
      }
      return acc
    }, {} as SortDefinition)
  }

  // Process getFilterData - Isotope expects filter functions to receive the element
  if (options.getFilterData) {
    const newFilterData: FilterDefinition = {}
    for (const key in options.getFilterData) {
      const value = options.getFilterData[key]
      if (typeof value === 'function') {
        newFilterData[key] = value
      }
    }
    options.getFilterData = newFilterData
  }

  return options
})

// --- Internal Functions ---

function requestUpdate() {
  if (!iso.value || willUpdate.value) return
  willUpdate.value = true
  void nextTick(() => {
    if (iso.value) {
      iso.value.arrange()
    }
    willUpdate.value = false
  })
}

function clearWatchers() {
  sortWatchers.value.forEach((unwatch) => unwatch())
  filterWatchers.value.forEach((unwatch) => unwatch())
  sortWatchers.value = []
  filterWatchers.value = []
}

// Store original getSortData for watcher use
const originalGetSortData = computed(() => {
  if (!props.options.getSortData) return undefined
  return Object.entries(props.options.getSortData).reduce((acc, [key, value]) => {
    let fn: ((item: ItemDataType, index?: number) => string | number) | undefined
    if (typeof value === 'string') {
      const propName = value
      fn = (item: ItemDataType): string | number => {
        if (item && typeof item === 'object' && propName in item) {
          const propValue = (item as Record<string, unknown>)[propName]
          if (typeof propValue === 'string' || typeof propValue === 'number') {
            return propValue
          }
          return JSON.stringify(propValue ?? '')
        }
        return ''
      }
    } else if (typeof value === 'function') {
      // Assert that the provided function matches the expected signature for 'fn'
      fn = value as (item: ItemDataType, index?: number) => string | number
    }
    if (fn) {
      // Wrap so Isotope receives a function that takes a DOM element
      acc[key] = fn
    }
    return acc
  }, {} as SortDefinition)
})

// Set up watchers for individual item properties defined in getSortData
function setupItemWatchers() {
  clearWatchers()
  const sortDataDefs = originalGetSortData.value
  if (sortDataDefs && typeof sortDataDefs === 'object') {
    // Check it's an object
    props.list.forEach((itemData, index) => {
      // Iterate over the data list
      if (!itemData) return // Skip null/undefined items
      Object.keys(sortDataDefs).forEach((key) => {
        const getter = sortDataDefs[key] as (item: ItemDataType, index?: number) => string | number
        if (typeof getter === 'function') {
          const unwatch = watch(
            () => getter(itemData, index), // Watch the property on the data item
            () => {
              if (iso.value) {
                iso.value.updateSortData() // Call without args to update all items
                requestUpdate() // Debounced arrange
              }
            },
            { deep: false } // Avoid deep watching individual properties unless necessary
          )
          sortWatchers.value.push(unwatch)
        }
      })
    })
  }
}

// Adds the itemSelector class to direct children elements if missing
function ensureItemClasses(element: HTMLElement | null) {
  if (!element) return
  let classAdded = false
  const children = getValidChildren(element)
  children.forEach((child, idx) => {
    if (!child.classList.contains(props.itemSelector)) {
      child.classList.add(props.itemSelector)
      classAdded = true
    }
    child.setAttribute('data-index', String(idx))
  })
  return classAdded
}

function initializeIsotope() {
  if (!isotopeElement.value || iso.value) return

  // Ensure children have the necessary class before initializing Isotope
  ensureItemClasses(isotopeElement.value)

  const options = compiledOptions.value
  console.log('Initializing Isotope with options:', options)
  // Use a more specific type assertion for Isotope constructor
  const instance = new Isotope(
    isotopeElement.value,
    options as unknown as IsotopeOptions
  ) as IsotopeInstance

  iso.value = instance
  setupItemWatchers()
}

function destroyIsotope() {
  if (iso.value) {
    iso.value.destroy()
    iso.value = null
  }
  clearWatchers()
  // Stop main watchers if they exist
  listWatcher.value?.()
  optionsWatcher.value?.()
  listWatcher.value = null
  optionsWatcher.value = null
}

// --- Lifecycle Hooks ---

onMounted(() => {
  // Initialize after the first render and DOM is available
  void nextTick(() => {
    initializeIsotope()
    addDataIndexAttributes(isotopeElement.value)
  })

  // Watch for list changes (additions/removals/reorders)
  listWatcher.value = watch(
    () => props.list,
    async () => {
      await nextTick() // Wait for Vue to update the DOM based on list change
      if (iso.value && isotopeElement.value) {
        ensureItemClasses(isotopeElement.value) // Ensure new items have class
        addDataIndexAttributes(isotopeElement.value)
        iso.value.reloadItems?.() // Tell Isotope to re-read the DOM
        setupItemWatchers() // Re-setup watchers for the new list data
        requestUpdate() // Arrange with debouncing
      } else {
        // If isotope wasn't initialized yet, try again
        initializeIsotope()
        addDataIndexAttributes(isotopeElement.value)
      }
    },
    { deep: true }
  ) // Deep watch is often necessary if item objects are mutated

  // Watch for option changes
  optionsWatcher.value = watch(
    compiledOptions,
    (newOptions, oldOptions) => {
      // console.log("Compiled options changed", newOptions, oldOptions);
      if (!iso.value || deepEqual(newOptions, oldOptions)) return

      // If only layoutMode, filter, or sortBy changed, just call arrange
      const layoutChanged = newOptions.layoutMode !== oldOptions.layoutMode
      const filterChanged = newOptions.filter !== oldOptions.filter
      const sortChanged = !deepEqual(newOptions.sortBy, oldOptions.sortBy)

      if (layoutChanged || filterChanged || sortChanged) {
        console.log('Arranging due to option change (layout/filter/sort)')
        iso.value.arrange(newOptions as IsotopeOptions)
      }

      // If getSortData or getFilterData changed, update them and watchers
      const sortDataChanged = !deepEqual(newOptions.getSortData, oldOptions.getSortData)
      const filterDataChanged = !deepEqual(newOptions.getFilterData, oldOptions.getFilterData)

      if (sortDataChanged) {
        console.log('Updating sort data')
        if (iso.value.options && newOptions.getSortData) {
          iso.value.options.getSortData = newOptions.getSortData // Update isotope's internal options
        }
        setupItemWatchers() // Re-setup watchers
        iso.value.updateSortData() // Update all items
        requestUpdate()
      }
      if (filterDataChanged) {
        console.log('Updating filter data (Note: mapping might be required)')
        if (iso.value.options && newOptions.getFilterData) {
          iso.value.options.getFilterData = newOptions.getFilterData
        }
        // No direct isotope method to update filter functions, re-arranging might be needed if filter changes
        // setupItemWatchers(); // If watchers were used for filters
        // requestUpdate();
      }

      // For other changes, a full re-init might be safest, but less performant.
      // Example: if itemSelector changes, re-init is needed.
      if (newOptions.itemSelector !== oldOptions.itemSelector) {
        console.log('Re-initializing due to itemSelector change.')
        destroyIsotope()
        void nextTick(initializeIsotope)
      }
    },
    { deep: true }
  )
})

onBeforeUnmount(() => {
  destroyIsotope()
})

// --- Exposed Methods ---

function arrange(options: IsotopeOptions) {
  if (iso.value) {
    iso.value.arrange(options)
    emit('arrange', options)
  }
}

// Define a type for the allowed layout modes
type LayoutMode = NonNullable<IsotopeOptions['layoutMode']>

function layout(layoutMode: LayoutMode) {
  const options = { layoutMode }
  arrange(options)
  emit('layout', layoutMode)
}

function sort(sortBy: string | string[]) {
  const options = { sortBy }
  arrange(options)
  emit('sort', sortBy)
}

function getDataIndexFilter(filterFn: (item: ItemDataType, index?: number) => boolean) {
  return (elem: Element) => {
    const idx = Number(elem.getAttribute('data-index'))
    return !isNaN(idx) && props.list[idx] ? filterFn(props.list[idx], idx) : false
  }
}

function getFilterArg(
  filterName: string | ((item: ItemDataType, index?: number) => boolean)
): string | ((elem: Element) => boolean) | undefined {
  if (typeof filterName === 'function') {
    return getDataIndexFilter(filterName)
  }
  const filterFunc = compiledOptions.value.getFilterData?.[filterName]
  return typeof filterFunc === 'function' ? getDataIndexFilter(filterFunc) : filterName
}

function filter(filterName: string | ((item: ItemDataType, index?: number) => boolean) | null) {
  if (filterName === null) {
    unfilter()
    return
  }

  const filterArg = getFilterArg(filterName)

  if (filterArg !== undefined) {
    arrange({ filter: filterArg })
    emit('filter', filterName) // Emit the original name/function
  } else {
    console.error(
      `Cannot apply filter: "${String(filterName)}". It's not a valid selector, not found in getFilterData, or function-based filtering failed due to mapping issues.`
    )
  }
}

function unfilter() {
  arrange({ filter: '*' }) // Use '*' selector to show all
  emit('filter', null)
}

function shuffle() {
  if (iso.value) {
    iso.value.shuffle()
    emit('shuffle')
    emit('sort', null) // Shuffle overrides sort
  }
}

function getFilteredItemElements(): Element[] {
  return iso.value?.getFilteredItemElements() || []
}

function getElementItems(): Element[] {
  // Isotope v3+ stores item instances in the 'items' array
  return iso.value?.items?.map((item) => item.element) || []
}

// Expose methods to parent components
defineExpose({
  arrange,
  filter,
  unfilter,
  layout,
  sort,
  shuffle,
  getFilteredItemElements,
  getElementItems,
  iso // Expose the Isotope instance itself if needed
})
</script>

<template>
  <div ref="isotopeElement">
    <slot></slot>
  </div>
</template>
