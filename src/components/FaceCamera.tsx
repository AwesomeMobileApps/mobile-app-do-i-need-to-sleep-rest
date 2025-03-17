import React, { forwardRef, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera } from 'expo-camera';

// Props for the camera component
interface FaceCameraProps {
  children?: ReactNode;
  style?: any;
}

// Forward ref to allow parent to access camera methods
const FaceCamera = forwardRef<Camera, FaceCameraProps>((props, ref) => {
  return (
    <View style={[styles.container, props.style]}>
      <Camera
        ref={ref}
        style={styles.camera}
        type="front"
        flashMode="off"
        autoFocus={true}
      >
        {props.children}
      </Camera>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});

export default FaceCamera; 