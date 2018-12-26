import { TextEncoder } from 'util';

/**
 * The Merkle Tree provides you with a way to audit a vector of data by comparing the hashes of each datum.
 * It does this by building a layer using your initial hashes, and then takes a hash sum of two hashes until
 * it reaches the last hash, effectively creating a smaller layer on top.
 * 
 * Note that since the Merkle Tree is a binary tree, whenever a layer has an odd amount of nodes, it must
 * duplicate the odd node and add the hash to itself.
 * @export
 * @class MerkleTree
 */
export class MerkleTree {
    private _hashes: string[] = [];

    /**
     * The count of each node in the base of the tree.
     *
     * @readonly
     * @type {number}
     * @memberof MerkleTree
     */
    public get length(): number {
        return this._hashes.length;
    }

    private constructor() { }

    /**
     * Use this to get a new instance of a MerkleTree.
     *
     * @static
     * @returns {MerkleTree}
     * @memberof MerkleTree
     */
    public static create(): MerkleTree {
        return new MerkleTree();
    }

    /**
     * Create a new instance of a MerkleTree with predefined data.
     *
     * @static
     * @param {any[]} data An array of any data.
     * @returns A Merkle Tree containing the hashes of the data that was passed in.
     * @memberof MerkleTree
     */
    public static async createWith(data: any[]): Promise<MerkleTree> {
        const tree = new MerkleTree();
        await tree.addNodes(data);
        return tree;
    }

    /**
     * @param {*} data Any form of data can be passed here. It will
     * be stringified, hashed, and only store the hash.
     * 
     * @returns {Promise<number>} A promise containing the new length of the base of the Merkle Tree.
     * @memberof MerkleTree
     */
    public async addNode(data: any): Promise<number> {
        return this._hashes.push(await Hashing.hashFrom(data));
    }

    /**
     * Adds an array of data to the hash nodes.
     *
     * @see #addNode
     * @param {any[]} data An array of any data.
     * @returns {Promise<number>} A promise containing the new length of the base of the Merkle Tree.
     * @memberof MerkleTree
     */
    public async addNodes(data: any[]): Promise<number> {
        for (const d of data) {
            await this.addNode(d);
        }
        return this._hashes.length;
    }

    /**
     * Constructs a Merkle Tree based off of the hashes found in the endmost descendant nodes
     * (the hashes that came from your data). It then builds all of the intermediate nodes of
     * the tree until it reaches the root, at which it will then return the root hash which
     * is comprised of the sum of all of the descendant node hashes.
     * 
     * Diagram of the Merkle Tree result:
     * ```
     *           H(7)           where H(x) is a hashing function
     *         /      \         that takes any data as it's input,
     *     H(5)        H(6)     H(5) = H(1) + H(2),
     *    /    \      /    \    H(6) = H(3) + H(4),
     *  H(1)   H(2) H(3)   H(4) H(7) = H(5) + H(6).
     * ```
     *
     * @returns {Promise<string>}
     * @memberof MerkleTree
     */
    public async computeRootHash(): Promise<string> {
        if (this._hashes.length < 1) {
            throw new Error('There is no data in the Merkle Tree. Use #addNode or #addNodes.');
        }

        let hashes = this._hashes.slice();
        while(hashes.length > 1) {
            hashes = await MerkleTree.buildLayer(hashes);
        }
        return hashes[0];
    }

    private static async buildLayer(hashes: string[]): Promise<string[]> {
        const newHashes: string[] = [];
        
        for (let i = 0; i < hashes.length; i++) {
            // Check to see if the last node is odd
            if(i + 1 === hashes.length && i % 2 === 1) {
                // Take a hash of the last node with a duplicate of itself
                const hash = await Hashing.hashFrom(hashes[i] + hashes[i]);
                newHashes.push(hash);
            }
            else if(i % 2 === 1) {
                // From an odd node, hash it together with the previous node
                const hash = await Hashing.hashFrom(hashes[i] + hashes[i - 1]);
                newHashes.push(hash);
            }
        }

        return newHashes;
    }
}

export namespace Hashing {
    const alg = 'SHA512';

    function encodeData(data: any): Uint8Array {
        return new TextEncoder().encode(JSON.stringify(data));
    }

    /**
     * Returns a SHA-512 hash from any given data. Used internally for the
     * Merkle Tree.
     *
     * @export
     * @param {*} data Any data.
     * @returns {Promise<string>} A promise containing the hash of the data that
     * was passed into the function.
     */
    export async function hashFrom(data: any): Promise<string> {
        const crypto = require('crypto');
        const hash = crypto.createHash(alg).update(encodeData(data));
        return hash.digest().join('');
    }
}
