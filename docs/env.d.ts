/// <reference types="vite/client" />

declare module 'hanabi' {
  function hanabi(code: string): string
  export default hanabi
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'super-vue3-tabs' {
  import { DefineComponent } from 'vue'
  export const Tab: DefineComponent<unknown, unknown, unknown>
  export const Tabs: DefineComponent<unknown, unknown, unknown>
}
declare module 'vue-3-slider-component' {
  import { DefineComponent } from 'vue'
  const VueSlider: DefineComponent<unknown, unknown, unknown>
  export default VueSlider
}
declare module 'vue3-swatches' {
  import { DefineComponent } from 'vue'
  export const VSwatches: DefineComponent<unknown, unknown, unknown>
}
