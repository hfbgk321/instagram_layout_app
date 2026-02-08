import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Rect, Group, Circle } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS, useDerivedValue } from 'react-native-reanimated';
import { BSPNode } from '../engine/types';
import { getLeafNodes, getInternalNodes } from '../engine/bsp';
import { useLayoutStore } from '../store/useLayoutStore';

interface GridCanvasProps {
  rootNode: BSPNode;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({ rootNode }) => {
  const leaves = getLeafNodes(rootNode);
  const internalNodes = getInternalNodes(rootNode);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeHandleId, setActiveHandleId] = useState<string | null>(null);
  const { swapContent, updateSplitRatio } = useLayoutStore();
  
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      const handle = internalNodes.find((node) => {
        const handleX = node.splitType === 'vertical' ? node.x + node.width * (node.splitRatio || 0.5) : node.x + node.width / 2;
        const handleY = node.splitType === 'horizontal' ? node.y + node.height * (node.splitRatio || 0.5) : node.y + node.height / 2;
        const dist = Math.sqrt(Math.pow(e.x - handleX, 2) + Math.pow(e.y - handleY, 2));
        return dist < 30; // Larger hit area for handles
      });

      if (handle) {
        runOnJS(setActiveHandleId)(handle.id);
      } else {
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
      if (activeHandleId) {
        const node = internalNodes.find((n) => n.id === activeHandleId);
        if (node) {
          let newRatio = 0.5;
          if (node.splitType === 'vertical') {
            newRatio = (e.x - node.x) / node.width;
          } else {
            newRatio = (e.y - node.y) / node.height;
          }
          newRatio = Math.max(0.1, Math.min(0.9, newRatio));
          runOnJS(updateSplitRatio)(activeHandleId, newRatio);
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
      if (activeNodeId) {
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
      runOnJS(setActiveNodeId)(null);
      runOnJS(setActiveHandleId)(null);
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

  return (
    <GestureDetector gesture={composed}>
      <Canvas style={styles.canvas}>
        <Group transform={transform}>
          {leaves.map((leaf) => {
            const contentId = leaf.contentId || leaf.id;
            const colorIndex = parseInt(contentId.substring(0, 8), 36);
            
            return (
              <Group key={leaf.id}>
                <Rect
                  x={leaf.x}
                  y={leaf.y}
                  width={leaf.width}
                  height={leaf.height}
                  color="white"
                />
                <Rect
                  x={leaf.x + 1}
                  y={leaf.y + 1}
                  width={leaf.width - 2}
                  height={leaf.height - 2}
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
             const handleX = node.splitType === 'vertical' ? node.x + node.width * (node.splitRatio || 0.5) : node.x + node.width / 2;
             const handleY = node.splitType === 'horizontal' ? node.y + node.height * (node.splitRatio || 0.5) : node.y + node.height / 2;
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
                      x={dragX.value - leaf.width / 2}
                      y={dragY.value - leaf.height / 2}
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