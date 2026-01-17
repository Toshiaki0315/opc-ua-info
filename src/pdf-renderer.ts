import PDFDocument from "pdfkit";
const SVGtoPDF = require("svg-to-pdfkit");
import { Graphviz } from "@hpcc-js/wasm";
import fs from "fs";

export async function renderPdf(dot: string, outputPath: string) {
    // 1. Convert DOT to SVG using hpcc-js/wasm
    const graphviz = await Graphviz.load();
    const svg = graphviz.layout(dot, "svg", "dot");

    // 2. Create PDF
    const doc = new PDFDocument({
        compress: false // sometimes helps with weird compression issues, but usually fine
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // 3. Embed SVG
    // SVGtoPDF needs the document, and the svg string.
    // It draws at current position.
    SVGtoPDF(doc, svg, 0, 0, {
        preserveAspectRatio: "xMinYMin meet"
    });

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
    });
}
