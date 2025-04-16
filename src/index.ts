import type { App, Plugin } from 'vue'
import VueIsotopeComponent from './components/VueIsotope.vue'

const install: Plugin = (app: App) => {
  app.component('VueIsotope', VueIsotopeComponent)
}

// Attach the install function directly to the component object.
// Use a type assertion with an intersection type to inform TypeScript
// that this object now also has an 'install' property.
const VueIsotope = VueIsotopeComponent as typeof VueIsotopeComponent & { install: Plugin }
VueIsotope.install = install

export default VueIsotope
