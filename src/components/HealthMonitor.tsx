import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FaceAnalysisResult, HealthMetrics } from '../types';

interface HealthMonitorProps {
  analysisResult: FaceAnalysisResult | null;
  style?: any;
}

const HealthMonitor: React.FC<HealthMonitorProps> = ({ analysisResult, style }) => {
  if (!analysisResult) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.noDataText}>No analysis data available</Text>
      </View>
    );
  }

  const { healthMetrics, fatigueScore, needsRest, needsSleep, trend, recommendations } = analysisResult;

  const getFatigueColor = (score: number) => {
    if (score < 30) return '#4CAF50'; // Green
    if (score < 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getStatusText = () => {
    if (needsSleep) return 'Sleep Recommended';
    if (needsRest) return 'Rest Recommended';
    return 'Alert & Healthy';
  };

  const getStatusColor = () => {
    if (needsSleep) return '#F44336';
    if (needsRest) return '#FF9800';
    return '#4CAF50';
  };

  const renderMetricBar = (label: string, value: number, maxValue: number = 100) => {
    const percentage = (value / maxValue) * 100;
    const barColor = percentage > 70 ? '#F44336' : percentage > 40 ? '#FF9800' : '#4CAF50';
    
    return (
      <View style={styles.metricContainer}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={styles.metricValue}>{Math.round(value)}</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${percentage}%`, backgroundColor: barColor }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderDrowsinessIndicators = () => {
    const indicators = healthMetrics.drowsinessIndicators;
    const activeIndicators = Object.entries(indicators)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);

    if (activeIndicators.length === 0) {
      return <Text style={styles.noIndicators}>No drowsiness indicators detected</Text>;
    }

    return (
      <View style={styles.indicatorsContainer}>
        {activeIndicators.map((indicator, index) => (
          <View key={index} style={styles.indicatorChip}>
            <Text style={styles.indicatorText}>
              {indicator.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderHeadPose = () => {
    const { pitch, yaw, roll } = healthMetrics.headPose;
    return (
      <View style={styles.headPoseContainer}>
        <Text style={styles.sectionTitle}>Head Position</Text>
        <View style={styles.poseRow}>
          <Text style={styles.poseLabel}>Pitch: {Math.round(pitch)}°</Text>
          <Text style={styles.poseLabel}>Yaw: {Math.round(yaw)}°</Text>
          <Text style={styles.poseLabel}>Roll: {Math.round(roll)}°</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Main Status */}
      <View style={[styles.statusCard, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <Text style={styles.fatigueScore}>Fatigue: {Math.round(fatigueScore)}%</Text>
        <Text style={styles.trendText}>Trend: {trend}</Text>
      </View>

      {/* Detailed Metrics */}
      <View style={styles.metricsCard}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        
        {renderMetricBar('Eye Openness', (healthMetrics.eyeAspectRatio * 100), 100)}
        {renderMetricBar('Blink Rate', healthMetrics.blinkRate, 30)}
        {renderMetricBar('Eye Strain', healthMetrics.eyeStrain)}
        {renderMetricBar('Facial Tension', healthMetrics.facialTension)}
        
        {/* Skin Analysis */}
        <View style={styles.skinAnalysis}>
          <Text style={styles.subSectionTitle}>Skin Analysis</Text>
          <View style={styles.skinRow}>
            <Text style={styles.skinMetric}>
              Pallor: {Math.round(healthMetrics.skinAnalysis.pallor)}%
            </Text>
            <Text style={styles.skinMetric}>
              Under-eye Darkness: {Math.round(healthMetrics.skinAnalysis.darkness)}%
            </Text>
          </View>
        </View>

        {/* Head Pose */}
        {renderHeadPose()}
      </View>

      {/* Drowsiness Indicators */}
      <View style={styles.indicatorsCard}>
        <Text style={styles.sectionTitle}>Drowsiness Indicators</Text>
        {renderDrowsinessIndicators()}
      </View>

      {/* Recommendations */}
      <View style={styles.recommendationsCard}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  fatigueScore: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  trendText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  metricsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  metricContainer: {
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  skinAnalysis: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  skinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skinMetric: {
    fontSize: 14,
    color: '#666',
  },
  headPoseContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  poseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poseLabel: {
    fontSize: 14,
    color: '#666',
  },
  indicatorsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  indicatorChip: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  indicatorText: {
    fontSize: 12,
    color: '#c62828',
    fontWeight: '500',
  },
  noIndicators: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  recommendationsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
});

export default HealthMonitor;
