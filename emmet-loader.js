import t from"./emmet-compress.js";const e=t=>`import emmet from "emmet";const f=()=>emmet(${JSON.stringify(t)});export default f;`;function n(n){const m=new t,o=m.write(n);if(!o)return e(m.end());{const t=this.async();o.then((()=>{t(null,e(m.end()))})).catch(t)}}export{n as default};
//# sourceMappingURL=emmet-loader.js.map
