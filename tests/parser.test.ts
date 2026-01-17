import { parseNodeSet } from "../src/parser";
import { AddressSpace, generateAddressSpace, nodesets } from "node-opcua";
import fs from "fs";

jest.mock("fs");
jest.mock("node-opcua", () => ({
    AddressSpace: {
        create: jest.fn(),
    },
    generateAddressSpace: jest.fn(),
    nodesets: {
        standard: "standard_nodeset_mock.xml",
    },
}));

describe("parseNodeSet", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create address space and generate nodes from xml files", async () => {
        const mockAddressSpace = { dispose: jest.fn() };
        // @ts-ignore
        const { AddressSpace, generateAddressSpace, nodesets } = require("node-opcua");

        AddressSpace.create.mockReturnValue(mockAddressSpace);
        generateAddressSpace.mockResolvedValue(undefined);
        (fs.existsSync as jest.Mock).mockReturnValue(true);

        const xmlFiles = ["test1.xml", "test2.xml"];
        const result = await parseNodeSet(xmlFiles);

        expect(AddressSpace.create).toHaveBeenCalled();
        expect(generateAddressSpace).toHaveBeenCalledWith(
            mockAddressSpace,
            expect.arrayContaining([nodesets.standard, ...xmlFiles])
        );
        expect(result).toBe(mockAddressSpace);
    });

    it("should throw error if standard nodeset is missing", async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        // @ts-ignore
        const { nodesets } = require("node-opcua");

        await expect(parseNodeSet([])).rejects.toThrow(
            `Standard NodeSet not found at ${nodesets.standard}`
        );
    });
});
