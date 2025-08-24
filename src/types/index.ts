// Types for rest analysis results
export interface RestAnalysisResult {
  needsRest: boolean;
  needsSleep: boolean;
  energyLevel: number; // 0-100
  message: string;
  timestamp: number;
  facialFeatures?: {
    eyeOpenness: string;
    blinkRate: string;
    skinTone: string;
    facialMovements: string;
    posture: string;
    yawning: boolean;
  };
  detailedAnalysis?: {
    primaryFactor: string;
    secondaryFactor: string;
    recommendation: string;
  };
  enhancedAnalysis?: FaceAnalysisResult; // Add enhanced face analysis data
}

// Enhanced types for face analysis
export interface HealthMetrics {
  eyeAspectRatio: number;
  blinkRate: number;
  eyeStrain: number;
  facialTension: number;
  headPose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  skinAnalysis: {
    pallor: number;
    darkness: number;
  };
  drowsinessIndicators: {
    heavyEyelids: boolean;
    slowBlinks: boolean;
    headDropping: boolean;
    reducedFacialExpression: boolean;
  };
}

export interface FaceAnalysisResult {
  timestamp: number;
  faceDetected: boolean;
  confidence: number;
  healthMetrics: HealthMetrics;
  fatigueScore: number;
  needsRest: boolean;
  needsSleep: boolean;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

// Types for user settings
export interface UserSettings {
  enableNotifications: boolean;
  saveVideos: boolean;
  aiSensitivity: number; // 0-100
}

// Dream tracking types
export interface DreamEntry {
  id: string;
  title: string;
  description: string;
  date: number;
  tags: string[];
  mood: 'peaceful' | 'exciting' | 'mysterious' | 'scary' | 'romantic' | 'adventurous';
  lucidity: number; // 0-100 (how lucid the dream was)
  vividity: number; // 0-100 (how vivid the dream was)
  emotions: string[];
  characters: string[];
  locations: string[];
  soundscape?: {
    type: 'nature' | 'urban' | 'cosmic' | 'ocean' | 'forest' | 'rain';
    url: string;
    duration: number;
  };
  generatedImage?: {
    url: string;
    style: 'abstract' | 'realistic' | 'fantasy' | 'surreal';
    prompt: string;
  };
  sleepQuality: number; // 0-100
  dreamLength: 'short' | 'medium' | 'long';
}

export interface DreamAnalysis {
  commonThemes: string[];
  emotionalPatterns: { emotion: string; frequency: number }[];
  sleepQualityTrend: 'improving' | 'stable' | 'declining';
  averageLucidity: number;
  averageVividity: number;
  dreamFrequency: number; // dreams per week
  recommendations: string[];
}

// Interface for navigation params
export type RootStackParamList = {
  Home: undefined;
  RecordVideo: undefined;
  Results: { result: RestAnalysisResult };
  History: undefined;
  Settings: undefined;
  CameraVerification: undefined;
  DreamTracker: undefined;
  AddDream: undefined;
  DreamDetail: { dreamId: string };
  DreamAnalysis: undefined;
}; 