import { AddressSpace, generateAddressSpace, nodesets } from "node-opcua";

export async function parseNodeSet(xmlFiles: string[]): Promise<AddressSpace> {
    const addressSpace = AddressSpace.create();

    // Always include standard nodeset to ensure basic types exist
    const standardNodeSet = nodesets.standard;
    const allXmlFiles = [standardNodeSet, ...xmlFiles];

    await generateAddressSpace(addressSpace, allXmlFiles);

    return addressSpace;
}
