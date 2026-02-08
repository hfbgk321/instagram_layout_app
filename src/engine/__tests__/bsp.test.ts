import { createRootNode, splitNode, getLeafNodes } from '../bsp';

describe('BSP Engine', () => {
  it('should create a root node', () => {
    const root = createRootNode(100, 200);
    expect(root.width).toBe(100);
    expect(root.height).toBe(200);
    expect(root.x).toBe(0);
    expect(root.y).toBe(0);
  });

  it('should split a node vertically', () => {
    const root = createRootNode(100, 200);
    const split = splitNode(root, 'vertical', 0.6);
    expect(split.splitType).toBe('vertical');
    expect(split.splitRatio).toBe(0.6);
    expect(split.left?.width).toBe(60);
    expect(split.right?.width).toBe(40);
    expect(split.left?.height).toBe(200);
    expect(split.right?.height).toBe(200);
    expect(split.right?.x).toBe(60);
  });

  it('should split a node horizontally', () => {
    const root = createRootNode(100, 200);
    const split = splitNode(root, 'horizontal', 0.4);
    expect(split.splitType).toBe('horizontal');
    expect(split.splitRatio).toBe(0.4);
    expect(split.left?.height).toBe(80);
    expect(split.right?.height).toBe(120);
    expect(split.left?.width).toBe(100);
    expect(split.right?.width).toBe(100);
    expect(split.right?.y).toBe(80);
  });

  it('should return leaf nodes', () => {
    const root = createRootNode(100, 200);
    const split1 = splitNode(root, 'vertical', 0.5);
    const split2 = splitNode(split1.left!, 'horizontal', 0.5);
    
    const leaves = getLeafNodes({ ...split1, left: split2 });
    expect(leaves.length).toBe(3);
  });
});
