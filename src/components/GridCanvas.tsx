import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Rect, Group, Circle } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS, useDerivedValue } from 'react-native-reanimated';
import { BSPNode } from '../engine/types';
import { getLeafNodes, getInternalNodes, computeLayout } from '../engine/bsp';
import { useLayoutStore } from '../store/useLayoutStore';

interface GridCanvasProps {
  rootNode: BSPNode;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({ rootNode }) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const { swapContent, updateSplitRatio } = useLayoutStore();
  
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Performance Optimization: Use shared values for active handle and temporary split ratio
  const activeHandleIdSV = useSharedValue<string | null>(null);
  const tempSplitRatio = useSharedValue<number | undefined>(undefined);

  const leaves = getLeafNodes(rootNode);
  const internalNodes = getInternalNodes(rootNode);

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      let foundHandle = false;
      for (const node of internalNodes) {
        const handleX = node.splitType === 'vertical' ? node.x + node.width * (node.splitRatio || 0.5) : node.x + node.width / 2;
        const handleY = node.splitType === 'horizontal' ? node.y + node.height * (node.splitRatio || 0.5) : node.y + node.height / 2;
        const dist = Math.sqrt(Math.pow(e.x - handleX, 2) + Math.pow(e.y - handleY, 2));
        if (dist < 30) {
          activeHandleIdSV.value = node.id;
          tempSplitRatio.value = node.splitRatio || 0.5;
          foundHandle = true;
          break;
        }
      }

      if (!foundHandle) {
        const node = leaves.find(
          (leaf) =>
            e.x >= leaf.x &&
            e.x <= leaf.x + leaf.width &&
            e.y >= leaf.y &&
            e.y <= leaf.y + leaf.height
        );
        if (node) {
          runOnJS(setActiveNodeId)(node.id);
          dragX.value = e.x;
          dragY.value = e.y;
        }
      }
    })
    .onUpdate((e) => {
      if (activeHandleIdSV.value) {
        // Find the node on UI thread if possible, or use a map
        // For now we assume we can find it in the internalNodes list which is small
        const handleId = activeHandleIdSV.value;
        const node = internalNodes.find(n => n.id === handleId);
        if (node) {
          let newRatio = 0.5;
          if (node.splitType === 'vertical') {
            newRatio = (e.x - node.x) / node.width;
          } else {
            newRatio = (e.y - node.y) / node.height;
          }
          tempSplitRatio.value = Math.max(0.1, Math.min(0.9, newRatio));
        }
      } else if (activeNodeId) {
        dragX.value = e.x;
        dragY.value = e.y;
      } else {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd((e) => {
      if (activeHandleIdSV.value && tempSplitRatio.value !== undefined) {
        runOnJS(updateSplitRatio)(activeHandleIdSV.value, tempSplitRatio.value);
      } else if (activeNodeId) {
        const targetNode = leaves.find(
          (leaf) =>
            leaf.id !== activeNodeId &&
            e.x >= leaf.x &&
            e.x <= leaf.x + leaf.width &&
            e.y >= leaf.y &&
            e.y <= leaf.y + leaf.height
        );
        if (targetNode) {
          runOnJS(swapContent)(activeNodeId, targetNode.id);
        }
      } else {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
      activeHandleIdSV.value = null;
      tempSplitRatio.value = undefined;
      runOnJS(setActiveNodeId)(null);
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const transform = useDerivedValue(() => [
    { translateX: translateX.value },
    { translateY: translateY.value },
    { scale: scale.value },
  ]);

  // Derived layout for smooth UI thread updates
  const derivedLeaves = useDerivedValue(() => {
    return computeLayout(
      rootNode,
      rootNode.x,
      rootNode.y,
      rootNode.width,
      rootNode.height,
      activeHandleIdSV.value || undefined,
      tempSplitRatio.value
    );
  });

  return (
    <GestureDetector gesture={composed}>
      <Canvas style={styles.canvas}>
        <Group transform={transform}>
          {leaves.map((leaf, index) => {
            const contentId = leaf.contentId || leaf.id;
            const colorIndex = parseInt(contentId.substring(0, 8), 36);
            
            // Reanimated derived values for rect dimensions
            const rectX = useDerivedValue(() => derivedLeaves.value[index]?.x ?? leaf.x);
            const rectY = useDerivedValue(() => derivedLeaves.value[index]?.y ?? leaf.y);
            const rectW = useDerivedValue(() => derivedLeaves.value[index]?.width ?? leaf.width);
            const rectH = useDerivedValue(() => derivedLeaves.value[index]?.height ?? leaf.height);

            return (
              <Group key={leaf.id}>
                <Rect
                  x={rectX}
                  y={rectY}
                  width={rectW}
                  height={rectH}
                  color="white"
                />
                <Rect
                  x={useDerivedValue(() => rectX.value + 1)}
                  y={useDerivedValue(() => rectY.value + 1)}
                  width={useDerivedValue(() => rectW.value - 2)}
                  height={useDerivedValue(() => rectH.value - 2)}
                  color={
                    activeNodeId === leaf.id
                      ? 'rgba(0,0,0,0.1)'
                      : `hsl(${colorIndex % 360}, 50%, 75%)`
                  }
                />
              </Group>
            );
          })}
          {internalNodes.map((node) => {
             // Handle position also derived from split ratios
             const handleX = useDerivedValue(() => {
                const isOverridden = node.id === activeHandleIdSV.value;
                const ratio = isOverridden ? (tempSplitRatio.value ?? node.splitRatio ?? 0.5) : (node.splitRatio ?? 0.5);
                return node.splitType === 'vertical' ? node.x + node.width * ratio : node.x + node.width / 2;
             });
             const handleY = useDerivedValue(() => {
                const isOverridden = node.id === activeHandleIdSV.value;
                const ratio = isOverridden ? (tempSplitRatio.value ?? node.splitRatio ?? 0.5) : (node.splitRatio ?? 0.5);
                return node.splitType === 'horizontal' ? node.y + node.height * ratio : node.y + node.height / 2;
             });
             
             return (
               <Circle
                 key={`handle-${node.id}`}
                 cx={handleX}
                 cy={handleY}
                 r={10}
                 color="rgba(0,0,0,0.2)"
               />
             );
          })}
          {activeNodeId && (
            <Group>
              {leaves
                .filter((l) => l.id === activeNodeId)
                .map((leaf) => {
                  const contentId = leaf.contentId || leaf.id;
                  const colorIndex = parseInt(contentId.substring(0, 8), 36);
                  return (
                    <Rect
                      key={`drag-${leaf.id}`}
                      x={useDerivedValue(() => dragX.value - leaf.width / 2)}
                      y={useDerivedValue(() => dragY.value - leaf.height / 2)}
                      width={leaf.width}
                      height={leaf.height}
                      color={`hsl(${colorIndex % 360}, 50%, 75%)`}
                      opacity={0.8}
                    />
                  );
                })}
            </Group>
          )}
        </Group>
      </Canvas>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});