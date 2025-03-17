import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getResults } from '../services/restAnalysisService';
import { RestAnalysisResult } from '../types';
import { useIsFocused } from '@react-navigation/native';
import CameraIcon from '../../assets/camera';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [latestResult, setLatestResult] = React.useState<RestAnalysisResult | null>(null);
  const isFocused = useIsFocused();
  
  // Load latest result when screen is focused
  React.useEffect(() => {
    if (isFocused) {
      loadLatestResult();
    }
  }, [isFocused]);
  
  // Function to load the latest analysis result
  const loadLatestResult = async () => {
    const results = await getResults();
    if (results.length > 0) {
      // Sort by timestamp (newest first) and get the first one
      const sorted = [...results].sort((a, b) => b.timestamp - a.timestamp);
      setLatestResult(sorted[0]);
    }
  };
  
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },
  recordButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  lastResultContainer: {
    marginTop: 30,
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