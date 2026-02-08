import { Skia } from '@shopify/react-native-skia';
import { BSPNode } from './types';
import { getLeafNodes, updateNodeDimensions } from './bsp';

export function exportToImage(rootNode: BSPNode, width: number, height: number): string {
  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (!surface) throw new Error('Could not create offscreen surface');
  
  const canvas = surface.getCanvas();
  // Update node dimensions for the export resolution
  const exportRoot = updateNodeDimensions(rootNode, 0, 0, width, height);
  const leaves = getLeafNodes(exportRoot);
  
  const paint = Skia.Paint();
  
  leaves.forEach((leaf, index) => {
    const contentId = leaf.contentId || leaf.id;
    const colorIndex = parseInt(contentId.substring(0, 8), 36);
    
    // Draw white background
    paint.setColor(Skia.Color('white'));
    canvas.drawRect({ x: leaf.x, y: leaf.y, width: leaf.width, height: leaf.height }, paint);
    
    // Simple color generation (RGB)
    const r = (colorIndex % 256);
    const g = ((colorIndex / 256) % 256);
    const b = ((colorIndex / (256 * 256)) % 256);
    
    paint.setColor(Skia.Color(`rgb(${r}, ${g}, ${b})`));
    canvas.drawRect({ x: leaf.x + 1, y: leaf.y + 1, width: leaf.width - 2, height: leaf.height - 2 }, paint);
  });
  
  const image = surface.makeImageSnapshot();
  const data = image.encodeToBase64();
  return data;
}
