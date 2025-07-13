import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, FaceAnalysisResult } from '../types';
import { getResults, performLiveFaceAnalysis } from '../services/restAnalysisService';
import { RestAnalysisResult } from '../types';
import { useIsFocused } from '@react-navigation/native';
import CameraIcon from '../../assets/camera';
import HealthMonitor from '../components/HealthMonitor';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [latestResult, setLatestResult] = useState<RestAnalysisResult | null>(null);
  const [liveAnalysis, setLiveAnalysis] = useState<FaceAnalysisResult | null>(null);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
  const isFocused = useIsFocused();

  // Load latest result when screen is focused
  useEffect(() => {
    if (isFocused) {
      loadLatestResult();
    }
  }, [isFocused]);

  // Handle live monitoring toggle
  useEffect(() => {
    if (isLiveMonitoring) {
      startLiveMonitoring();
    } else {
      stopLiveMonitoring();
    }

    return () => {
      stopLiveMonitoring();
    };
  }, [isLiveMonitoring]);

  // Function to load the latest analysis result
  const loadLatestResult = async () => {
    try {
      const results = await getResults();
      if (results.length > 0) {
        const sorted = [...results].sort((a, b) => b.timestamp - a.timestamp);
        setLatestResult(sorted[0]);
      }
    } catch (error) {
      console.error('Failed to load latest result:', error);
    }
  };

  const startLiveMonitoring = () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }

    // Perform initial analysis
    performLiveAnalysis();

    // Set up periodic analysis every 5 seconds
    const interval = setInterval(performLiveAnalysis, 5000);
    setMonitoringInterval(interval);
  };

  const stopLiveMonitoring = () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      setMonitoringInterval(null);
    }
  };

  const performLiveAnalysis = async () => {
    try {
      const result = await performLiveFaceAnalysis();
      if (result) {
        setLiveAnalysis(result);

        // Show alert for critical fatigue
        if (result.needsSleep && result.fatigueScore > 85) {
          Alert.alert(
            'Critical Fatigue Detected!',
            'Your analysis shows severe fatigue. Please rest immediately.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Live analysis failed:', error);
    }
  };

  const toggleLiveMonitoring = () => {
    setIsLiveMonitoring(!isLiveMonitoring);
    if (!isLiveMonitoring) {
      Alert.alert(
        'Live Monitoring',
        'This feature will continuously analyze your face for fatigue indicators. Make sure you have good lighting and the front camera is visible.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DO I NEED TO REST?</Text>
        <Text style={styles.subtitle}>AI-powered health monitoring</Text>

        {/* Live monitoring toggle */}
        <View style={styles.liveMonitoringContainer}>
          <Text style={styles.liveMonitoringText}>Live Monitoring</Text>
          <Switch
            value={isLiveMonitoring}
            onValueChange={toggleLiveMonitoring}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isLiveMonitoring ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Live Analysis Display */}
        {isLiveMonitoring && liveAnalysis && (
          <View style={styles.liveAnalysisContainer}>
            <Text style={styles.liveAnalysisTitle}>Real-time Analysis</Text>
            <HealthMonitor
              analysisResult={liveAnalysis}
              style={styles.healthMonitor}
            />
          </View>
        )}

        {/* Quick Analysis Button */}
        <TouchableOpacity
          style={[styles.recordButton, isLiveMonitoring && styles.recordButtonSmall]}
          onPress={() => navigation.navigate('RecordVideo')}
        >
          <CameraIcon width={30} height={30} color="white" />
          <Text style={styles.recordButtonText}>
            {isLiveMonitoring ? 'Detailed Analysis' : 'Check Now'}
          </Text>
        </TouchableOpacity>

        {/* Latest Result Display */}
        {latestResult && !isLiveMonitoring && (
          <View style={styles.lastResultContainer}>
            <Text style={styles.lastResultTitle}>Your last check:</Text>
            <Text style={styles.lastResultTime}>
              {new Date(latestResult.timestamp).toLocaleString()}
            </Text>
            <Text style={[
              styles.lastResultMessage,
              { color: latestResult.needsRest ? '#FF6347' : '#32CD32' }
            ]}>
              {latestResult.message}
            </Text>

            {/* Enhanced Analysis Display */}
            {latestResult.enhancedAnalysis && (
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => navigation.navigate('Results', { result: latestResult })}
              >
                <Text style={styles.viewDetailsText}>View Detailed Analysis</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick Stats */}
        {liveAnalysis && (
          <View style={styles.quickStatsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Fatigue</Text>
              <Text style={[
                styles.statValue,
                { color: liveAnalysis.fatigueScore > 60 ? '#FF6347' : '#32CD32' }
              ]}>
                {Math.round(liveAnalysis.fatigueScore)}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Trend</Text>
              <Text style={[
                styles.statValue,
                {
                  color: liveAnalysis.trend === 'improving' ? '#32CD32' :
                    liveAnalysis.trend === 'declining' ? '#FF6347' : '#FFA500'
                }
              ]}>
                {liveAnalysis.trend}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Eye Strain</Text>
              <Text style={[
                styles.statValue,
                { color: liveAnalysis.healthMetrics.eyeStrain > 60 ? '#FF6347' : '#32CD32' }
              ]}>
                {Math.round(liveAnalysis.healthMetrics.eyeStrain)}%
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.footerButtonText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.footerButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

return (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>DO I NEED TO REST?</Text>
      <Text style={styles.subtitle}>Quick analysis of your energy levels</Text>
    </View>

    <View style={styles.contentContainer}>
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => navigation.navigate('RecordVideo')}
      >
        <CameraIcon width={30} height={30} color="white" />
        <Text style={styles.recordButtonText}>Check Now</Text>
      </TouchableOpacity>

      {latestResult && (
        <View style={styles.lastResultContainer}>
          <Text style={styles.lastResultTitle}>Your last check:</Text>
          <Text style={styles.lastResultTime}>
            {new Date(latestResult.timestamp).toLocaleString()}
          </Text>
          <Text style={[
            styles.lastResultMessage,
            { color: latestResult.needsRest ? '#FF6347' : '#32CD32' }
          ]}>
            {latestResult.message}
          </Text>
        </View>
      )}
    </View>

    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.footerButtonText}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.footerButtonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  liveMonitoringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  liveMonitoringText: {
    color: 'white',
    fontSize: 16,
    marginRight: 10,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  liveAnalysisContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  liveAnalysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  healthMonitor: {
    maxHeight: 300,
  },
  recordButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    alignSelf: 'center',
  },
  recordButtonSmall: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  lastResultContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  lastResultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastResultTime: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  lastResultMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  viewDetailsButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButton: {
    padding: 10,
  },
  footerButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '500',
  },
}); 