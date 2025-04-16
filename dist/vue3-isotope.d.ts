import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { default as default_2 } from 'isotope-layout';
import { DefineComponent } from 'vue';
import { IsotopeOptions } from 'isotope-layout';
import { Plugin as Plugin_2 } from 'vue';
import { PublicProps } from 'vue';
import { Ref } from 'vue';

declare const __VLS_component: DefineComponent<Props, {
arrange: typeof arrange;
filter: typeof filter;
unfilter: typeof unfilter;
layout: typeof layout;
sort: typeof sort;
shuffle: typeof shuffle;
getFilteredItemElements: typeof getFilteredItemElements;
getElementItems: typeof getElementItems;
iso: Ref<    {
options?: {
getSortData?: SortDefinition | undefined;
getFilterData?: FilterDefinition | undefined;
isJQueryFiltering?: boolean | undefined | undefined;
cellsByColumn?: {
columnWidth?: number | string | undefined | undefined;
rowHeight?: number | string | undefined | undefined;
} | undefined;
cellsByRow?: {
columnWidth?: number | string | undefined | undefined;
rowHeight?: number | string | undefined | undefined;
} | undefined;
containerStyle?: default_2.Style | undefined;
filter?: string | ((itemElement: HTMLElement) => boolean) | undefined | undefined;
fitRows?: {
gutter?: number | string | undefined | undefined;
} | undefined;
initLayout?: boolean | undefined | undefined;
itemSelector?: string | undefined | undefined;
layoutMode?: default_2.LayoutModes | undefined;
hiddenStyle?: default_2.Style | undefined;
horiz?: {
verticalAligment?: number | undefined | undefined;
} | undefined;
masonry?: {
columnWidth?: number | string | undefined | undefined;
gutter?: number | string | undefined | undefined;
horizontalOrder?: boolean | undefined | undefined;
fitWidth?: boolean | undefined | undefined;
} | undefined;
masontryHorizontal?: {
gutter?: number | string | undefined | undefined;
rowHeight?: number | string | undefined | undefined;
} | undefined;
originLeft?: boolean | undefined | undefined;
originTop?: boolean | undefined | undefined;
packery?: {
columnWidth?: number | string | undefined | undefined;
gutter?: number | string | undefined | undefined;
horizontal?: boolean | undefined | undefined;
rowHeight?: number | undefined | undefined;
} | undefined;
percentPosition?: boolean | undefined | undefined;
resize?: boolean | undefined | undefined;
sortAscending?: boolean | default_2.SortOrder | undefined;
sortBy?: string | string[] | undefined | undefined;
stagger?: number | string | undefined | undefined;
stamp?: string | undefined | undefined;
transitionDuration?: number | string | undefined | undefined;
vertical?: {
horizontalAlignment?: number | undefined | undefined;
} | undefined;
visibleStyle?: default_2.Style | undefined;
} | undefined;
items?: {
element: Element;
}[] | undefined;
updateSortData: (elements?: Elements) => void;
arrange: (options?: IsotopeOptions) => void;
stamp: (elements: default_2.Elements) => void;
addItems: (elements: default_2.Elements) => void;
appended: (elements: default_2.Elements) => void;
destroy: () => void;
getFilteredItemElements: () => Element[];
getItemElements: () => Element[];
hideItemElements: (elements: default_2.Elements) => void;
insert: (elements: default_2.Elements) => void;
layout: () => void;
layoutItems: (elements: HTMLElement[], isStill: boolean) => void;
prepended: (elements: default_2.Elements) => void;
reloadItems: () => void;
remove: (elements: default_2.Elements) => void;
revealItemElements: (elements: default_2.Elements) => void;
shuffle: () => void;
unstamp: (elements: default_2.Elements) => void;
on: (event: default_2.Events, listener: () => void) => void;
off: (event: default_2.Events, listener: () => void) => void;
once: (event: default_2.Events, listener: () => void) => void;
} | null, IsotopeInstance | {
options?: {
getSortData?: SortDefinition | undefined;
getFilterData?: FilterDefinition | undefined;
isJQueryFiltering?: boolean | undefined | undefined;
cellsByColumn?: {
columnWidth?: number | string | undefined | undefined;
rowHeight?: number | string | undefined | undefined;
} | undefined;
cellsByRow?: {
columnWidth?: number | string | undefined | undefined;
rowHeight?: number | string | undefined | undefined;
} | undefined;
containerStyle?: default_2.Style | undefined;
filter?: string | ((itemElement: HTMLElement) => boolean) | undefined | undefined;
fitRows?: {
gutter?: number | string | undefined | undefined;
} | undefined;
initLayout?: boolean | undefined | undefined;
itemSelector?: string | undefined | undefined;
layoutMode?: default_2.LayoutModes | undefined;
hiddenStyle?: default_2.Style | undefined;
horiz?: {
verticalAligment?: number | undefined | undefined;
} | undefined;
masonry?: {
columnWidth?: number | string | undefined | undefined;
gutter?: number | string | undefined | undefined;
horizontalOrder?: boolean | undefined | undefined;
fitWidth?: boolean | undefined | undefined;
} | undefined;
masontryHorizontal?: {
gutter?: number | string | undefined | undefined;
rowHeight?: number | string | undefined | undefined;
} | undefined;
originLeft?: boolean | undefined | undefined;
originTop?: boolean | undefined | undefined;
packery?: {
columnWidth?: number | string | undefined | undefined;
gutter?: number | string | undefined | undefined;
horizontal?: boolean | undefined | undefined;
rowHeight?: number | undefined | undefined;
} | undefined;
percentPosition?: boolean | undefined | undefined;
resize?: boolean | undefined | undefined;
sortAscending?: boolean | default_2.SortOrder | undefined;
sortBy?: string | string[] | undefined | undefined;
stagger?: number | string | undefined | undefined;
stamp?: string | undefined | undefined;
transitionDuration?: number | string | undefined | undefined;
vertical?: {
horizontalAlignment?: number | undefined | undefined;
} | undefined;
visibleStyle?: default_2.Style | undefined;
} | undefined;
items?: {
element: Element;
}[] | undefined;
updateSortData: (elements?: Elements) => void;
arrange: (options?: IsotopeOptions) => void;
stamp: (elements: default_2.Elements) => void;
addItems: (elements: default_2.Elements) => void;
appended: (elements: default_2.Elements) => void;
destroy: () => void;
getFilteredItemElements: () => Element[];
getItemElements: () => Element[];
hideItemElements: (elements: default_2.Elements) => void;
insert: (elements: default_2.Elements) => void;
layout: () => void;
layoutItems: (elements: HTMLElement[], isStill: boolean) => void;
prepended: (elements: default_2.Elements) => void;
reloadItems: () => void;
remove: (elements: default_2.Elements) => void;
revealItemElements: (elements: default_2.Elements) => void;
shuffle: () => void;
unstamp: (elements: default_2.Elements) => void;
on: (event: default_2.Events, listener: () => void) => void;
off: (event: default_2.Events, listener: () => void) => void;
once: (event: default_2.Events, listener: () => void) => void;
} | null>;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
filter: (filterName: string | ((item: ItemDataType, index?: number) => boolean) | null) => any;
arrange: (options: IsotopeOptions) => any;
layout: (layoutMode: LayoutMode) => any;
shuffle: () => any;
sort: (sortBy: string | string[] | null) => any;
}, string, PublicProps, Readonly<Props> & Readonly<{
onFilter?: ((filterName: string | ((item: ItemDataType, index?: number) => boolean) | null) => any) | undefined;
onArrange?: ((options: IsotopeOptions) => any) | undefined;
onLayout?: ((layoutMode: LayoutMode) => any) | undefined;
onShuffle?: (() => any) | undefined;
onSort?: ((sortBy: string | string[] | null) => any) | undefined;
}>, {
itemSelector: string;
options: ExtendedIsotopeOptions;
}, {}, {}, {}, string, ComponentProvideOptions, false, {
isotopeElement: HTMLDivElement;
}, HTMLDivElement>;

declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        default?(_: {}): any;
    };
    refs: {
        isotopeElement: HTMLDivElement;
    };
    rootEl: HTMLDivElement;
};

declare type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;

declare type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare function arrange(options: IsotopeOptions): void;

declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;

declare type Elements = Element | Element[] | HTMLElement | HTMLElement[] | string | NodeList;

declare interface ExtendedIsotopeOptions extends Omit<IsotopeOptions, 'getSortData'> {
    getSortData?: SortDefinition | undefined;
    getFilterData?: FilterDefinition | undefined;
    isJQueryFiltering?: boolean | undefined;
}

declare function filter(filterName: string | ((item: ItemDataType, index?: number) => boolean) | null): void;

declare interface FilterDefinition {
    [key: string]: (item: ItemDataType, index?: number) => boolean;
}

declare function getElementItems(): Element[];

declare function getFilteredItemElements(): Element[];

declare interface IsotopeInstance extends Omit<default_2, 'updateSortData'> {
    options?: ExtendedIsotopeOptions;
    items?: Array<{
        element: Element;
    }>;
    updateSortData(elements?: Elements): void;
    arrange(options?: IsotopeOptions): void;
}

declare type ItemDataType = unknown;

declare function layout(layoutMode: LayoutMode): void;

declare type LayoutMode = NonNullable<IsotopeOptions['layoutMode']>;

declare interface Props {
    list: ItemDataType[];
    itemSelector: string;
    options: ExtendedIsotopeOptions;
}

declare function shuffle(): void;

declare function sort(sortBy: string | string[]): void;

declare interface SortDefinition {
    [key: string]: ((item: ItemDataType, index?: number) => string | number) | ((elem: Element) => string | number) | string;
}

declare function unfilter(): void;

declare const VueIsotope: typeof _default & {
    install: Plugin_2;
};
export default VueIsotope;

export { }
