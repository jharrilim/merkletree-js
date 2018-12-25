export class MerkleTree {
    private nodes: MerkleTreeNode[] = [];

    private constructor() { }

    /**
     * Creates a new instance of the MerkleTree.
     *
     * @static
     * @returns {MerkleTree}
     * @memberof MerkleTree
     */
    public static create(): MerkleTree {
        return new MerkleTree();
    }

    /**
     * @param {*} data Any form of data can be passed here. It will
     * be stringified, hashed, and only store the hash.
     * 
     * @returns {Promise<number>} A promise containing the new length of the base of the Merkle Tree.
     * @memberof MerkleTree
     */
    public async addNode(data: any) {
        return this.nodes.push(await MerkleTreeNode.create(data));
    }

    /**
     * Constructs a Merkle Tree based off of the hashes found in the endmost descendant nodes
     * (the hashes that came from your data). It then builds all of the intermediate nodes of
     * the tree until it reaches the root, at which it will then return the root hash which
     * is comprised of the sum of all of the descendant node hashes.
     * ```
     *           H(7)        where H(7) = H(5) + H(6),
     *         /      \            H(5) = H(1) + H(2),
     *     H(5)        H(6)        H(6) = H(3) + H(4)
     *    /    \      /    \   
     *  H(1)   H(2) H(3)   H(4)
     * ```
     * which make up the base of the Merkle Tree
     *
     * @returns {string}
     * @memberof MerkleTree
     */
    public audit(): string {
        return '';
    }
}

class MerkleTreeNode {
    private constructor(private hash: string) { }

    public static async create(data: any): Promise<MerkleTreeNode> {
        return new MerkleTreeNode(await Hashing.hashFrom(data));
    }
}

namespace Hashing {
    const alg = 'SHA-512';

    function encodeData(data: any): Uint8Array {
        return new TextEncoder().encode(JSON.stringify(data));
    }

    export async function hashFrom(data: any): Promise<string> {
        const crypto = require('crypto');
        const hash = crypto.createHash(alg).update(encodeData(data));
        return hash.digest().join('');
    }
}

