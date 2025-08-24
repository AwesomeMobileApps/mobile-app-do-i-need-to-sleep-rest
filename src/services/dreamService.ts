import AsyncStorage from '@react-native-async-storage/async-storage';
import { DreamEntry, DreamAnalysis } from '../types';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const DREAMS_STORAGE_KEY = 'dream_entries';

// Dream service for managing dream data and generating soundscapes
export class DreamService {
  private static instance: DreamService;
  private soundscapeAudio: Audio.Sound | null = null;

  static getInstance(): DreamService {
    if (!DreamService.instance) {
      DreamService.instance = new DreamService();
    }
    return DreamService.instance;
  }

  // Save a dream entry
  async saveDreamEntry(dream: Omit<DreamEntry, 'id'>): Promise<DreamEntry> {
    try {
      const dreamEntry: DreamEntry = {
        ...dream,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };

      // Generate soundscape for the dream
      dreamEntry.soundscape = await this.generateSoundscape(dreamEntry);
      
      // Generate AI image prompt and simulate image generation
      dreamEntry.generatedImage = await this.generateDreamImage(dreamEntry);

      const existingDreams = await this.getDreamEntries();
      const updatedDreams = [dreamEntry, ...existingDreams];

      await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(updatedDreams));
      return dreamEntry;
    } catch (error) {
      console.error('Failed to save dream entry:', error);
      throw error;
    }
  }

  // Get all dream entries
  async getDreamEntries(): Promise<DreamEntry[]> {
    try {
      const dreamsStr = await AsyncStorage.getItem(DREAMS_STORAGE_KEY);
      return dreamsStr ? JSON.parse(dreamsStr) : [];
    } catch (error) {
      console.error('Failed to get dream entries:', error);
      return [];
    }
  }

  // Get a specific dream by ID
  async getDreamById(id: string): Promise<DreamEntry | null> {
    try {
      const dreams = await this.getDreamEntries();
      return dreams.find(dream => dream.id === id) || null;
    } catch (error) {
      console.error('Failed to get dream by ID:', error);
      return null;
    }
  }

  // Delete a dream entry
  async deleteDreamEntry(id: string): Promise<void> {
    try {
      const dreams = await this.getDreamEntries();
      const filteredDreams = dreams.filter(dream => dream.id !== id);
      await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(filteredDreams));
    } catch (error) {
      console.error('Failed to delete dream entry:', error);
      throw error;
    }
  }

  // Generate soundscape based on dream content
  private async generateSoundscape(dream: DreamEntry): Promise<DreamEntry['soundscape']> {
    // AI-driven soundscape selection based on dream content
    const soundscapeMap: Record<string, DreamEntry['soundscape']['type']> = {
      peaceful: 'nature',
      exciting: 'urban',
      mysterious: 'cosmic',
      scary: 'forest',
      romantic: 'ocean',
      adventurous: 'rain',
    };

    const baseType = soundscapeMap[dream.mood] || 'nature';
    
    // Enhanced selection based on locations and emotions
    let finalType = baseType;
    if (dream.locations.some(loc => loc.toLowerCase().includes('water') || loc.toLowerCase().includes('ocean'))) {
      finalType = 'ocean';
    } else if (dream.locations.some(loc => loc.toLowerCase().includes('forest') || loc.toLowerCase().includes('tree'))) {
      finalType = 'forest';
    } else if (dream.locations.some(loc => loc.toLowerCase().includes('city') || loc.toLowerCase().includes('urban'))) {
      finalType = 'urban';
    } else if (dream.emotions.some(emotion => emotion.toLowerCase().includes('calm') || emotion.toLowerCase().includes('peace'))) {
      finalType = 'rain';
    }

    // Simulate soundscape generation (in production, you'd use actual audio generation APIs)
    const soundscapeUrls = {
      nature: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
      urban: 'https://www.soundjay.com/misc/sounds/city-01.wav',
      cosmic: 'https://www.soundjay.com/misc/sounds/space-01.wav',
      ocean: 'https://www.soundjay.com/misc/sounds/ocean-01.wav',
      forest: 'https://www.soundjay.com/misc/sounds/forest-01.wav',
      rain: 'https://www.soundjay.com/misc/sounds/rain-02.wav',
    };

    return {
      type: finalType,
      url: soundscapeUrls[finalType],
      duration: 300000, // 5 minutes
    };
  }

  // Generate AI image for dream visualization
  private async generateDreamImage(dream: DreamEntry): Promise<DreamEntry['generatedImage']> {
    // Create AI prompt based on dream content
    const styleMap = {
      peaceful: 'abstract',
      exciting: 'realistic',
      mysterious: 'surreal',
      scary: 'surreal',
      romantic: 'fantasy',
      adventurous: 'realistic',
    } as const;

    const style = styleMap[dream.mood] || 'abstract';
    
    // Generate detailed AI prompt
    const prompt = this.generateImagePrompt(dream);
    
    // Simulate image generation (in production, you'd use DALL-E, Midjourney, or Stable Diffusion APIs)
    const mockImageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;

    return {
      url: mockImageUrl,
      style,
      prompt,
    };
  }

  // Generate detailed AI image prompt from dream content
  private generateImagePrompt(dream: DreamEntry): string {
    const { description, mood, locations, characters, emotions } = dream;
    
    let prompt = `${mood} dream scene`;
    
    if (locations.length > 0) {
      prompt += ` set in ${locations.join(', ')}`;
    }
    
    if (characters.length > 0) {
      prompt += ` featuring ${characters.join(', ')}`;
    }
    
    if (emotions.length > 0) {
      prompt += ` with ${emotions.join(', ')} atmosphere`;
    }
    
    // Add artistic style based on mood
    const styleDescriptions = {
      peaceful: 'soft, ethereal lighting, pastel colors, serene composition',
      exciting: 'dynamic movement, vibrant colors, action-packed scene',
      mysterious: 'dark shadows, mysterious fog, enigmatic elements',
      scary: 'dark tones, ominous shadows, haunting atmosphere',
      romantic: 'warm lighting, beautiful scenery, romantic ambiance',
      adventurous: 'epic landscape, adventure elements, heroic composition',
    };
    
    prompt += `, ${styleDescriptions[dream.mood]}, digital art, highly detailed`;
    
    return prompt;
  }

  // Play soundscape for a dream
  async playSoundscape(soundscape: DreamEntry['soundscape']): Promise<void> {
    try {
      if (this.soundscapeAudio) {
        await this.soundscapeAudio.unloadAsync();
      }

      // For demo purposes, we'll use a local placeholder sound
      // In production, you would download and cache the actual soundscape
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundscape.url },
        { shouldPlay: true, isLooping: true, volume: 0.5 }
      );
      
      this.soundscapeAudio = sound;
    } catch (error) {
      console.error('Failed to play soundscape:', error);
      // Fallback: play a simple tone or silence
    }
  }

  // Stop current soundscape
  async stopSoundscape(): Promise<void> {
    try {
      if (this.soundscapeAudio) {
        await this.soundscapeAudio.stopAsync();
        await this.soundscapeAudio.unloadAsync();
        this.soundscapeAudio = null;
      }
    } catch (error) {
      console.error('Failed to stop soundscape:', error);
    }
  }

  // Analyze dream patterns
  async analyzeDreams(): Promise<DreamAnalysis> {
    try {
      const dreams = await this.getDreamEntries();
      
      if (dreams.length === 0) {
        return {
          commonThemes: [],
          emotionalPatterns: [],
          sleepQualityTrend: 'stable',
          averageLucidity: 0,
          averageVividity: 0,
          dreamFrequency: 0,
          recommendations: ['Start recording your dreams to see personalized insights!'],
        };
      }

      // Analyze common themes
      const allTags = dreams.flatMap(dream => dream.tags);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const commonThemes = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

      // Analyze emotional patterns
      const allEmotions = dreams.flatMap(dream => dream.emotions);
      const emotionCounts = allEmotions.reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const emotionalPatterns = Object.entries(emotionCounts)
        .map(([emotion, frequency]) => ({ emotion, frequency }))
        .sort((a, b) => b.frequency - a.frequency);

      // Calculate averages
      const averageLucidity = dreams.reduce((sum, dream) => sum + dream.lucidity, 0) / dreams.length;
      const averageVividity = dreams.reduce((sum, dream) => sum + dream.vividity, 0) / dreams.length;
      const averageSleepQuality = dreams.reduce((sum, dream) => sum + dream.sleepQuality, 0) / dreams.length;

      // Determine sleep quality trend
      const recentDreams = dreams.slice(0, 10);
      const olderDreams = dreams.slice(10, 20);
      
      let sleepQualityTrend: 'improving' | 'stable' | 'declining' = 'stable';
      if (recentDreams.length > 0 && olderDreams.length > 0) {
        const recentAvg = recentDreams.reduce((sum, d) => sum + d.sleepQuality, 0) / recentDreams.length;
        const olderAvg = olderDreams.reduce((sum, d) => sum + d.sleepQuality, 0) / olderDreams.length;
        
        if (recentAvg > olderAvg + 5) sleepQualityTrend = 'improving';
        else if (recentAvg < olderAvg - 5) sleepQualityTrend = 'declining';
      }

      // Calculate dream frequency (dreams per week)
      const oldestDream = dreams[dreams.length - 1];
      const timeSpanWeeks = (Date.now() - oldestDream.date) / (7 * 24 * 60 * 60 * 1000);
      const dreamFrequency = dreams.length / Math.max(timeSpanWeeks, 1);

      // Generate recommendations
      const recommendations = this.generateDreamRecommendations({
        commonThemes,
        emotionalPatterns,
        sleepQualityTrend,
        averageLucidity,
        averageVividity,
        dreamFrequency,
        recommendations: [],
      });

      return {
        commonThemes,
        emotionalPatterns,
        sleepQualityTrend,
        averageLucidity,
        averageVividity,
        dreamFrequency,
        recommendations,
      };
    } catch (error) {
      console.error('Failed to analyze dreams:', error);
      throw error;
    }
  }

  // Generate personalized dream recommendations
  private generateDreamRecommendations(analysis: DreamAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.dreamFrequency < 1) {
      recommendations.push('Try keeping a dream journal by your bed to improve dream recall');
      recommendations.push('Practice dream affirmations before sleep: "I will remember my dreams"');
    }

    if (analysis.averageLucidity < 30) {
      recommendations.push('Practice reality checks during the day to increase lucid dreaming');
      recommendations.push('Try the "wake-back-to-bed" technique for lucid dreams');
    }

    if (analysis.sleepQualityTrend === 'declining') {
      recommendations.push('Consider improving your sleep hygiene for better dream quality');
      recommendations.push('Reduce screen time before bed to enhance sleep quality');
    }

    if (analysis.emotionalPatterns.some(p => p.emotion.toLowerCase().includes('stress'))) {
      recommendations.push('Practice relaxation techniques before bed to reduce stress dreams');
      recommendations.push('Try meditation or mindfulness to process daily emotions');
    }

    if (analysis.averageVividity > 80) {
      recommendations.push('Your vivid dreams suggest strong REM sleep - keep it up!');
    } else if (analysis.averageVividity < 40) {
      recommendations.push('Try B6 supplements (consult your doctor) to enhance dream vividness');
      recommendations.push('Ensure you get enough uninterrupted sleep for better dream recall');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your dream patterns look healthy! Keep maintaining good sleep habits');
      recommendations.push('Consider exploring lucid dreaming techniques for enhanced dream experiences');
    }

    return recommendations;
  }

  // Search dreams by keywords
  async searchDreams(query: string): Promise<DreamEntry[]> {
    try {
      const dreams = await this.getDreamEntries();
      const lowercaseQuery = query.toLowerCase();
      
      return dreams.filter(dream => 
        dream.title.toLowerCase().includes(lowercaseQuery) ||
        dream.description.toLowerCase().includes(lowercaseQuery) ||
        dream.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        dream.emotions.some(emotion => emotion.toLowerCase().includes(lowercaseQuery)) ||
        dream.characters.some(character => character.toLowerCase().includes(lowercaseQuery)) ||
        dream.locations.some(location => location.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Failed to search dreams:', error);
      return [];
    }
  }
}

export const dreamService = DreamService.getInstance();
