import { defineComponent as O, useTemplateRef as Q, ref as p, computed as B, onMounted as H, nextTick as h, watch as x, onBeforeUnmount as X, createElementBlock as Y, openBlock as Z, renderSlot as w } from "vue";
import tt from "isotope-layout";
const q = /* @__PURE__ */ O({
  __name: "VueIsotope",
  props: {
    list: {},
    itemSelector: { default: "vue-isotope-item" },
    options: { default: () => ({
      layoutMode: "masonry",
      masonry: {
        gutter: 10
      }
    }) }
  },
  emits: ["arrange", "layout", "filter", "sort", "shuffle"],
  setup(D, { expose: z, emit: J }) {
    function g(t, e) {
      if (t === e) return !0;
      if (t == null || e == null || typeof t != typeof e) return !1;
      if (Array.isArray(t) && Array.isArray(e)) {
        if (t.length !== e.length) return !1;
        for (let r = 0; r < t.length; r++)
          if (!g(t[r], e[r])) return !1;
        return !0;
      }
      if (typeof t == "object" && typeof e == "object") {
        const r = Object.getPrototypeOf(t) === Object.prototype, n = Object.getPrototypeOf(e) === Object.prototype;
        if (!r || !n) return !1;
        const a = Object.keys(t), i = Object.keys(e);
        return a.length !== i.length ? !1 : a.every(
          (l) => (
            // Ensure key exists on both objects and values are deep equal
            Object.prototype.hasOwnProperty.call(e, l) && g(t[l], e[l])
          )
        );
      }
      return !1;
    }
    const u = D, c = J, s = Q("isotopeElement"), o = p(null), S = p([]), C = p([]), d = p(null), v = p(null), b = p(!1);
    function k(t) {
      return t ? Array.from(t.children) : [];
    }
    function I(t) {
      if (!t) return;
      k(t).forEach((r, n) => {
        r.setAttribute("data-index", String(n));
      });
    }
    const F = B(() => {
      var e;
      const t = {
        ...u.options,
        // Ensure itemSelector starts with '.' if it's intended as a class selector
        itemSelector: (e = u.itemSelector) != null && e.startsWith(".") ? u.itemSelector : `.${u.itemSelector}`,
        isJQueryFiltering: !1
        // Important for non-jQuery environments
      };
      if (t.getSortData && (t.getSortData = Object.entries(t.getSortData).reduce((r, [n, a]) => {
        let i;
        if (typeof a == "string") {
          const l = a;
          i = (f) => {
            if (f && typeof f == "object" && l in f) {
              const m = f[l];
              return typeof m == "string" || typeof m == "number" ? m : JSON.stringify(m ?? "");
            }
            return "";
          };
        } else typeof a == "function" && (i = a);
        return i && (r[n] = (l) => {
          const f = Number(l.getAttribute("data-index"));
          return !isNaN(f) && u.list[f] ? i(u.list[f], f) : "";
        }), r;
      }, {})), t.getFilterData) {
        const r = {};
        for (const n in t.getFilterData) {
          const a = t.getFilterData[n];
          typeof a == "function" && (r[n] = a);
        }
        t.getFilterData = r;
      }
      return t;
    });
    function j() {
      !o.value || b.value || (b.value = !0, h(() => {
        o.value && o.value.arrange(), b.value = !1;
      }));
    }
    function V() {
      S.value.forEach((t) => t()), C.value.forEach((t) => t()), S.value = [], C.value = [];
    }
    const M = B(() => {
      if (u.options.getSortData)
        return Object.entries(u.options.getSortData).reduce((t, [e, r]) => {
          let n;
          if (typeof r == "string") {
            const a = r;
            n = (i) => {
              if (i && typeof i == "object" && a in i) {
                const l = i[a];
                return typeof l == "string" || typeof l == "number" ? l : JSON.stringify(l ?? "");
              }
              return "";
            };
          } else typeof r == "function" && (n = r);
          return n && (t[e] = n), t;
        }, {});
    });
    function A() {
      V();
      const t = M.value;
      t && typeof t == "object" && u.list.forEach((e, r) => {
        e && Object.keys(t).forEach((n) => {
          const a = t[n];
          if (typeof a == "function") {
            const i = x(
              () => a(e, r),
              // Watch the property on the data item
              () => {
                o.value && (o.value.updateSortData(), j());
              },
              { deep: !1 }
              // Avoid deep watching individual properties unless necessary
            );
            S.value.push(i);
          }
        });
      });
    }
    function _(t) {
      if (!t) return;
      let e = !1;
      return k(t).forEach((n, a) => {
        n.classList.contains(u.itemSelector) || (n.classList.add(u.itemSelector), e = !0), n.setAttribute("data-index", String(a));
      }), e;
    }
    function E() {
      if (!s.value || o.value) return;
      _(s.value);
      const t = F.value;
      console.log("Initializing Isotope with options:", t);
      const e = new tt(
        s.value,
        t
      );
      o.value = e, A();
    }
    function N() {
      var t, e;
      o.value && (o.value.destroy(), o.value = null), V(), (t = d.value) == null || t.call(d), (e = v.value) == null || e.call(v), d.value = null, v.value = null;
    }
    H(() => {
      h(() => {
        E(), I(s.value);
      }), d.value = x(
        () => u.list,
        async () => {
          var t, e;
          await h(), o.value && s.value ? (_(s.value), I(s.value), (e = (t = o.value).reloadItems) == null || e.call(t), A(), j()) : (E(), I(s.value));
        },
        { deep: !0 }
      ), v.value = x(
        F,
        (t, e) => {
          if (!o.value || g(t, e)) return;
          const r = t.layoutMode !== e.layoutMode, n = t.filter !== e.filter, a = !g(t.sortBy, e.sortBy);
          (r || n || a) && (console.log("Arranging due to option change (layout/filter/sort)"), o.value.arrange(t));
          const i = !g(t.getSortData, e.getSortData), l = !g(t.getFilterData, e.getFilterData);
          i && (console.log("Updating sort data"), o.value.options && t.getSortData && (o.value.options.getSortData = t.getSortData), A(), o.value.updateSortData(), j()), l && (console.log("Updating filter data (Note: mapping might be required)"), o.value.options && t.getFilterData && (o.value.options.getFilterData = t.getFilterData)), t.itemSelector !== e.itemSelector && (console.log("Re-initializing due to itemSelector change."), N(), h(E));
        },
        { deep: !0 }
      );
    }), X(() => {
      N();
    });
    function y(t) {
      o.value && (o.value.arrange(t), c("arrange", t));
    }
    function W(t) {
      y({ layoutMode: t }), c("layout", t);
    }
    function $(t) {
      y({ sortBy: t }), c("sort", t);
    }
    function P(t) {
      return (e) => {
        const r = Number(e.getAttribute("data-index"));
        return !isNaN(r) && u.list[r] ? t(u.list[r], r) : !1;
      };
    }
    function K(t) {
      var r;
      if (typeof t == "function")
        return P(t);
      const e = (r = F.value.getFilterData) == null ? void 0 : r[t];
      return typeof e == "function" ? P(e) : t;
    }
    function L(t) {
      if (t === null) {
        U();
        return;
      }
      const e = K(t);
      e !== void 0 ? (y({ filter: e }), c("filter", t)) : console.error(
        `Cannot apply filter: "${String(t)}". It's not a valid selector, not found in getFilterData, or function-based filtering failed due to mapping issues.`
      );
    }
    function U() {
      y({ filter: "*" }), c("filter", null);
    }
    function R() {
      o.value && (o.value.shuffle(), c("shuffle"), c("sort", null));
    }
    function T() {
      var t;
      return ((t = o.value) == null ? void 0 : t.getFilteredItemElements()) || [];
    }
    function G() {
      var t, e;
      return ((e = (t = o.value) == null ? void 0 : t.items) == null ? void 0 : e.map((r) => r.element)) || [];
    }
    return z({
      arrange: y,
      filter: L,
      unfilter: U,
      layout: W,
      sort: $,
      shuffle: R,
      getFilteredItemElements: T,
      getElementItems: G,
      iso: o
      // Expose the Isotope instance itself if needed
    }), (t, e) => (Z(), Y("div", {
      ref_key: "isotopeElement",
      ref: s
    }, [
      w(t.$slots, "default")
    ], 512));
  }
}), et = (D) => {
  D.component("VueIsotope", q);
}, rt = q;
rt.install = et;
export {
  rt as default
};
//# sourceMappingURL=vue3-isotope.js.map
