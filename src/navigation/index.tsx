import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Import screens (to be created)
import HomeScreen from '../screens/HomeScreen';
import RecordVideoScreen from '../screens/RecordVideoScreen';
import ResultsScreen from '../screens/ResultsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CameraVerificationScreen from '../screens/CameraVerificationScreen';
import DreamTrackerScreen from '../screens/DreamTrackerScreen';
import AddDreamScreen from '../screens/AddDreamScreen';
import DreamDetailScreen from '../screens/DreamDetailScreen';
import DreamAnalysisScreen from '../screens/DreamAnalysisScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4A90E2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'DO I NEED TO REST?' }}
        />
        <Stack.Screen
          name="RecordVideo"
          component={RecordVideoScreen}
          options={{ title: 'Record Video' }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Analysis Results' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Your History' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="CameraVerification"
          component={CameraVerificationScreen}
          options={{ title: 'Camera Verification' }}
        />
        <Stack.Screen
          name="DreamTracker"
          component={DreamTrackerScreen}
          options={{ title: 'Dream Tracker' }}
        />
        <Stack.Screen
          name="AddDream"
          component={AddDreamScreen}
          options={{ title: 'Record Dream' }}
        />
        <Stack.Screen
          name="DreamDetail"
          component={DreamDetailScreen}
          options={{ title: 'Dream Details' }}
        />
        <Stack.Screen
          name="DreamAnalysis"
          component={DreamAnalysisScreen}
          options={{ title: 'Dream Analysis' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 