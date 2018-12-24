export class MerkleTree {
    private hash: String;
    private nodes: MerkleTreeNode[];

    constructor() {
        this.hash = '';
        this.nodes = [];
    }

    addNode(obj: any) {
        this.nodes.push(obj);
    }

    audit() {

    }
}

class MerkleTreeNode {
    static alg = 'SHA-512';

    public get hash() : string {
        return '';
    }
    
    private children: Array<MerkleTreeNode>;

    private constructor() {
        this.children = [];
    }

    private async hashFrom(data: any): Promise<string> {
        return isBrowser ? await this.hashForBrowser(data) : this.hashForNode(data);
    }

    private async hashForBrowser(data: any): Promise<string> {
        const d = await window.crypto.subtle.digest(MerkleTreeNode.alg, this.encodeData(data));
        const dView = new Uint8Array(d);
        return dView.join('');
    }

    private async hashForNode(data: any): Promise<string> {
        const crypto = await import('crypto');
        const hash = crypto.createHash(MerkleTreeNode.alg).update(this.encodeData(data));
        return hash.digest().join('');
    }

    private encodeData(data: any): Uint8Array {
        return new TextEncoder().encode(JSON.stringify(data));
    }
}

function isBrowser() {
    return typeof window !== 'undefined';
}
