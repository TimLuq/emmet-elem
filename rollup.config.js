import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import summary from "rollup-plugin-summary";

/** @type {import("terser").MinifyOptions} */
const terserOptions = {
    warnings: true,
    ecma: 2020,
    compress: {
        unsafe: true,
        passes: 2,
    },
    output: {
        comments: false,
        inline_script: false,
    },
    sourceMap: true,
    module: true,
};

/** @type {import("rollup").RollupOptions[]} */
const config = [
    {
        input: [
            "emmet-elem.ts",
            "emmet-slot.ts",
            "emmet-compress.ts",
            "emmet-loader.ts"
        ],
        output: {
            dir: "./",
            sourcemap: true,
            format: "esm",
        },
        plugins: [
            typescript(),
            summary(),
            terser(terserOptions),
        ],
        external: ["htmlparser2", "fs/promises"]
    },
    {
        input: [
            "emmet-elem.ts",
            "emmet-slot.ts",
            "emmet-compress.ts",
            "emmet-loader.ts"
        ],
        output: {
            dir: "./cjs",
            sourcemap: true,
            format: "cjs",
            entryFileNames: "[name].cjs",
        },
        plugins: [
            typescript(),
            summary(),
            terser(terserOptions),
        ],
        external: ["htmlparser2", "fs/promises"]
    },
    {
        input: "emmet-elem.ts",
        output: {
            dir: "./umd",
            sourcemap: true,
            format: "umd",
            name: "emmetElem",
            exports: "named",
        },
        plugins: [
            typescript({ declaration: true, declarationDir: "./umd" }),
            terser(terserOptions),
        ]
    },
    {
        input: "emmet-slot.ts",
        output: {
            dir: "./umd",
            sourcemap: true,
            format: "umd",
            name: "emmetSlot",
            exports: "named",
        },
        plugins: [
            typescript({ declaration: true, declarationDir: "./umd" }),
            terser(terserOptions),
        ]
    },
    {
        input: "emmet-compress.ts",
        output: {
            dir: "./umd",
            sourcemap: true,
            format: "umd",
            name: "emmetCompress",
            exports: "named",
        },
        plugins: [
            typescript({ declaration: true, declarationDir: "./umd" }),
            terser(terserOptions),
        ],
        external: ["htmlparser2"]
    },
    {
        input: "emmet-loader.ts",
        output: {
            dir: "./umd",
            sourcemap: true,
            format: "umd",
            name: "emmetLoader",
            exports: "named",
        },
        plugins: [
            typescript({ declaration: true, declarationDir: "./umd" }),
            terser(terserOptions),
        ],
        external: ["htmlparser2", "fs/promises"]
    },
];

export default config;
