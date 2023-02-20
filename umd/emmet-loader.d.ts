import type { IParserConstructor } from "./emmet-compress.js";
type SourceMap = any;
export interface ILoaderCallback {
    (err: null, result: string, map?: SourceMap, meta?: any): void;
    (err: Error, result?: undefined, map?: SourceMap, meta?: any): void;
}
export interface ILoaderContext {
    async(): ILoaderCallback;
    callback(): ILoaderCallback;
}
export default function xmlLoader(this: ILoaderContext, source: string, sourceMap?: SourceMap, meta?: any): void;
export interface RollupEmmetConfig {
    parser?: IParserConstructor | Promise<IParserConstructor>;
    includeRaw?: string | RegExp | Array<string | RegExp>;
    include?: string | RegExp | Array<string | RegExp>;
    exclude?: string | RegExp | Array<string | RegExp>;
}
export declare function rollupLoader(options?: RollupEmmetConfig): import("rollup").Plugin;
export {};
