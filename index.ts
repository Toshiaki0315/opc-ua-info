import { parseNodeSet } from "./src/parser";
import { generateGraph } from "./src/graph";
import { renderPdf } from "./src/pdf-renderer";
import path from "path";

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("Usage: ts-node index.ts <input1.xml> [input2.xml ...] <output.pdf>");
        process.exit(1);
    }

    const outputPdf = args[args.length - 1] as string;
    const inputXmls = args.slice(0, args.length - 1);

    // Validate inputs
    for (const xml of inputXmls) {
        if (!xml.endsWith(".xml")) {
            console.error(`Input file must be an XML file: ${xml}`);
            process.exit(1);
        }
    }

    try {
        console.log(`Loading Nodesets from ${inputXmls.join(", ")}...`);
        const addressSpace = await parseNodeSet(inputXmls);

        console.log("Generating Graph...");
        const dot = generateGraph(addressSpace);

        console.log(`Rendering PDF to ${outputPdf}...`);
        await renderPdf(dot, outputPdf);

        console.log("Done!");
        process.exit(0); // Force exit to cleanup any opcua timers
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

main();
