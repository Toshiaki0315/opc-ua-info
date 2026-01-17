import { renderPdf } from "../src/pdf-renderer";
import PDFDocument from "pdfkit";
import { Graphviz } from "@hpcc-js/wasm";
import fs from "fs";
const SVGtoPDF = require("svg-to-pdfkit");

// Mock dependencies
jest.mock("pdfkit");
jest.mock("fs");
jest.mock("svg-to-pdfkit");
jest.mock("@hpcc-js/wasm");

describe("renderPdf", () => {
    it("should render PDF from DOT string", async () => {
        // Mock Graphviz
        const mockGraphviz = {
            layout: jest.fn().mockReturnValue("<svg>...</svg>"),
        };
        (Graphviz.load as jest.Mock).mockResolvedValue(mockGraphviz);

        // Mock PDFDocument
        const mockDoc = {
            pipe: jest.fn(),
            end: jest.fn(),
        };
        (PDFDocument as unknown as jest.Mock).mockReturnValue(mockDoc);

        // Mock fs
        const mockStream = {
            on: jest.fn((event, callback) => {
                if (event === "finish") {
                    callback();
                }
                return mockStream;
            }),
        };
        (fs.createWriteStream as jest.Mock).mockReturnValue(mockStream);

        const dot = "digraph G {}";
        const outputPath = "output.pdf";

        await renderPdf(dot, outputPath);

        expect(Graphviz.load).toHaveBeenCalled();
        expect(mockGraphviz.layout).toHaveBeenCalledWith(dot, "svg", "dot");
        expect(PDFDocument).toHaveBeenCalled();
        expect(fs.createWriteStream).toHaveBeenCalledWith(outputPath);
        expect(mockDoc.pipe).toHaveBeenCalledWith(mockStream);
        expect(SVGtoPDF).toHaveBeenCalledWith(mockDoc, "<svg>...</svg>", 0, 0, expect.any(Object));
        expect(mockDoc.end).toHaveBeenCalled();
    });

    it("should reject promise on stream error", async () => {
        // Mock Graphviz
        const mockGraphviz = {
            layout: jest.fn().mockReturnValue("<svg>...</svg>"),
        };
        (Graphviz.load as jest.Mock).mockResolvedValue(mockGraphviz);

        // Mock PDFDocument
        const mockDoc = {
            pipe: jest.fn(),
            end: jest.fn(),
        };
        (PDFDocument as unknown as jest.Mock).mockReturnValue(mockDoc);

        // Mock fs with error
        const mockStream = {
            on: jest.fn((event, callback) => {
                if (event === "error") {
                    callback(new Error("Write error"));
                }
                return mockStream;
            }),
        };
        (fs.createWriteStream as jest.Mock).mockReturnValue(mockStream);

        await expect(renderPdf("digraph G {}", "output.pdf")).rejects.toThrow("Write error");
    });
});
