import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DreamEntry } from '../types';
import { dreamService } from '../services/dreamService';
import { formatDate } from '../utils/helpers';
import * as Haptics from 'expo-haptics';

type DreamTrackerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DreamTracker'>;
};

export default function DreamTrackerScreen({ navigation }: DreamTrackerScreenProps) {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDreams, setFilteredDreams] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDreams();
  }, []);

  useEffect(() => {
    filterDreams();
  }, [dreams, searchQuery]);

  const loadDreams = async () => {
    try {
      setLoading(true);
      const dreamEntries = await dreamService.getDreamEntries();
      setDreams(dreamEntries);
    } catch (error) {
      console.error('Failed to load dreams:', error);
      Alert.alert('Error', 'Failed to load your dreams');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDreams();
    setRefreshing(false);
  };

  const filterDreams = () => {
    if (searchQuery.trim() === '') {
      setFilteredDreams(dreams);
    } else {
      const filtered = dreams.filter(dream =>
        dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredDreams(filtered);
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

  const handleDreamPress = (dreamId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('DreamDetail', { dreamId });
  };

  const handleAddDream = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('AddDream');
  };

  const handleAnalyzePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('DreamAnalysis');
  };

  const renderDreamCard = (dream: DreamEntry) => (
    <TouchableOpacity
      key={dream.id}
      style={styles.dreamCard}
      onPress={() => handleDreamPress(dream.id)}
    >
      <View style={styles.dreamHeader}>
        <View style={styles.dreamTitleRow}>
          <Text style={[styles.moodEmoji]}>{getMoodEmoji(dream.mood)}</Text>
          <Text style={styles.dreamTitle} numberOfLines={1}>
            {dream.title}
          </Text>
          <View style={[styles.moodBadge, { backgroundColor: getMoodColor(dream.mood) }]}>
            <Text style={styles.moodText}>{dream.mood}</Text>
          </View>
        </View>
        <Text style={styles.dreamDate}>{formatDate(dream.date)}</Text>
      </View>

      <Text style={styles.dreamDescription} numberOfLines={2}>
        {dream.description}
      </Text>

      {dream.generatedImage && (
        <Image source={{ uri: dream.generatedImage.url }} style={styles.dreamImage} />
      )}

      <View style={styles.dreamMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Lucidity</Text>
          <Text style={styles.metricValue}>{dream.lucidity}%</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Vividity</Text>
          <Text style={styles.metricValue}>{dream.vividity}%</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Sleep Quality</Text>
          <Text style={styles.metricValue}>{dream.sleepQuality}%</Text>
        </View>
      </View>

      {dream.tags.length > 0 && (
        <View style={styles.dreamTags}>
          {dream.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {dream.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{dream.tags.length - 3} more</Text>
          )}
        </View>
      )}

      {dream.soundscape && (
        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🎵</Text>
            <Text style={styles.featureText}>Soundscape</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dream Tracker</Text>
        <Text style={styles.subtitle}>
          {dreams.length} dreams recorded
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your dreams..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddDream}>
          <Text style={styles.addButtonText}>+ Add Dream</Text>
        </TouchableOpacity>
        
        {dreams.length > 0 && (
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyzePress}>
            <Text style={styles.analyzeButtonText}>📊 Analyze</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.dreamsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your dreams...</Text>
          </View>
        ) : filteredDreams.length > 0 ? (
          filteredDreams.map(renderDreamCard)
        ) : dreams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyTitle}>No Dreams Yet</Text>
            <Text style={styles.emptyDescription}>
              Start recording your dreams to unlock personalized insights,
              soundscapes, and AI-generated imagery!
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={handleAddDream}>
              <Text style={styles.startButtonText}>Record Your First Dream</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No Dreams Found</Text>
            <Text style={styles.emptyDescription}>
              Try adjusting your search terms
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    padding: 20,
    backgroundColor: '#4A90E2',
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
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dreamsList: {
    flex: 1,
    padding: 15,
  },
  dreamCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dreamHeader: {
    marginBottom: 10,
  },
  dreamTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  dreamTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  moodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  moodText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  dreamDate: {
    fontSize: 14,
    color: '#666',
  },
  dreamDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 10,
  },
  dreamImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  dreamMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  dreamTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  featureEmoji: {
    fontSize: 16,
    marginRight: 5,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
