import EmmetCompress from "./emmet-compress.js";

const wrap = (str: string) => {
    return `import emmet from "emmet";const f=()=>emmet(${JSON.stringify(str)});export default f;`;
};

export default function xmlLoader(this: { async(): (err: Error | null, res?: string) => void }, source: string) {
    const compr = new EmmetCompress();
    const prom = compr.write(source);
    if (prom) {
        const callback = this.async();
        prom.then(() => {
            callback(null, wrap(compr.end()));
        }).catch(callback);
    } else {
        return wrap(compr.end());
    }
}
