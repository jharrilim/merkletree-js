# merkletree-js

Merkle Tree for Javascript/Typescript on Node. Currently, browser is not supported.

| Build | Status |
| --- | --- |
| Overall | [![Build Status]](https://travis-ci.org/jharrilim/merkletree-js) |
| Node 8 | [![Node 8]](https://travis-ci.org/jharrilim/merkletree-js) |
| Node 9 | [![Node 9]](https://travis-ci.org/jharrilim/merkletree-js) |
| Node 10 | [![Node 10]](https://travis-ci.org/jharrilim/merkletree-js) |
| Node 11 | [![Node 11]](https://travis-ci.org/jharrilim/merkletree-js) |

| Coverage | Score |
| --- | --- |
| Codacy | [![Codacy Badge]](https://www.codacy.com/app/jharri50/merkletree-js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=jharrilim/merkletree-js&amp;utm_campaign=Badge_Grade) |
| Codecov | [![Codecov]](https://codecov.io/gh/jharrilim/merkletree-js) |



[Build Status]: https://travis-ci.org/jharrilim/merkletree-js.svg?branch=master
[Codecov]: https://codecov.io/gh/jharrilim/merkletree-js/branch/master/graph/badge.svg
[Codacy Badge]: https://api.codacy.com/project/badge/Grade/56df89b36bfe4c6396e105184aceb66a
[Node 8]: https://travis-matrix-badges.herokuapp.com/repos/jharrilim/merkletree-js/branches/master/1
[Node 9]: https://travis-matrix-badges.herokuapp.com/repos/jharrilim/merkletree-js/branches/master/2
[Node 10]: https://travis-matrix-badges.herokuapp.com/repos/jharrilim/merkletree-js/branches/master/3
[Node 11]: https://travis-matrix-badges.herokuapp.com/repos/jharrilim/merkletree-js/branches/master/4

## Table of Contents
- [merkletree-js](#merkletree-js)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
    - [Create a Merkle Tree](#create-a-merkle-tree)
      - [Without Data](#without-data)
      - [With Data](#with-data)
    - [Add Some Data](#add-some-data)
    - [Compare Data](#compare-data)

## Usage

### Create a Merkle Tree

To create a Merkle Tree, you may do so in one of the following ways:

#### Without Data

```js
import { MerkleTree } from 'merkletree-js';

// Creates a new instance of the MerkleTree
const newTree = MerkleTree.create();
```

#### With Data

You may create a MerkleTree with some data that you already have defined.

```js
import { MerkleTree } from 'merkletree-js';

const data = [ 'some', 'data', { msg: 'of any type', except: 'no nulls, functions, or undefined' }, true ];

(async () => {
    const newTree = await MerkleTree.createWith(data);
})().catch(_ => {});
```

### Add Some Data

To add data, you may use either #addNode to add one thing, or #addNodes to add multiple things.

```js
import { MerkleTree } from 'merkletree-js';

export async function doCoolThings() {
    const newTree = MerkleTree.create();

    await newTree.addNodes(['hello', 'world']);
    await newTree.addNode(42);
}
```

### Compare Data

To make use of the merkle tree, you will want to compare data across multiple trees. You may do so
by using MerkleTree#compareWith, or by using MerkleTree#computeRootHash and comparing the hash yourself:

```js
import { MerkleTree } from 'merkletree-js';

export async function compareTrees() {
    const sharedData = ['this', 'is', 'shared', 'data'];
    const firstTree = await MerkleTree.createWith(sharedData);
    const secondTree = await MerkleTree.createWith(sharedData);

    // Does intermediate actions with the hashes
    const attempt1 = await compareAndSave(firstTree, secondTree);

    // Compare directly
    const attempt2 = await firstTree.compareWith(secondTree);

    return attempt1 && attempt2;
}

async function compareAndSave(firstTree, secondTree) {  // This is not price matching

    const firstTreeHash = await firstTree.computeRootHash();
    const secondTreeHash = await secondTree.computeRootHash();
    try {
        // Perhaps do stuff such as
        await SomeMongooseModel.save(firstTreeHash);
        await SomeMongooseModel.save(secondTreeHash);
    } catch (e) {
        uhOhMadeAMistake(e);
        return false;
    }

    return firstTreeHash === secondTreeHash;
}

```