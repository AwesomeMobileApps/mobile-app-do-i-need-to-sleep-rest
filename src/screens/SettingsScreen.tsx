import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Linking,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserSettings } from '../types';
import * as Haptics from 'expo-haptics';

const SETTINGS_STORAGE_KEY = 'user_settings';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [settings, setSettings] = useState<UserSettings>({
    enableNotifications: false,
    saveVideos: false,
    aiSensitivity: 50,
  });
  const [loading, setLoading] = useState(true);
  
  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  // Load saved settings
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Save settings when they change
  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings.');
    }
  };
  
  // Handle toggle changes
  const handleToggle = (setting: keyof UserSettings, value: boolean) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };
  
  // Handle sensitivity change
  const handleSensitivityChange = (value: number) => {
    const newSettings = { ...settings, aiSensitivity: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };
  
  // Show privacy policy
  const showPrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'DO I NEED TO REST? respects your privacy. We do not collect or share any personal data. Analysis is performed locally on your device.',
      [{ text: 'OK', onPress: () => {} }]
    );
  };
  
  // Open app website
  const openWebsite = () => {
    Linking.openURL('https://example.com/doineeedtorest');
  };
  
  // Sensitivity levels for the AI
  const sensitivityLevels = [
    { label: 'Low', value: 25 },
    { label: 'Normal', value: 50 },
    { label: 'High', value: 75 },
  ];
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading settings...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Notifications</Text>
            <Text style={styles.settingDescription}>
              Enable daily reminders to check your rest level
            </Text>
          </View>
          <Switch
            value={settings.enableNotifications}
            onValueChange={(value) => handleToggle('enableNotifications', value)}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
            thumbColor={Platform.OS === 'ios' ? '' : '#FFFFFF'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Save Videos</Text>
            <Text style={styles.settingDescription}>
              Save video recordings to your device
            </Text>
          </View>
          <Switch
            value={settings.saveVideos}
            onValueChange={(value) => handleToggle('saveVideos', value)}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
            thumbColor={Platform.OS === 'ios' ? '' : '#FFFFFF'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Sensitivity</Text>
        <Text style={styles.settingDescription}>
          Adjust how sensitive the AI is when analyzing your fatigue level
        </Text>
        
        <View style={styles.sensitivityContainer}>
          {sensitivityLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.sensitivityButton,
                settings.aiSensitivity === level.value && styles.sensitivityButtonActive,
              ]}
              onPress={() => handleSensitivityChange(level.value)}
            >
              <Text
                style={[
                  styles.sensitivityText,
                  settings.aiSensitivity === level.value && styles.sensitivityTextActive,
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.aboutItem} onPress={showPrivacyPolicy}>
          <Text style={styles.aboutText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.aboutItem} onPress={openWebsite}>
          <Text style={styles.aboutText}>Visit Website</Text>
        </TouchableOpacity>
        
        <View style={styles.aboutItem}>
          <Text style={styles.aboutText}>Version 1.0.0</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          DO I NEED TO REST? 2023
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    marginBottom: 0,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  sensitivityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  sensitivityButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  sensitivityButtonActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#4A90E2',
  },
  sensitivityText: {
    color: '#333',
  },
  sensitivityTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  aboutItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  aboutText: {
    fontSize: 16,
  },
  footer: {
    margin: 15,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
}); 