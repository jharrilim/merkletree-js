/** global describe it */
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { MerkleTree, Hashing, InvalidDataError } from '../src/index';

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

        expect(tree.length).to.equal(data.length);
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

    it('correctly reproduces the same hash from the same tree when #computeRootHash is called twice', async () => {
        const data = [true, false, ![]];

        const tree = await MerkleTree.createWith(data);
        const hash1 = await tree.computeRootHash();
        const hash2 = await tree.computeRootHash();
    
        expect(hash1).to.equal(hash2);
    });

    it('correctly compares the hash of two trees that contain the same data with #compareWith', async () => {
        const data = [true, false, 1, 2, {}, 'foo'];
        const tree1 = await MerkleTree.createWith(data);
        const tree2 = await MerkleTree.createWith(data);

        const result = await tree1.compareWith(tree2);

        expect(result).to.equal(true);
    });

    it('correctly compares the hash of two trees that contain different data with #compareWith', async () => {
        const data1 = [true, false, 1, -2, {}, 'foo', 0.000000293];
        const data2 = [false, 'foo', 'bar', 1, {}, 2];
        const tree1 = await MerkleTree.createWith(data1);
        const tree2 = await MerkleTree.createWith(data2);

        const result = await tree1.compareWith(tree2);

        expect(result).to.equal(false);
    });

    it('is dirty after calling #createWith', async () => {
        const data = [1, 2, 3];
        
        const tree = await MerkleTree.createWith(data);
        
        expect(tree.isDirty).to.equal(true);
    });

    it('is dirty after calling #addNode', async () => {
        const tree = MerkleTree.create();

        tree.addNode('newnode');

        expect(tree.isDirty).to.equal(true);
    });

    it('is dirty after calling #addNodes', async () => {
        const data = [1, 2, 3];
        const tree = MerkleTree.create();

        await tree.addNodes(data);

        expect(tree.isDirty).to.equal(true);
    })

    it('is dirty after creating a tree with MerkleTree.create', async () => {
        const tree = MerkleTree.create();

        expect(tree.isDirty).to.equal(true);
    });

    it('is not dirty after calling #computeRootHash with valid data', async () => {
        const data = [1, 2, 3];
        const tree = await MerkleTree.createWith(data);
        
        await tree.computeRootHash();

        expect(tree.isDirty).to.equal(false);
    });

    it('is dirty after adding ndoes, computing root hash, and then adding a node', async () => {
        const data = [1, 2, 3];
        const tree = await MerkleTree.createWith(data);

        await tree.computeRootHash();
        await tree.addNode(4);

        expect(tree.isDirty).to.equal(true);
    });

    it('throws error when auditing a tree with no data', async () => {
        const data = [];
        const tree = await MerkleTree.createWith(data);

        expect(tree.computeRootHash()).to.be.rejectedWith(InvalidDataError);
    });

    it('throws an error when attempting to hash undefined data', async () => {
        const data = undefined;

        expect(Hashing.hashFrom(data)).to.be.rejectedWith(InvalidDataError);
    });

    it('throws an error when attempting to hash null data', async () => {
        const data = null;

        expect(Hashing.hashFrom(data)).to.be.rejectedWith(InvalidDataError);
    });

    it('throws an error when attempting to hash a function type', async () => {
        const data = () => { return 'oops'; };

        expect(Hashing.hashFrom(data)).to.be.rejectedWith(InvalidDataError);
    });

    it('throws an error when attempting to hash a class type', async () => {
        const data = class { constructor(private oops: string) { } };

        expect(Hashing.hashFrom(data)).to.be.rejectedWith(InvalidDataError);
    });
});