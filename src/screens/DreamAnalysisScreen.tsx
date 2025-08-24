import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DreamAnalysis } from '../types';
import { dreamService } from '../services/dreamService';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

type DreamAnalysisScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DreamAnalysis'>;
};

const screenWidth = Dimensions.get('window').width;

export default function DreamAnalysisScreen({ navigation }: DreamAnalysisScreenProps) {
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const analysisResult = await dreamService.analyzeDreams();
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Failed to load dream analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getTrendEmoji = (trend: string): string => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  const renderEmotionalPatternsChart = () => {
    if (!analysis || analysis.emotionalPatterns.length === 0) return null;

    const data = analysis.emotionalPatterns.slice(0, 5).map((pattern, index) => ({
      name: pattern.emotion.substring(0, 8),
      population: pattern.frequency,
      color: `rgba(${74 + index * 30}, ${144 + index * 20}, ${226 - index * 30}, 1)`,
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    return (
      <PieChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 10]}
        absolute
      />
    );
  };

  const renderMetricsChart = () => {
    if (!analysis) return null;

    const data = {
      labels: ['Lucidity', 'Vividity', 'Sleep Quality'],
      datasets: [
        {
          data: [
            analysis.averageLucidity,
            analysis.averageVividity,
            analysis.dreamFrequency * 10, // Scale for visualization
          ],
        },
      ],
    };

    return (
      <BarChart
        style={{ marginVertical: 8, borderRadius: 16 }}
        data={data}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix="%"
        chartConfig={{
          ...chartConfig,
          decimalPlaces: 0,
        }}
        verticalLabelRotation={30}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing your dreams...</Text>
        <Text style={styles.loadingSubtext}>🔮 Discovering patterns and insights</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load dream analysis</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalysis}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dream Analysis 📊</Text>
        <Text style={styles.subtitle}>Insights from your dream patterns</Text>
      </View>

      <View style={styles.overviewCard}>
        <Text style={styles.cardTitle}>Overview</Text>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{analysis.dreamFrequency.toFixed(1)}</Text>
            <Text style={styles.overviewLabel}>Dreams/Week</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{Math.round(analysis.averageLucidity)}%</Text>
            <Text style={styles.overviewLabel}>Avg Lucidity</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{Math.round(analysis.averageVividity)}%</Text>
            <Text style={styles.overviewLabel}>Avg Vividity</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={[
              styles.trendValue,
              { color: getTrendColor(analysis.sleepQualityTrend) }
            ]}>
              {getTrendEmoji(analysis.sleepQualityTrend)}
            </Text>
            <Text style={styles.overviewLabel}>Sleep Trend</Text>
          </View>
        </View>
      </View>

      {analysis.commonThemes.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Common Themes 🎭</Text>
          <View style={styles.themesContainer}>
            {analysis.commonThemes.map((theme, index) => (
              <View key={index} style={styles.themeChip}>
                <Text style={styles.themeText}>#{theme}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {analysis.emotionalPatterns.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emotional Patterns 💭</Text>
          <Text style={styles.chartDescription}>
            Your most frequent dream emotions
          </Text>
          {renderEmotionalPatternsChart()}
          <View style={styles.emotionsGrid}>
            {analysis.emotionalPatterns.slice(0, 6).map((pattern, index) => (
              <View key={index} style={styles.emotionItem}>
                <Text style={styles.emotionName}>{pattern.emotion}</Text>
                <Text style={styles.emotionFrequency}>{pattern.frequency}x</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dream Metrics 📈</Text>
        <Text style={styles.chartDescription}>
          Your average scores across key dream dimensions
        </Text>
        {renderMetricsChart()}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep Quality Trend 😴</Text>
        <View style={styles.trendContainer}>
          <View style={[
            styles.trendCard,
            { backgroundColor: getTrendColor(analysis.sleepQualityTrend) + '20' }
          ]}>
            <Text style={styles.trendEmoji}>
              {getTrendEmoji(analysis.sleepQualityTrend)}
            </Text>
            <Text style={styles.trendText}>
              Your sleep quality is{' '}
              <Text style={[
                styles.trendLabel,
                { color: getTrendColor(analysis.sleepQualityTrend) }
              ]}>
                {analysis.sleepQualityTrend}
              </Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personalized Recommendations 💡</Text>
        <View style={styles.recommendationsContainer}>
          {analysis.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.insightsCard}>
        <Text style={styles.cardTitle}>Dream Insights 🔮</Text>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Dream Recall Frequency:</Text>
          <Text style={styles.insightValue}>
            {analysis.dreamFrequency < 1 ? 'Improving needed' :
             analysis.dreamFrequency < 3 ? 'Good progress' : 'Excellent!'}
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Lucid Dreaming Potential:</Text>
          <Text style={styles.insightValue}>
            {analysis.averageLucidity < 30 ? 'Developing' :
             analysis.averageLucidity < 70 ? 'Promising' : 'Advanced'}
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Dream Vividness:</Text>
          <Text style={styles.insightValue}>
            {analysis.averageVividity < 40 ? 'Subtle' :
             analysis.averageVividity < 70 ? 'Clear' : 'Incredibly vivid'}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={loadAnalysis}
      >
        <Text style={styles.refreshButtonText}>🔄 Refresh Analysis</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  overviewCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  trendValue: {
    fontSize: 32,
    marginBottom: 5,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  themeText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  chartDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  emotionItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 10,
  },
  emotionName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  emotionFrequency: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  trendContainer: {
    alignItems: 'center',
  },
  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  trendEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  trendText: {
    fontSize: 16,
    color: '#333',
  },
  trendLabel: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  recommendationsContainer: {
    marginTop: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#4A90E2',
    marginRight: 10,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  insightsCard: {
    backgroundColor: '#f8fafe',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  insightValue: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});
