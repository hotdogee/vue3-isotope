<template>
  <div>
    <h1>Isotope - filtering &amp; sorting (Vue 3)</h1>
    <h2>Filter</h2>
    <div class="button-group">
      <button
        v-for="btn in filterButtons"
        :key="btn.value"
        class="button"
        :class="{ 'is-checked': filterValue === btn.value }"
        @click="onFilterClick(btn.value)"
      >
        {{ btn.label }}
      </button>
    </div>
    <h2>Sort</h2>
    <div class="button-group">
      <button
        v-for="btn in sortButtons"
        :key="btn.value"
        class="button"
        :class="{ 'is-checked': sortByValue === btn.value }"
        @click="onSortClick(btn.value)"
      >
        {{ btn.label }}
      </button>
    </div>
    <VueIsotope
      ref="isotopeRef"
      :list="elements"
      itemSelector="element-item"
      :options="isotopeOptions"
      class="grid"
      style="min-height: 300px"
    >
      <template v-for="el in elements" :key="el.symbol">
        <div :class="el.classes.join(' ')" :data-category="el.category">
          <h3 class="name">{{ el.name }}</h3>
          <p class="symbol">{{ el.symbol }}</p>
          <p class="number">{{ el.number }}</p>
          <p class="weight">{{ el.weight }}</p>
        </div>
      </template>
    </VueIsotope>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VueIsotope from './components/VueIsotope.vue'

// Data for periodic table elements
interface ElementItem {
  name: string
  symbol: string
  number: number
  weight: string
  category: string
  classes: string[]
}

const elements = ref<ElementItem[]>([
  {
    name: 'Mercury',
    symbol: 'Hg',
    number: 80,
    weight: '200.59',
    category: 'transition',
    classes: ['element-item', 'transition', 'metal']
  },
  {
    name: 'Tellurium',
    symbol: 'Te',
    number: 52,
    weight: '127.6',
    category: 'metalloid',
    classes: ['element-item', 'metalloid']
  },
  {
    name: 'Bismuth',
    symbol: 'Bi',
    number: 83,
    weight: '208.980',
    category: 'post-transition',
    classes: ['element-item', 'post-transition', 'metal']
  },
  {
    name: 'Lead',
    symbol: 'Pb',
    number: 82,
    weight: '207.2',
    category: 'post-transition',
    classes: ['element-item', 'post-transition', 'metal']
  },
  {
    name: 'Gold',
    symbol: 'Au',
    number: 79,
    weight: '196.967',
    category: 'transition',
    classes: ['element-item', 'transition', 'metal']
  },
  {
    name: 'Potassium',
    symbol: 'K',
    number: 19,
    weight: '39.0983',
    category: 'alkali',
    classes: ['element-item', 'alkali', 'metal']
  },
  {
    name: 'Sodium',
    symbol: 'Na',
    number: 11,
    weight: '22.99',
    category: 'alkali',
    classes: ['element-item', 'alkali', 'metal']
  },
  {
    name: 'Cadmium',
    symbol: 'Cd',
    number: 48,
    weight: '112.411',
    category: 'transition',
    classes: ['element-item', 'transition', 'metal']
  },
  {
    name: 'Calcium',
    symbol: 'Ca',
    number: 20,
    weight: '40.078',
    category: 'alkaline-earth',
    classes: ['element-item', 'alkaline-earth', 'metal']
  },
  {
    name: 'Rhenium',
    symbol: 'Re',
    number: 75,
    weight: '186.207',
    category: 'transition',
    classes: ['element-item', 'transition', 'metal']
  },
  {
    name: 'Thallium',
    symbol: 'Tl',
    number: 81,
    weight: '204.383',
    category: 'post-transition',
    classes: ['element-item', 'post-transition', 'metal']
  },
  {
    name: 'Antimony',
    symbol: 'Sb',
    number: 51,
    weight: '121.76',
    category: 'metalloid',
    classes: ['element-item', 'metalloid']
  },
  {
    name: 'Cobalt',
    symbol: 'Co',
    number: 27,
    weight: '58.933',
    category: 'transition',
    classes: ['element-item', 'transition', 'metal']
  },
  {
    name: 'Ytterbium',
    symbol: 'Yb',
    number: 70,
    weight: '173.054',
    category: 'lanthanoid',
    classes: ['element-item', 'lanthanoid', 'metal', 'inner-transition']
  },
  {
    name: 'Argon',
    symbol: 'Ar',
    number: 18,
    weight: '39.948',
    category: 'noble-gas',
    classes: ['element-item', 'noble-gas', 'nonmetal']
  },
  {
    name: 'Nitrogen',
    symbol: 'N',
    number: 7,
    weight: '14.007',
    category: 'diatomic',
    classes: ['element-item', 'diatomic', 'nonmetal']
  },
  {
    name: 'Uranium',
    symbol: 'U',
    number: 92,
    weight: '238.029',
    category: 'actinoid',
    classes: ['element-item', 'actinoid', 'metal', 'inner-transition']
  },
  {
    name: 'Plutonium',
    symbol: 'Pu',
    number: 94,
    weight: '(244)',
    category: 'actinoid',
    classes: ['element-item', 'actinoid', 'metal', 'inner-transition']
  }
])

// Isotope options and custom filter/sort functions
const isotopeOptions = computed(() => ({
  layoutMode: 'fitRows' as const,
  getSortData: {
    name: (item: ElementItem) => item.name.toLowerCase(),
    symbol: (item: ElementItem) => item.symbol,
    number: (item: ElementItem) => item.number,
    category: (item: ElementItem) => item.category,
    weight: (item: ElementItem) => parseFloat(item.weight.replace(/[()]/g, ''))
  },
  getFilterData: {
    numberGreaterThan50: (item: ElementItem) => item.number > 50,
    ium: (item: ElementItem) => /ium$/.test(item.name)
  }
}))

const isotopeRef = ref<InstanceType<typeof VueIsotope> | null>(null)

// Filter and sort state
const filterValue = ref<string | null>('*')
const sortByValue = ref<string>('original-order')

// Button groups
const filterButtons = [
  { label: 'show all', value: '*' },
  { label: 'metal', value: '.metal' },
  { label: 'transition', value: '.transition' },
  { label: 'alkali and alkaline-earth', value: '.alkali, .alkaline-earth' },
  { label: 'not transition', value: ':not(.transition)' },
  { label: 'metal but not transition', value: '.metal:not(.transition)' },
  { label: 'number > 50', value: 'numberGreaterThan50' },
  { label: 'name ends with –ium', value: 'ium' }
]
const sortButtons = [
  { label: 'original order', value: 'original-order' },
  { label: 'name', value: 'name' },
  { label: 'symbol', value: 'symbol' },
  { label: 'number', value: 'number' },
  { label: 'weight', value: 'weight' },
  { label: 'category', value: 'category' }
]

function onFilterClick(val: string) {
  filterValue.value = val
  if (isotopeRef.value) {
    if (val === '*' || val.startsWith('.') || val.startsWith(':')) {
      isotopeRef.value.filter(val)
    } else {
      isotopeRef.value.filter(val)
    }
  }
}
function onSortClick(val: string) {
  sortByValue.value = val
  if (isotopeRef.value) {
    isotopeRef.value.sort(val)
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
}

/* ---- button ---- */

.button {
  display: inline-block;
  padding: 0.5em 1em;
  background: #eee;
  border: none;
  border-radius: 7px;
  background-image: linear-gradient(to bottom, hsla(0, 0%, 0%, 0), hsla(0, 0%, 0%, 0.2));
  color: #222;
  font-family: sans-serif;
  font-size: 16px;
  text-shadow: 0 1px white;
  cursor: pointer;
}

.button:hover {
  background-color: #8cf;
  text-shadow: 0 1px hsla(0, 0%, 100%, 0.5);
  color: #222;
}

.button:active,
.button.is-checked {
  background-color: #28f;
}

.button.is-checked {
  color: white;
  text-shadow: 0 -1px hsla(0, 0%, 0%, 0.8);
}

.button:active {
  box-shadow: inset 0 1px 10px hsla(0, 0%, 0%, 0.8);
}

/* ---- button-group ---- */

.button-group {
  margin-bottom: 20px;
}

.button-group:after {
  content: '';
  display: block;
  clear: both;
}

.button-group .button {
  float: left;
  border-radius: 0;
  margin-left: 0;
  margin-right: 1px;
}

.button-group .button:first-child {
  border-radius: 0.5em 0 0 0.5em;
}
.button-group .button:last-child {
  border-radius: 0 0.5em 0.5em 0;
}

/* ---- isotope ---- */

.grid {
  border: 1px solid #333;
}

/* clear fix */
.grid:after {
  content: '';
  display: block;
  clear: both;
}

/* ---- .element-item ---- */

.element-item {
  position: relative;
  float: left;
  width: 100px;
  height: 100px;
  margin: 5px;
  padding: 10px;
  background: #888;
  color: #262524;
}

.element-item > * {
  margin: 0;
  padding: 0;
}

.element-item .name {
  position: absolute;

  left: 10px;
  top: 60px;
  text-transform: none;
  letter-spacing: 0;
  font-size: 12px;
  font-weight: normal;
}

.element-item .symbol {
  position: absolute;
  left: 10px;
  top: 0px;
  font-size: 42px;
  font-weight: bold;
  color: white;
}

.element-item .number {
  position: absolute;
  right: 8px;
  top: 5px;
}

.element-item .weight {
  position: absolute;
  left: 10px;
  top: 76px;
  font-size: 12px;
}

.element-item.alkali {
  background: #f00;
  background: hsl(0, 100%, 50%);
}
.element-item.alkaline-earth {
  background: #f80;
  background: hsl(36, 100%, 50%);
}
.element-item.lanthanoid {
  background: #ff0;
  background: hsl(72, 100%, 50%);
}
.element-item.actinoid {
  background: #0f0;
  background: hsl(108, 100%, 50%);
}
.element-item.transition {
  background: #0f8;
  background: hsl(144, 100%, 50%);
}
.element-item.post-transition {
  background: #0ff;
  background: hsl(180, 100%, 50%);
}
.element-item.metalloid {
  background: #08f;
  background: hsl(216, 100%, 50%);
}
.element-item.diatomic {
  background: #00f;
  background: hsl(252, 100%, 50%);
}
.element-item.halogen {
  background: #f0f;
  background: hsl(288, 100%, 50%);
}
.element-item.noble-gas {
  background: #f08;
  background: hsl(324, 100%, 50%);
}
</style>
