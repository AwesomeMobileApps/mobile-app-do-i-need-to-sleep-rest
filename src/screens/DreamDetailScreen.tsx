import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, DreamEntry } from '../types';
import { dreamService } from '../services/dreamService';
import { formatDate } from '../utils/helpers';
import * as Haptics from 'expo-haptics';

type DreamDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DreamDetail'>;
  route: RouteProp<RootStackParamList, 'DreamDetail'>;
};

export default function DreamDetailScreen({ navigation, route }: DreamDetailScreenProps) {
  const { dreamId } = route.params;
  const [dream, setDream] = useState<DreamEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingSoundscape, setIsPlayingSoundscape] = useState(false);

  useEffect(() => {
    loadDream();
  }, [dreamId]);

  const loadDream = async () => {
    try {
      setLoading(true);
      const dreamEntry = await dreamService.getDreamById(dreamId);
      setDream(dreamEntry);
    } catch (error) {
      console.error('Failed to load dream:', error);
      Alert.alert('Error', 'Failed to load dream details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: DreamEntry['mood']): string => {
    const moodColors = {
      peaceful: '#4CAF50',
      exciting: '#FF9800',
      mysterious: '#9C27B0',
      scary: '#F44336',
      romantic: '#E91E63',
      adventurous: '#2196F3',
    };
    return moodColors[mood];
  };

  const getMoodEmoji = (mood: DreamEntry['mood']): string => {
    const moodEmojis = {
      peaceful: '😌',
      exciting: '🎉',
      mysterious: '🔮',
      scary: '😰',
      romantic: '💕',
      adventurous: '🗺️',
    };
    return moodEmojis[mood];
  };

  const handlePlaySoundscape = async () => {
    if (!dream?.soundscape) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (isPlayingSoundscape) {
        await dreamService.stopSoundscape();
        setIsPlayingSoundscape(false);
      } else {
        await dreamService.playSoundscape(dream.soundscape);
        setIsPlayingSoundscape(true);
        
        // Show playing indicator
        Alert.alert(
          'Soundscape Playing 🎵',
          `Now playing "${dream.soundscape.type}" soundscape for your dream. The ambient sounds will help you reconnect with the dream atmosphere.`,
          [
            {
              text: 'Stop',
              onPress: () => {
                dreamService.stopSoundscape();
                setIsPlayingSoundscape(false);
              }
            },
            { text: 'Keep Playing', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Failed to play soundscape:', error);
      Alert.alert('Error', 'Failed to play soundscape');
    }
  };

  const handleShareDream = async () => {
    if (!dream) return;

    try {
      const shareMessage = `🌙 Dream: "${dream.title}"\n\n${dream.description}\n\nMood: ${getMoodEmoji(dream.mood)} ${dream.mood}\nLucidity: ${dream.lucidity}%\nVividity: ${dream.vividity}%\n\nRecorded with Dream Tracker app`;
      
      await Share.share({
        message: shareMessage,
        title: `Dream: ${dream.title}`,
      });
    } catch (error) {
      console.error('Failed to share dream:', error);
    }
  };

  const handleDeleteDream = () => {
    if (!dream) return;

    Alert.alert(
      'Delete Dream',
      `Are you sure you want to delete "${dream.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dreamService.deleteDreamEntry(dream.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete dream:', error);
              Alert.alert('Error', 'Failed to delete dream');
            }
          }
        }
      ]
    );
  };

  const getSoundscapeIcon = (type: string): string => {
    const icons = {
      nature: '🌿',
      urban: '🏙️',
      cosmic: '🌌',
      ocean: '🌊',
      forest: '🌲',
      rain: '🌧️',
    };
    return icons[type] || '🎵';
  };

  const renderMetricBar = (label: string, value: number, color: string) => (
    <View style={styles.metricContainer}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}%</Text>
      </View>
      <View style={styles.metricBarBackground}>
        <View 
          style={[
            styles.metricBarFill,
            { width: `${value}%`, backgroundColor: color }
          ]}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dream details...</Text>
      </View>
    );
  }

  if (!dream) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Dream not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.dreamEmoji}>{getMoodEmoji(dream.mood)}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.dreamTitle}>{dream.title}</Text>
            <Text style={styles.dreamDate}>{formatDate(dream.date)}</Text>
          </View>
          <View style={[styles.moodBadge, { backgroundColor: getMoodColor(dream.mood) }]}>
            <Text style={styles.moodText}>{dream.mood}</Text>
          </View>
        </View>
      </View>

      {dream.generatedImage && (
        <View style={styles.imageSection}>
          <Image source={{ uri: dream.generatedImage.url }} style={styles.dreamImage} />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageStyle}>Style: {dream.generatedImage.style}</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Description</Text>
          <Text style={styles.description}>{dream.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Metrics</Text>
          {renderMetricBar('Lucidity', dream.lucidity, '#4A90E2')}
          {renderMetricBar('Vividity', dream.vividity, '#4CAF50')}
          {renderMetricBar('Sleep Quality', dream.sleepQuality, '#9C27B0')}
          
          <View style={styles.lengthContainer}>
            <Text style={styles.lengthLabel}>Duration:</Text>
            <Text style={styles.lengthValue}>
              {dream.dreamLength === 'short' ? 'Short (< 5 min)' :
               dream.dreamLength === 'medium' ? 'Medium (5-15 min)' :
               'Long (> 15 min)'}
            </Text>
          </View>
        </View>

        {dream.soundscape && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI-Generated Soundscape</Text>
            <TouchableOpacity 
              style={[
                styles.soundscapeCard,
                isPlayingSoundscape && styles.soundscapeCardPlaying
              ]}
              onPress={handlePlaySoundscape}
            >
              <Text style={styles.soundscapeIcon}>
                {getSoundscapeIcon(dream.soundscape.type)}
              </Text>
              <View style={styles.soundscapeInfo}>
                <Text style={styles.soundscapeType}>
                  {dream.soundscape.type.charAt(0).toUpperCase() + dream.soundscape.type.slice(1)} Soundscape
                </Text>
                <Text style={styles.soundscapeDescription}>
                  Ambient sounds crafted for your dream atmosphere
                </Text>
              </View>
              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>
                  {isPlayingSoundscape ? '⏸️' : '▶️'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {dream.emotions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emotions</Text>
            <View style={styles.tagsContainer}>
              {dream.emotions.map((emotion, index) => (
                <View key={index} style={[styles.tag, styles.emotionTag]}>
                  <Text style={styles.emotionTagText}>{emotion}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {dream.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {dream.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {dream.characters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Characters</Text>
            <View style={styles.charactersContainer}>
              {dream.characters.map((character, index) => (
                <View key={index} style={styles.characterChip}>
                  <Text style={styles.characterText}>👤 {character}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {dream.locations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locations</Text>
            <View style={styles.locationsContainer}>
              {dream.locations.map((location, index) => (
                <View key={index} style={styles.locationChip}>
                  <Text style={styles.locationText}>📍 {location}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {dream.generatedImage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Image Prompt</Text>
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>{dream.generatedImage.prompt}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareDream}>
            <Text style={styles.shareButtonText}>📤 Share Dream</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteDream}>
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  loadingText: {
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
  backButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dreamEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  dreamTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dreamDate: {
    fontSize: 16,
    color: '#666',
  },
  moodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  moodText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  imageSection: {
    position: 'relative',
  },
  dreamImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  imageStyle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  metricContainer: {
    marginBottom: 15,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  metricBarBackground: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  lengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  lengthLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginRight: 10,
  },
  lengthValue: {
    fontSize: 16,
    color: '#666',
  },
  soundscapeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
  },
  soundscapeCardPlaying: {
    borderColor: '#4A90E2',
    backgroundColor: '#f8fafe',
  },
  soundscapeIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  soundscapeInfo: {
    flex: 1,
  },
  soundscapeType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  soundscapeDescription: {
    fontSize: 14,
    color: '#666',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 20,
    color: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  emotionTag: {
    backgroundColor: '#fff3e0',
  },
  emotionTagText: {
    fontSize: 14,
    color: '#f57c00',
    fontWeight: '500',
  },
  charactersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  characterChip: {
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  characterText: {
    fontSize: 14,
    color: '#7b1fa2',
    fontWeight: '500',
  },
  locationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationChip: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  locationText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  promptContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  promptText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
