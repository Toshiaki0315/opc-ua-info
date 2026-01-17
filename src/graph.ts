import { AddressSpace, BaseNode, UAReference, NodeClass } from "node-opcua";
import { digraph, toDot } from "ts-graphviz";

export function generateGraph(addressSpace: AddressSpace): string {
    const visited = new Set<string>();

    const g = digraph("G", (g) => {
        // Set Attributes
        g.set("rankdir", "LR");
        g.set("fontname", "Helvetica");
        g.set("labelloc", "t");
        g.set("label", "OPC UA Information Model");

        // Define styles
        // ...

        // Iterate namespaces
        const namespaces = addressSpace.getNamespaceArray();

        for (const ns of namespaces) {
            // Skip standard namespace (index 0) to avoid thousands of nodes
            if (ns.index === 0) continue;

            // Access internal map
            const nodeMap = (ns as any)._nodeid_index as Map<string, BaseNode>;

            if (nodeMap && nodeMap instanceof Map) {
                for (const node of nodeMap.values()) {
                    visitNode(node);
                }
            }
        }

        function visitNode(node: BaseNode) {
            const nodeId = node.nodeId.toString();
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            const label = `${node.browseName.toString()}\n(${NodeClass[node.nodeClass]})`;

            let shape = "box";
            let color = "black";

            switch (node.nodeClass) {
                case NodeClass.ObjectType:
                    shape = "component";
                    color = "blue";
                    break;
                case NodeClass.VariableType:
                    shape = "box";
                    color = "green";
                    break;
                case NodeClass.Object:
                    shape = "folder";
                    color = "blue";
                    break;
                case NodeClass.Variable:
                    shape = "ellipse";
                    color = "green";
                    break;
                case NodeClass.Method:
                    shape = "cds";
                    color = "red";
                    break;
                case NodeClass.DataType:
                    shape = "hexagon";
                    color = "purple";
                    break;
                case NodeClass.ReferenceType:
                    shape = "diamond";
                    color = "orange";
                    break;
            }

            g.node(nodeId, {
                label: label,
                shape: shape,
                color: color,
                fontname: "Helvetica"
            });

            // References
            const references = node.findReferencesEx("References");

            for (const ref of references) {
                const targetId = ref.nodeId.toString();

                // Add edge
                // We show all references from our nodes.
                // If target is in ns=0, it will show up as a plain box (implicit) or we can style it if we want.

                const refTypeNode = addressSpace.findNode(ref.referenceType);
                const refLabel = refTypeNode ? refTypeNode.browseName.toString() : ref.referenceType.toString();

                g.edge([nodeId, targetId], {
                    label: refLabel,
                    fontsize: 8,
                    fontcolor: "gray"
                });
            }
        }
    });

    return toDot(g);
}
