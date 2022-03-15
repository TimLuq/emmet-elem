/**
 * A slot in the generated emmet structure.
 * Although this is an element, use only the methods and properties that manipulate its children.
 */
export class EmmetSlot extends HTMLElement {
    public connectedCallback() {
        const s = this.style;
        if (!s.display) {
            s.display = "contents";
        }
    }
}

if (typeof customElements == "object") {
    customElements.define("emmet-slot", EmmetSlot);
}
