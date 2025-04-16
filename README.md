[![banner](https://github.com/user-attachments/assets/3376883d-7ef5-4475-8d73-369c05c066d5)](https://vue3-isotope.hanl.in/)
[![GitHub](https://img.shields.io/github/license/hotdogee/vue3-isotope)](https://github.com/hotdogee/vue3-isotope/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/vue3-isotope)](https://www.npmjs.com/package/vue3-isotope)
[![Vue](https://img.shields.io/badge/vue-^3.5-brightgreen.svg)](https://vuejs.org/)
[![demo](https://img.shields.io/badge/demo-vue3--isotope.hanl.in-blue)](https://vue3-isotope.hanl.in/)

A fully-featured Vue 3 component for [Isotope](https://isotope.metafizzy.co/), supporting magical grid layouts with filtering, sorting, and dynamic content.

- 💚 Vue 3 Composition API
- 🔥 Written in TypeScript

## 🚀 Live

- [Demo](https://vue3-isotope.hanl.in/)
- [Playground](https://stackblitz.com/~/github.com/hotdogee/vue3-isotope?file=src/App.vue)

## Features

- **Vue 3 Composition API:** Built with `<script setup>` for modern Vue development.
- **TypeScript:** Fully typed for a better development experience.
- **Reactivity:** Automatically updates the layout when your data list changes or when properties affecting sorting/filtering are modified.
- **Data-Driven Filtering/Sorting:** Define `getFilterData` and `getSortData` functions that operate directly on your data, instead DOM elements.
- **Exposed API:** Access Isotope's core methods (`filter`, `sort`, `arrange`, `shuffle`, etc.) directly via template refs.
- **Full Isotope Options:** Supports all standard Isotope layout options.
- Emits events for all major Isotope operations.

## Installation

```bash
npm install vue3-isotope
```

### Local Registration

```vue
<script setup lang="ts">
import VueIsotope from 'vue3-isotope'
</script>

<template>
  <VueIsotope :list="items" :options="options">
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </VueIsotope>
</template>
```

### Global Registration

```typescript
// main.ts
import { createApp } from 'vue'
import VueIsotope from 'vue3-isotope'
import App from './App.vue'

const app = createApp(App)
app.use(VueIsotope)
app.mount('#app')
```

## Basic Usage

```vue
<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import VueIsotope from 'vue3-isotope'

interface Item {
  id: number
  name: string
  category: string
  weight: number
}

const items = ref<Item[]>([
  { id: 1, name: 'Item 1', category: 'category1', weight: 100 },
  { id: 2, name: 'Item 2', category: 'category2', weight: 400 },
  { id: 3, name: 'Item 3', category: 'category1', weight: 200 },
  { id: 4, name: 'Item 4', category: 'category2', weight: 300 }
])

const options = computed(() => ({
  layoutMode: 'masonry' as const,
  getSortData: {
    name: 'name', // String shorthand - uses the name property directly
    weight: (item: Item) => item.weight, // Function - custom sort logic
    category: 'category'
  },
  getFilterData: {
    isCategory1: (item: Item) => item.category === 'category1',
    isHeavy: (item: Item) => item.weight > 250
  }
}))

const isotopeRef = useTemplateRef('isotopeRef')

function filterByCategory1() {
  isotopeRef.value?.filter('isCategory1')
}

let sortAscending = true
function sortByWeight() {
  isotopeRef.value?.sort('weight', (sortAscending = !sortAscending))
}
</script>

<template>
  <div>
    <div class="controls">
      <button @click="filterByCategory1">Show Category 1</button>
      <button @click="isotopeRef?.filter('*')">Show All</button>
      <button @click="sortByWeight">Sort by Weight</button>
    </div>

    <VueIsotope ref="isotopeRef" :list="items" :options="options" itemSelector="item">
      <div v-for="item in items" :key="item.id" class="item">
        <h3>{{ item.name }}</h3>
        <p>Category: {{ item.category }}</p>
        <p>Weight: {{ item.weight }}</p>
      </div>
    </VueIsotope>
  </div>
</template>

<style>
.item {
  width: 200px;
  margin: 10px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
```

## Props

| Prop           | Type     | Default                                              | Description                                                                                                    |
| -------------- | -------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `list`         | `Array`  | Required                                             | Array of data to display in the grid. Each item in the list corresponds to a DOM element in the grid.          |
| `options`      | `Object` | `{ layoutMode: 'masonry', masonry: { gutter: 10 } }` | Isotope configuration options. All [Isotope options](https://isotope.metafizzy.co/options.html) are supported. |
| `itemSelector` | `String` | `'vue-isotope-item'`                                 | Class to apply to isotope elements. Will be automatically added to child elements.                             |

### Special Options Properties

#### `getSortData`

An object where keys are sort names and values are functions that receive your data item (and its index) and return a value (string or number) to sort by. You can also provide a string which will be treated as a property name on the data item:

```typescript
getSortData: {
  // Use property name directly
  id: 'id',

  // Custom sort function
  name: (item) => item.name.toLowerCase(),

  // More complex sort function
  weight: (item) => parseFloat(item.weight.replace(/[()]/g, ''))
}
```

#### `getFilterData`

An object where keys are filter names and values are functions that receive your data item (and its index) and return true if the item should be shown for that filter:

```typescript
getFilterData: {
  // Filter by condition
  isCategory1: (item) => item.category === 'category1',

  // More complex filtering
  containsText: (item) => item.name.toLowerCase().includes(this.filterText)
}
```

## Methods

Access these methods via a ref to the component:

| Method                    | Arguments                    | Description                                           |
| ------------------------- | ---------------------------- | ----------------------------------------------------- |
| `filter`                  | `string \| Function \| null` | Apply filter by name, CSS selector or custom function |
| `unfilter`                | none                         | Reset filtering (show all items)                      |
| `sort`                    | `string \| string[]`         | Sort by key name from getSortData                     |
| `layout`                  | `string`                     | Change layout mode                                    |
| `shuffle`                 | none                         | Randomly shuffle items                                |
| `arrange`                 | `Object`                     | Pass options directly to Isotope arrange              |
| `getFilteredItemElements` | none                         | Returns array of filtered DOM elements                |
| `getElementItems`         | none                         | Returns array of all item elements                    |

## Events

| Event     | Payload                      | Description                                 |
| --------- | ---------------------------- | ------------------------------------------- |
| `filter`  | `string \| Function \| null` | Emitted when filter is applied              |
| `sort`    | `string \| string[] \| null` | Emitted when sort is applied                |
| `layout`  | `string`                     | Emitted when layout mode changes            |
| `shuffle` | none                         | Emitted when items are shuffled             |
| `arrange` | `Object`                     | Emitted when arrange is called with options |

## CSS Selector Filtering

In addition to custom filter functions, you can also use CSS selector filtering:

```typescript
// Filter by class
isotopeRef.value.filter('.metal')

// Filter by multiple classes
isotopeRef.value.filter('.metal, .transition')

// Filter with :not selector
isotopeRef.value.filter(':not(.transition)')

// Combined selectors
isotopeRef.value.filter('.metal:not(.transition)')
```

## TypeScript Support

This component includes full TypeScript definitions. Use them to get type checking for options, methods, and events:

```typescript
import VueIsotope from 'vue3-isotope'
import type { VueIsotopeOptions } from 'vue3-isotope'

// Type-safe options
const options: VueIsotopeOptions = {
  layoutMode: 'masonry',
  getSortData: {
    name: (item: MyItemType) => item.name.toLowerCase()
  }
}
```

## Working with Images

When working with images, they may load after Isotope has calculated layouts. To handle this case, consider using an image loading library like `imagesloaded`.

## Development

```bash
npm i
npm run dev
# Open localhost:5173

# Build the library
npm run build
```

### 📚 Documentation Site

```bash
npm i
npm run docs:dev
# open localhost:5173
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  **Fork** the repository.
2.  Create a **new branch** for your feature or bug fix (`git checkout -b feature/my-new-feature` or `git checkout -b fix/issue-123`).
3.  **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4.  **Push** your branch to your fork (`git push origin feature/amazing-feature`)
5.  Create a **Pull Request**

## License

[MIT](https://github.com/hotdogee/vue3-isotope/blob/master/LICENSE)
