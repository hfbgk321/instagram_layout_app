export type SplitType = 'horizontal' | 'vertical';

export interface BSPNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  splitType?: SplitType;
  splitRatio?: number; // 0 to 1
  left?: BSPNode;
  right?: BSPNode;
  contentId?: string;
}
