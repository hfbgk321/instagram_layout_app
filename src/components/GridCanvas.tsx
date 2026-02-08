import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';
import { BSPNode } from '../engine/types';
import { GridCell } from './GridCell';
import { SplitHandle } from './SplitHandle';
import { DragPreview } from './DragPreview';

interface GridCanvasProps {
  leaves: BSPNode[];
  internalNodes: BSPNode[];
  transform: SharedValue<{ translateX: number; translateY: number; scale: number }[]>;
  derivedLeaves: SharedValue<{ id: string; x: number; y: number; width: number; height: number }[]>;
  activeNodeId: string | null;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  activeHandleIdSV: SharedValue<string | null>;
  tempSplitRatio: SharedValue<number | undefined>;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  leaves,
  internalNodes,
  transform,
  derivedLeaves,
  activeNodeId,
  dragX,
  dragY,
  activeHandleIdSV,
  tempSplitRatio,
}) => {
  return (
    <Canvas style={styles.canvas}>
      <Group transform={transform}>
        {leaves.map((leaf, index) => (
          <GridCell
            key={leaf.id}
            leaf={leaf}
            index={index}
            derivedLeaves={derivedLeaves}
            activeNodeId={activeNodeId}
          />
        ))}
        {internalNodes.map((node) => (
          <SplitHandle
            key={`handle-${node.id}`}
            node={node}
            activeHandleIdSV={activeHandleIdSV}
            tempSplitRatio={tempSplitRatio}
          />
        ))}
        {activeNodeId && (
          <Group>
            {leaves
              .filter((l) => l.id === activeNodeId)
              .map((leaf) => (
                <DragPreview
                  key={`drag-${leaf.id}`}
                  leaf={leaf}
                  dragX={dragX}
                  dragY={dragY}
                />
              ))}
          </Group>
        )}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});