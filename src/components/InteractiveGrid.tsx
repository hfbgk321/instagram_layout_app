import React, { useState } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS, useDerivedValue } from 'react-native-reanimated';
import { BSPNode } from '../engine/types';
import { getLeafNodes, getInternalNodes, computeLayout } from '../engine/bsp';
import { useLayoutStore } from '../store/useLayoutStore';
import { GridCanvas } from './GridCanvas';

interface InteractiveGridProps {
  rootNode: BSPNode;
}

export const InteractiveGrid: React.FC<InteractiveGridProps> = ({ rootNode }) => {
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
      <GridCanvas
        leaves={leaves}
        internalNodes={internalNodes}
        transform={transform}
        derivedLeaves={derivedLeaves}
        activeNodeId={activeNodeId}
        dragX={dragX}
        dragY={dragY}
        activeHandleIdSV={activeHandleIdSV}
        tempSplitRatio={tempSplitRatio}
      />
    </GestureDetector>
  );
};
