import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Share, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, RestAnalysisResult } from '../types';
import { formatDate, getEnergyColor } from '../utils/helpers';
import * as Haptics from 'expo-haptics';

type ResultsScreenProps = {
  route: RouteProp<RootStackParamList, 'Results'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
};

export default function ResultsScreen({ route, navigation }: ResultsScreenProps) {
  const { result } = route.params;
  
  // Play haptic feedback based on result when screen loads
  React.useEffect(() => {
    if (result.needsSleep) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (result.needsRest) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);
  
  // Share result with others
  const shareResult = async () => {
    try {
      const shareMessage = `My energy level is ${result.energyLevel}% (${result.message}) - Checked with DO I NEED TO REST? app.`;
      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.error('Error sharing result:', error);
    }
  };
  
  // Return to home screen
  const goHome = () => {
    navigation.navigate('Home');
  };
  
  // Check again (new recording)
  const checkAgain = () => {
    navigation.replace('RecordVideo');
  };
  
  // Render facial features analysis if available
  const renderFacialFeatures = () => {
    if (!result.facialFeatures) return null;
    
    const features = result.facialFeatures;
    
    return (
      <View style={styles.facialFeaturesContainer}>
        <Text style={styles.facialFeaturesTitle}>Facial Analysis</Text>
        
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Eyes</Text>
            <Text style={styles.featureValue}>{features.eyeOpenness}</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Blinking</Text>
            <Text style={styles.featureValue}>{features.blinkRate}</Text>
          </View>
        </View>
        
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Skin Tone</Text>
            <Text style={styles.featureValue}>{features.skinTone}</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Movements</Text>
            <Text style={styles.featureValue}>{features.facialMovements}</Text>
          </View>
        </View>
        
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Posture</Text>
            <Text style={styles.featureValue}>{features.posture}</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Yawning</Text>
            <Text style={styles.featureValue}>{features.yawning ? 'Detected' : 'None'}</Text>
          </View>
        </View>
        
        {result.detailedAnalysis && (
          <View style={styles.detailedAnalysis}>
            <Text style={styles.analysisText}>
              Primary Factor: <Text style={styles.analysisValue}>{result.detailedAnalysis.primaryFactor}</Text>
            </Text>
            <Text style={styles.analysisText}>
              Secondary Factor: <Text style={styles.analysisValue}>{result.detailedAnalysis.secondaryFactor}</Text>
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.resultCard}>
          <Text style={styles.timestamp}>{formatDate(result.timestamp)}</Text>
          
          <View style={styles.energyContainer}>
            <Text style={styles.energyLabel}>Your Energy Level</Text>
            <View style={styles.energyMeterContainer}>
              <View 
                style={[
                  styles.energyMeter, 
                  { width: `${result.energyLevel}%`, backgroundColor: getEnergyColor(result.energyLevel) }
                ]} 
              />
            </View>
            <Text style={[styles.energyValue, { color: getEnergyColor(result.energyLevel) }]}>
              {result.energyLevel}%
            </Text>
          </View>
          
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>What this means:</Text>
            <Text style={[styles.message, { color: getEnergyColor(result.energyLevel) }]}>
              {result.message}
            </Text>
          </View>
          
          {/* Render facial features analysis */}
          {renderFacialFeatures()}
          
          <View style={styles.recommendationContainer}>
            {result.needsSleep && (
              <View style={styles.recommendation}>
                <Text style={styles.recommendationTitle}>You should sleep soon</Text>
                <Text style={styles.recommendationText}>
                  Based on your face analysis, you appear to be very tired. Getting proper sleep will help you recover.
                </Text>
              </View>
            )}
            
            {result.needsRest && !result.needsSleep && (
              <View style={styles.recommendation}>
                <Text style={styles.recommendationTitle}>Consider taking a break</Text>
                <Text style={styles.recommendationText}>
                  A short rest or power nap might help you recharge your energy level.
                </Text>
              </View>
            )}
            
            {!result.needsRest && !result.needsSleep && (
              <View style={styles.recommendation}>
                <Text style={styles.recommendationTitle}>You're doing great!</Text>
                <Text style={styles.recommendationText}>
                  Your energy level is good. It's a perfect time to be productive or do things you enjoy.
                </Text>
              </View>
            )}
            
            {result.detailedAnalysis && (
              <Text style={styles.recommendationSubtext}>
                Recommendation: {result.detailedAnalysis.recommendation}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={checkAgain}>
            <Text style={styles.buttonText}>Check Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={shareResult}>
            <Text style={styles.buttonText}>Share Result</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={goHome}>
            <Text style={styles.buttonText}>Go Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.historyButton]} 
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.buttonText}>View History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  energyContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  energyLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  energyMeterContainer: {
    height: 20,
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  energyMeter: {
    height: '100%',
  },
  energyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  messageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  messageLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  message: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  facialFeaturesContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  facialFeaturesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  featureItem: {
    flex: 1,
    paddingHorizontal: 5,
  },
  featureLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  featureValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textTransform: 'capitalize',
  },
  detailedAnalysis: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  analysisValue: {
    color: '#333',
    fontWeight: '500',
  },
  recommendationContainer: {
    marginTop: 15,
  },
  recommendation: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  recommendationSubtext: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  historyButton: {
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 