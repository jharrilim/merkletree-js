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
    private _isDirty: boolean = true;
    private _rootHash: string = '';


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

    /**
     * Use this to check if a node has been added to the tree
     * between now and the last time #computeRootHash was called.
     * @readonly
     * @type {boolean}
     * @memberof MerkleTree
     */
    public get isDirty(): boolean {
        return this._isDirty;
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
        this._isDirty = true;
        return await this._addNode(data);
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
        this._isDirty = true;
        for (const d of data) {
            await this._addNode(d);
        }
        return this._hashes.length;
    }

    /**
     * Use this to compare the root hash of this tree with another tree.
     * 
     * 
     * @example
     * ```js
     * async function foo() {
     *     const data = [1, 2, 3];
     *     const tree1 = await MerkleTree.createWith(data);
     *     const tree2 = await MerkleTree.createWith(data);
     *     return await tree1.compareWith(tree2);
     * }
     * ```
     * 
     * @param {MerkleTree} thatTree
     * @returns {Promise<boolean>}
     * @memberof MerkleTree
     */
    public async compareWith(thatTree: MerkleTree): Promise<boolean> {
        return await this.computeRootHash() === await thatTree.computeRootHash();
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
        if (!this._isDirty) {
            return this._rootHash;
        }

        if (this._hashes.length < 1) {
            throw new Error('There is no data in the Merkle Tree. Use #addNode or #addNodes.');
        }
        // If last node is odd, copy last node and push it to make it even
        if (this._hashes.length % 2 === 1) {
            this._hashes.push(this._hashes[this._hashes.length - 1]);
        }

        let hashes = this._hashes.slice();
        while (hashes.length > 1) {
            hashes = await MerkleTree.buildLayer(hashes);
        }
        this._isDirty = false;
        return this._rootHash = hashes[0];
    }

    private async _addNode(data: any): Promise<number> {
        return this._hashes.push(await Hashing.hashFrom(data));
    }

    /**
     * Used internally to convert a layer of hashes in a Merkle Tree to the next smaller layer.
     * This is where the most of the Merkle Tree algorithm resides.
     * @private
     * @static
     * @param {string[]} hashes
     * @returns {Promise<string[]>}
     * @memberof MerkleTree
     */
    private static async buildLayer(hashes: string[]): Promise<string[]> {
        const newHashes: string[] = [];

        for (let i = 0; i < hashes.length; i += 2) {
            // From an odd node, hash it together with the previous node
            const hash = await Hashing.hashFrom(hashes[i] + hashes[i + 1]);
            newHashes.push(hash);
        }

        return newHashes;
    }
}

/**
 * This error gets thrown when trying to hash one of the following:
 * - undefined
 * - null
 * - function (includes class)
 *
 * @export
 * @class InvalidDataError
 * @extends {Error}
 */
export class InvalidDataError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

/**
 * This namespace is used to hold functions related to hashing.
 */
export namespace Hashing {
    const alg = 'SHA512';

    /**
     * Encodes data by JSON stringifying it and then using the TextEncoder to encode it.
     *
     * @param {*} data
     * @returns {Uint8Array}
     */
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
        if (data === undefined || data === null || typeof (data) === 'function') {
            throw new InvalidDataError('Cannot hash null or undefined data.');
        }
        const crypto = require('crypto');
        const hash = crypto.createHash(alg).update(encodeData(data));
        return hash.digest().join('');
    }
}
