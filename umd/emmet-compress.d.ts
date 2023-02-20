export interface IParser {
    write(str: string): void;
    end(): void;
}
export interface IParserConstructor {
    new (config: Walker): IParser;
}
declare class Walker {
    private _agg;
    private _text;
    private _hasChild;
    private _deep;
    private _up;
    constructor();
    /**
     * This fires when a new tag is opened.
     *
     * If you don't need an aggregated `attributes` object,
     * have a look at the `onopentagname` and `onattribute` events.
     */
    onopentag(name: string, attributes: Record<string, string>): void;
    /**
     * Fires whenever a section of text was processed.
     *
     * Note that this can fire at any point within text and you might
     * have to stitch together multiple pieces.
     */
    ontext(text: string): void;
    /**
     * Fires when a tag is closed.
     *
     * You can rely on this event only firing when you have received an
     * equivalent opening tag before. Closing tags without corresponding
     * opening tags will be ignored.
     */
    onclosetag(_name: string): void;
    toString(): string;
}
/**
 * Compresses HTML into an Emmet abbreviation.
 *
 * To use this class, you must do one of the following:
 * - pass in a parser to use in the constructor
 * - have `htmlparser2` ready to import
 * - have `DOMParser` defined in the global scope
 */
export default class EmmetCompress {
    private _walker?;
    private _parser?;
    private _parseCons;
    /**
     * Creates a new compression context for Emmet.
     *
     * @param {IParserConstructor | Promise<IParserConstructor>} parser when set, this will be the parser used to parse the HTML. If not set, the default parser will be used.
     */
    constructor(parser?: IParserConstructor | Promise<IParserConstructor>);
    /**
     * Write a chunk of XML data to the parser.
     *
     * @param {string} source a chunk of XML to parse
     * @returns {void | Promise<void>} if the parser was not ready, this will return a promise that resolves when the parser has been written to
     */
    write(source: string): void | Promise<void>;
    /**
     *
     * @returns {string} the compressed Emmet abbreviation
     */
    end(): string;
    /**
     *
     * @returns {string} the current serialized state of the Emmet abbreviation
     */
    toString(): string;
}
export {};
