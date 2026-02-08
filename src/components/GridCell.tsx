import React from 'react';
import { Rect, Group } from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { BSPNode } from '../engine/types';

interface GridCellProps {
  leaf: BSPNode;
  index: number;
  derivedLeaves: SharedValue<{ id: string; x: number; y: number; width: number; height: number }[]>;
  activeNodeId: string | null;
}

export const GridCell: React.FC<GridCellProps> = ({
  leaf,
  index,
  derivedLeaves,
  activeNodeId,
}) => {
  const contentId = leaf.contentId || leaf.id;
  const colorIndex = parseInt(contentId.substring(0, 8), 36);

  // Reanimated derived values for rect dimensions
  const rectX = useDerivedValue(() => derivedLeaves.value[index]?.x ?? leaf.x);
  const rectY = useDerivedValue(() => derivedLeaves.value[index]?.y ?? leaf.y);
  const rectW = useDerivedValue(() => derivedLeaves.value[index]?.width ?? leaf.width);
  const rectH = useDerivedValue(() => derivedLeaves.value[index]?.height ?? leaf.height);

  const innerX = useDerivedValue(() => rectX.value + 1);
  const innerY = useDerivedValue(() => rectY.value + 1);
  const innerW = useDerivedValue(() => rectW.value - 2);
  const innerH = useDerivedValue(() => rectH.value - 2);

  const color = activeNodeId === leaf.id
    ? 'rgba(0,0,0,0.1)'
    : `hsl(${colorIndex % 360}, 50%, 75%)`;

  return (
    <Group>
      <Rect
        x={rectX}
        y={rectY}
        width={rectW}
        height={rectH}
        color="white"
      />
      <Rect
        x={innerX}
        y={innerY}
        width={innerW}
        height={innerH}
        color={color}
      />
    </Group>
  );
};
