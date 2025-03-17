import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions, 
  Alert,
  ViewStyle,
  Animated,
  Easing,
  ImageBackground
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { analyzeVideo } from '../services/restAnalysisService';
import * as ScreenOrientation from 'expo-screen-orientation';

type RecordVideoScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RecordVideo'>;
};

// Sequence of positions to guide the user
const FACE_POSITIONS = [
  { label: 'Look straight ahead', position: 'center', prompt: 'Center your face inside the outline' },
  { label: 'Slowly turn left', position: 'left', prompt: 'Turn your face to the left' },
  { label: 'Slowly turn right', position: 'right', prompt: 'Turn your face to the right' },
  { label: 'Look slightly up', position: 'up', prompt: 'Tilt your head slightly upward' },
  { label: 'Look slightly down', position: 'down', prompt: 'Tilt your head slightly downward' },
  { label: 'Look straight again', position: 'center', prompt: 'Return to center for final capture' },
];

const RECORDING_DURATION = 3000; // 3 seconds in milliseconds
const POSITION_CHANGE_INTERVAL = 500; // Time between position changes in ms

export default function RecordVideoScreen({ navigation }: RecordVideoScreenProps) {
  // States for UI flow
  const [hasPermission, setHasPermission] = useState<boolean>(true); // Assume permission for now
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [countdownValue, setCountdownValue] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  
  // Animation values
  const outlineScale = useRef(new Animated.Value(0.95)).current;
  const outlineOpacity = useRef(new Animated.Value(0.7)).current;
  const positionIndicatorAnim = useRef(new Animated.Value(1)).current;
  
  // Start outline pulse animation
  useEffect(() => {
    const pulseOutline = () => {
      Animated.sequence([
        Animated.timing(outlineScale, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(outlineScale, {
          toValue: 0.95,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ]).start(pulseOutline);
    };
    
    pulseOutline();
    
    return () => {
      outlineScale.stopAnimation();
    };
  }, []);
  
  // Lock screen orientation on mount
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);
  
  // Handle position change during recording
  useEffect(() => {
    let positionTimer: NodeJS.Timeout;
    
    if (recording) {
      positionTimer = setInterval(() => {
        setCurrentPositionIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          // Provide haptic feedback on position change
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          // Animate position indicator
          Animated.sequence([
            Animated.timing(positionIndicatorAnim, {
              toValue: 1.3,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(positionIndicatorAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            })
          ]).start();
          
          return nextIndex < FACE_POSITIONS.length ? nextIndex : prevIndex;
        });
      }, POSITION_CHANGE_INTERVAL);
    }
    
    return () => {
      if (positionTimer) clearInterval(positionTimer);
    };
  }, [recording]);
  
  // Function to start the face position sequence
  const startPositionSequence = () => {
    setCurrentPositionIndex(0);
    setShowCountdown(true);
    
    // Fade in the outline
    Animated.timing(outlineOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Start countdown
    let count = 3;
    setCountdownValue(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdownValue(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        setShowCountdown(false);
        startRecording();
      }
    }, 1000);
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      setRecording(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Simulate recording time
      setTimeout(() => {
        setRecording(false);
        simulateProcessVideo();
      }, RECORDING_DURATION);
    } catch (error) {
      console.error('Error recording video:', error);
      setRecording(false);
      Alert.alert('Error', 'Failed to record video');
    }
  };
  
  // Process the simulated video
  const simulateProcessVideo = async () => {
    try {
      setProcessing(true);
      
      // Simulate processing time
      setTimeout(async () => {
        // Use a dummy video URI for now
        const result = await analyzeVideo('dummy://video.mp4');
        
        // Navigate to results screen with the analysis result
        navigation.replace('Results', { result });
      }, 2000);
    } catch (error) {
      console.error('Error processing video:', error);
      Alert.alert('Error', 'Failed to analyze video');
      setProcessing(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Camera simulation - just a black background */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraContent}>
          {/* Face outline overlay - always present but with variable opacity */}
          <Animated.View 
            style={[
              styles.faceOutlineContainer,
              {
                opacity: outlineOpacity,
                transform: [{ scale: outlineScale }]
              }
            ]}
          >
            <View style={styles.faceOutline} />
          </Animated.View>
          
          {/* Guide overlay */}
          <View style={styles.guideOverlay}>
            {!recording && !processing && !showCountdown && (
              <View style={styles.positionGuide}>
                <Text style={styles.guideText}>
                  Position your face inside the outline in good lighting
                </Text>
                <Text style={styles.guideSubtext}>
                  We'll guide you through a 3-second scan of different angles
                </Text>
                <TouchableOpacity 
                  style={styles.recordButton}
                  onPress={startPositionSequence}
                >
                  <Text style={styles.recordButtonText}>Start Check</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Countdown display */}
            {showCountdown && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownText}>{countdownValue}</Text>
                <Text style={styles.countdownSubtext}>Get ready...</Text>
              </View>
            )}
            
            {/* Face position guidance */}
            {recording && (
              <View style={styles.positionGuide}>
                <Animated.View 
                  style={[
                    styles.recordingIndicator,
                    { transform: [{ scale: positionIndicatorAnim }] }
                  ]}
                />
                <Text style={styles.positionText}>
                  {FACE_POSITIONS[currentPositionIndex].label}
                </Text>
                <Text style={styles.positionSubtext}>
                  {FACE_POSITIONS[currentPositionIndex].prompt}
                </Text>
                <View style={[
                  styles.positionIndicator,
                  getPositionStyles(FACE_POSITIONS[currentPositionIndex].position)
                ]} />
                
                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                  {FACE_POSITIONS.map((_, index) => (
                    <View 
                      key={index}
                      style={[
                        styles.progressDot,
                        currentPositionIndex >= index ? styles.progressDotActive : {}
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
            
            {/* Processing indicator */}
            {processing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.processingText}>Analyzing your face...</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {/* Cancel button */}
      {!processing && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Helper function to get position styles
const getPositionStyles = (position: string): ViewStyle => {
  switch (position) {
    case 'left':
      return { left: 20, backgroundColor: '#4A90E2' };
    case 'right':
      return { right: 20, backgroundColor: '#4A90E2' };
    case 'up':
      return { top: 20, alignSelf: 'center' as const, backgroundColor: '#4A90E2' };
    case 'down':
      return { bottom: 20, alignSelf: 'center' as const, backgroundColor: '#4A90E2' };
    default:
      return { alignSelf: 'center' as const, backgroundColor: '#32CD32' };
  }
};

const { width, height } = Dimensions.get('window');
const faceOutlineSize = width * 0.7; // Size of the face outline relative to screen width

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#121212', // Dark background to simulate camera
  },
  cameraContent: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOutlineContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOutline: {
    width: faceOutlineSize,
    height: faceOutlineSize * 1.3, // Oval shape, taller than wide
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: faceOutlineSize / 2,
    borderStyle: 'dashed',
  },
  positionGuide: {
    alignItems: 'center',
    padding: 20,
    marginTop: faceOutlineSize * 0.7, // Position below the face outline
  },
  guideText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  guideSubtext: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 5,
    marginBottom: 20,
  },
  positionText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  positionSubtext: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 5,
    marginBottom: 20,
  },
  positionIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'white',
  },
  recordingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4136', // Red recording dot
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#4A90E2',
  },
  recordButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownText: {
    color: 'white',
    fontSize: 80,
    fontWeight: 'bold',
  },
  countdownSubtext: {
    color: 'white',
    fontSize: 18,
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
  },
  processingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 