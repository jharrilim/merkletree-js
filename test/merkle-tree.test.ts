/** global describe it */
import { expect } from 'chai';
import { MerkleTree } from '../src/index';
describe('MerkleTree', () => {
    it('returns a MerkleTree from #create', () => {
        expect(MerkleTree.create()).to.be.instanceOf(MerkleTree);
    });

    it('can create a MerkleTree with predefined elements using #createWith', async () => {
        const predefinedData = [1, 2, 3];
        const treeWithPredefinedData = await MerkleTree.createWith(predefinedData);
        expect(treeWithPredefinedData).to.be.instanceOf(MerkleTree);
    });

    it('can audit a vector with a length power to 2 (2 ^ 3)', async () => {
        const dataToAudit = [1, 2, 3, 4, 5, 6, 7, 8];
        const tree = await MerkleTree.createWith(dataToAudit);
        const auditResult = await tree.audit();
        expect(auditResult).to.be.a('string');
    });

    it('can audit a vector with a length that is odd', async () => {
        const dataToAudit = [1, 2, 3, 4, 5, 6, 7];
        const tree = await MerkleTree.createWith(dataToAudit);
        const auditResult = await tree.audit();
        expect(auditResult).to.be.a('string');
    });

    it('can audit a vector with multiple data types', async () => {
        const dataToAudit = [1, true, 'foo', { bar: 'baz' }, MerkleTree.create()];
        const tree = await MerkleTree.createWith(dataToAudit);
        const auditResult = await tree.audit();
        expect(auditResult).to.be.a('string');
    });
});