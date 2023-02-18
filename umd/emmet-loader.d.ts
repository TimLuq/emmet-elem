export default function xmlLoader(this: {
    async(): (err: Error | null, res?: string) => void;
}, source: string): string | undefined;
