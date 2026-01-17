import { AddressSpace, generateAddressSpace, nodesets } from "node-opcua";
import fs from "fs";

export async function parseNodeSet(xmlFiles: string[]): Promise<AddressSpace> {
    const addressSpace = AddressSpace.create();

    // Always include standard nodeset to ensure basic types exist
    const standardNodeSet = nodesets.standard;
    if (!standardNodeSet || !fs.existsSync(standardNodeSet)) {
        throw new Error(`Standard NodeSet not found at ${standardNodeSet}. Please ensure node-opcua is installed correctly.`);
    }

    const allXmlFiles = [standardNodeSet, ...xmlFiles];

    await generateAddressSpace(addressSpace, allXmlFiles);

    return addressSpace;
}
