import { ViewStyle, TextStyle } from 'react-native';

/**
 * Audio player variant types
 */
export type AudioPlayerVariant =
  | 'minimal'      // Simple play/pause button
  | 'compact'      // Play/pause + progress
  | 'standard'     // Full controls + waveform
  | 'pronunciation' // Chinese pronunciation focused
  | 'lesson'       // Lesson audio with segments
  | 'recording';   // Voice recording interface

/**
 * Audio player size configurations
 */
export type AudioPlayerSize =
  | 'xs'          // Extra small: 32px height
  | 'sm'          // Small: 48px height
  | 'md'          // Medium: 64px height
  | 'lg'          // Large: 80px height
  | 'xl';         // Extra large: 96px height

/**
 * Audio playback speed options
 */
export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

/**
 * Audio player theme variants
 */
export type AudioPlayerTheme =
  | 'default'     // Standard theme
  | 'pronunciation' // Chinese pronunciation theme
  | 'lesson'      // Lesson-focused theme
  | 'tone'        // Chinese tone-based theme
  | 'dark'        // Dark theme
  | 'minimal';    // Minimal theme

/**
 * Audio waveform configuration
 */
export interface WaveformConfig {
  /** Enable waveform visualization */
  enabled?: boolean;
  /** Waveform height */
  height?: number;
  /** Number of waveform bars */
  barCount?: number;
  /** Bar width */
  barWidth?: number;
  /** Gap between bars */
  barGap?: number;
  /** Waveform color */
  color?: string;
  /** Progress color */
  progressColor?: string;
  /** Animate waveform */
  animated?: boolean;
  /** Show frequency visualization */
  showFrequency?: boolean;
}

/**
 * Chinese pronunciation features
 */
export interface PronunciationConfig {
  /** Show tone indicators */
  showTones?: boolean;
  /** Tone number (1-4, 0 for neutral) */
  tone?: number;
  /** Show pinyin text */
  showPinyin?: boolean;
  /** Pinyin text */
  pinyin?: string;
  /** Show Chinese character */
  showCharacter?: boolean;
  /** Chinese character */
  character?: string;
  /** HSK level indicator */
  hskLevel?: number;
  /** Pronunciation difficulty */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Show phonetic breakdown */
  showPhonetics?: boolean;
}

/**
 * Audio segment for lesson content
 */
export interface AudioSegment {
  /** Segment unique ID */
  id: string;
  /** Segment title */
  title?: string;
  /** Start time in seconds */
  startTime: number;
  /** End time in seconds */
  endTime: number;
  /** Segment text content */
  text?: string;
  /** Chinese character */
  character?: string;
  /** Pinyin */
  pinyin?: string;
  /** Vietnamese translation */
  vietnamese?: string;
  /** English translation */
  english?: string;
  /** Tone number */
  tone?: number;
  /** Is segment currently active */
  isActive?: boolean;
}

/**
 * Recording configuration
 */
export interface RecordingConfig {
  /** Enable recording functionality */
  enabled?: boolean;
  /** Maximum recording duration (seconds) */
  maxDuration?: number;
  /** Audio quality */
  quality?: 'low' | 'medium' | 'high';
  /** Auto-stop recording */
  autoStop?: boolean;
  /** Show recording waveform */
  showWaveform?: boolean;
  /** Recording format */
  format?: 'wav' | 'mp3' | 'm4a';
}

/**
 * Audio player state
 */
export interface AudioPlayerState {
  /** Is audio currently playing */
  isPlaying: boolean;
  /** Is audio paused */
  isPaused: boolean;
  /** Is audio loading */
  isLoading: boolean;
  /** Is recording active */
  isRecording: boolean;
  /** Current playback position (seconds) */
  currentTime: number;
  /** Total audio duration (seconds) */
  duration: number;
  /** Current playback speed */
  playbackSpeed: PlaybackSpeed;
  /** Volume level (0-1) */
  volume: number;
  /** Is audio muted */
  isMuted: boolean;
  /** Current audio segment (for lessons) */
  currentSegment?: AudioSegment;
  /** Audio buffer progress (0-1) */
  bufferProgress: number;
  /** Error state */
  error?: string;
}

/**
 * Audio control actions
 */
export interface AudioControls {
  /** Play audio */
  play: () => void;
  /** Pause audio */
  pause: () => void;
  /** Stop audio */
  stop: () => void;
  /** Seek to position */
  seekTo: (position: number) => void;
  /** Set playback speed */
  setSpeed: (speed: PlaybackSpeed) => void;
  /** Set volume */
  setVolume: (volume: number) => void;
  /** Toggle mute */
  toggleMute: () => void;
  /** Skip forward */
  skipForward: (seconds?: number) => void;
  /** Skip backward */
  skipBackward: (seconds?: number) => void;
  /** Start recording */
  startRecording: () => void;
  /** Stop recording */
  stopRecording: () => void;
  /** Play recorded audio */
  playRecording: () => void;
}

/**
 * Enhanced AudioPlayer component props
 */
export interface AudioPlayerProps {
  /**
   * Audio player variant
   * @default 'standard'
   */
  variant?: AudioPlayerVariant;

  /**
   * Audio player size
   * @default 'md'
   */
  size?: AudioPlayerSize;

  /**
   * Audio player theme
   * @default 'default'
   */
  theme?: AudioPlayerTheme;

  /**
   * Audio source URI
   */
  source?: string;

  /**
   * Audio title
   */
  title?: string;

  /**
   * Audio subtitle/description
   */
  subtitle?: string;

  /**
   * Auto-play audio when loaded
   * @default false
   */
  autoPlay?: boolean;

  /**
   * Loop audio playback
   * @default false
   */
  loop?: boolean;

  /**
   * Show play/pause button
   * @default true
   */
  showPlayButton?: boolean;

  /**
   * Show progress bar
   * @default true
   */
  showProgress?: boolean;

  /**
   * Show time display
   * @default true
   */
  showTime?: boolean;

  /**
   * Show speed control
   * @default false
   */
  showSpeedControl?: boolean;

  /**
   * Show volume control
   * @default false
   */
  showVolumeControl?: boolean;

  /**
   * Available playback speeds
   */
  availableSpeeds?: PlaybackSpeed[];

  /**
   * Waveform configuration
   */
  waveformConfig?: WaveformConfig;

  /**
   * Chinese pronunciation configuration
   */
  pronunciationConfig?: PronunciationConfig;

  /**
   * Audio segments for lessons
   */
  segments?: AudioSegment[];

  /**
   * Recording configuration
   */
  recordingConfig?: RecordingConfig;

  /**
   * Initial audio state
   */
  initialState?: Partial<AudioPlayerState>;

  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;

  /**
   * Custom control style
   */
  controlStyle?: ViewStyle;

  /**
   * Custom progress style
   */
  progressStyle?: ViewStyle;

  /**
   * Custom text style
   */
  textStyle?: TextStyle;

  /**
   * Audio load handler
   */
  onLoad?: (duration: number) => void;

  /**
   * Audio play handler
   */
  onPlay?: () => void;

  /**
   * Audio pause handler
   */
  onPause?: () => void;

  /**
   * Audio end handler
   */
  onEnd?: () => void;

  /**
   * Progress update handler
   */
  onProgress?: (currentTime: number, duration: number) => void;

  /**
   * Speed change handler
   */
  onSpeedChange?: (speed: PlaybackSpeed) => void;

  /**
   * Segment change handler (for lessons)
   */
  onSegmentChange?: (segment: AudioSegment) => void;

  /**
   * Recording start handler
   */
  onRecordingStart?: () => void;

  /**
   * Recording stop handler
   */
  onRecordingStop?: (recordingUri: string) => void;

  /**
   * Error handler
   */
  onError?: (error: string) => void;

  /**
   * Seek handler
   */
  onSeek?: (position: number) => void;
}

/**
 * Internal AudioPlayer styles interface
 */
export interface AudioPlayerStyles {
  container: ViewStyle;
  header: ViewStyle;
  titleContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  toneIndicator: ViewStyle;
  hskBadge: ViewStyle;
  hskBadgeText: TextStyle;
  controlsContainer: ViewStyle;
  primaryControls: ViewStyle;
  secondaryControls: ViewStyle;
  playButton: ViewStyle;
  playButtonIcon: TextStyle;
  controlButton: ViewStyle;
  controlButtonIcon: TextStyle;
  speedButton: ViewStyle;
  speedButtonText: TextStyle;
  progressContainer: ViewStyle;
  progressBar: ViewStyle;
  progressFill: ViewStyle;
  progressHandle: ViewStyle;
  timeContainer: ViewStyle;
  timeText: TextStyle;
  waveformContainer: ViewStyle;
  waveformBar: ViewStyle;
  segmentsContainer: ViewStyle;
  segmentItem: ViewStyle;
  segmentText: TextStyle;
  segmentTime: TextStyle;
  recordingContainer: ViewStyle;
  recordingButton: ViewStyle;
  recordingIndicator: ViewStyle;
  recordingTime: TextStyle;
  pronunciationContainer: ViewStyle;
  chineseCharacter: TextStyle;
  pinyinText: TextStyle;
  translationText: TextStyle;
  volumeContainer: ViewStyle;
  volumeSlider: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  loadingContainer: ViewStyle;
}

/**
 * Audio player analytics data
 */
export interface AudioPlayerAnalytics {
  /** Audio source */
  source: string;
  /** Play duration */
  playDuration: number;
  /** Total audio duration */
  totalDuration: number;
  /** Completion percentage */
  completionRate: number;
  /** Number of replays */
  replayCount: number;
  /** Speeds used */
  speedsUsed: PlaybackSpeed[];
  /** Segments played (for lessons) */
  segmentsPlayed: string[];
  /** Recording attempts */
  recordingAttempts: number;
  /** Session timestamp */
  timestamp: Date;
} 