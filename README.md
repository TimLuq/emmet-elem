# emmet-elem

A small standalone library (~2k gzipped) containing the logic behind parsing Emmet syntax and building a caching DOM tree.

The provided functions are `emmetSlots(strings, options = undefined)`, `slotted(template, ...nodeData)`, and `emmet(template, ...nodeData)`.

For the `slotted` and `emmet` functions to be compatible with template literal syntax, those are unable to contain options.
As the `options` object is used to specify the document and cache to use for creating `Node`s, there exists an extra function with global side-effects `setDefDoc(document)` that controls which document will be used by default.

## `emmet` function

The `emmet` function will apply any parameters before returning an `Element` or `DocumentFragment` node expanded from the string.

Example 1.1:
```js
const root = emmet`(a#a>(b.clss+c)*3)+d+e>${4 * 2}`;

assert(() => serializeToString(root) == [
    `<a id="a">`,
    `<b class="clss" /><c />`,
    `<b class="clss" /><c />`,
    `<b class="clss" /><c />`,
    `</a><d /><e>8</e>`
].join(""));
```

Example 1.2:
```js
const root = emmet`(a#a>(b.clss>${
    (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
}*2^c>${
    (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
})*3)+d+e>${4 * 1}`;

assert(() => serializeToString(root) == [
    `<a id="a">`,
    `<b class="clss">0&lt;0/6&gt;0&lt;1/6&gt;</b><c>1&lt;0/3&gt;</c>`,
    `<b class="clss">0&lt;2/6&gt;0&lt;3/6&gt;</b><c>1&lt;1/3&gt;</c>`,
    `<b class="clss">0&lt;4/6&gt;0&lt;5/6&gt;</b><c>1&lt;2/3&gt;</c>`,
    `</a><d /><e>4</e>`
].join(""));
```


## `slotted` function

The `slotted` function will insert the special node `emmet-slot` at each parameter location and fill those with the given value before returning an `Element` or `DocumentFragment` node wrapped together with a list of slots.

Example 2.1:
```js
const { root, slots } = slotted`(a#a>(b.clss+c)*3)+d+e>${4 * 1}`;
slots[0].textNode = "8";

assert(() => serializeToString(root) == [
    `<a id="a">`,
    `<b class="clss">0&lt;0/6&gt;0&lt;1/6&gt;</b><c>1&lt;0/3&gt;</c>`,
    `<b class="clss">0&lt;2/6&gt;0&lt;3/6&gt;</b><c>1&lt;1/3&gt;</c>`,
    `<b class="clss">0&lt;4/6&gt;0&lt;5/6&gt;</b><c>1&lt;2/3&gt;</c>`,
    `</a><d /><e>8</e>`
].join(""));
```

