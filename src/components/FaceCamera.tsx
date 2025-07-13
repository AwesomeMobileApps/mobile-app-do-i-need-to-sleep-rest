import React, { forwardRef, ReactNode, useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { Camera, CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { faceAnalysisService } from '../services/faceAnalysisService';
import { FaceAnalysisResult } from '../types';

// Props for the camera component
interface FaceCameraProps {
  children?: ReactNode;
  style?: any;
  onAnalysisResult?: (result: FaceAnalysisResult) => void;
  analysisEnabled?: boolean;
  analysisInterval?: number; // milliseconds between analyses
}

// Forward ref to allow parent to access camera methods
const FaceCamera = forwardRef<CameraView, FaceCameraProps>((props, ref) => {
  const {
    onAnalysisResult,
    analysisEnabled = false,
    analysisInterval = 2000, // Default 2 seconds
    ...otherProps
  } = props;

  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }

      // Initialize face analysis service
      if (permission?.granted) {
        try {
          await faceAnalysisService.initialize();
        } catch (error) {
          console.error('Failed to initialize face analysis:', error);
          Alert.alert('Error', 'Failed to initialize face analysis service');
        }
      }
    })();

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [permission]);

  useEffect(() => {
    if (analysisEnabled && permission?.granted && !isAnalyzing) {
      startAnalysis();
    } else if (!analysisEnabled && analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    };
  }, [analysisEnabled, permission?.granted, analysisInterval]);

  const startAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    analysisIntervalRef.current = setInterval(async () => {
      try {
        setIsAnalyzing(true);
        await performFaceAnalysis();
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, analysisInterval);
  };

  const performFaceAnalysis = async () => {
    if (!ref || typeof ref === 'function') return;

    try {
      // In a real implementation, you would capture a frame from the camera
      // and convert it to ImageData for analysis

      // For now, we'll simulate the analysis with mock image data
      const mockImageData = new ImageData(400, 300);

      const result = await faceAnalysisService.analyzeFace(mockImageData);

      if (result && onAnalysisResult) {
        onAnalysisResult(result);
      }
    } catch (error) {
      console.error('Face analysis failed:', error);
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>No access to camera</Text>
        <Text onPress={requestPermission}>Grant permission</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, otherProps.style]}>
      <CameraView
        ref={ref}
        style={styles.camera}
        facing="front"
        autofocus="on"
      >
        {/* Analysis indicator */}
        {analysisEnabled && (
          <View style={styles.analysisIndicator}>
            <View style={[styles.indicator, isAnalyzing && styles.analyzing]} />
            <Text style={styles.indicatorText}>
              {isAnalyzing ? 'Analyzing...' : 'Ready'}
            </Text>
          </View>
        )}

        {/* Face detection overlay could go here */}
        <View style={styles.overlay}>
          {props.children}
        </View>
      </CameraView>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  analysisIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  analyzing: {
    backgroundColor: '#FF9800',
  },
  indicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default FaceCamera; 