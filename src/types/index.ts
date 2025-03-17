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