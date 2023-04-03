
/** Global cache for the default document. */
const parsedM = new Map<string[] | string, Element | DocumentFragment>();

/**
 * Default document to use when no one is specified.
 * If this is `undefined` an attept is made to read the global `document` object.
 */
let defDoc: undefined | Document = undefined;

/**
 * Sets the default document to use when no one is specified.
 * If this hasn't been set, an attempt is made to read the global `document` object.
 * @param document the default document object to use for node creation
 */
export function setDefDoc(document: Document) {
    defDoc = document;
    parsedM.clear();
}

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
/**
 * Config
 */
export interface IEmmetConfig<D extends Document = Document> {
    doc: D,
    cache: Map<readonly string[] | string, Element | DocumentFragment>,
}

export interface ISlottedEmmet<T extends Element | DocumentFragment, D extends Document> {
    doc: D,
    root: T;
    slots: IEmmetSlots;
}

/**
 * Parses the emmet string or template string array and returns the root element and the slots created.
 * The actual type in the returned `root` depends on the `strings` parameter and the default document.
 * 
 * @template T the type of the root element, defaults to `Element | DocumentFragment`
 * @template D the type of the document, defaults to `Document`
 * @param {readonly string[] | string} strings the emmet string or template string array
 * @param {Readonly<Partial<IEmmetConfig<D>>> | undefined} options optional config object
 * @returns {ISlottedEmmet<T, D>} the root element and the slots created if the `strings` parameter was a string array
 */
export function emmetSlots<T extends Element | DocumentFragment = Element | DocumentFragment, D extends Document = Document>(strings: readonly string[] | string, options?: Readonly<Partial<IEmmetConfig<D>>>): ISlottedEmmet<T, D> {
    const dd = defDoc || (typeof document == "undefined" ? undefined : document);
    const doc = (options?.doc || dd) as D;
    const cache = options?.cache || (doc == dd ? parsedM : undefined);
    strings = /*@__PURE__*/isTemplateStringsArray(strings as readonly string[]) ? (strings as TemplateStringsArray).raw : strings;
    let parsed = cache?.get(strings);
    if (!parsed) {
        const string = typeof strings !== "string" ? strings : [strings];
        parsed = /*@__PURE__*/parseEmmet(doc, string);
        cache?.set(strings, parsed);
    }
    const root = parsed.cloneNode(true) as Element | DocumentFragment;
    const slots: IEmmetSlots = { length: 0 };
    if (typeof strings === "string" || strings.length < 2) {
        return { doc, root: root as T, slots };
    }
    for (const e of root.querySelectorAll<IEmmetSlot>("emmet-slot")) {
        const n = parseInt(e.getAttribute("n") as string);
        const prevSlot = slots[n];
        if (slots.length <= n) {
            slots.length = n + 1;
        }
        if (!prevSlot) {
            slots[n] = e;
        } else if (Array.isArray(prevSlot)) {
            prevSlot.push(e);
        } else {
            slots[n] = [prevSlot, e];
        }
    }
    return { doc, root: root as T, slots };
}

function isTemplateStringsArray(arr: TemplateStringsArray | readonly string[]): arr is TemplateStringsArray {
    return Array.isArray((arr as TemplateStringsArray).raw);
}
/**
 * Parses the emmet string or template string array and returns the root element and the slots created.
 * The actual type in the returned `root` depends on the `strings` parameter and the default document.
 * 
 * @template T the type of the root element, defaults to `Element | DocumentFragment`
 * @param {TemplateStringsArray | string[] | string} strings segments of the emmet string
 * @param {Array} values values to initially fill the slots with
 * @returns {ISlottedEmmet<T, Document>} the root element and the slots created.
 */
export function slotted<T extends Element | DocumentFragment = Element | DocumentFragment>(strings: TemplateStringsArray | string[] | string, ...values: (string | number | Node | null | EmmetCallback<IEmmetSlot> | Promise<string | number | Node | null | undefined> | undefined)[]): ISlottedEmmet<T, Document> {
    const o = emmetSlots<T, Document>(strings);
    if (!values || values.length == 0) {
        return o;
    }

    const slots = o.slots;
    const doc = o.doc;
    let n = -1;
    for (const v of values) {
        n += 1;
        const slotsn = slots[n];
        if (v === undefined || v === null || v === "" || !slotsn) {
            continue;
        }
        const elems = Array.isArray(slotsn) ? slotsn : [slotsn];
        if (typeof v === "function") {
            const c = elems.length;
            let i = 0;
            for (const e of elems) {
                const ie = contentToNode(doc, v(n, i, c, e));
                i += 1;
                if (ie) {
                    e.appendChild(ie);
                }
            }
        } else if (typeof v === "object" && (v as Promise<string | number | Node | null | undefined>).then) {
            (v as Promise<string | number | Node | null | undefined>).then((v) => {
                if (v === null || v === undefined || v === "") {
                    return;
                }
                const c = elems.length;
                for (let i = 0; i < c;) {
                    const e = elems[i++];
                    if (e.childNodes.length == 0) {
                        if (typeof v === "object") {
                            e.appendChild(i == c ? v : v.cloneNode(true));
                        } else {
                            e.textContent = v.toString();
                        }
                    }
                }
            });
            continue;
        } else {
            let i = 0;
            const c = elems.length;
            for (const e of elems) {
                i += 1;
                if (e.childNodes.length == 0 && v !== null && v !== undefined && v !== "") {
                    if (typeof v === "object") {
                        e.appendChild(i == c ? (v as Node) : (v as Node).cloneNode(true));
                    } else {
                        e.textContent = v.toString();
                    }
                }
            }
        }
    }

    return o;
}

/**
 * Parses the emmet string or template string array and returns the root element.
 * The actual type in the returned value depends on the `strings` parameter and the default document.
 * 
 * @template T the type of the root element, defaults to `Element | DocumentFragment`
 * @param {TemplateStringsArray | string[] | string} strings segments of the emmet string
 * @param {(string | number | Node | null | EmmetCallback<Element | DocumentFragment> | undefined)[]} values values to replace the slots with
 * @returns {T} the root element
 */
export function emmet<T extends Element | DocumentFragment = Element | DocumentFragment>(strings: TemplateStringsArray | string[] | string, ...values: (string | number | Node | null | EmmetCallback<Element | DocumentFragment> | undefined)[]): T {
    const { doc, root, slots } = emmetSlots<T>(strings);
    if (!values || values.length == 0) {
        return root as T;
    }
    for (let n = 0; n < values.length; n++) {
        const slotn = slots[n];
        if (!slotn) {
            continue;
        }
        const ab = Array.isArray(slotn) ? slotn : [slotn];
        const al = ab.length;
        const v = values[n];
        if (v === undefined || v === null || v === "") {
            for (const a of ab) {
                a.remove();
            }
        } else if (typeof v === "function") {
            let i = 0;
            for (const a of ab) {
                const par = a.parentNode as Element | DocumentFragment;
                const ie = contentToNode(doc, v(n, i++, al, par));
                if (!ie) {
                    a.remove();
                } else {
                    par.replaceChild(ie, a);
                }
            }
            continue;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const node = contentToNode(doc, v)!;
            for (let i = 0; i < al;) {
                const a = ab[i++];
                const par = a.parentNode as Element | DocumentFragment;
                par.replaceChild(i == al ? node : node.cloneNode(true), a);
            }
        }
    }
    return root as T;
}

function contentToNode(doc: Document, content: string | number | Node | null | undefined): Node | undefined {
    if (content === undefined || content === null || content === "") {
        return undefined;
    }
    return typeof content == "number" ? doc.createTextNode(content.toString())
        : typeof content == "string"
            ? doc.createTextNode(content)
            : content;
}


function parseEmmet(doc: Document, strings: readonly string[]): Element | DocumentFragment {
    if (!strings || strings.length == 0) {
        throw new Error("expected emmet input");
    }
    const groups: [DocumentFragment | Element | undefined, DocumentFragment | Element | undefined][] = [];
    let base: DocumentFragment | Element | undefined = undefined;
    let curr: DocumentFragment | Element | undefined = undefined;
    let attachTo: DocumentFragment | Element | undefined = undefined;
    let xp = 0;
    let string = strings[0];
    let nsaware = false;
    let prevLen: number;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        prevLen = string.length;
        let end = string.search(/[^\p{L}\p{N}:_-]/u);
        if (end === -1) {
            if (!string) {
                xp += 1;
                if (xp < strings.length) {
                    string = strings[xp];
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const added: Element = curr!.appendChild(doc.createElement("emmet-slot"));
                    added.setAttribute("n", (xp - 1).toString());
                    curr = added;
                    continue;
                }
                break;
            }
            end = string.length;
        }
        if (end === 0) {
            if (string.startsWith("(")) {
                groups.push([base, curr]);
                string = string.substring(1);
                base = undefined;
                curr = undefined;
                continue;
            }
            if (string.startsWith(")") && groups.length && base) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const [oldBase, oldCurr] = groups.pop()!;
                curr = base;
                attachTo = oldCurr;
                base = oldBase;
                string = string.substring(1);
            } else if (!curr) {
                throw new Error("unexpected character in emmet");
            }
        } else {
            const tag = string.substring(0, end);
            let ns: null | string = null;
            const pfxlen = tag.indexOf(":");
            if (pfxlen != -1 && !nsaware) {
                nsaware = true;
            }
            const pfx = pfxlen == -1 ? null : tag.substring(0, pfxlen);
            const xmlnsOverride = pfx ? "xmlns:" + pfx : "xmlns";
            if (nsaware && curr) {
                ns = curr.lookupNamespaceURI(pfx);
            } 
            const elem: Element = doc.createElementNS(ns, tag);
            if (!curr) {
                base = elem;
            } else {
                curr.appendChild(elem);
            }
            curr = elem;
            if (string.length == end) {
                xp += 1;
                if (xp < strings.length) {
                    throw new Error("unexpected varaible slot " + xp);
                }
                break;
            }
            string = string.substring(end);
            if (string.startsWith("#")) {
                end = string.substring(1).search(/[^\p{L}\p{N}_-]/u) + 1;
                if (end === 0) {
                    end = string.length;
                }
                curr.id = string.substring(1, end);
                string = string.substring(end);
            }
            while (string.startsWith(".")) {
                end = string.substring(1).search(/[^\p{L}\p{N}_-]/u) + 1;
                if (end === 0) {
                    end = string.length;
                }
                curr.classList.add(string.substring(1, end));
                string = string.substring(end);
            }
            while (string.startsWith("[")) {
                string = string.substring(1);
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const mid = string.search(/[=\] ]/);
                    if (mid === -1) {
                        throw new Error("eof in emmet attribute");
                    }
                    const name = string.substring(0, mid);
                    const oc = string.charAt(mid);
                    if (oc === "=") {
                        let off;
                        if (string.charAt(mid + 1) == "\"") {
                            string = string.substring(mid + 2);
                            end = string.indexOf("\"");
                            if (end === -1) {
                                throw new Error("eof in emmet attribute value");
                            }
                            off = 1;
                        } else {
                            string = string.substring(mid + 1);
                            end = string.search(/[\] ]/);
                            if (end === -1) {
                                throw new Error("eof in emmet attribute value");
                            }
                            off = 0;
                        }
                        const val = string.substring(0, end);
                        end += off;
                        const c = string.charAt(end);
                        string = string.substring(end + 1);
                        if (name == xmlnsOverride) {
                            nsaware = true;
                            const nselem: Element = doc.createElementNS(val, curr.tagName);
                            for (const a of curr.attributes) {
                                nselem.setAttributeNS(a.namespaceURI, a.name, a.value);
                            }
                            if (base == curr) {
                                base = nselem;
                            } else {
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                const p = curr.parentNode!;
                                p.removeChild(curr);
                                p.appendChild(nselem);
                            }
                            curr = nselem;
                        }
                        if (name == "xmlns" || name.startsWith("xmlns:")) {
                            curr.setAttributeNS("http://www.w3.org/2000/xmlns/", name, val);
                        } else {
                            const nsp = name.indexOf(":");
                            const ns = nsp == -1 ? null : curr.lookupNamespaceURI(name.substring(0, nsp));
                            if (ns) {
                                curr.setAttributeNS(ns, name, val);
                            } else {
                                curr.setAttribute(name, val);
                            }
                        }
                        if (c == " ") {
                            continue;
                        }
                        if (c == "]") {
                            break;
                        }
                        throw new Error("expected end or space after emmet attribute value");
                    } else {
                        string = string.substring(mid + 1);
                        curr.setAttribute(name, "");
                        if (oc == " ") {
                            continue;
                        }
                        if (oc == "]") {
                            break;
                        }
                        throw new Error("expected eq, end, or space after emmet attribute name");
                    }
                }
            }
            while (string.startsWith("{")) {
                end = string.indexOf("}");
                if (end === -1) {
                    throw new Error("eof in emmet content");
                }
                curr.appendChild(doc.createTextNode(string.substring(1, end)));
                string = string.substring(end + 1);
            }
        }
        if (string == "" && (xp + 1) == strings.length) {
            if (attachTo) {
                attachTo.appendChild(curr);
                attachTo = undefined;
            }
            break;
        }
        
        if (string.startsWith("*")) {
            let mid = string.substring(1).search(/[^0-9]/);
            if (mid == -1) {
                mid = string.length - 1;
            }
            if (mid == 0) {
                throw new Error("no number in emmet multiplication");
            }
            const count = parseInt(string.substring(1, mid + 1));
            if (count == 0) {
                throw new Error("zero multiplication not allowed");
            }
            if (count != 1) {
                const par = doc.createDocumentFragment();
                for (let i = 1; i < count; i++) {
                    par.appendChild(curr.cloneNode(true) as Element | DocumentFragment);
                }
                const currPar = curr.parentNode as DocumentFragment | Element | null;
                par.appendChild(curr);
                if (attachTo) {
                    attachTo.appendChild(par);
                    attachTo = undefined;
                } else if (currPar) {
                    currPar.appendChild(par);
                } else {
                    base = par;
                }
            } else if (attachTo) {
                attachTo.appendChild(curr);
                attachTo = undefined;
            }
            string = string.substring(mid + 1);

            if (string == "" && (xp + 1) == strings.length) {
                break;
            }
        }
        if (attachTo) {
            attachTo.appendChild(curr);
            attachTo = undefined;
        }
        if (string.startsWith(">")) {
            string = string.substring(1);
            continue;
        }
        if (string.startsWith("^")) {
            if (curr.parentNode) {
                curr = curr.parentNode as DocumentFragment | Element;
            } else {
                throw new Error("invalid depth");
            }
            while (string.startsWith("^")) {
                if (curr.parentNode) {
                    curr = curr.parentNode as DocumentFragment | Element;
                } else if (curr.nodeType === 11) {
                    throw new Error("invalid depth");
                } else {
                    base = doc.createDocumentFragment();
                    base.appendChild(curr);
                    curr = base;
                }
                string = string.substring(1);
            }
            continue;
        }
        if (string.startsWith("+")) {
            if (curr.parentNode) {
                curr = curr.parentNode as DocumentFragment | Element | undefined;
            } else {
                base = doc.createDocumentFragment();
                base.appendChild(curr);
                curr = base;
            }
            string = string.substring(1);
            continue;
        }
        if (prevLen == string.length) {
            throw new Error("unexpected character in emmet: " + string.charAt(0));
        }
    }

    if (groups.length) {
        throw new Error("unexpected eof, emmet expected group end");
    }
    if (!curr) {
        throw new Error("unexpected eof, no content found");
    }
    if (!base) {
        base = curr;
    }

    return base as DocumentFragment | Element;
}
