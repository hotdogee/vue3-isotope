<template>
  <main class="main-container">
    <header class="hero">
      <GithubBadge slug="hotdogee/vue3-isotope" />
      <img class="banner" src="./images/banner.png" alt="Vue 3 Isotope" />
      <p class="subtitle">Filter & sort magical layouts for Vue 3</p>
    </header>

    <section class="controls-section">
      <div class="control-group">
        <h2>Filter Elements</h2>
        <div class="button-group filter-buttons">
          <button
            v-for="btn in filterButtons"
            :key="btn.value"
            class="control-button"
            :class="{ 'is-active': filterValue === btn.value }"
            @click="onFilterClick(btn.value)"
          >
            {{ btn.label }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <h2>Sort Elements</h2>
        <div class="button-group sort-buttons">
          <button
            v-for="btn in sortButtons"
            :key="btn.value"
            class="control-button"
            :class="{ 'is-active': sortByValue === btn.value }"
            @click="onSortClick(btn.value)"
          >
            {{ btn.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="elements-container">
      <VueIsotope
        ref="isotopeRef"
        :list="elements"
        itemSelector="element-item"
        :options="isotopeOptions"
        class="isotope-grid"
      >
        <template v-for="el in elements" :key="el.symbol">
          <div :class="el.classes.join(' ')" :data-category="el.category">
            <div class="element-content">
              <p class="symbol">{{ el.symbol }}</p>
              <p class="number">#{{ el.number }}</p>
              <h3 class="name">{{ el.name }}</h3>
              <p class="weight">{{ el.weight }}</p>
            </div>
          </div>
        </template>
      </VueIsotope>
    </section>

    <footer class="footer">
      <p>
        Released under the
        <a href="//github.com/hotdogee/vue3-isotope/blob/master/LICENSE">MIT</a> license.
        <a href="//github.com/hotdogee/vue3-isotope">View source</a>
      </p>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VueIsotope from '../src/components/VueIsotope.vue'
import GithubBadge from './GithubBadge.vue'

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
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --text-color: #333;
  --background-color: #f8f9fa;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* ---- Header styles ---- */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero > * {
  margin-bottom: 1.5rem;
}

.hero > *:last-child {
  margin-bottom: 1.5rem;
}

.title {
  font-size: 3.5rem;
  margin: 1rem 0 0.5rem;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.subtitle {
  font-size: 1.5rem;
  color: #666;
}

.banner {
  max-width: 80%;
  height: auto;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: transform var(--transition-speed);
}

.banner:hover {
  transform: scale(1.02);
}

/* ---- Controls section ---- */
.controls-section {
  margin-bottom: 3rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-between;
}

.control-group {
  flex: 1;
  min-width: 300px;
}

.control-group h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: var(--secondary-color);
  border-left: 4px solid var(--primary-color);
  padding-left: 1rem;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* ---- Buttons ---- */
.control-button {
  display: inline-block;
  padding: 0.75rem 1.25rem;
  background: #ffffff;
  border: none;
  border-radius: 8px;
  color: var(--text-color);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all var(--transition-speed);
}

.control-button:hover {
  background-color: #f0f7ff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.control-button:active,
.control-button.is-active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(0);
}

/* ---- Isotope grid ---- */
.elements-container {
  padding: 1rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}

.isotope-grid {
  border: none;
  padding: 1rem;
}

/* Clear fix */
.isotope-grid:after {
  content: '';
  display: block;
  clear: both;
}

/* ---- Element items ---- */
.element-item {
  position: relative;
  float: left;
  width: 120px;
  height: 120px;
  margin: 8px;
  background: #888;
  color: #262524;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  transition: all var(--transition-speed);
}

.element-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.element-content {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  color: white;
}

.element-item .symbol {
  position: absolute;
  left: 12px;
  top: 8px;
  font-size: 32px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.element-item .number {
  position: absolute;
  right: 12px;
  top: 8px;
  font-size: 14px;
  opacity: 0.8;
}

.element-item .name {
  position: absolute;
  left: 12px;
  bottom: 30px;
  text-transform: none;
  letter-spacing: 0.5px;
  font-size: 14px;
  font-weight: 500;
}

.element-item .weight {
  position: absolute;
  left: 12px;
  bottom: 12px;
  font-size: 12px;
  opacity: 0.8;
}

/* Element colors with better gradient effects */
.element-item.alkali {
  background: linear-gradient(to bottom right, #ff5252, #b33939);
}

.element-item.alkaline-earth {
  background: linear-gradient(to bottom right, #ff793f, #d95c0d);
}

.element-item.lanthanoid {
  background: linear-gradient(to bottom right, #ffb142, #cc8e34);
}

.element-item.actinoid {
  background: linear-gradient(to bottom right, #33d9b2, #218c74);
}

.element-item.transition {
  background: linear-gradient(to bottom right, #34ace0, #227093);
}

.element-item.post-transition {
  background: linear-gradient(to bottom right, #706fd3, #474787);
}

.element-item.metalloid {
  background: linear-gradient(to bottom right, #40407a, #2c2c54);
}

.element-item.diatomic {
  background: linear-gradient(to bottom right, #ff5252, #b33939);
}

.element-item.halogen {
  background: linear-gradient(to bottom right, #ff5252, #b33939);
}

.element-item.noble-gas {
  background: linear-gradient(to bottom right, #ff5252, #b33939);
}

/* Footer styles */
.footer {
  margin-top: 1rem;
  text-align: center;
  padding: 2rem 0;
  color: #666;
  font-size: 0.9rem;
}

.footer a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color var(--transition-speed);
}

.footer a:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-container {
    padding: 1rem;
  }

  .title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .controls-section {
    flex-direction: column;
    gap: 1rem;
  }

  .control-group {
    min-width: 100%;
  }

  .element-item {
    width: 100px;
    height: 100px;
  }

  .banner {
    max-width: 100%;
  }
}
</style>
