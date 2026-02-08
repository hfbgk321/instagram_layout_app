import React from 'react';
import { Circle } from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { BSPNode } from '../engine/types';

interface SplitHandleProps {
  node: BSPNode;
  activeHandleIdSV: SharedValue<string | null>;
  tempSplitRatio: SharedValue<number | undefined>;
}

export const SplitHandle: React.FC<SplitHandleProps> = ({
  node,
  activeHandleIdSV,
  tempSplitRatio,
}) => {
  const handleX = useDerivedValue(() => {
    const isOverridden = node.id === activeHandleIdSV.value;
    const ratio = isOverridden
      ? (tempSplitRatio.value ?? node.splitRatio ?? 0.5)
      : (node.splitRatio ?? 0.5);
    return node.splitType === 'vertical'
      ? node.x + node.width * ratio
      : node.x + node.width / 2;
  });

  const handleY = useDerivedValue(() => {
    const isOverridden = node.id === activeHandleIdSV.value;
    const ratio = isOverridden
      ? (tempSplitRatio.value ?? node.splitRatio ?? 0.5)
      : (node.splitRatio ?? 0.5);
    return node.splitType === 'horizontal'
      ? node.y + node.height * ratio
      : node.y + node.height / 2;
  });

  return (
    <Circle
      cx={handleX}
      cy={handleY}
      r={10}
      color="rgba(0,0,0,0.2)"
    />
  );
};
