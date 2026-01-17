import { parseNodeSet } from "../src/parser";
import { AddressSpace, generateAddressSpace, nodesets } from "node-opcua";

jest.mock("node-opcua", () => ({
    AddressSpace: {
        create: jest.fn(),
    },
    generateAddressSpace: jest.fn(),
    nodesets: {
        standard: "standard_nodeset_mock",
    },
}));

describe("parseNodeSet", () => {
    it("should create address space and generate nodes from xml files", async () => {
        const mockAddressSpace = { dispose: jest.fn() };
        // @ts-ignore
        const { AddressSpace, generateAddressSpace, nodesets } = require("node-opcua");

        AddressSpace.create.mockReturnValue(mockAddressSpace);
        generateAddressSpace.mockResolvedValue(undefined);

        const xmlFiles = ["test1.xml", "test2.xml"];
        const result = await parseNodeSet(xmlFiles);

        expect(AddressSpace.create).toHaveBeenCalled();
        expect(generateAddressSpace).toHaveBeenCalledWith(
            mockAddressSpace,
            expect.arrayContaining([nodesets.standard, ...xmlFiles])
        );
        expect(result).toBe(mockAddressSpace);
    });
});
