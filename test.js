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


const testEnv = {
    test_simple(assert) {
        let res = slotted`(a>(b>bi*2^c>ci)*3)+d{4}`;
        
        assert(() => res.slots.length == 0);
        assert(() => res.doc == doc);
        assert(() => res.root.nodeType == 11);
        assert(() => res.root.childNodes.length == 2);

        assert(() => res.root.firstChild.tagName == "a");
        assert(() => res.root.firstChild.childNodes.length == 6);
        
        assert(() => res.root.lastChild.tagName == "d");
        assert(() => res.root.lastChild.textContent == "4");
    },

    test_slotted_simple(assert) {
        let res = slotted`a>${1}+${2}`;
        
        assert(() => res.slots.length == 2);
        assert(() => res.doc == doc);
        assert(() => res.root.nodeType == 1);
        assert(() => res.root.tagName == "a");
        assert(() => res.root.childNodes.length == 2);

        assert(() => res.root.firstChild.tagName == "emmet-slot");
        assert(() => res.root.firstChild.textContent == "1");
        
        assert(() => res.root.lastChild.tagName == "emmet-slot");
        assert(() => res.root.lastChild.textContent == "2");
    },

    test_slotted(assert) {
        const slots = slotted`(a>(b>${
        (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
        }*2^c>${
        (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
        })*3)+d>${4 * 1}`.slots;
        
        assert(() => slots.length == 3);
        assert(() => slots[3] == undefined);
        
        assert(() => Array.isArray(slots[0]) && slots[0].length == 6);
        assert(() => slots[0][0].parentNode.tagName == "b");
        assert(() => slots[0][0].textContent == "0<0/6>");
        assert(() => slots[0][5].textContent == "0<5/6>");
        
        assert(() => Array.isArray(slots[1]) && slots[1].length == 3);
        assert(() => slots[1][0].parentNode.tagName == "c");
        assert(() => slots[1][0].textContent == "1<0/3>");
        assert(() => slots[1][2].textContent == "1<2/3>");
        
        assert(() => !Array.isArray(slots[2]));
        assert(() => slots[2].parentNode.tagName == "d");
        assert(() => slots[2].textContent == "4");
    },

    test_inlined(assert) {
        const root = emmet`(a#a>(b.clss>${
        (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
        }*2^c>${
        (paramId, idx, max) => paramId + "<" + idx + "/" + max + ">"
        })*3)+d+e>${4 * 1}`;

        
        assert(() => eq_joined(serializeToString(root), [
            `<a id="a">`,
            `<b class="clss">0&lt;0/6&gt;0&lt;1/6&gt;</b><c>1&lt;0/3&gt;</c>`,
            `<b class="clss">0&lt;2/6&gt;0&lt;3/6&gt;</b><c>1&lt;1/3&gt;</c>`,
            `<b class="clss">0&lt;4/6&gt;0&lt;5/6&gt;</b><c>1&lt;2/3&gt;</c>`,
            `</a><d /><e>4</e>`
        ]));
    },

    test_static(assert) {
        const root = emmet`main.main-content[role=main]>div#list.page-1a+test-elem111#seldoc.page-1a+span#v404.page-1a+span#v500.page-1a^span#snack`;

        assert(() => eq_joined(serializeToString(root), [
            `<main class="main-content" role="main">`,
            `<div id="list" class="page-1a" />`,
            `<test-elem111 id="seldoc" class="page-1a" />`,
            `<span id="v404" class="page-1a" />`,
            `<span id="v500" class="page-1a" />`,
            `</main>`,
            `<span id="snack" />`
        ]));
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


function run(assert) {
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
            item.call(item, (a) => assert(a));
            su += 1;
        } catch (e) {
            fa += 1;
            console.error("test %s failed:\n  %s", JSON.stringify(test), e.message);
        }
    }
    console.log("\n%i tests succeeded, %i tests failed", su, fa);
    if (fa) {
        throw "One or more tests failed."
    }
}

run((a) => {
    if (!a()) {
        const s = a.toString().replace(/^[^>\{]*?>?/, "").trim();
        throw new Error("assertion failed: " + JSON.stringify(s));
    }
});
