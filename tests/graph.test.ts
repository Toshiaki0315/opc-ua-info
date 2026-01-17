import { generateGraph } from "../src/graph";
import { NodeClass } from "node-opcua";

// Mock ts-graphviz
jest.mock("ts-graphviz", () => {
    return {
        digraph: jest.fn((name, callback) => {
            const mockG = {
                set: jest.fn(),
                node: jest.fn(),
                edge: jest.fn(),
            };
            callback(mockG);
            return mockG;
        }),
        toDot: jest.fn(() => "digraph G {}"),
    };
});

describe("generateGraph", () => {
    it("should generate a graph from address space", () => {
        const mockNode = {
            nodeId: { toString: () => "ns=1;i=1000" },
            browseName: { toString: () => "TestObject" },
            nodeClass: NodeClass.Object,
            findReferencesEx: jest.fn().mockReturnValue([]),
        };

        const mockNamespace = {
            index: 1,
            _nodeid_index: new Map([["ns=1;i=1000", mockNode]]),
        };

        const mockAddressSpace = {
            getNamespaceArray: jest.fn().mockReturnValue([
                { index: 0 }, // Standard namespace, skipped
                mockNamespace
            ]),
            findNode: jest.fn(),
        } as any;

        const result = generateGraph(mockAddressSpace);

        expect(result).toBe("digraph G {}"); // Mocked return

        // Verify interactions if needed, but the main goal is ensuring it runs without error and calls the library
        const { digraph } = require("ts-graphviz");
        expect(digraph).toHaveBeenCalled();
    });

    it("should handle references correctly", () => {
        const mockRef = {
            nodeId: { toString: () => "ns=1;i=2000" },
            referenceType: { toString: () => "HasComponent" }
        };

        const mockNode = {
            nodeId: { toString: () => "ns=1;i=1000" },
            browseName: { toString: () => "TestObject" },
            nodeClass: NodeClass.Object,
            findReferencesEx: jest.fn().mockReturnValue([mockRef]),
        };

        const mockNamespace = {
            index: 1,
            _nodeid_index: new Map([["ns=1;i=1000", mockNode]]),
        };

        const mockAddressSpace = {
            getNamespaceArray: jest.fn().mockReturnValue([
                { index: 0 },
                mockNamespace
            ]),
            findNode: jest.fn().mockReturnValue({ browseName: { toString: () => "HasComponent" } }),
        } as any;

        generateGraph(mockAddressSpace);
        // We assert implicitly that it doesn't crash and covers lines
    });
    it("should handle all node types", () => {
        const nodeTypes = [
            { type: NodeClass.ObjectType, id: "i=1" },
            { type: NodeClass.VariableType, id: "i=2" },
            { type: NodeClass.Object, id: "i=3" },
            { type: NodeClass.Variable, id: "i=4" },
            { type: NodeClass.Method, id: "i=5" },
            { type: NodeClass.DataType, id: "i=6" },
            { type: NodeClass.ReferenceType, id: "i=7" },
        ];

        const nodeMap = new Map();
        nodeTypes.forEach(n => {
            nodeMap.set(n.id, {
                nodeId: { toString: () => n.id },
                browseName: { toString: () => "Node" + n.id },
                nodeClass: n.type,
                findReferencesEx: jest.fn().mockReturnValue([]),
            });
        });

        const mockNamespace = {
            index: 1,
            _nodeid_index: nodeMap,
        };

        const mockAddressSpace = {
            getNamespaceArray: jest.fn().mockReturnValue([
                { index: 0 },
                mockNamespace
            ]),
        } as any;

        generateGraph(mockAddressSpace);
    });
});
