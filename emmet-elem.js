const t=new Map;let e;function n(n){e=n,t.clear()}function r(n,r){const s=e||("undefined"==typeof document?void 0:document),i=r?.doc||s,l=r?.cache||(i==s?t:void 0);n=o(n)?n.raw:n;let a=l?.get(n);a||(a=c(i,"string"!=typeof n?n:[n]),l?.set(n,a));const f=a.cloneNode(!0),u={length:0};if("string"==typeof n||n.length<2)return{doc:i,root:f,slots:u};for(const t of f.querySelectorAll("emmet-slot")){const e=parseInt(t.getAttribute("n")),n=u[e];u.length<=e&&(u.length=e+1),n?Array.isArray(n)?n.push(t):u[e]=[n,t]:u[e]=t}return{doc:i,root:f,slots:u}}function o(t){return Array.isArray(t.raw)}function s(t,...e){const n=r(t);if(!e||0==e.length)return n;const o=n.slots,s=n.doc;let i=-1;for(const t of e){i+=1;const e=o[i];if(null==t||""===t||!e)continue;const n=Array.isArray(e)?e:[e];if("function"==typeof t){const e=n.length;let r=0;for(const o of n){const n=l(s,t(i,r,e,o));r+=1,n&&o.appendChild(n)}}else{if("object"==typeof t&&t.then){t.then((t=>{if(null==t||""===t)return;const e=n.length;for(let r=0;r<e;){const o=n[r++];0==o.childNodes.length&&("object"==typeof t?o.appendChild(r==e?t:t.cloneNode(!0)):o.textContent=t.toString())}}));continue}{let e=0;const r=n.length;for(const o of n)e+=1,0==o.childNodes.length&&null!=t&&""!==t&&("object"==typeof t?o.appendChild(e==r?t:t.cloneNode(!0)):o.textContent=t.toString())}}}return n}function i(t,...e){const{doc:n,root:o,slots:s}=r(t);if(!e||0==e.length)return o;for(let t=0;t<e.length;t++){const r=s[t];if(!r)continue;const o=Array.isArray(r)?r:[r],i=o.length,c=e[t];if(null==c||""===c)for(const t of o)t.remove();else{if("function"==typeof c){let e=0;for(const r of o){const o=r.parentNode,s=l(n,c(t,e++,i,o));s?o.replaceChild(s,r):r.remove()}continue}{const t=l(n,c);for(let e=0;e<i;){const n=o[e++];n.parentNode.replaceChild(e==i?t:t.cloneNode(!0),n)}}}}return o}function l(t,e){if(null!=e&&""!==e)return"number"==typeof e?t.createTextNode(e.toString()):"string"==typeof e?t.createTextNode(e):e}function c(t,e){if(!e||0==e.length)throw Error("expected emmet input");const n=[];let r,o,s,i,l=0,c=e[0],a=!1;for(;;){i=c.length;let f=c.search(/[^\p{L}\p{N}:_-]/u);if(-1===f){if(!c){if(l+=1,l<e.length){c=e[l];const n=o.appendChild(t.createElement("emmet-slot"));n.setAttribute("n",""+(l-1)),o=n;continue}break}f=c.length}if(0===f){if(c.startsWith("(")){n.push([r,o]),c=c.substring(1),r=void 0,o=void 0;continue}if(c.startsWith(")")&&n.length&&r){const[t,e]=n.pop();o=r,s=e,r=t,c=c.substring(1)}else if(!o)throw Error("unexpected character in emmet")}else{const n=c.substring(0,f);let s=null;const i=n.indexOf(":");-1==i||a||(a=!0);const u=-1==i?null:n.substring(0,i),d=u?"xmlns:"+u:"xmlns";a&&o&&(s=o.lookupNamespaceURI(u));const h=t.createElementNS(s,n);if(o?o.appendChild(h):r=h,o=h,c.length==f){if(l+=1,l<e.length)throw Error("unexpected varaible slot "+l);break}for(c=c.substring(f),c.startsWith("#")&&(f=c.substring(1).search(/[^\p{L}\p{N}_-]/u)+1,0===f&&(f=c.length),o.id=c.substring(1,f),c=c.substring(f));c.startsWith(".");)f=c.substring(1).search(/[^\p{L}\p{N}_-]/u)+1,0===f&&(f=c.length),o.classList.add(c.substring(1,f)),c=c.substring(f);for(;c.startsWith("[");)for(c=c.substring(1);;){const e=c.search(/[=\] ]/);if(-1===e)throw Error("eof in emmet attribute");const n=c.substring(0,e),s=c.charAt(e);if("="===s){let s;if('"'==c.charAt(e+1)){if(c=c.substring(e+2),f=c.indexOf('"'),-1===f)throw Error("eof in emmet attribute value");s=1}else{if(c=c.substring(e+1),f=c.search(/[\] ]/),-1===f)throw Error("eof in emmet attribute value");s=0}const i=c.substring(0,f);f+=s;const l=c.charAt(f);if(c=c.substring(f+1),n==d){a=!0;const e=t.createElementNS(i,o.tagName);for(const t of o.attributes)e.setAttributeNS(t.namespaceURI,t.name,t.value);if(r==o)r=e;else{const t=o.parentNode;t.removeChild(o),t.appendChild(e)}o=e}if("xmlns"==n||n.startsWith("xmlns:"))o.setAttributeNS("http://www.w3.org/2000/xmlns/",n,i);else{const t=n.indexOf(":"),e=-1==t?null:o.lookupNamespaceURI(n.substring(0,t));e?o.setAttributeNS(e,n,i):o.setAttribute(n,i)}if(" "==l)continue;if("]"==l)break;throw Error("expected end or space after emmet attribute value")}if(c=c.substring(e+1),o.setAttribute(n,"")," "!=s){if("]"==s)break;throw Error("expected eq, end, or space after emmet attribute name")}}for(;c.startsWith("{");){if(f=c.indexOf("}"),-1===f)throw Error("eof in emmet content");o.appendChild(t.createTextNode(c.substring(1,f))),c=c.substring(f+1)}}if(""==c&&l+1==e.length){s&&(s.appendChild(o),s=void 0);break}if(c.startsWith("*")){let n=c.substring(1).search(/[^0-9]/);if(-1==n&&(n=c.length-1),0==n)throw Error("no number in emmet multiplication");const i=parseInt(c.substring(1,n+1));if(0==i)throw Error("zero multiplication not allowed");if(1!=i){const e=t.createDocumentFragment();for(let t=1;t<i;t++)e.appendChild(o.cloneNode(!0));const n=o.parentNode;e.appendChild(o),s?(s.appendChild(e),s=void 0):n?n.appendChild(e):r=e}else s&&(s.appendChild(o),s=void 0);if(c=c.substring(n+1),""==c&&l+1==e.length)break}if(s&&(s.appendChild(o),s=void 0),c.startsWith(">"))c=c.substring(1);else if(c.startsWith("^")){if(!o.parentNode)throw Error("invalid depth");for(o=o.parentNode;c.startsWith("^");){if(o.parentNode)o=o.parentNode;else{if(11===o.nodeType)throw Error("invalid depth");r=t.createDocumentFragment(),r.appendChild(o),o=r}c=c.substring(1)}}else if(c.startsWith("+"))o.parentNode?o=o.parentNode:(r=t.createDocumentFragment(),r.appendChild(o),o=r),c=c.substring(1);else if(i==c.length)throw Error("unexpected character in emmet: "+c.charAt(0))}if(n.length)throw Error("unexpected eof, emmet expected group end");if(!o)throw Error("unexpected eof, no content found");return r||(r=o),r}export{i as emmet,r as emmetSlots,n as setDefDoc,s as slotted};
//# sourceMappingURL=emmet-elem.js.map
