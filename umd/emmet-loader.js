var t,e;t=this,e=function(t){let e;const s=()=>e||(e=import("htmlparser2").then((({Parser:t})=>t)).catch((()=>class{constructor(t){this._buf="",this._config=t}write(t){this._buf+=t}end(){const t=(new DOMParser).parseFromString(this._buf,"text/xml"),e=t.getElementsByTagName("parsererror");if(0!=e.length)throw Object.assign(Error("XML Parse Error"),{errors:e});const s=t=>{for(const e of t){if(3===e.nodeType||4===e.nodeType){const t=e.nodeValue;t&&this._config.ontext(t)}if(1==e.nodeType){const t=e,i=t.nodeName,n={};for(const e of t.attributes)n[e.nodeName]=e.nodeValue||"";this._config.onopentag(i,n),s(t.childNodes),this._config.onclosetag(i)}}};s([t.documentElement])}})),e.catch((()=>{})),e);class i{constructor(){this._agg="",this._text="",this._hasChild=!1,this._deep=0,this._up=0}onopentag(t,e){if(console.log("onopentag",t,e),this._text.trim())throw Error("Cannot have mixed text nodes and element nodes: "+JSON.stringify(this._text));if(this._deep&&!this._up)this._agg+=">";else if(1==this._up)this._agg+="+",this._up=0;else for(;0!=this._up;)this._agg+="^",this._up-=1;this._agg+=t;const s=Object.keys(e||{});s.length&&(this._agg+=`[${s.map((t=>{const s=e[t];return""===s?t:`${t}=${JSON.stringify(s)}`})).join(" ")}]`),this._text="",this._hasChild=!1,this._up=0,this._deep+=1}ontext(t){if(this._hasChild){if(t.trim())throw Error("Cannot have mixed text nodes and element nodes: "+JSON.stringify(this._text+t))}else{if(this._text+=t,-1!=t.indexOf("}"))throw Error("Cannot have the character `}` in text: "+JSON.stringify(this._text));this._up=0}}onclosetag(t){!this._hasChild&&this._text&&(this._agg+=`{${this._text}}`),this._text="",this._hasChild=!0,this._up+=1,this._deep-=1}toString(){return this._agg}}class n{constructor(t){this._parseCons=t||s()}write(t){if(t)if(this._parser)this._parser.write(t);else{if(this._parseCons instanceof Promise)return this._parseCons.then((e=>{this._parser||(this._parseCons=e,this._walker=new i,this._parser=new e(this._walker)),this._parser.write(t)}));this._walker=new i,this._parser=new this._parseCons(this._walker),this._parser.write(t)}}end(){if(!this._parser)return"";this._parser.end();const t=this._walker.toString();return this._parser=void 0,this._walker=void 0,t}toString(){return this._walker?this._walker.toString():""}}const r=t=>`import emmet from "emmet";const f=()=>emmet(${JSON.stringify(t)});export default f;`;function o(t){return"string"==typeof t?[RegExp(t)]:t instanceof RegExp?[t]:t.map((t=>"string"==typeof t?RegExp(t):t))}t.default=function(t,e,s){const i=new n,o=i.write(t);if(o){const t=this.async();o.then((()=>{t(null,r(i.end()),e,s)})).catch(t)}else this.callback()(null,r(i.end()),e,s)},t.rollupLoader=function(t){const e={...t||{}},s=e.exclude?o(e.exclude):[/(^|\/)node_modules/],i=e.include?o(e.include):[/\.(?:xml|html|xhtml|svg|xsl|xslt|mathml|xsd)$/],h=e.includeRaw?o(e.includeRaw):[/\.emmet$/];return{name:"emmet",load(t){const o=t.replace(/\\/g,"/");return s.some((t=>!!o.match(t)))?null:h.some((t=>!!o.match(t)))?import("fs/promises").then((({readFile:e})=>e(t,"utf8"))).then((t=>r(t))):i.some((t=>!!o.match(t)))?import("fs/promises").then((({readFile:e})=>e(t,"utf8"))).then((t=>{const s=new n(e.parser),i=s.write(t);return i?i.then((()=>r(s.end()))):r(s.end())})):null}}},Object.defineProperty(t,"__esModule",{value:!0})},"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).emmetLoader={});
//# sourceMappingURL=emmet-loader.js.map