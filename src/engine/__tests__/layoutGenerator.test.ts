import { generateRandomLayout } from '../layoutGenerator';
import { getLeafNodes } from '../bsp';

describe('Layout Generator', () => {
  it('should generate a layout with correct number of items', () => {
    const itemCount = 5;
    const root = generateRandomLayout(100, 100, itemCount);
    const leaves = getLeafNodes(root);
    expect(leaves.length).toBe(itemCount);
  });

  it('should handle itemCount 1', () => {
    const root = generateRandomLayout(100, 100, 1);
    const leaves = getLeafNodes(root);
    expect(leaves.length).toBe(1);
  });
});
