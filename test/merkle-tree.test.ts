/** global describe it */
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { MerkleTree } from '../src/index';

use(chaiAsPromised);

describe('MerkleTree', () => {
    it('returns a MerkleTree from MerkleTree.create', () => {
        const tree = MerkleTree.create();

        expect(tree).to.be.instanceOf(MerkleTree);
        expect(tree.length).to.equal(0);
    });

    it('can add multiple elements to a MerkleTree using #addNodes', async () => {
        const data = [1,2,3,4,5];
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

    it('can audit a vector with a length power to 2 (2 ^ 3) using #audit', async () => {
        const dataToAudit = [1, 2, 3, 4, 5, 6, 7, 8];
        const tree = await MerkleTree.createWith(dataToAudit);
        
        const auditResult = await tree.audit();
        
        expect(auditResult).to.be.a('string');
    });

    it('can audit a vector with a length that is odd using #audit', async () => {
        const dataToAudit = [1, 2, 3, 4, 5, 6, 7];
        const tree = await MerkleTree.createWith(dataToAudit);
        
        const auditResult = await tree.audit();
        
        expect(auditResult).to.be.a('string');
    });

    it('can audit a vector with multiple data types using #audit', async () => {
        const dataToAudit = [1, true, 'foo', { bar: 'baz' }, MerkleTree.create()];
        const tree = await MerkleTree.createWith(dataToAudit);
        
        const auditResult = await tree.audit();
        
        expect(auditResult).to.be.a('string');
    });

    it('can create equal hashes based off of the same data for multiple trees', async () => {
        const dataToAudit = [1, 2, 3, 4, 5, 6, 7];
        const tree1 = await MerkleTree.createWith(dataToAudit);
        const tree2 = await MerkleTree.createWith(dataToAudit);
        
        const hash1 = await tree1.audit();
        const hash2 = await tree2.audit();

        expect(hash1).to.equal(hash2);
    });

    it('throws error when auditing a tree with no data', async () => {
        const dataToAudit = [];
        const tree = await MerkleTree.createWith(dataToAudit);
        
        expect(tree.audit()).to.be.rejectedWith(Error);
    });
});