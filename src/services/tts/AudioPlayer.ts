import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

/**
 * 🎵 Audio Player Service
 * 
 * Tính năng:
 * - Play audio từ base64 content
 * - Quản lý audio state (playing, paused, stopped)
 * - Progress tracking
 * - Volume control
 * - Multiple audio instances
 */

export interface AudioState {
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  duration: number;
  position: number;
  volume: number;
}

export interface PlaybackOptions {
  volume?: number; // 0.0 - 1.0
  rate?: number; // 0.5 - 2.0
  shouldLoop?: boolean;
  progressUpdateInterval?: number; // milliseconds
}

class AudioPlayerService {
  private audioInstances = new Map<string, Audio.Sound>();
  private audioStates = new Map<string, AudioState>();
  private progressCallbacks = new Map<string, (state: AudioState) => void>();

  constructor() {
    // Configure audio session
    this.configureAudioSession();
  }

  /**
   * 🔧 Configure audio session for optimal playback
   */
  private async configureAudioSession(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      console.log('✅ Audio session configured successfully');
    } catch (error) {
      console.warn('⚠️ Failed to configure audio session:', error);
    }
  }

  /**
   * 🎯 Load và play audio từ base64 content
   */
  async playFromBase64(
    audioId: string,
    base64Content: string,
    options: PlaybackOptions = {}
  ): Promise<void> {
    try {
      // Stop existing audio nếu có
      await this.stop(audioId);

      // Convert base64 to temporary file
      const audioUri = await this.base64ToTempFile(base64Content, audioId);

      // Create new audio instance
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        {
          shouldPlay: true,
          volume: options.volume || 1.0,
          rate: options.rate || 1.0,
          shouldLoop: options.shouldLoop || false,
          progressUpdateIntervalMillis: options.progressUpdateInterval || 100,
        }
      );

      // Store audio instance
      this.audioInstances.set(audioId, sound);

      // Initialize audio state
      const initialState: AudioState = {
        isLoaded: true,
        isPlaying: true,
        isPaused: false,
        duration: 0,
        position: 0,
        volume: options.volume || 1.0,
      };
      this.audioStates.set(audioId, initialState);

      // Setup status update listener
      sound.setOnPlaybackStatusUpdate((status) => {
        this.handlePlaybackStatusUpdate(audioId, status);
      });

      console.log(`🎵 Playing audio: ${audioId}`);
    } catch (error) {
      console.error(`❌ Failed to play audio ${audioId}:`, error);
      throw error;
    }
  }

  /**
   * 🎯 Play audio từ URL
   */
  async playFromUrl(
    audioId: string,
    url: string,
    options: PlaybackOptions = {}
  ): Promise<void> {
    try {
      await this.stop(audioId);

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        {
          shouldPlay: true,
          volume: options.volume || 1.0,
          rate: options.rate || 1.0,
          shouldLoop: options.shouldLoop || false,
          progressUpdateIntervalMillis: options.progressUpdateInterval || 100,
        }
      );

      this.audioInstances.set(audioId, sound);

      const initialState: AudioState = {
        isLoaded: true,
        isPlaying: true,
        isPaused: false,
        duration: 0,
        position: 0,
        volume: options.volume || 1.0,
      };
      this.audioStates.set(audioId, initialState);

      sound.setOnPlaybackStatusUpdate((status) => {
        this.handlePlaybackStatusUpdate(audioId, status);
      });

      console.log(`🎵 Playing audio from URL: ${audioId}`);
    } catch (error) {
      console.error(`❌ Failed to play audio from URL ${audioId}:`, error);
      throw error;
    }
  }

  /**
   * ⏸️ Pause audio
   */
  async pause(audioId: string): Promise<void> {
    const sound = this.audioInstances.get(audioId);
    if (sound) {
      try {
        await sound.pauseAsync();
        
        const state = this.audioStates.get(audioId);
        if (state) {
          state.isPlaying = false;
          state.isPaused = true;
          this.audioStates.set(audioId, state);
          this.notifyProgressCallback(audioId, state);
        }

        console.log(`⏸️ Paused audio: ${audioId}`);
      } catch (error) {
        console.error(`❌ Failed to pause audio ${audioId}:`, error);
      }
    }
  }

  /**
   * ▶️ Resume audio
   */
  async resume(audioId: string): Promise<void> {
    const sound = this.audioInstances.get(audioId);
    if (sound) {
      try {
        await sound.playAsync();
        
        const state = this.audioStates.get(audioId);
        if (state) {
          state.isPlaying = true;
          state.isPaused = false;
          this.audioStates.set(audioId, state);
          this.notifyProgressCallback(audioId, state);
        }

        console.log(`▶️ Resumed audio: ${audioId}`);
      } catch (error) {
        console.error(`❌ Failed to resume audio ${audioId}:`, error);
      }
    }
  }

  /**
   * ⏹️ Stop audio
   */
  async stop(audioId: string): Promise<void> {
    const sound = this.audioInstances.get(audioId);
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        
        this.audioInstances.delete(audioId);
        this.audioStates.delete(audioId);
        this.progressCallbacks.delete(audioId);

        // Cleanup temporary file
        await this.cleanupTempFile(audioId);

        console.log(`⏹️ Stopped audio: ${audioId}`);
      } catch (error) {
        console.error(`❌ Failed to stop audio ${audioId}:`, error);
      }
    }
  }

  /**
   * 🔊 Set volume
   */
  async setVolume(audioId: string, volume: number): Promise<void> {
    const sound = this.audioInstances.get(audioId);
    if (sound) {
      try {
        await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
        
        const state = this.audioStates.get(audioId);
        if (state) {
          state.volume = volume;
          this.audioStates.set(audioId, state);
          this.notifyProgressCallback(audioId, state);
        }
      } catch (error) {
        console.error(`❌ Failed to set volume for ${audioId}:`, error);
      }
    }
  }

  /**
   * ⚡ Set playback rate
   */
  async setRate(audioId: string, rate: number): Promise<void> {
    const sound = this.audioInstances.get(audioId);
    if (sound) {
      try {
        await sound.setRateAsync(Math.max(0.5, Math.min(2.0, rate)), true);
        console.log(`⚡ Set rate ${rate} for audio: ${audioId}`);
      } catch (error) {
        console.error(`❌ Failed to set rate for ${audioId}:`, error);
      }
    }
  }

  /**
   * 📍 Seek to position
   */
  async seekTo(audioId: string, positionMillis: number): Promise<void> {
    const sound = this.audioInstances.get(audioId);
    if (sound) {
      try {
        await sound.setPositionAsync(positionMillis);
        console.log(`📍 Seeked to ${positionMillis}ms for audio: ${audioId}`);
      } catch (error) {
        console.error(`❌ Failed to seek audio ${audioId}:`, error);
      }
    }
  }

  /**
   * 📊 Get audio state
   */
  getAudioState(audioId: string): AudioState | null {
    return this.audioStates.get(audioId) || null;
  }

  /**
   * 📈 Set progress callback
   */
  setProgressCallback(audioId: string, callback: (state: AudioState) => void): void {
    this.progressCallbacks.set(audioId, callback);
  }

  /**
   * 🗑️ Stop all audio instances
   */
  async stopAll(): Promise<void> {
    const audioIds = Array.from(this.audioInstances.keys());
    
    for (const audioId of audioIds) {
      await this.stop(audioId);
    }

    console.log(`🗑️ Stopped all ${audioIds.length} audio instances`);
  }

  /**
   * 📄 Convert base64 to temporary file
   */
  private async base64ToTempFile(base64Content: string, audioId: string): Promise<string> {
    try {
      const filename = `tts_audio_${audioId}_${Date.now()}.mp3`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, base64Content, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`📄 Created temp audio file: ${filename}`);
      return fileUri;
    } catch (error) {
      console.error('❌ Failed to create temp audio file:', error);
      throw error;
    }
  }

  /**
   * 🧹 Cleanup temporary file
   */
  private async cleanupTempFile(audioId: string): Promise<void> {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) return;

      const files = await FileSystem.readDirectoryAsync(cacheDir);
      const audioFiles = files.filter(file => 
        file.includes(`tts_audio_${audioId}`) && file.endsWith('.mp3')
      );

      for (const file of audioFiles) {
        const fileUri = `${cacheDir}${file}`;
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        console.log(`🧹 Cleaned up temp file: ${file}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup temp files:', error);
    }
  }

  /**
   * 📊 Handle playback status updates
   */
  private handlePlaybackStatusUpdate(audioId: string, status: any): void {
    if (!status.isLoaded) return;

    const currentState = this.audioStates.get(audioId);
    if (!currentState) return;

    const updatedState: AudioState = {
      ...currentState,
      isPlaying: status.isPlaying || false,
      isPaused: !status.isPlaying && status.positionMillis > 0,
      duration: status.durationMillis || 0,
      position: status.positionMillis || 0,
    };

    this.audioStates.set(audioId, updatedState);
    this.notifyProgressCallback(audioId, updatedState);

    // Auto cleanup when finished
    if (status.didJustFinish) {
      setTimeout(() => this.stop(audioId), 100);
    }
  }

  /**
   * 📢 Notify progress callback
   */
  private notifyProgressCallback(audioId: string, state: AudioState): void {
    const callback = this.progressCallbacks.get(audioId);
    if (callback) {
      callback(state);
    }
  }

  /**
   * 📊 Get service status
   */
  getStatus(): { activeAudioCount: number; totalCacheSize: number } {
    return {
      activeAudioCount: this.audioInstances.size,
      totalCacheSize: this.audioStates.size,
    };
  }
}

// Export singleton instance
export const audioPlayerService = new AudioPlayerService();
export default AudioPlayerService; 