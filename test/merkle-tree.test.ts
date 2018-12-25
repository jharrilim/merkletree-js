/** global describe it */
import { expect } from 'chai';
import { MerkleTree } from '../src/index';
describe('MerkleTree', () => {
    it('returns a MerkleTree from #create', () => {
        expect(MerkleTree.create()).is.instanceOf(MerkleTree);
    });
});