(function(o,g){typeof exports=="object"&&typeof module<"u"?module.exports=g(require("vue"),require("isotope-layout")):typeof define=="function"&&define.amd?define(["vue","isotope-layout"],g):(o=typeof globalThis<"u"?globalThis:o||self,o.VueIsotope=g(o.Vue,o.Isotope))})(this,function(o,g){"use strict";const E=o.defineComponent({__name:"VueIsotope",props:{list:{},itemSelector:{default:"vue-isotope-item"},options:{default:()=>({layoutMode:"masonry",masonry:{gutter:10}})}},emits:["arrange","layout","filter","sort","shuffle"],setup(D,{expose:B,emit:z}){function d(t,e){if(t===e)return!0;if(t==null||e==null||typeof t!=typeof e)return!1;if(Array.isArray(t)&&Array.isArray(e)){if(t.length!==e.length)return!1;for(let r=0;r<t.length;r++)if(!d(t[r],e[r]))return!1;return!0}if(typeof t=="object"&&typeof e=="object"){const r=Object.getPrototypeOf(t)===Object.prototype,i=Object.getPrototypeOf(e)===Object.prototype;if(!r||!i)return!1;const a=Object.keys(t),l=Object.keys(e);return a.length!==l.length?!1:a.every(s=>Object.prototype.hasOwnProperty.call(e,s)&&d(t[s],e[s]))}return!1}const u=D,p=z,f=o.useTemplateRef("isotopeElement"),n=o.ref(null),S=o.ref([]),C=o.ref([]),y=o.ref(null),h=o.ref(null),I=o.ref(!1);function V(t){return t?Array.from(t.children):[]}function b(t){if(!t)return;V(t).forEach((r,i)=>{r.setAttribute("data-index",String(i))})}const j=o.computed(()=>{var e;const t={...u.options,itemSelector:(e=u.itemSelector)!=null&&e.startsWith(".")?u.itemSelector:`.${u.itemSelector}`,isJQueryFiltering:!1};if(t.getSortData&&(t.getSortData=Object.entries(t.getSortData).reduce((r,[i,a])=>{let l;if(typeof a=="string"){const s=a;l=c=>{if(c&&typeof c=="object"&&s in c){const v=c[s];return typeof v=="string"||typeof v=="number"?v:JSON.stringify(v??"")}return""}}else typeof a=="function"&&(l=a);return l&&(r[i]=s=>{const c=Number(s.getAttribute("data-index"));return!isNaN(c)&&u.list[c]?l(u.list[c],c):""}),r},{})),t.getFilterData){const r={};for(const i in t.getFilterData){const a=t.getFilterData[i];typeof a=="function"&&(r[i]=a)}t.getFilterData=r}return t});function F(){!n.value||I.value||(I.value=!0,o.nextTick(()=>{n.value&&n.value.arrange(),I.value=!1}))}function T(){S.value.forEach(t=>t()),C.value.forEach(t=>t()),S.value=[],C.value=[]}const J=o.computed(()=>{if(u.options.getSortData)return Object.entries(u.options.getSortData).reduce((t,[e,r])=>{let i;if(typeof r=="string"){const a=r;i=l=>{if(l&&typeof l=="object"&&a in l){const s=l[a];return typeof s=="string"||typeof s=="number"?s:JSON.stringify(s??"")}return""}}else typeof r=="function"&&(i=r);return i&&(t[e]=i),t},{})});function x(){T();const t=J.value;t&&typeof t=="object"&&u.list.forEach((e,r)=>{e&&Object.keys(t).forEach(i=>{const a=t[i];if(typeof a=="function"){const l=o.watch(()=>a(e,r),()=>{n.value&&(n.value.updateSortData(),F())},{deep:!1});S.value.push(l)}})})}function _(t){if(!t)return;let e=!1;return V(t).forEach((i,a)=>{i.classList.contains(u.itemSelector)||(i.classList.add(u.itemSelector),e=!0),i.setAttribute("data-index",String(a))}),e}function A(){if(!f.value||n.value)return;_(f.value);const t=j.value;console.log("Initializing Isotope with options:",t);const e=new g(f.value,t);n.value=e,x()}function q(){var t,e;n.value&&(n.value.destroy(),n.value=null),T(),(t=y.value)==null||t.call(y),(e=h.value)==null||e.call(h),y.value=null,h.value=null}o.onMounted(()=>{o.nextTick(()=>{A(),b(f.value)}),y.value=o.watch(()=>u.list,async()=>{var t,e;await o.nextTick(),n.value&&f.value?(_(f.value),b(f.value),(e=(t=n.value).reloadItems)==null||e.call(t),x(),F()):(A(),b(f.value))},{deep:!0}),h.value=o.watch(j,(t,e)=>{if(!n.value||d(t,e))return;const r=t.layoutMode!==e.layoutMode,i=t.filter!==e.filter,a=!d(t.sortBy,e.sortBy);(r||i||a)&&(console.log("Arranging due to option change (layout/filter/sort)"),n.value.arrange(t));const l=!d(t.getSortData,e.getSortData),s=!d(t.getFilterData,e.getFilterData);l&&(console.log("Updating sort data"),n.value.options&&t.getSortData&&(n.value.options.getSortData=t.getSortData),x(),n.value.updateSortData(),F()),s&&(console.log("Updating filter data (Note: mapping might be required)"),n.value.options&&t.getFilterData&&(n.value.options.getFilterData=t.getFilterData)),t.itemSelector!==e.itemSelector&&(console.log("Re-initializing due to itemSelector change."),q(),o.nextTick(A))},{deep:!0})}),o.onBeforeUnmount(()=>{q()});function m(t){n.value&&(n.value.arrange(t),p("arrange",t))}function M(t){m({layoutMode:t}),p("layout",t)}function W(t,e=!0){m({sortBy:t,sortAscending:e}),p("sort",t)}function N(t){return e=>{const r=Number(e.getAttribute("data-index"));return!isNaN(r)&&u.list[r]?t(u.list[r],r):!1}}function $(t){var r;if(typeof t=="function")return N(t);const e=(r=j.value.getFilterData)==null?void 0:r[t];return typeof e=="function"?N(e):t}function K(t){if(t===null){P();return}const e=$(t);e!==void 0?(m({filter:e}),p("filter",t)):console.error(`Cannot apply filter: "${String(t)}". It's not a valid selector, not found in getFilterData, or function-based filtering failed due to mapping issues.`)}function P(){m({filter:"*"}),p("filter",null)}function L(){n.value&&(n.value.shuffle(),p("shuffle"),p("sort",null))}function R(){var t;return((t=n.value)==null?void 0:t.getFilteredItemElements())||[]}function G(){var t,e;return((e=(t=n.value)==null?void 0:t.items)==null?void 0:e.map(r=>r.element))||[]}return B({arrange:m,filter:K,unfilter:P,layout:M,sort:W,shuffle:L,getFilteredItemElements:R,getElementItems:G,iso:n}),(t,e)=>(o.openBlock(),o.createElementBlock("div",{ref_key:"isotopeElement",ref:f},[o.renderSlot(t.$slots,"default")],512))}}),U=D=>{D.component("VueIsotope",E)},k=E;return k.install=U,k});
//# sourceMappingURL=vue3-isotope.umd.cjs.map
