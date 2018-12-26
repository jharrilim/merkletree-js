/** global describe it */
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { MerkleTree, Hashing, DataIsNullOrUndefinedError } from '../src/index';

use(chaiAsPromised);

describe('MerkleTree', () => {
    it('returns a MerkleTree from MerkleTree.create', () => {
        const tree = MerkleTree.create();

        expect(tree).to.be.instanceOf(MerkleTree);
        expect(tree.length).to.equal(0);
    });

    it('can add multiple elements to a MerkleTree using #addNodes', async () => {
        const data = [1, 2, 3, 4, 5];
        const tree = MerkleTree.create();

        await tree.addNodes(data);

        expect(tree.length).to.be.gt(0);
    });

    it('can create a MerkleTree with predefined elements using MerkleTree.createWith', async () => {
        const predefinedData = [1, 2, 3];

        const treeWithPredefinedData = await MerkleTree.createWith(predefinedData);

        expect(treeWithPredefinedData.length).to.be.gt(0);
        expect(treeWithPredefinedData).to.be.instanceOf(MerkleTree);
    });

    it('can compute the hash for a vector with a length power to 2 (2 ^ 3) using #computeRootHash', async () => {
        const data = [1, 2, 3, 4, 5, 6, 7, 8];
        const tree = await MerkleTree.createWith(data);

        const rootHash = await tree.computeRootHash();

        expect(rootHash).to.be.a('string');
    });

    it('can compute the hash for a vector with one item using #computeRootHash', async () => {
        const data = [1];
        const tree = await MerkleTree.createWith(data);

        const rootHash = await tree.computeRootHash();

        expect(rootHash).to.be.a('string');
    });

    it('can compute the hash for a vector with a length that is odd using #computeRootHash', async () => {
        const data = [1, 2, 3, 4, 5, 6, 7];
        const tree = await MerkleTree.createWith(data);

        const rootHash = await tree.computeRootHash();

        expect(rootHash).to.be.a('string');
    });

    it('can compute the hash for a vector with multiple data types using #computeRootHash', async () => {
        const data = [1, true, 'foo', { bar: 'baz' }, MerkleTree.create()];
        const tree = await MerkleTree.createWith(data);

        const rootHash = await tree.computeRootHash();

        expect(rootHash).to.be.a('string');
    });

    it('can create equal hashes based off of the same data for multiple trees', async () => {
        const data = [1, 2, 3, 4, 5, 6, 7];
        const tree1 = await MerkleTree.createWith(data);
        const tree2 = await MerkleTree.createWith(data);

        const hash1 = await tree1.computeRootHash();
        const hash2 = await tree2.computeRootHash();

        expect(hash1).to.equal(hash2);
    });

    it('throws error when auditing a tree with no data', async () => {
        const data = [];
        const tree = await MerkleTree.createWith(data);

        expect(tree.computeRootHash()).to.be.rejectedWith(Error);
    });

    it('throws an error when attempting to hash undefined data', async () => {
        const data = undefined;
        
        expect(Hashing.hashFrom(data)).to.be.rejectedWith(DataIsNullOrUndefinedError);
    });

    it('throws an error when attempting to hash null data', async () => {
        const data = null;
        
        expect(Hashing.hashFrom(data)).to.be.rejectedWith(DataIsNullOrUndefinedError);
    });
});