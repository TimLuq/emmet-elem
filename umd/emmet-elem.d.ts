/**
 * Sets the default document to use when no one is specified.
 * If this hasen't been set, an attept is made to read the global `document` object.
 * @param document the default document object to use for node creation
 */
export declare function setDefDoc(document: Document): void;
export type EmmetCallback<P extends Element | DocumentFragment = Element | DocumentFragment> = (i: number, c: number, n: number, p: P) => string | number | Node | null | undefined;
/**
 * A slot in the generated emmet structure.
 * Although this is an element, use only the methods and properties that manipulate its children.
 */
export interface IEmmetSlot extends Element {
    tagName: "emmet-slot";
    localName: "emmet-slot";
}
/**
 * The numbered slots available.
 *
 * ```js
 * let slots = slotted`a>(b>${
 *   (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
 * }*2^c>${
 *   (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
 * })*3^d>${4 * 1}`.slots;
 *
 * assert(slots.length == 3);
 * assert(slots[3] == undefined);
 *
 * assert(Array.isArray(slots[0]) && slots[0].length == 6);
 * assert(slots[0][0].parentNode.tagName == "b");
 * assert(slots[0][0].textContent == "0<0/6>");
 * assert(slots[0][5].textContent == "0<5/6>");
 *
 * assert(Array.isArray(slots[1]) && slots[1].length == 3);
 * assert(slots[1][0].parentNode.tagName == "c");
 * assert(slots[1][0].textContent == "1<0/3>");
 * assert(slots[1][2].textContent == "1<2/3>");
 *
 * assert(!Array.isArray(slots[2]));
 * assert(slots[2].parentNode.tagName == "d");
 * assert(slots[2].textContent == "4");
 * ```
 */
export interface IEmmetSlots {
    length: number;
    [index: number]: undefined | IEmmetSlot | IEmmetSlot[];
}
export interface IEmmetConfig<D extends Document = Document> {
    doc: D;
    cache: Map<readonly string[] | string, Element | DocumentFragment>;
}
export interface ISlottedEmmet<T extends Element | DocumentFragment, D extends Document> {
    doc: D;
    root: T;
    slots: IEmmetSlots;
}
/**
 *
 * @param strings
 * @param values
 * @returns
 */
export declare function emmetSlots<T extends Element | DocumentFragment = Element | DocumentFragment, D extends Document = Document>(strings: readonly string[] | string, options?: Readonly<Partial<IEmmetConfig<D>>>): ISlottedEmmet<T, D>;
export declare function slotted<T extends Element | DocumentFragment = Element | DocumentFragment>(strings: TemplateStringsArray | string[] | string, ...values: (string | number | Node | null | EmmetCallback<IEmmetSlot> | Promise<string | number | Node | null | undefined> | undefined)[]): ISlottedEmmet<T, Document>;
export declare function emmet<T extends Element | DocumentFragment = Element | DocumentFragment>(strings: TemplateStringsArray | string[] | string, ...values: (string | number | Node | null | EmmetCallback<Element | DocumentFragment> | undefined)[]): T;
