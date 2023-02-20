export interface IParser {
    write(str: string): void;
    end(): void;
}
export interface IParserConstructor {
    new (config: Walker): IParser;
}

let parserP: undefined | Promise<IParserConstructor>;
const defParser = () => {
    if (parserP) {
        return parserP;
    }
    parserP = import("htmlparser2").then(({ Parser }) => Parser).catch(() => class ParserFromDOM implements IParser {
        private _config: Walker;
        private _buf: string;
    
        public constructor(config: Walker) {
            this._buf = "";
            this._config = config;
        }
        public write(str: string) {
            this._buf += str;
        }
        public end() {
            const parser = new DOMParser();
            const doc = parser.parseFromString(this._buf, "text/xml");
            const errors = doc.getElementsByTagName("parsererror");
            if (errors.length != 0) {
                const err = Object.assign(new Error("XML Parse Error"), { errors });
                throw err;
            }
            const f = (children: [Node] | NodeListOf<ChildNode>) => {
                for (const child of children) {
                    if (child.nodeType === 3 || child.nodeType === 4) {
                        const t = child.nodeValue;
                        t && this._config.ontext(t);
                    }
                    if (child.nodeType == 1) {
                        const elem = child as Element;
                        const name = elem.nodeName;
                        const attrs: Record<string, string> = {};
                        for (const attr of elem.attributes) {
                            attrs[attr.nodeName] = attr.nodeValue || "";
                        }
                        this._config.onopentag(name, attrs);
                        f(elem.childNodes);
                        this._config.onclosetag(name);
                    }
                }
            };
            f([doc.documentElement]);
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    parserP.catch(() => {});
    return parserP;
};

class Walker {
    private _agg: string;
    private _text: string;
    private _hasChild: boolean;
    private _deep: number;
    private _up: number;

    constructor() {
        this._agg = "";
        this._text = "";
        this._hasChild = false;
        this._deep = 0;
        this._up = 0;
    }
    /**
     * This fires when a new tag is opened.
     *
     * If you don't need an aggregated `attributes` object,
     * have a look at the `onopentagname` and `onattribute` events.
     */
    public onopentag(name: string, attributes: Record<string, string>) {
        console.log("onopentag", name, attributes);
        if (this._text.trim()) {
            throw new Error(`Cannot have mixed text nodes and element nodes: ${JSON.stringify(this._text)}`);
        }
        if (this._deep && !this._up) {
            this._agg += ">";
        } else if (this._up == 1) {
            this._agg += "+";
            this._up = 0;
        } else {
            while (this._up != 0) {
                this._agg += "^";
                this._up -= 1;
            }
        }
        this._agg += name;
        const attrs = Object.keys(attributes || {});
        if (attrs.length) {
            this._agg += `[${attrs.map((k) => {
                const v = attributes[k];
                if (v === "") {
                    return k;
                }
                return `${k}=${JSON.stringify(v)}`;
            }).join(" ")}]`;
        }
        this._text = "";
        this._hasChild = false;
        this._up = 0;
        this._deep += 1;
    }
    /**
     * Fires whenever a section of text was processed.
     *
     * Note that this can fire at any point within text and you might
     * have to stitch together multiple pieces.
     */
    public ontext(text: string) {
        if (this._hasChild) {
            if (text.trim()) {
                throw new Error(`Cannot have mixed text nodes and element nodes: ${JSON.stringify(this._text + text)}`);
            }
            return;
        }
        this._text += text;
        if (text.indexOf("}") != -1) {
            throw new Error(`Cannot have the character \`}\` in text: ${JSON.stringify(this._text)}`);
        }
        this._up = 0;
    }
    /**
     * Fires when a tag is closed.
     *
     * You can rely on this event only firing when you have received an
     * equivalent opening tag before. Closing tags without corresponding
     * opening tags will be ignored.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onclosetag(_name: string) {
        if (!this._hasChild && this._text) {
            this._agg += `{${this._text}}`;
        }
        this._text = "";
        this._hasChild = true;
        this._up += 1;
        this._deep -= 1;
    }

    public toString() {
        return this._agg;
    }
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
    private _walker?: Walker;
    private _parser?: IParser;
    private _parseCons: IParserConstructor | Promise<IParserConstructor>;

    /**
     * Creates a new compression context for Emmet.
     * 
     * @param {IParserConstructor | Promise<IParserConstructor>} parser when set, this will be the parser used to parse the HTML. If not set, the default parser will be used.
     */
    public constructor(parser?: IParserConstructor | Promise<IParserConstructor>) {
        this._parseCons = parser || defParser();
    }

    /**
     * Write a chunk of XML data to the parser.
     * 
     * @param {string} source a chunk of XML to parse
     * @returns {void | Promise<void>} if the parser was not ready, this will return a promise that resolves when the parser has been written to
     */
    public write(source: string): void | Promise<void> {
        if (!source) {
            return;
        }
        if (this._parser) {
            this._parser.write(source);
        } else if (this._parseCons instanceof Promise) {
            return this._parseCons.then((ParserCons: IParserConstructor) => {
                if (!this._parser) {
                    this._parseCons = ParserCons;
                    this._walker = new Walker();
                    this._parser = new ParserCons(this._walker);
                }
                this._parser.write(source);
            });
        } else {
            this._walker = new Walker();
            this._parser = new this._parseCons(this._walker);
            this._parser.write(source);
        }
    }
    /**
     * 
     * @returns {string} the compressed Emmet abbreviation
     */
    public end(): string {
        if (!this._parser) {
            return "";
        }
        this._parser.end();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const ret = this._walker!.toString();
        this._parser = undefined;
        this._walker = undefined;
        return ret;
    }
    /**
     * 
     * @returns {string} the current serialized state of the Emmet abbreviation
     */
    public toString() {
        return this._walker ? this._walker.toString() : "";
    }
}
