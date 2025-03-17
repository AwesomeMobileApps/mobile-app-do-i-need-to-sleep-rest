import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Share,
  Alert,
  useWindowDimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, RestAnalysisResult } from '../types';
import { getResults, clearAllResults } from '../services/restAnalysisService';
import { formatDate, getEnergyColor, organizeResultsByDay } from '../utils/helpers';
import * as Haptics from 'expo-haptics';

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'History'>;
};

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [results, setResults] = useState<RestAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  
  // Load results when screen is focused
  useEffect(() => {
    loadResults();
  }, []);
  
  // Function to load all the analysis results
  const loadResults = async () => {
    setLoading(true);
    try {
      const savedResults = await getResults();
      // Sort by timestamp (most recent first)
      const sortedResults = savedResults.sort((a, b) => b.timestamp - a.timestamp);
      setResults(sortedResults);
    } catch (error) {
      console.error('Failed to load results:', error);
      Alert.alert('Error', 'Failed to load your history.');
    } finally {
      setLoading(false);
    }
  };
  
  // Share history chart
  const shareHistory = async () => {
    try {
      const avgEnergy = results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.energyLevel, 0) / results.length) 
        : 0;
      
      const message = `My average energy level over the past ${results.length} checks is ${avgEnergy}%. Tracked with DO I NEED TO REST? app.`;
      
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing history:', error);
    }
  };
  
  // Clear all history data
  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all your history data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllResults();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setResults([]);
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert('Error', 'Failed to clear history.');
            }
          }
        },
      ]
    );
  };
  
  // Render a single result item
  const renderResultItem = ({ item }: { item: RestAnalysisResult }) => (
    <View style={styles.resultItem}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultDate}>{formatDate(item.timestamp)}</Text>
        <View 
          style={[
            styles.energyIndicator, 
            { backgroundColor: getEnergyColor(item.energyLevel) }
          ]} 
        />
      </View>
      <Text style={styles.resultEnergy}>Energy: {item.energyLevel}%</Text>
      <Text style={styles.resultMessage}>{item.message}</Text>
    </View>
  );
  
  // Prepare chart data
  const getChartData = () => {
    const { labels, data } = organizeResultsByDay(results);
    
    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Energy Level'],
    };
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No History Yet</Text>
      <Text style={styles.emptyText}>
        Your energy level analysis history will appear here after you check your fatigue level.
      </Text>
      <TouchableOpacity
        style={styles.checkButton}
        onPress={() => navigation.navigate('RecordVideo')}
      >
        <Text style={styles.checkButtonText}>Check Now</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading your history...</Text>
        </View>
      ) : (
        <>
          {results.length > 0 ? (
            <>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Energy Level Trend</Text>
                <Text style={styles.chartSubtitle}>Past 7 Days</Text>
                <LineChart
                  data={getChartData()}
                  width={width - 40}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: '#4A90E2',
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>
              
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Recent Checks</Text>
                <TouchableOpacity onPress={shareHistory}>
                  <Text style={styles.shareButton}>Share</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={results}
                renderItem={renderResultItem}
                keyExtractor={(item) => item.timestamp.toString()}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
              
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearHistory}
              >
                <Text style={styles.clearButtonText}>Clear History</Text>
              </TouchableOpacity>
            </>
          ) : (
            renderEmptyState()
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButton: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  list: {
    paddingBottom: 70,
  },
  resultItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultDate: {
    fontSize: 14,
    color: '#666',
  },
  energyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  resultEnergy: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 14,
    color: '#444',
  },
  clearButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  checkButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  checkButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 