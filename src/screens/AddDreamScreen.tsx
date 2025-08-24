import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DreamEntry } from '../types';
import { dreamService } from '../services/dreamService';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';

type AddDreamScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddDream'>;
};

const COMMON_TAGS = [
  'flying', 'water', 'animals', 'family', 'friends', 'school', 'work',
  'adventure', 'magical', 'nature', 'city', 'home', 'travel', 'fantasy',
  'childhood', 'future', 'past', 'colors', 'music', 'food'
];

const COMMON_EMOTIONS = [
  'happy', 'excited', 'peaceful', 'confused', 'anxious', 'curious',
  'amazed', 'scared', 'nostalgic', 'free', 'powerful', 'lost'
];

export default function AddDreamScreen({ navigation }: AddDreamScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState<DreamEntry['mood']>('peaceful');
  const [lucidity, setLucidity] = useState(50);
  const [vividity, setVividity] = useState(50);
  const [sleepQuality, setSleepQuality] = useState(70);
  const [dreamLength, setDreamLength] = useState<DreamEntry['dreamLength']>('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [characters, setCharacters] = useState('');
  const [locations, setLocations] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [customEmotion, setCustomEmotion] = useState('');
  const [saving, setSaving] = useState(false);

  const moods: { mood: DreamEntry['mood']; emoji: string; color: string }[] = [
    { mood: 'peaceful', emoji: '😌', color: '#4CAF50' },
    { mood: 'exciting', emoji: '🎉', color: '#FF9800' },
    { mood: 'mysterious', emoji: '🔮', color: '#9C27B0' },
    { mood: 'scary', emoji: '😰', color: '#F44336' },
    { mood: 'romantic', emoji: '💕', color: '#E91E63' },
    { mood: 'adventurous', emoji: '🗺️', color: '#2196F3' },
  ];

  const dreamLengths: { length: DreamEntry['dreamLength']; label: string }[] = [
    { length: 'short', label: 'Short (< 5 min)' },
    { length: 'medium', label: 'Medium (5-15 min)' },
    { length: 'long', label: 'Long (> 15 min)' },
  ];

  const handleTagPress = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleEmotionPress = (emotion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const addCustomEmotion = () => {
    if (customEmotion.trim() && !selectedEmotions.includes(customEmotion.trim())) {
      setSelectedEmotions(prev => [...prev, customEmotion.trim()]);
      setCustomEmotion('');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for your dream');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please describe your dream');
      return;
    }

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const dreamData: Omit<DreamEntry, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        date: Date.now(),
        tags: selectedTags,
        mood,
        lucidity,
        vividity,
        emotions: selectedEmotions,
        characters: characters.split(',').map(c => c.trim()).filter(c => c),
        locations: locations.split(',').map(l => l.trim()).filter(l => l),
        sleepQuality,
        dreamLength,
      };

      const savedDream = await dreamService.saveDreamEntry(dreamData);
      
      Alert.alert(
        'Dream Saved! 🌟',
        `Your dream "${savedDream.title}" has been saved with AI-generated soundscape and imagery!`,
        [
          {
            text: 'View Dream',
            onPress: () => {
              navigation.replace('DreamDetail', { dreamId: savedDream.id });
            }
          },
          {
            text: 'Add Another',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setMood('peaceful');
              setLucidity(50);
              setVividity(50);
              setSleepQuality(70);
              setDreamLength('medium');
              setSelectedTags([]);
              setSelectedEmotions([]);
              setCharacters('');
              setLocations('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to save dream:', error);
      Alert.alert('Error', 'Failed to save your dream. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Give your dream a memorable title..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe your dream in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Mood</Text>
          <View style={styles.moodContainer}>
            {moods.map(({ mood: moodType, emoji, color }) => (
              <TouchableOpacity
                key={moodType}
                style={[
                  styles.moodButton,
                  { backgroundColor: mood === moodType ? color : '#f0f0f0' }
                ]}
                onPress={() => setMood(moodType)}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={[
                  styles.moodText,
                  { color: mood === moodType ? 'white' : '#333' }
                ]}>
                  {moodType}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Metrics</Text>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              Lucidity: {lucidity}% {lucidity > 70 ? '🌟' : lucidity > 40 ? '✨' : '💭'}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={lucidity}
              onValueChange={setLucidity}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="#ddd"
              thumbStyle={{ backgroundColor: '#4A90E2' }}
            />
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              Vividity: {vividity}% {vividity > 70 ? '🎨' : vividity > 40 ? '🖼️' : '🔍'}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={vividity}
              onValueChange={setVividity}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#ddd"
              thumbStyle={{ backgroundColor: '#4CAF50' }}
            />
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              Sleep Quality: {sleepQuality}% {sleepQuality > 70 ? '😴' : sleepQuality > 40 ? '😐' : '😵'}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={sleepQuality}
              onValueChange={setSleepQuality}
              minimumTrackTintColor="#9C27B0"
              maximumTrackTintColor="#ddd"
              thumbStyle={{ backgroundColor: '#9C27B0' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Length</Text>
          <View style={styles.lengthContainer}>
            {dreamLengths.map(({ length, label }) => (
              <TouchableOpacity
                key={length}
                style={[
                  styles.lengthButton,
                  { backgroundColor: dreamLength === length ? '#4A90E2' : '#f0f0f0' }
                ]}
                onPress={() => setDreamLength(length)}
              >
                <Text style={[
                  styles.lengthText,
                  { color: dreamLength === length ? 'white' : '#333' }
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {COMMON_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  { backgroundColor: selectedTags.includes(tag) ? '#e3f2fd' : '#f9f9f9' }
                ]}
                onPress={() => handleTagPress(tag)}
              >
                <Text style={[
                  styles.tagButtonText,
                  { color: selectedTags.includes(tag) ? '#1976d2' : '#666' }
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Add custom tag..."
              value={customTag}
              onChangeText={setCustomTag}
            />
            <TouchableOpacity style={styles.addButton} onPress={addCustomTag}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emotions</Text>
          <View style={styles.tagsContainer}>
            {COMMON_EMOTIONS.map(emotion => (
              <TouchableOpacity
                key={emotion}
                style={[
                  styles.tagButton,
                  { backgroundColor: selectedEmotions.includes(emotion) ? '#fff3e0' : '#f9f9f9' }
                ]}
                onPress={() => handleEmotionPress(emotion)}
              >
                <Text style={[
                  styles.tagButtonText,
                  { color: selectedEmotions.includes(emotion) ? '#f57c00' : '#666' }
                ]}>
                  {emotion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Add custom emotion..."
              value={customEmotion}
              onChangeText={setCustomEmotion}
            />
            <TouchableOpacity style={styles.addButton} onPress={addCustomEmotion}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Characters</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Who was in your dream? (separate with commas)"
            value={characters}
            onChangeText={setCharacters}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locations</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Where did your dream take place? (separate with commas)"
            value={locations}
            onChangeText={setLocations}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving Dream... 🌟' : 'Save Dream with AI Features 🎨🎵'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  lengthContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  lengthButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  lengthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  tagButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 50,
  },
});
