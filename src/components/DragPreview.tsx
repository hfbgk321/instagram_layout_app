import React from 'react';
import { Rect } from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { BSPNode } from '../engine/types';

interface DragPreviewProps {
  leaf: BSPNode;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
}

export const DragPreview: React.FC<DragPreviewProps> = ({
  leaf,
  dragX,
  dragY,
}) => {
  const contentId = leaf.contentId || leaf.id;
  const colorIndex = parseInt(contentId.substring(0, 8), 36);

  const x = useDerivedValue(() => dragX.value - leaf.width / 2);
  const y = useDerivedValue(() => dragY.value - leaf.height / 2);

  return (
    <Rect
      x={x}
      y={y}
      width={leaf.width}
      height={leaf.height}
      color={`hsl(${colorIndex % 360}, 50%, 75%)`}
      opacity={0.8}
    />
  );
};
