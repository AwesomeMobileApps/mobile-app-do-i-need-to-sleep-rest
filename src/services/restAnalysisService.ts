import { RestAnalysisResult } from '../types';
import { generateMessage } from '../utils/helpers';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RESULTS_STORAGE_KEY = 'rest_analysis_results';

// Enhanced AI analysis that simulates face analysis
export const analyzeVideo = async (videoUri: string): Promise<RestAnalysisResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real app, we would:
  // 1. Extract frames from the video
  // 2. Use computer vision to analyze:
  //    - Eye openness (droopy eyelids indicate fatigue)
  //    - Blink rate (increased blink rate means fatigue)
  //    - Skin tone (pallor or redness)
  //    - Face movements (slower movements = tiredness)
  //    - Posture (head drooping = sleepiness)
  //    - Yawning detection
  
  // For the demo, create a more interesting random result that's weighted toward the middle
  const getWeightedRandomEnergyLevel = () => {
    // Create a bell curve-like distribution with most results in 40-70 range
    const r1 = Math.random();
    const r2 = Math.random();
    // Use the central limit theorem to get a more "normal" distribution
    const bellCurve = (r1 + r2) / 2;
    // Scale to 0-100 range, shifted slightly to favor mid-range values
    return Math.floor(bellCurve * 70 + 30);
  };
  
  const randomEnergyLevel = getWeightedRandomEnergyLevel();
  
  // Analyze various facial features (simulated)
  const facialFeatures = {
    eyeOpenness: randomEnergyLevel > 50 ? 'wide' : 'narrowed',
    blinkRate: randomEnergyLevel < 40 ? 'frequent' : 'normal',
    skinTone: randomEnergyLevel < 30 ? 'pale' : 'healthy',
    facialMovements: randomEnergyLevel < 50 ? 'slow' : 'alert',
    posture: randomEnergyLevel < 40 ? 'drooping' : 'upright',
    yawning: randomEnergyLevel < 35,
  };
  
  // Generate detailed analysis
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
    facialFeatures, // Add detailed facial analysis
    detailedAnalysis // Add more context for the results
  };
  
  // Save result to history
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