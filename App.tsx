import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, TouchableOpacity, Text, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLayoutStore } from './src/store/useLayoutStore';
import { generateRandomLayout } from './src/engine/layoutGenerator';
import { GridCanvas } from './src/components/GridCanvas';
import { exportToImage } from './src/engine/export';

function App() {
  const { width, height } = useWindowDimensions();
  const { rootNode, setRootNode } = useLayoutStore();

  useEffect(() => {
    if (width > 0 && height > 0 && !rootNode) {
      const initialLayout = generateRandomLayout(width, height, 6);
      setRootNode(initialLayout);
    }
  }, [width, height, rootNode, setRootNode]);

  const handleExport = () => {
    if (rootNode) {
      try {
        const base64 = exportToImage(rootNode, 3840, 2160);
        console.log('Exported 4K image (base64 length):', base64.length);
        Alert.alert('Export Success', '4K Image generated in memory.');
      } catch (error) {
        Alert.alert('Export Failed', String(error));
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {rootNode && <GridCanvas rootNode={rootNode} />}
      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Text style={styles.exportText}>Export 4K</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  exportButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  exportText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;