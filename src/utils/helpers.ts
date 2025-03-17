import { RestAnalysisResult } from '../types';

// Format timestamp to readable date/time
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// Generate text message based on analysis result
export const generateMessage = (energyLevel: number): string => {
  if (energyLevel < 30) {
    return "You look very tired. You should definitely get some sleep soon.";
  } else if (energyLevel < 50) {
    return "You seem tired. Consider taking a short nap or rest.";
  } else if (energyLevel < 70) {
    return "You're doing okay, but a little break might help you recharge.";
  } else {
    return "You look quite awake and energized. Do things that make you happy!";
  }
};

// Get color based on energy level
export const getEnergyColor = (energyLevel: number): string => {
  if (energyLevel < 30) {
    return '#FF6347'; // tomato red
  } else if (energyLevel < 50) {
    return '#FFA500'; // orange
  } else if (energyLevel < 70) {
    return '#FFD700'; // gold
  } else {
    return '#32CD32'; // lime green
  }
};

// Organize results by day for the chart
export const organizeResultsByDay = (results: RestAnalysisResult[]): { labels: string[], data: number[] } => {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  // Group by day and average energy levels
  const resultsByDay: { [key: string]: number[] } = {};
  
  // Initialize all days with empty arrays
  last7Days.forEach(day => {
    resultsByDay[day] = [];
  });
  
  // Add results to appropriate days
  results.forEach(result => {
    const day = new Date(result.timestamp).toISOString().split('T')[0];
    if (resultsByDay[day]) {
      resultsByDay[day].push(result.energyLevel);
    }
  });
  
  // Calculate averages or use 0 if no data
  const data = last7Days.map(day => {
    const values = resultsByDay[day];
    return values.length > 0 
      ? values.reduce((sum, val) => sum + val, 0) / values.length 
      : 0;
  });
  
  // Format labels as short day names
  const labels = last7Days.map(day => {
    const date = new Date(day);
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  });
  
  return { labels, data };
}; 