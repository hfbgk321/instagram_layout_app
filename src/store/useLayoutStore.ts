import { create } from 'zustand';
import { BSPNode } from '../engine/types';
import { updateNodeInTree, findNodeById, updateSplitRatio } from '../engine/bsp';

interface LayoutState {
  rootNode: BSPNode | null;
  setRootNode: (node: BSPNode) => void;
  swapContent: (id1: string, id2: string) => void;
  updateSplitRatio: (id: string, newRatio: number) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  rootNode: null,
  setRootNode: (node) => set({ rootNode: node }),
  swapContent: (id1, id2) =>
    set((state) => {
      if (!state.rootNode) return state;
      const node1 = findNodeById(state.rootNode, id1);
      const node2 = findNodeById(state.rootNode, id2);
      if (!node1 || !node2) return state;

      const content1 = node1.contentId || node1.id;
      const content2 = node2.contentId || node2.id;

      let newRoot = updateNodeInTree(state.rootNode, id1, {
        ...node1,
        contentId: content2,
      });
      newRoot = updateNodeInTree(newRoot, id2, {
        ...node2,
        contentId: content1,
      });

      return { rootNode: newRoot };
    }),
  updateSplitRatio: (id, newRatio) =>
    set((state) => {
      if (!state.rootNode) return state;
      return { rootNode: updateSplitRatio(state.rootNode, id, newRatio) };
    }),
}));
