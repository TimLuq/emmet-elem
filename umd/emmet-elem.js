!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).emmetElem={})}(this,(function(t){"use strict";const e=new Map;let n;function r(t,r){const i=n||("undefined"==typeof document?void 0:document),l=r?.doc||i,c=r?.cache||(l==i?e:void 0);t=o(t)?t.raw:t;let f=c?.get(t);f||(f=s(l,"string"!=typeof t?t:[t]),c?.set(t,f));const a=f.cloneNode(!0),d={length:0};if("string"==typeof t||t.length<2)return{doc:l,root:a,slots:d};for(const t of a.querySelectorAll("emmet-slot")){const e=parseInt(t.getAttribute("n")),n=d[e];d.length<=e&&(d.length=e+1),n?Array.isArray(n)?n.push(t):d[e]=[n,t]:d[e]=t}return{doc:l,root:a,slots:d}}function o(t){return Array.isArray(t.raw)}function i(t,e){if(null!=e&&""!==e)return"number"==typeof e?t.createTextNode(e.toString()):"string"==typeof e?t.createTextNode(e):e}function s(t,e){if(!e||0==e.length)throw Error("expected emmet input");const n=[];let r,o,i,s=0,l=e[0];for(;;){let c=l.search(/[^a-z-]/);if(-1===c){if(!l){if(s+=1,s<e.length){l=e[s];const n=o.appendChild(t.createElement("emmet-slot"));n.setAttribute("n",""+(s-1)),o=n;continue}break}c=l.length}if(0===c){if(l.startsWith("(")){n.push([r,o]),l=l.substring(1),r=void 0,o=void 0;continue}if(l.startsWith(")")&&n.length&&r){const[t,e]=n.pop();o=r,i=e,r=t,l=l.substring(1)}else if(!o)throw Error("unexpected character in emmet")}else{const n=l.substring(0,c),i=t.createElement(n);if(o?o.appendChild(i):r=i,o=i,l.length==c){if(s+=1,s<e.length)throw Error("unexpected varaible slot "+s);break}for(l=l.substring(c),l.startsWith("#")&&(c=l.search(/[^a-zA-Z0-9_#-]/),-1===c&&(c=l.length),o.id=l.substring(1,c),l=l.substring(c));l.startsWith(".");)c=l.substring(1).search(/[^a-zA-Z0-9_-]/)+1,0===c&&(c=l.length),o.classList.add(l.substring(1,c)),l=l.substring(c);for(;l.startsWith("[");)for(l=l.substring(1);;){const t=l.search(/[=\] ]/);if(-1===t)throw Error("eof in emmet attribute");const e=l.substring(0,t),n=l.charAt(t);if("="===n){let n;if('"'==l.charAt(t+1)){if(l=l.substring(t+2),c=l.indexOf('"'),-1===c)throw Error("eof in emmet attribute value");n=1}else{if(l=l.substring(t+1),c=l.search(/[\] ]/),-1===c)throw Error("eof in emmet attribute value");n=0}const r=l.substring(0,c);c+=n;const i=l.charAt(c);if(l=l.substring(c+1),o.setAttribute(e,r)," "==i)continue;if("]"==i)break;throw Error("expected end or space after emmet attribute value")}if(l=l.substring(t+1),o.setAttribute(e,"")," "!=n){if("]"==n)break;throw Error("expected end or space after emmet attribute value")}}for(;l.startsWith("{");){if(c=l.indexOf("}"),-1===c)throw Error("eof in emmet content");o.appendChild(t.createTextNode(l.substring(1,c))),l=l.substring(c+1)}}if(""==l&&s+1==e.length){i&&(i.appendChild(o),i=void 0);break}if(l.startsWith("*")){let n=l.substring(1).search(/[^0-9]/);if(-1==n&&(n=l.length-1),0==n)throw Error("no number in emmet multiplication");const c=parseInt(l.substring(1,n+1));if(0==c)throw Error("zero multiplication not allowed");if(1!=c){const e=t.createDocumentFragment();for(let t=1;t<c;t++)e.appendChild(o.cloneNode(!0));const n=o.parentNode;e.appendChild(o),i?(i.appendChild(e),i=void 0):n?n.appendChild(e):r=e}else i&&(i.appendChild(o),i=void 0);if(l=l.substring(n+1),""==l&&s+1==e.length)break}if(i&&(i.appendChild(o),i=void 0),l.startsWith(">"))l=l.substring(1);else if(l.startsWith("^")){if(!o.parentNode)throw Error("invalid depth");for(o=o.parentNode;l.startsWith("^");){if(o.parentNode)o=o.parentNode;else{if(11===o.nodeType)throw Error("invalid depth");r=t.createDocumentFragment(),r.appendChild(o),o=r}l=l.substring(1)}}else l.startsWith("+")&&(o.parentNode?o=o.parentNode:(r=t.createDocumentFragment(),r.appendChild(o),o=r),l=l.substring(1))}if(n.length)throw Error("unexpected eof, emmet expected group end");if(!o)throw Error("unexpected eof, no content found");return r||(r=o),r}t.emmet=function(t,...e){const{doc:n,root:o,slots:s}=r(t);if(!e||0==e.length)return o;for(let t=0;t<e.length;t++){const r=s[t];if(!r)continue;const o=Array.isArray(r)?r:[r],l=o.length,c=e[t];if(null==c||""===c)for(const t of o)t.remove();else{if("function"==typeof c){let e=0;for(const r of o){const o=r.parentNode,s=i(n,c(t,e++,l,o));s?o.replaceChild(s,r):r.remove()}continue}{const t=i(n,c);for(let e=0;e<l;){const n=o[e++];n.parentNode.replaceChild(e==l?t:t.cloneNode(!0),n)}}}}return o},t.emmetSlots=r,t.setDefDoc=function(t){n=t,e.clear()},t.slotted=function(t,...e){const n=r(t);if(!e||0==e.length)return n;const o=n.slots,s=n.doc;let l=-1;for(const t of e){l+=1;const e=o[l];if(null==t||""===t||!e)continue;const n=Array.isArray(e)?e:[e];if("function"==typeof t){const e=n.length;let r=0;for(const o of n){const n=i(s,t(l,r,e,o));r+=1,n&&o.appendChild(n)}}else{if("object"==typeof t&&t.then){t.then((t=>{if(null==t||""===t)return;const e=n.length;for(let r=0;r<e;){const o=n[r++];0==o.childNodes.length&&("object"==typeof t?o.appendChild(r==e?t:t.cloneNode(!0)):o.textContent=t.toString())}}));continue}{let e=0;const r=n.length;for(const o of n)e+=1,0==o.childNodes.length&&null!=t&&""!==t&&("object"==typeof t?o.appendChild(e==r?t:t.cloneNode(!0)):o.textContent=t.toString())}}}return n},Object.defineProperty(t,"__esModule",{value:!0})}));
//# sourceMappingURL=emmet-elem.js.map
