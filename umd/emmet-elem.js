var t,e;t=this,e=function(t){const e=new Map;let n;function r(t,r){const s=n||("undefined"==typeof document?void 0:document),l=r?.doc||s,c=r?.cache||(l==s?e:void 0);t=o(t)?t.raw:t;let a=c?.get(t);a||(a=i(l,"string"!=typeof t?t:[t]),c?.set(t,a));const f=a.cloneNode(!0),d={length:0};if("string"==typeof t||t.length<2)return{doc:l,root:f,slots:d};for(const t of f.querySelectorAll("emmet-slot")){const e=parseInt(t.getAttribute("n")),n=d[e];d.length<=e&&(d.length=e+1),n?Array.isArray(n)?n.push(t):d[e]=[n,t]:d[e]=t}return{doc:l,root:f,slots:d}}function o(t){return Array.isArray(t.raw)}function s(t,e){if(null!=e&&""!==e)return"number"==typeof e?t.createTextNode(e.toString()):"string"==typeof e?t.createTextNode(e):e}function i(t,e){if(!e||0==e.length)throw Error("expected emmet input");const n=[];let r,o,s,i=0,l=e[0],c=!1;for(;;){let a=l.search(/[^\p{L}\p{N}:_-]/u);if(-1===a){if(!l){if(i+=1,i<e.length){l=e[i];const n=o.appendChild(t.createElement("emmet-slot"));n.setAttribute("n",""+(i-1)),o=n;continue}break}a=l.length}if(0===a){if(l.startsWith("(")){n.push([r,o]),l=l.substring(1),r=void 0,o=void 0;continue}if(l.startsWith(")")&&n.length&&r){const[t,e]=n.pop();o=r,s=e,r=t,l=l.substring(1)}else if(!o)throw Error("unexpected character in emmet")}else{const n=l.substring(0,a);let s=null;const f=n.indexOf(":");-1==f||c||(c=!0);const d=-1==f?null:n.substring(0,f),u=d?"xmlns:"+d:"xmlns";c&&o&&(s=o.lookupNamespaceURI(d));const p=t.createElementNS(s,n);if(o?o.appendChild(p):r=p,o=p,l.length==a){if(i+=1,i<e.length)throw Error("unexpected varaible slot "+i);break}for(l=l.substring(a),l.startsWith("#")&&(a=l.substring(1).search(/[^\p{L}\p{N}_-]/u)+1,0===a&&(a=l.length),o.id=l.substring(1,a),l=l.substring(a));l.startsWith(".");)a=l.substring(1).search(/[^\p{L}\p{N}_-]/u)+1,0===a&&(a=l.length),o.classList.add(l.substring(1,a)),l=l.substring(a);for(;l.startsWith("[");)for(l=l.substring(1);;){const e=l.search(/[=\] ]/);if(-1===e)throw Error("eof in emmet attribute");const n=l.substring(0,e),s=l.charAt(e);if("="===s){let s;if('"'==l.charAt(e+1)){if(l=l.substring(e+2),a=l.indexOf('"'),-1===a)throw Error("eof in emmet attribute value");s=1}else{if(l=l.substring(e+1),a=l.search(/[\] ]/),-1===a)throw Error("eof in emmet attribute value");s=0}const i=l.substring(0,a);a+=s;const f=l.charAt(a);if(l=l.substring(a+1),n==u){c=!0;const e=t.createElementNS(i,o.tagName);for(const t of o.attributes)e.setAttributeNS(t.namespaceURI,t.name,t.value);if(r==o)r=e;else{const t=o.parentNode;t.removeChild(o),t.appendChild(e)}o=e}if("xmlns"==n||n.startsWith("xmlns:"))o.setAttributeNS("http://www.w3.org/2000/xmlns/",n,i);else{const t=n.indexOf(":"),e=-1==t?null:o.lookupNamespaceURI(n.substring(0,t));e?o.setAttributeNS(e,n,i):o.setAttribute(n,i)}if(" "==f)continue;if("]"==f)break;throw Error("expected end or space after emmet attribute value")}if(l=l.substring(e+1),o.setAttribute(n,"")," "!=s){if("]"==s)break;throw Error("expected eq, end, or space after emmet attribute name")}}for(;l.startsWith("{");){if(a=l.indexOf("}"),-1===a)throw Error("eof in emmet content");o.appendChild(t.createTextNode(l.substring(1,a))),l=l.substring(a+1)}}if(""==l&&i+1==e.length){s&&(s.appendChild(o),s=void 0);break}if(l.startsWith("*")){let n=l.substring(1).search(/[^0-9]/);if(-1==n&&(n=l.length-1),0==n)throw Error("no number in emmet multiplication");const c=parseInt(l.substring(1,n+1));if(0==c)throw Error("zero multiplication not allowed");if(1!=c){const e=t.createDocumentFragment();for(let t=1;t<c;t++)e.appendChild(o.cloneNode(!0));const n=o.parentNode;e.appendChild(o),s?(s.appendChild(e),s=void 0):n?n.appendChild(e):r=e}else s&&(s.appendChild(o),s=void 0);if(l=l.substring(n+1),""==l&&i+1==e.length)break}if(s&&(s.appendChild(o),s=void 0),l.startsWith(">"))l=l.substring(1);else if(l.startsWith("^")){if(!o.parentNode)throw Error("invalid depth");for(o=o.parentNode;l.startsWith("^");){if(o.parentNode)o=o.parentNode;else{if(11===o.nodeType)throw Error("invalid depth");r=t.createDocumentFragment(),r.appendChild(o),o=r}l=l.substring(1)}}else l.startsWith("+")&&(o.parentNode?o=o.parentNode:(r=t.createDocumentFragment(),r.appendChild(o),o=r),l=l.substring(1))}if(n.length)throw Error("unexpected eof, emmet expected group end");if(!o)throw Error("unexpected eof, no content found");return r||(r=o),r}t.emmet=function(t,...e){const{doc:n,root:o,slots:i}=r(t);if(!e||0==e.length)return o;for(let t=0;t<e.length;t++){const r=i[t];if(!r)continue;const o=Array.isArray(r)?r:[r],l=o.length,c=e[t];if(null==c||""===c)for(const t of o)t.remove();else{if("function"==typeof c){let e=0;for(const r of o){const o=r.parentNode,i=s(n,c(t,e++,l,o));i?o.replaceChild(i,r):r.remove()}continue}{const t=s(n,c);for(let e=0;e<l;){const n=o[e++];n.parentNode.replaceChild(e==l?t:t.cloneNode(!0),n)}}}}return o},t.emmetSlots=r,t.setDefDoc=function(t){n=t,e.clear()},t.slotted=function(t,...e){const n=r(t);if(!e||0==e.length)return n;const o=n.slots,i=n.doc;let l=-1;for(const t of e){l+=1;const e=o[l];if(null==t||""===t||!e)continue;const n=Array.isArray(e)?e:[e];if("function"==typeof t){const e=n.length;let r=0;for(const o of n){const n=s(i,t(l,r,e,o));r+=1,n&&o.appendChild(n)}}else{if("object"==typeof t&&t.then){t.then((t=>{if(null==t||""===t)return;const e=n.length;for(let r=0;r<e;){const o=n[r++];0==o.childNodes.length&&("object"==typeof t?o.appendChild(r==e?t:t.cloneNode(!0)):o.textContent=t.toString())}}));continue}{let e=0;const r=n.length;for(const o of n)e+=1,0==o.childNodes.length&&null!=t&&""!==t&&("object"==typeof t?o.appendChild(e==r?t:t.cloneNode(!0)):o.textContent=t.toString())}}}return n}},"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).emmetElem={});
//# sourceMappingURL=emmet-elem.js.map
