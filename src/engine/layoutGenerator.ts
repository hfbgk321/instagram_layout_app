import { BSPNode, SplitType } from './types';
import { createRootNode, splitNode, getLeafNodes, updateNodeInTree } from './bsp';

export function generateRandomLayout(
  width: number,
  height: number,
  itemCount: number
): BSPNode {
  if (itemCount <= 0) return createRootNode(width, height);

  let root = createRootNode(width, height);
  
  for (let i = 0; i < itemCount - 1; i++) {
    const leaves = getLeafNodes(root);
    // Pick a random leaf to split
    const leafToSplit = leaves[Math.floor(Math.random() * leaves.length)];
    
    // Decide split type based on aspect ratio to keep cells relatively square
    // or just alternating. Let's use aspect ratio.
    const splitType: SplitType = 
      leafToSplit.width > leafToSplit.height ? 'vertical' : 'horizontal';
    
    // Random split ratio between 0.3 and 0.7
    const splitRatio = 0.3 + Math.random() * 0.4;
    
    // Create the split node
    const newNode = splitNode(leafToSplit, splitType, splitRatio);
    
    // Update the tree
    root = updateNodeInTree(root, leafToSplit.id, newNode);
  }
  
  // Assign content IDs to leaf nodes
  const leaves = getLeafNodes(root);
  leaves.forEach((leaf, index) => {
    leaf.contentId = `photo_${index}`;
  });
  
  return root;
}
