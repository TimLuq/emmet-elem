import EmmetCompress from "./emmet-compress.js";
import type { IParserConstructor } from "./emmet-compress.js";
import type { IEmmetConfig } from "./emmet-elem.js";

const wrap = (str: string) => {
    return `import emmet from "emmet";const f=()=>emmet(${JSON.stringify(str)});export default f;`;
};

type SourceMap = any;

export interface ILoaderCallback {
    (err: null, result: string, map?: SourceMap, meta?: any): void;
    (err: Error, result?: undefined, map?: SourceMap, meta?: any): void;
}

export interface ILoaderContext {
    async(): ILoaderCallback;
    callback(): ILoaderCallback;
}

export default function xmlLoader(this: ILoaderContext, source: string, sourceMap?: SourceMap, meta?: any) {
    const compr = new EmmetCompress();
    const prom = compr.write(source);
    if (prom) {
        const callback = this.async();
        prom.then(() => {
            callback(null, wrap(compr.end()), sourceMap, meta);
        }).catch(callback);
    } else {
        const callback = this.callback();
        callback(null, wrap(compr.end()), sourceMap, meta);
    }
}

export interface RollupEmmetConfig {
    // emmet?: Partial<IEmmetConfig>;
    parser?: IParserConstructor | Promise<IParserConstructor>;
    includeRaw?: string | RegExp | Array<string | RegExp>;
    include?: string | RegExp | Array<string | RegExp>;
    exclude?: string | RegExp | Array<string | RegExp>;
}

function regArray(r: string | RegExp | Array<string | RegExp>): RegExp[] {
    if (typeof r === "string") {
        return [new RegExp(r)];
    } else if (r instanceof RegExp) {
        return [r];
    } else {
        return r.map((r) => {
            if (typeof r === "string") {
                return new RegExp(r);
            } else {
                return r;
            }
        });
    }
}

export function rollupLoader(options?: RollupEmmetConfig): import("rollup").Plugin {
    const opts = { ...(options || {}) };
    const exclude = opts.exclude ? regArray(opts.exclude) : [/(^|\/)node_modules/];
    const include = opts.include ? regArray(opts.include) : [/\.(?:xml|html|xhtml|svg|xsl|xslt|mathml|xsd)$/];
    const includeRaw = opts.includeRaw ? regArray(opts.includeRaw) : [/\.emmet$/];
    return {
        name: "emmet",
        load(id: string) {
            const nid = id.replace(/\\/g, "/");
            if (exclude.some((r) => Boolean(nid.match(r)))) {
                return null;
            }
            if (includeRaw.some((r) => Boolean(nid.match(r)))) {
                return import("fs/promises").then(({ readFile }) => readFile(id, "utf8")).then((source) => wrap(source));
            }
            if (include.some((r) => Boolean(nid.match(r)))) {
                return import("fs/promises").then(({ readFile }) => readFile(id, "utf8")).then((source) => {
                    const compr = new EmmetCompress(opts.parser);
                    const prom = compr.write(source);
                    if (prom) {
                        return prom.then(() => wrap(compr.end()));
                    } else {
                        return wrap(compr.end());
                    }
                });
            }
            return null;
        }
    };
}
