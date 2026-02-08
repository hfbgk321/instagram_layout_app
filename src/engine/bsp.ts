import { BSPNode, SplitType } from './types';

export function createRootNode(width: number, height: number): BSPNode {
  return {
    id: Math.random().toString(36).substr(2, 9),
    x: 0,
    y: 0,
    width,
    height,
  };
}

export function splitNode(
  node: BSPNode,
  splitType: SplitType,
  splitRatio: number = 0.5
): BSPNode {
  if (node.left || node.right) {
    throw new Error('Node is already split');
  }

  const leftId = Math.random().toString(36).substr(2, 9);
  const rightId = Math.random().toString(36).substr(2, 9);

  const newNode: BSPNode = {
    ...node,
    splitType,
    splitRatio,
  };

  if (splitType === 'vertical') {
    const leftWidth = node.width * splitRatio;
    newNode.left = {
      id: leftId,
      x: node.x,
      y: node.y,
      width: leftWidth,
      height: node.height,
    };
    newNode.right = {
      id: rightId,
      x: node.x + leftWidth,
      y: node.y,
      width: node.width - leftWidth,
      height: node.height,
    };
  } else {
    const leftHeight = node.height * splitRatio;
    newNode.left = {
      id: leftId,
      x: node.x,
      y: node.y,
      width: node.width,
      height: leftHeight,
    };
    newNode.right = {
      id: rightId,
      x: node.x,
      y: node.y + leftHeight,
      width: node.width,
      height: node.height - leftHeight,
    };
  }

  return newNode;
}

export function getLeafNodes(node: BSPNode): BSPNode[] {
  if (!node.left && !node.right) {
    return [node];
  }
  return [...getLeafNodes(node.left!), ...getLeafNodes(node.right!)];
}

export function getInternalNodes(node: BSPNode): BSPNode[] {
  if (!node.left || !node.right) {
    return [];
  }
  return [
    node,
    ...getInternalNodes(node.left),
    ...getInternalNodes(node.right),
  ];
}

export function updateNodeDimensions(
  node: BSPNode,
  x: number,
  y: number,
  width: number,
  height: number
): BSPNode {
  const updatedNode: BSPNode = {
    ...node,
    x,
    y,
    width,
    height,
  };

  if (
    updatedNode.left &&
    updatedNode.right &&
    updatedNode.splitType &&
    updatedNode.splitRatio !== undefined
  ) {
    if (updatedNode.splitType === 'vertical') {
      const leftWidth = width * updatedNode.splitRatio;
      updatedNode.left = updateNodeDimensions(
        updatedNode.left,
        x,
        y,
        leftWidth,
        height
      );
      updatedNode.right = updateNodeDimensions(
        updatedNode.right,
        x + leftWidth,
        y,
        width - leftWidth,
        height
      );
    } else {
      const leftHeight = height * updatedNode.splitRatio;
      updatedNode.left = updateNodeDimensions(
        updatedNode.left,
        x,
        y,
        width,
        leftHeight
      );
      updatedNode.right = updateNodeDimensions(
        updatedNode.right,
        x,
        y + leftHeight,
        width,
        height - leftHeight
      );
    }
  }

  return updatedNode;
}

export function findNodeById(node: BSPNode, id: string): BSPNode | undefined {
  if (node.id === id) {
    return node;
  }
  if (node.left) {
    const found = findNodeById(node.left, id);
    if (found) return found;
  }
  if (node.right) {
    const found = findNodeById(node.right, id);
    if (found) return found;
  }
  return undefined;
}

export function updateNodeInTree(
  node: BSPNode,
  id: string,
  updatedNode: BSPNode
): BSPNode {
  if (node.id === id) {
    return updatedNode;
  }
  if (node.left || node.right) {
    const newNode = { ...node };
    if (node.left) {
      newNode.left = updateNodeInTree(node.left, id, updatedNode);
    }
    if (node.right) {
      newNode.right = updateNodeInTree(node.right, id, updatedNode);
    }
    return newNode;
  }
  return node;
}

export function updateSplitRatio(
  root: BSPNode,
  nodeId: string,
  newRatio: number
): BSPNode {
  const node = findNodeById(root, nodeId);
  if (!node || !node.left || !node.right || !node.splitType) return root;

  const updatedNode = { ...node, splitRatio: newRatio };

  if (node.splitType === 'vertical') {
    const leftWidth = node.width * newRatio;
    updatedNode.left = updateNodeDimensions(
      node.left,
      node.x,
      node.y,
      leftWidth,
      node.height
    );
    updatedNode.right = updateNodeDimensions(
      node.right,
      node.x + leftWidth,
      node.y,
      node.width - leftWidth,
      node.height
    );
  } else {
    const leftHeight = node.height * newRatio;
    updatedNode.left = updateNodeDimensions(
      node.left,
      node.x,
      node.y,
      node.width,
      leftHeight
    );
    updatedNode.right = updateNodeDimensions(
      node.right,
      node.x,
      node.y + leftHeight,
      node.width,
      node.height - leftHeight
    );
  }

  return updateNodeInTree(root, nodeId, updatedNode);
}
