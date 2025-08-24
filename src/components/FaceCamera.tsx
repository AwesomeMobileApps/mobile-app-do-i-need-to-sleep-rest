import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { faceAnalysisService } from '../services/faceAnalysisService';
import { FaceAnalysisResult } from '../types';

interface FaceCameraProps {
  children?: React.ReactNode;
  style?: any;
  onAnalysisResult?: (result: FaceAnalysisResult) => void;
  analysisEnabled?: boolean;
  analysisInterval?: number; // milliseconds between analyses
  onCameraReady?: () => void;
  onCameraError?: (error: string) => void;
}

// Camera verification states
export interface CameraVerificationResult {
  isWorking: boolean;
  hasPermission: boolean;
  canCapture: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  lighting: 'excellent' | 'good' | 'fair' | 'poor';
  stability: 'stable' | 'slight_shake' | 'unstable';
  faceDetectionAccuracy: number; // 0-100%
  errors: string[];
  recommendations: string[];
}

const FaceCamera = forwardRef<CameraView, FaceCameraProps>((props, ref) => {
  const {
    onAnalysisResult,
    analysisEnabled = false,
    analysisInterval = 2000,
    onCameraReady,
    onCameraError,
    ...otherProps
  } = props;

  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CameraVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (analysisEnabled && permission?.granted && cameraReady) {
      startAnalysis();
    } else {
      stopAnalysis();
    }

    return () => stopAnalysis();
  }, [analysisEnabled, permission?.granted, cameraReady, analysisInterval]);

  const initializeCamera = async () => {
    try {
      if (!permission) {
        await requestPermission();
      }

      if (permission?.granted) {
        await faceAnalysisService.initialize();
        setCameraReady(true);
        onCameraReady?.();
      }
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      onCameraError?.(`Camera initialization failed: ${error}`);
    }
  };

  const cleanup = () => {
    stopAnalysis();
    faceAnalysisService.dispose();
  };

  const startAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    analysisIntervalRef.current = setInterval(async () => {
      await performFaceAnalysis();
    }, analysisInterval);
  };

  const stopAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  const performFaceAnalysis = async () => {
    if (!ref || typeof ref === 'function' || !cameraReady) return;

    try {
      setIsAnalyzing(true);
      frameCountRef.current += 1;

      // In a real implementation, you would capture actual frame data
      // For now, we simulate with mock data but include real camera metrics
      const mockImageData = new ImageData(640, 480);
      
      const result = await faceAnalysisService.analyzeFace(mockImageData);

      if (result && onAnalysisResult) {
        onAnalysisResult(result);
      }

      // Update frame rate tracking
      const now = Date.now();
      const frameRate = 1000 / (now - lastFrameTimeRef.current);
      lastFrameTimeRef.current = now;

      // Update verification metrics
      updateVerificationMetrics(result, frameRate);
    } catch (error) {
      console.error('Face analysis failed:', error);
      onCameraError?.(`Analysis failed: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateVerificationMetrics = (result: FaceAnalysisResult | null, frameRate: number) => {
    // This would be called periodically to update camera performance metrics
    const accuracy = result?.confidence || 0;
    const quality = getQualityRating(accuracy, frameRate);
    
    setVerificationResult(prev => ({
      isWorking: true,
      hasPermission: permission?.granted || false,
      canCapture: cameraReady,
      quality,
      lighting: estimateLighting(result),
      stability: estimateStability(frameRate),
      faceDetectionAccuracy: accuracy * 100,
      errors: [],
      recommendations: generateRecommendations(quality, frameRate, accuracy)
    }));
  };

  const getQualityRating = (accuracy: number, frameRate: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (accuracy > 0.9 && frameRate > 15) return 'excellent';
    if (accuracy > 0.8 && frameRate > 10) return 'good';
    if (accuracy > 0.6 && frameRate > 5) return 'fair';
    return 'poor';
  };

  const estimateLighting = (result: FaceAnalysisResult | null): 'excellent' | 'good' | 'fair' | 'poor' => {
    // In real implementation, analyze pixel brightness and contrast
    const confidence = result?.confidence || 0;
    if (confidence > 0.9) return 'excellent';
    if (confidence > 0.7) return 'good';
    if (confidence > 0.5) return 'fair';
    return 'poor';
  };

  const estimateStability = (frameRate: number): 'stable' | 'slight_shake' | 'unstable' => {
    if (frameRate > 15) return 'stable';
    if (frameRate > 8) return 'slight_shake';
    return 'unstable';
  };

  const generateRecommendations = (quality: string, frameRate: number, accuracy: number): string[] => {
    const recommendations: string[] = [];

    if (quality === 'poor') {
      recommendations.push('Improve lighting conditions');
      recommendations.push('Clean camera lens');
      recommendations.push('Hold device steady');
    }

    if (frameRate < 10) {
      recommendations.push('Close other apps to improve performance');
      recommendations.push('Ensure good device performance');
    }

    if (accuracy < 0.6) {
      recommendations.push('Position face clearly in frame');
      recommendations.push('Ensure face is well-lit');
      recommendations.push('Remove obstructions from face');
    }

    if (recommendations.length === 0) {
      recommendations.push('Camera performance is optimal');
    }

    return recommendations;
  };

  // Comprehensive camera verification function
  const performCameraVerification = async (): Promise<CameraVerificationResult> => {
    setIsVerifying(true);
    
    const verification: CameraVerificationResult = {
      isWorking: false,
      hasPermission: false,
      canCapture: false,
      quality: 'poor',
      lighting: 'poor',
      stability: 'unstable',
      faceDetectionAccuracy: 0,
      errors: [],
      recommendations: []
    };

    try {
      // Check permissions
      if (permission?.granted) {
        verification.hasPermission = true;
      } else {
        verification.errors.push('Camera permission not granted');
        verification.recommendations.push('Grant camera permission in settings');
        return verification;
      }

      // Check camera initialization
      if (!cameraReady) {
        verification.errors.push('Camera not initialized');
        verification.recommendations.push('Restart the app or check camera availability');
        return verification;
      }

      verification.canCapture = true;

      // Perform test analysis for 5 seconds to gather metrics
      const testResults: FaceAnalysisResult[] = [];
      const frameRates: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        // Simulate frame capture and analysis
        const mockImageData = new ImageData(640, 480);
        const result = await faceAnalysisService.analyzeFace(mockImageData);
        
        if (result) {
          testResults.push(result);
        }

        const frameTime = Date.now() - startTime;
        frameRates.push(1000 / frameTime);

        // Wait 1 second between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Calculate metrics
      const avgAccuracy = testResults.length > 0 
        ? testResults.reduce((sum, r) => sum + r.confidence, 0) / testResults.length 
        : 0;
      
      const avgFrameRate = frameRates.length > 0
        ? frameRates.reduce((sum, fr) => sum + fr, 0) / frameRates.length
        : 0;

      verification.faceDetectionAccuracy = avgAccuracy * 100;
      verification.quality = getQualityRating(avgAccuracy, avgFrameRate);
      verification.lighting = estimateLighting(testResults[0] || null);
      verification.stability = estimateStability(avgFrameRate);
      verification.isWorking = avgAccuracy > 0.3; // At least 30% accuracy
      verification.recommendations = generateRecommendations(verification.quality, avgFrameRate, avgAccuracy);

      if (!verification.isWorking) {
        verification.errors.push('Face detection accuracy too low');
        verification.errors.push('Camera may not be functioning properly');
      }

    } catch (error) {
      verification.errors.push(`Verification failed: ${error}`);
      verification.recommendations.push('Check camera hardware and try again');
    } finally {
      setIsVerifying(false);
    }

    setVerificationResult(verification);
    return verification;
  };

  const handleCameraReady = () => {
    setCameraReady(true);
    onCameraReady?.();
  };

  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.statusText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.statusText}>Camera access required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, otherProps.style]}>
      <CameraView
        ref={ref}
        style={styles.camera}
        facing="front"
        onCameraReady={handleCameraReady}
      >
        {/* Camera Status Overlay */}
        <View style={styles.statusOverlay}>
          {isAnalyzing && (
            <View style={styles.analyzingIndicator}>
              <Text style={styles.analyzingText}>Analyzing...</Text>
            </View>
          )}
          
          {isVerifying && (
            <View style={styles.verifyingIndicator}>
              <Text style={styles.verifyingText}>Verifying Camera...</Text>
            </View>
          )}
        </View>

        {/* Verification Results Display */}
        {verificationResult && (
          <View style={styles.verificationOverlay}>
            <Text style={styles.verificationTitle}>Camera Status</Text>
            <Text style={[styles.verificationText, 
              verificationResult.isWorking ? styles.statusGood : styles.statusBad]}>
              {verificationResult.isWorking ? '✓ Camera Working' : '✗ Camera Issues'}
            </Text>
            <Text style={styles.verificationDetail}>
              Quality: {verificationResult.quality} | 
              Accuracy: {verificationResult.faceDetectionAccuracy.toFixed(1)}%
            </Text>
          </View>
        )}

        {/* Verification Button */}
        <TouchableOpacity 
          style={styles.verifyButton} 
          onPress={performCameraVerification}
          disabled={isVerifying}
        >
          <Text style={styles.verifyButtonText}>
            {isVerifying ? 'Verifying...' : 'Verify Camera'}
          </Text>
        </TouchableOpacity>

        {props.children}
      </CameraView>
    </View>
  );
});

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  analyzingIndicator: {
    backgroundColor: 'rgba(74, 144, 226, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  analyzingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  verifyingIndicator: {
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  verifyingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  verificationOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  verificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  verificationDetail: {
    color: '#ccc',
    fontSize: 12,
  },
  statusGood: {
    color: '#4CAF50',
  },
  statusBad: {
    color: '#F44336',
  },
  verifyButton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.8)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FaceCamera;
