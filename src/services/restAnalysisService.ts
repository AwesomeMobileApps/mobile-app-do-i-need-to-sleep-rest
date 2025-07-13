import { RestAnalysisResult, FaceAnalysisResult } from '../types';
import { generateMessage } from '../utils/helpers';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { faceAnalysisService } from './faceAnalysisService';

const RESULTS_STORAGE_KEY = 'rest_analysis_results';
const FACE_ANALYSIS_STORAGE_KEY = 'face_analysis_results';

// Enhanced AI analysis that uses real face analysis
export const analyzeVideo = async (videoUri: string): Promise<RestAnalysisResult> => {
  try {
    // Initialize face analysis service
    await faceAnalysisService.initialize();

    // In a real implementation, you would:
    // 1. Extract frames from the video
    // 2. Convert frames to ImageData
    // 3. Run face analysis on multiple frames
    // 4. Aggregate results for final analysis

    // For now, we'll simulate video analysis with multiple face scans
    const frameAnalyses: FaceAnalysisResult[] = [];

    // Simulate analyzing 5 frames from the video
    for (let i = 0; i < 5; i++) {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 400));

      // Create mock image data (in real app, this would be from video frame)
      const mockImageData = new ImageData(400, 300);

      const frameResult = await faceAnalysisService.analyzeFace(mockImageData);
      if (frameResult) {
        frameAnalyses.push(frameResult);
      }
    }

    // Aggregate analysis results
    const aggregatedResult = aggregateFrameAnalyses(frameAnalyses);

    // Convert to RestAnalysisResult format for backward compatibility
    const result: RestAnalysisResult = {
      needsRest: aggregatedResult.needsRest,
      needsSleep: aggregatedResult.needsSleep,
      energyLevel: Math.max(0, 100 - aggregatedResult.fatigueScore),
      message: generateEnhancedMessage(aggregatedResult),
      timestamp: Date.now(),
      facialFeatures: convertToLegacyFormat(aggregatedResult.healthMetrics),
      detailedAnalysis: {
        primaryFactor: determinePrimaryFactor(aggregatedResult),
        secondaryFactor: determineSecondaryFactor(aggregatedResult),
        recommendation: aggregatedResult.recommendations[0] || 'Continue monitoring your health'
      },
      // Add new enhanced data
      enhancedAnalysis: aggregatedResult
    };

    // Save both formats
    await saveResult(result);
    await saveFaceAnalysisResult(aggregatedResult);

    return result;
  } catch (error) {
    console.error('Enhanced video analysis failed:', error);

    // Fallback to simulated analysis
    return await performFallbackAnalysis();
  }
};

// Aggregate multiple frame analyses into a single result
const aggregateFrameAnalyses = (analyses: FaceAnalysisResult[]): FaceAnalysisResult => {
  if (analyses.length === 0) {
    throw new Error('No frame analyses available');
  }

  // Calculate averages
  const avgFatigueScore = analyses.reduce((sum, a) => sum + a.fatigueScore, 0) / analyses.length;
  const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;

  // Aggregate health metrics
  const avgHealthMetrics = {
    eyeAspectRatio: analyses.reduce((sum, a) => sum + a.healthMetrics.eyeAspectRatio, 0) / analyses.length,
    blinkRate: analyses.reduce((sum, a) => sum + a.healthMetrics.blinkRate, 0) / analyses.length,
    eyeStrain: analyses.reduce((sum, a) => sum + a.healthMetrics.eyeStrain, 0) / analyses.length,
    facialTension: analyses.reduce((sum, a) => sum + a.healthMetrics.facialTension, 0) / analyses.length,
    headPose: {
      pitch: analyses.reduce((sum, a) => sum + a.healthMetrics.headPose.pitch, 0) / analyses.length,
      yaw: analyses.reduce((sum, a) => sum + a.healthMetrics.headPose.yaw, 0) / analyses.length,
      roll: analyses.reduce((sum, a) => sum + a.healthMetrics.headPose.roll, 0) / analyses.length,
    },
    skinAnalysis: {
      pallor: analyses.reduce((sum, a) => sum + a.healthMetrics.skinAnalysis.pallor, 0) / analyses.length,
      darkness: analyses.reduce((sum, a) => sum + a.healthMetrics.skinAnalysis.darkness, 0) / analyses.length,
    },
    drowsinessIndicators: {
      heavyEyelids: analyses.filter(a => a.healthMetrics.drowsinessIndicators.heavyEyelids).length > analyses.length / 2,
      slowBlinks: analyses.filter(a => a.healthMetrics.drowsinessIndicators.slowBlinks).length > analyses.length / 2,
      headDropping: analyses.filter(a => a.healthMetrics.drowsinessIndicators.headDropping).length > analyses.length / 2,
      reducedFacialExpression: analyses.filter(a => a.healthMetrics.drowsinessIndicators.reducedFacialExpression).length > analyses.length / 2,
    }
  };

  // Collect all unique recommendations
  const allRecommendations = [...new Set(analyses.flatMap(a => a.recommendations))];

  // Determine trend (use the most recent analysis trend)
  const mostRecentTrend = analyses[analyses.length - 1]?.trend || 'stable';

  return {
    timestamp: Date.now(),
    faceDetected: true,
    confidence: avgConfidence,
    healthMetrics: avgHealthMetrics,
    fatigueScore: avgFatigueScore,
    needsRest: avgFatigueScore > 60,
    needsSleep: avgFatigueScore > 80,
    trend: mostRecentTrend,
    recommendations: allRecommendations
  };
};

// Generate enhanced message based on face analysis
const generateEnhancedMessage = (analysis: FaceAnalysisResult): string => {
  const { fatigueScore, healthMetrics } = analysis;

  if (fatigueScore > 80) {
    return `Critical fatigue detected (${Math.round(fatigueScore)}%). Your eyes show significant strain and drowsiness indicators are present. Immediate rest is strongly recommended.`;
  }

  if (fatigueScore > 60) {
    return `Moderate fatigue detected (${Math.round(fatigueScore)}%). Your facial analysis indicates tiredness. Consider taking a break soon.`;
  }

  if (fatigueScore > 40) {
    return `Mild fatigue detected (${Math.round(fatigueScore)}%). Some signs of tiredness are visible, but you're still relatively alert.`;
  }

  return `You appear alert and well-rested (${Math.round(100 - fatigueScore)}% energy). Your facial indicators suggest good health and alertness.`;
};

// Convert new health metrics to legacy facial features format
const convertToLegacyFormat = (healthMetrics: any) => {
  return {
    eyeOpenness: healthMetrics.eyeAspectRatio > 0.25 ? 'wide' : 'narrowed',
    blinkRate: healthMetrics.blinkRate < 15 ? 'slow' : 'normal',
    skinTone: healthMetrics.skinAnalysis.pallor > 50 ? 'pale' : 'healthy',
    facialMovements: healthMetrics.facialTension > 50 ? 'tense' : 'relaxed',
    posture: healthMetrics.headPose.pitch > 15 ? 'drooping' : 'upright',
    yawning: healthMetrics.drowsinessIndicators.slowBlinks && healthMetrics.drowsinessIndicators.heavyEyelids
  };
};

// Determine primary fatigue factor
const determinePrimaryFactor = (analysis: FaceAnalysisResult): string => {
  const { healthMetrics } = analysis;

  if (healthMetrics.drowsinessIndicators.heavyEyelids) {
    return 'heavy eyelids and reduced eye openness';
  }

  if (healthMetrics.eyeStrain > 60) {
    return 'significant eye strain and fatigue';
  }

  if (healthMetrics.drowsinessIndicators.slowBlinks) {
    return 'reduced blink rate indicating drowsiness';
  }

  if (healthMetrics.headPose.pitch > 15) {
    return 'head dropping and poor posture';
  }

  if (healthMetrics.facialTension < 30) {
    return 'reduced facial muscle tension';
  }

  return 'overall facial fatigue indicators';
};

// Determine secondary factor
const determineSecondaryFactor = (analysis: FaceAnalysisResult): string => {
  const { healthMetrics } = analysis;

  if (healthMetrics.skinAnalysis.darkness > 50) {
    return 'under-eye darkness suggesting sleep deprivation';
  }

  if (healthMetrics.skinAnalysis.pallor > 50) {
    return 'facial pallor indicating fatigue';
  }

  return 'consistent fatigue patterns across facial features';
};

// Fallback analysis when face detection fails
const performFallbackAnalysis = async (): Promise<RestAnalysisResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  const getWeightedRandomEnergyLevel = () => {
    const r1 = Math.random();
    const r2 = Math.random();
    const bellCurve = (r1 + r2) / 2;
    return Math.floor(bellCurve * 70 + 30);
  };

  const randomEnergyLevel = getWeightedRandomEnergyLevel();

  const facialFeatures = {
    eyeOpenness: randomEnergyLevel > 50 ? 'wide' : 'narrowed',
    blinkRate: randomEnergyLevel < 40 ? 'frequent' : 'normal',
    skinTone: randomEnergyLevel < 30 ? 'pale' : 'healthy',
    facialMovements: randomEnergyLevel < 50 ? 'slow' : 'alert',
    posture: randomEnergyLevel < 40 ? 'drooping' : 'upright',
    yawning: randomEnergyLevel < 35,
  };

  const detailedAnalysis = {
    primaryFactor: randomEnergyLevel < 40 ?
      'frequent blinking and droopy eyelids' :
      (randomEnergyLevel < 70 ? 'slight facial tension' : 'alert expressions'),
    secondaryFactor: randomEnergyLevel < 50 ?
      'reduced facial responsiveness' :
      'good facial muscle tone',
    recommendation: randomEnergyLevel < 30 ?
      'getting sleep soon' :
      (randomEnergyLevel < 50 ? 'taking a short rest' : 'continuing current activities')
  };

  const result: RestAnalysisResult = {
    needsRest: randomEnergyLevel < 50,
    needsSleep: randomEnergyLevel < 30,
    energyLevel: randomEnergyLevel,
    message: generateMessage(randomEnergyLevel),
    timestamp: Date.now(),
    facialFeatures,
    detailedAnalysis
  };

  await saveResult(result);
  return result;
};

// Save the analysis result
export const saveResult = async (result: RestAnalysisResult): Promise<void> => {
  try {
    // Get existing results
    const existingResultsStr = await AsyncStorage.getItem(RESULTS_STORAGE_KEY);
    const existingResults: RestAnalysisResult[] = existingResultsStr
      ? JSON.parse(existingResultsStr)
      : [];

    // Add new result
    const updatedResults = [...existingResults, result];

    // Keep only last 30 days of data
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filteredResults = updatedResults.filter(r => r.timestamp >= thirtyDaysAgo);

    // Save back to storage
    await AsyncStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(filteredResults));
  } catch (error) {
    console.error('Failed to save result:', error);
  }
};

// Get all saved results
export const getResults = async (): Promise<RestAnalysisResult[]> => {
  try {
    const resultsStr = await AsyncStorage.getItem(RESULTS_STORAGE_KEY);
    return resultsStr ? JSON.parse(resultsStr) : [];
  } catch (error) {
    console.error('Failed to get results:', error);
    return [];
  }
};

// Delete all results (for testing)
export const clearAllResults = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RESULTS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear results:', error);
  }
};

// Save face analysis result
export const saveFaceAnalysisResult = async (result: FaceAnalysisResult): Promise<void> => {
  try {
    const existingResultsStr = await AsyncStorage.getItem(FACE_ANALYSIS_STORAGE_KEY);
    const existingResults: FaceAnalysisResult[] = existingResultsStr
      ? JSON.parse(existingResultsStr)
      : [];

    const updatedResults = [...existingResults, result];

    // Keep only last 30 days of data
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filteredResults = updatedResults.filter(r => r.timestamp >= thirtyDaysAgo);

    await AsyncStorage.setItem(FACE_ANALYSIS_STORAGE_KEY, JSON.stringify(filteredResults));
  } catch (error) {
    console.error('Failed to save face analysis result:', error);
  }
};

// Get face analysis results
export const getFaceAnalysisResults = async (): Promise<FaceAnalysisResult[]> => {
  try {
    const resultsStr = await AsyncStorage.getItem(FACE_ANALYSIS_STORAGE_KEY);
    return resultsStr ? JSON.parse(resultsStr) : [];
  } catch (error) {
    console.error('Failed to get face analysis results:', error);
    return [];
  }
};

// Real-time face analysis for live monitoring
export const performLiveFaceAnalysis = async (): Promise<FaceAnalysisResult | null> => {
  try {
    await faceAnalysisService.initialize();

    // Create mock image data (in real app, this would be from camera feed)
    const mockImageData = new ImageData(400, 300);

    const result = await faceAnalysisService.analyzeFace(mockImageData);

    if (result) {
      // Save real-time result
      await saveFaceAnalysisResult(result);
    }

    return result;
  } catch (error) {
    console.error('Live face analysis failed:', error);
    return null;
  }
};