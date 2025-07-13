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

// Interface for navigation params
export type RootStackParamList = {
  Home: undefined;
  RecordVideo: undefined;
  Results: { result: RestAnalysisResult };
  History: undefined;
  Settings: undefined;
}; 