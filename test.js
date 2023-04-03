import {slotted, setDefDoc, emmet} from "./emmet-elem.js";
import { createDocument } from "fallback-dom";
import { serializeToString } from "fallback-dom/xml-serializer.js";

let doc;

if (typeof document != "object" || document.nodeType != 9) {
    doc = createDocument();
    setDefDoc(doc);
} else {
    doc = document;
}

/**
 * @type {Record<string, (assert: Assert) => void>}
 */
const testEnv = {
    test_simple(assert) {
        const res = slotted`(a>(b>bi*2^c>ci)*3)+d{4}`;
        
        assert.eq(res.slots.length, 0);
        assert.eq(res.doc, doc);
        assert.eq(res.root.nodeType, 11);
        assert.eq(res.root.childNodes.length, 2);

        assert.eq(res.root.firstChild.tagName, "a");
        assert.eq(res.root.firstChild.childNodes.length, 6);
        
        assert.eq(res.root.lastChild.tagName, "d");
        assert.eq(res.root.lastChild.textContent, "4");
    },

    test_slotted_simple(assert) {
        const res = slotted`a>${1}+${2}`;
        
        assert.eq(res.slots.length, 2);
        assert.eq(res.doc, doc);
        assert.eq(res.root.nodeType, 1);
        assert.eq(res.root.tagName, "a");
        assert.eq(res.root.childNodes.length, 2);

        assert.eq(res.root.firstChild.tagName, "emmet-slot");
        assert.eq(res.root.firstChild.textContent, "1");
        
        assert.eq(res.root.lastChild.tagName, "emmet-slot");
        assert.eq(res.root.lastChild.textContent, "2");
    },

    test_slotted(assert) {
        const slots = slotted`(a>(b>${
        (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
        }*2^c>${
        (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
        })*3)+d>${4 * 1}`.slots;
        
        assert.eq(slots.length, 3);
        assert.eq(slots[3], undefined);
        
        assert.assert(() => Array.isArray(slots[0]));
        assert.eq(slots[0].length, 6);
        assert.eq(slots[0][0].parentNode.tagName, "b");
        assert.eq(slots[0][0].textContent, "0<0/6>");
        assert.eq(slots[0][5].textContent, "0<5/6>");
        
        assert.assert(() => Array.isArray(slots[1]));
        assert.eq(slots[1].length, 3);
        assert.eq(slots[1][0].parentNode.tagName, "c");
        assert.eq(slots[1][0].textContent, "1<0/3>");
        assert.eq(slots[1][2].textContent, "1<2/3>");
        
        assert.assert(() => !Array.isArray(slots[2]));
        assert.eq(slots[2].parentNode.tagName, "d");
        assert.eq(slots[2].textContent, "4");
    },

    test_inlined(assert) {
        const root = emmet`(a#a>(b.clss>${
        (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
        }*2^c>${
        (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
        })*3)+d+e>${4 * 1}`;

        
        assert.assert(() => eq_joined(serializeToString(root), [
            `<a id="a">`,
            `<b class="clss">0&lt;0/6&gt;0&lt;1/6&gt;</b><c>1&lt;0/3&gt;</c>`,
            `<b class="clss">0&lt;2/6&gt;0&lt;3/6&gt;</b><c>1&lt;1/3&gt;</c>`,
            `<b class="clss">0&lt;4/6&gt;0&lt;5/6&gt;</b><c>1&lt;2/3&gt;</c>`,
            `</a><d/><e>4</e>`
        ]));
    },

    test_static(assert) {
        const root = emmet`main.main-content[role=main]>div#list.page-1a+test-elem111#seldoc.page-1a+span#v404.page-1a+span#v500.page-1a^span#snack`;

        assert.assert(() => eq_joined(serializeToString(root), [
            `<main class="main-content" role="main">`,
            `<div id="list" class="page-1a"/>`,
            `<test-elem111 id="seldoc" class="page-1a"/>`,
            `<span id="v404" class="page-1a"/>`,
            `<span id="v500" class="page-1a"/>`,
            `</main>`,
            `<span id="snack"/>`
        ]));
    },

    test_namespace(assert) {
        const root = emmet`main>svg[xmlns=http://www.w3.org/2000/svg]>circle[fill=red r=50 cx=50 cy=50]^svg:svg[xmlns:svg=http://www.w3.org/2000/svg]>svg:circle#a[fill=red r=50 cx=50 cy=50 xmlns:xlink=http://www.w3.org/1999/xlink xlink:href="#a"]`;
        const seri = serializeToString(root);
        assert.assert(() => eq_joined(seri, [
            `<main>`,
            `<svg xmlns="http://www.w3.org/2000/svg"><circle fill="red" r="50" cx="50" cy="50"/></svg>`,
            `<svg:svg xmlns:svg="http://www.w3.org/2000/svg">`,
            `<svg:circle id="a" fill="red" r="50" cx="50" cy="50" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#a"/>`,
            `</svg:svg></main>`
        ]));
    },

    
    test_throw_late_id(assert) {
        try {
            emmet`a>b.a#id>c`;
        } catch (error) {
            assert.eq(error.message, "unexpected character in emmet: #");
            return;
        }
        throw new Error("should throw due to invalid character");
    },
    test_throw_empty(assert) {
        try {
            emmet``;
        } catch (e) {
            assert.eq(e.message, "unexpected eof, no content found");
            return;
        }
        throw new Error("should throw due to empty string");
    },
    test_throw_unclosed_brace(assert) {
        try {
            emmet`x{test`;
        } catch (e) {
            assert.eq(e.message, "eof in emmet content");
            return;
        }
        throw new Error("eof in emmet content");
    },
    test_throw_extra_char(assert) {
        try {
            emmet`x{test}}`;
        } catch (e) {
            assert.eq(e.message, "unexpected character in emmet: }");
            return;
        }
        throw new Error("should throw due to extra char");
    },
}

function eq_joined(data, ref) {
    for (let i = 0; i < ref.length; i++) {
        if (data.startsWith(ref[i])) {
            data = data.substring(ref[i].length);
            continue;
        }
        console.warn("  part failed: ", JSON.stringify(data), ".startsWith(", JSON.stringify(ref[i]), ")");
        return false;
    }
    return data.length == 0;
}

/**
 * @param {Assert} assert 
 */
async function run() {
    let su = 0;
    let fa = 0;
    for (const test of Object.keys(testEnv)) {
        if (!test.startsWith("test_")) {
            console.log("skipping " + test)
            continue;
        }
        const item = testEnv[test];
        if (typeof item != "function") {
            console.log("skipping " + test)
            continue;
        }
        try {
            await item.call(item, new Assert());
            su += 1;
        } catch (e) {
            fa += 1;
            let m = e.message;
            let t;
            if (e instanceof AssertError) {
                if (e.source) {
                    t = e.source.stack.split("\n");
                } else {
                    t = e.stack.split("\n");
                    t.shift();
                }
            } else {
                t = e.stack.split("\n");
            }
            t.shift();
            t = t.shift().trim().replace(/^.*\(([^)]*?:\d+)(?::\d+)?\)/, "$1").trim();
            m += " (" + t + ")";

            console.error("test %s failed:\n  %s", JSON.stringify(test), m);
        }
    }
    console.log("\n%i tests succeeded, %i tests failed", su, fa);
    if (fa) {
        throw "One or more tests failed."
    }
}

class AssertError extends Error {
    /**
     * @param {string} message 
     * @param {undefined | Error} source
     */
    constructor(message, source = undefined) {
        super(message);
        this.name = "AssertError";
        this.source = source;
    }
}

class Assert {
    /**
     * @param {(() => boolean) | boolean} cond condition to check
     * @param {undefined | string} msg optional custom error message
     * @returns {void}
     * @throws {AssertError} if condition is not met
     */
    assert(cond, msg = undefined) {
        if (typeof cond == "function") {
            let res = false;
            try {
                res = cond();
            } catch (e) {
                throw new AssertError("error in assertion: " + JSON.stringify(cond), e);
            }
            if (!res) {
                if (typeof msg !== "string") {
                    msg = cond.toString().replace(/^[^>\{]*?>?/, "").trim();
                }
                throw new AssertError("assertion failed: " + JSON.stringify(msg));
            }
            return;
        }
        if (typeof cond == "boolean") {
            if (!cond) {
                if (typeof msg !== "string") {
                    msg = "condition failed";
                }
                throw new AssertError("assertion failed: " + JSON.stringify(msg));
            }
            return;
        }
        throw new AssertError("assertion failed: error in assertion: " + JSON.stringify(cond));
    }

    eq(actual, expected, msg = undefined) {
        if (actual !== expected) {
            const at = actual === undefined ? "undefined" : JSON.stringify(actual);
            const bt = expected === undefined ? "undefined" : JSON.stringify(expected);
            if (typeof msg !== "string") {
                msg = at + " !== " + bt;
            } else {
                msg = msg.replace(/\$\{actual\}/g, at);
                msg = msg.replace(/\$\{expected\}/g, expected);
            }
            throw new AssertError("assertion failed: " + JSON.stringify(msg));
        }
    }
}
Object.freeze(Assert.prototype);

run();
