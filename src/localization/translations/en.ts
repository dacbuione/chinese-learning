// 🇺🇸 English translations (Secondary language)
export const en = {
  // 🏠 Common & Navigation
  common: {
    // Basic actions
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    continue: 'Continue',
    retry: 'Retry',
    start: 'Start',
    finish: 'Finish',
    next: 'Next',
    previous: 'Previous',
    skip: 'Skip',
    done: 'Done',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    open: 'Open',
    delete: 'Delete',
    edit: 'Edit',
    share: 'Share',
    copy: 'Copy',
    
    // Time & dates
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    
    // Status
    online: 'Online',
    offline: 'Offline',
    syncing: 'Syncing',
    synced: 'Synced',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
  },

  // 🏠 Home Screen
  home: {
    welcome: 'Welcome to Chinese Learning!',
    welcomeBack: 'Welcome back, {{name}}!',
    dailyGoal: 'Daily Goal',
    dailyGoalProgress: '{{current}}/{{target}} lessons',
    streak: '{{count}} day streak',
    streakToday: 'Complete today to maintain your streak!',
    continueLesson: 'Continue Lesson',
    startLearning: 'Start Learning',
    quickPractice: 'Quick Practice',
    todayProgress: "Today's Progress",
    weeklyProgress: 'Weekly Progress',
    monthlyProgress: 'Monthly Progress',
    
    // Statistics
    stats: {
      totalWords: 'Total Words Learned',
      wordsToday: 'Words Today',
      minutesToday: 'Minutes Today',
      accuracy: 'Accuracy',
      level: 'Current Level',
      xp: 'Experience Points',
    },
    
    // Quick actions
    quickActions: {
      vocabulary: 'Vocabulary',
      pronunciation: 'Pronunciation',
      writing: 'Writing',
      listening: 'Listening',
      review: 'Review',
    },
  },

  // 🧭 Navigation
  navigation: {
    home: 'Home',
    lessons: 'Lessons',
    practice: 'Practice',
    progress: 'Progress',
    profile: 'Profile',
    settings: 'Settings',
    back: 'Back',
    menu: 'Menu',
    search: 'Search',
  },

  // 📚 Lessons & Learning
  lessons: {
    // Lesson types
    vocabulary: 'Vocabulary',
    grammar: 'Grammar',
    pronunciation: 'Pronunciation',
    writing: 'Writing',
    listening: 'Listening',
    reading: 'Reading',
    conversation: 'Conversation',
    culture: 'Culture',
    
    // Lesson status
    locked: 'Locked',
    available: 'Available',
    inProgress: 'In Progress',
    completed: 'Completed',
    mastered: 'Mastered',
    
    // Actions
    startLesson: 'Start Lesson',
    continueLesson: 'Continue Lesson',
    reviewLesson: 'Review Lesson',
    retakeLesson: 'Retake Lesson',
    
    // Progress
    progress: 'Progress: {{percent}}%',
    timeSpent: 'Time: {{minutes}} minutes',
    wordsLearned: 'Learned {{count}} words',
    accuracy: 'Accuracy: {{percent}}%',
    
    // Lesson structure
    introduction: 'Introduction',
    practice: 'Practice',
    quiz: 'Quiz',
    review: 'Review',
    summary: 'Summary',
  },

  // 🔤 Chinese Language Specific
  chinese: {
    // Character types
    simplified: 'Simplified',
    traditional: 'Traditional',
    pinyin: 'Pinyin',
    character: 'Character',
    characters: 'Characters',
    
    // Tones
    tones: 'Tones',
    tone1: 'First Tone (一声)',
    tone2: 'Second Tone (二声)',
    tone3: 'Third Tone (三声)',
    tone4: 'Fourth Tone (四声)',
    neutral: 'Neutral Tone (轻声)',
    
    // Strokes
    stroke: 'Stroke',
    strokes: 'Strokes',
    strokeOrder: 'Stroke Order',
    strokeCount: '{{count}} strokes',
    
    // Components
    radical: 'Radical',
    radicals: 'Radicals',
    component: 'Component',
    components: 'Components',
    
    // Grammar
    measure: 'Measure Word',
    measures: 'Measure Words',
    particle: 'Particle',
    particles: 'Particles',
    
    // Levels
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    native: 'Native',
  },

  // 🎯 HSK Levels
  hsk: {
    level: 'HSK Level',
    hsk1: 'HSK 1 - Beginner',
    hsk2: 'HSK 2 - Elementary',
    hsk3: 'HSK 3 - Pre-Intermediate',
    hsk4: 'HSK 4 - Intermediate',
    hsk5: 'HSK 5 - Upper Intermediate',
    hsk6: 'HSK 6 - Advanced',
    
    descriptions: {
      hsk1: 'Can understand and use very basic Chinese words and phrases',
      hsk2: 'Can communicate simply about familiar topics',
      hsk3: 'Can handle basic communication in daily life',
      hsk4: 'Can discuss various topics fluently',
      hsk5: 'Can read newspapers, watch movies, and give presentations',
      hsk6: 'Can understand almost everything heard or read',
    },
    
    wordCount: {
      hsk1: '150 words',
      hsk2: '300 words',
      hsk3: '600 words',
      hsk4: '1200 words',
      hsk5: '2500 words',
      hsk6: '5000+ words',
    },
  },

  // 🔊 Audio & Pronunciation
  audio: {
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    replay: 'Replay',
    record: 'Record',
    stopRecording: 'Stop Recording',
    playRecording: 'Play Recording',
    deleteRecording: 'Delete Recording',
    
    // Speed controls
    slow: 'Slow',
    normal: 'Normal',
    fast: 'Fast',
    playbackSpeed: 'Playback Speed',
    
    // Quality
    loading: 'Loading audio...',
    error: 'Audio playback error',
    noAudio: 'No audio available',
    
    // Practice
    listenAndRepeat: 'Listen and Repeat',
    compareYourPronunciation: 'Compare Your Pronunciation',
    goodPronunciation: 'Good pronunciation!',
    needsImprovement: 'Needs improvement',
    tryAgain: 'Try again',
  },

  // ✍️ Writing Practice
  writing: {
    practice: 'Writing Practice',
    strokeOrder: 'Stroke Order',
    traceCharacter: 'Trace Character',
    writeCharacter: 'Write Character',
    clear: 'Clear',
    hint: 'Hint',
    showStrokes: 'Show Strokes',
    hideStrokes: 'Hide Strokes',
    
    // Feedback
    correct: 'Correct!',
    incorrect: 'Incorrect, try again',
    almostCorrect: 'Almost correct',
    goodJob: 'Good job!',
    perfect: 'Perfect!',
    
    // Instructions
    followStrokeOrder: 'Follow the correct stroke order',
    writeNeatly: 'Write neatly',
    takeYourTime: 'Take your time',
  },

  // 🎮 Practice & Quiz
  practice: {
    // Types
    flashcards: 'Flashcards',
    multipleChoice: 'Multiple Choice',
    fillInBlank: 'Fill in the Blank',
    matching: 'Matching',
    translation: 'Translation',
    listening: 'Listening',
    
    // Instructions
    selectCorrectAnswer: 'Select the correct answer',
    typeAnswer: 'Type your answer',
    speakAnswer: 'Speak your answer',
    tapToReveal: 'Tap to reveal',
    flipCard: 'Flip card',
    
    // Feedback
    correct: 'Correct!',
    incorrect: 'Incorrect!',
    tryAgain: 'Try again',
    showAnswer: 'Show answer',
    nextQuestion: 'Next question',
    
    // Results
    score: 'Score: {{score}}/{{total}}',
    accuracy: 'Accuracy: {{percent}}%',
    timeSpent: 'Time: {{time}}',
    questionsCorrect: '{{correct}}/{{total}} correct',
    
    // Motivation
    excellent: 'Excellent!',
    veryGood: 'Very good!',
    good: 'Good!',
    needsWork: 'Needs work',
    keepPracticing: 'Keep practicing!',
  },

  // 👤 Profile & Settings
  profile: {
    // User info
    profile: 'Profile',
    name: 'Name',
    email: 'Email',
    level: 'Level',
    joinDate: 'Join Date',
    
    // Statistics
    statistics: 'Statistics',
    daysStudied: 'Days Studied',
    totalWords: 'Total Words',
    totalTime: 'Total Time',
    averageAccuracy: 'Average Accuracy',
    currentStreak: 'Current Streak',
    longestStreak: 'Longest Streak',
    
    // Achievements
    achievements: 'Achievements',
    badges: 'Badges',
    certificates: 'Certificates',
    
    // Goals
    goals: 'Goals',
    dailyGoal: 'Daily Goal',
    weeklyGoal: 'Weekly Goal',
    monthlyGoal: 'Monthly Goal',
    
    // Preferences
    preferences: 'Preferences',
    language: 'Interface Language',
    theme: 'Theme',
    notifications: 'Notifications',
    sound: 'Sound',
    vibration: 'Vibration',
  },

  // ⚙️ Settings
  settings: {
    settings: 'Settings',
    
    // General
    general: 'General',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    
    // Learning
    learning: 'Learning',
    dailyReminder: 'Daily Reminder',
    studyTime: 'Study Time',
    difficulty: 'Difficulty',
    autoplay: 'Auto-play Audio',
    
    // Audio
    audio: 'Audio',
    soundEffects: 'Sound Effects',
    voiceSpeed: 'Voice Speed',
    volume: 'Volume',
    
    // Accessibility
    accessibility: 'Accessibility',
    fontSize: 'Font Size',
    highContrast: 'High Contrast',
    reduceMotion: 'Reduce Motion',
    
    // Privacy
    privacy: 'Privacy',
    dataCollection: 'Data Collection',
    analytics: 'Analytics',
    
    // Account
    account: 'Account',
    signOut: 'Sign Out',
    deleteAccount: 'Delete Account',
    
    // About
    about: 'About',
    version: 'Version',
    support: 'Support',
    feedback: 'Feedback',
    rateApp: 'Rate App',
    
    // Values
    themes: {
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
    },
    
    difficulties: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    },
    
    speeds: {
      slower: 'Slower',
      normal: 'Normal',
      faster: 'Faster',
    },
  },

  // 🎯 Gamification
  gamification: {
    // Points & Levels
    xp: 'XP',
    level: 'Level {{level}}',
    levelUp: 'Level Up!',
    pointsEarned: '+{{points}} points',
    
    // Achievements
    achievement: 'Achievement',
    achievementUnlocked: 'Achievement Unlocked!',
    badge: 'Badge',
    badgeEarned: 'Badge Earned!',
    
    // Streaks
    streak: 'Streak',
    streakContinued: 'Streak Continued!',
    streakBroken: 'Streak Broken',
    
    // Challenges
    challenge: 'Challenge',
    dailyChallenge: 'Daily Challenge',
    weeklyChallenge: 'Weekly Challenge',
    
    // Rewards
    reward: 'Reward',
    rewardEarned: 'Reward Earned!',
    collectReward: 'Collect Reward',
    
    // Leaderboard
    leaderboard: 'Leaderboard',
    rank: 'Rank {{rank}}',
    topLearners: 'Top Learners',
  },

  // 📊 Progress & Analytics
  progress: {
    progress: 'Progress',
    overview: 'Overview',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    
    // Metrics
    wordsLearned: 'Words Learned',
    lessonsCompleted: 'Lessons Completed',
    timeSpent: 'Time Spent',
    accuracy: 'Accuracy',
    consistency: 'Consistency',
    
    // Charts
    learningCurve: 'Learning Curve',
    activityHeatmap: 'Activity Heatmap',
    skillBreakdown: 'Skill Breakdown',
    
    // Insights
    insights: 'Insights',
    strongAreas: 'Strong Areas',
    improvementAreas: 'Areas for Improvement',
    recommendations: 'Recommendations',
  },

  // ⚠️ Errors & Validation
  errors: {
    // Network
    networkError: 'Network error',
    serverError: 'Server error',
    timeoutError: 'Connection timeout',
    
    // Authentication
    loginRequired: 'Please log in',
    sessionExpired: 'Session expired',
    accessDenied: 'Access denied',
    
    // Validation
    required: 'This field is required',
    invalidEmail: 'Invalid email',
    passwordTooShort: 'Password too short',
    passwordsNotMatch: 'Passwords do not match',
    
    // Content
    contentNotFound: 'Content not found',
    audioNotAvailable: 'Audio not available',
    loadingFailed: 'Loading failed',
    
    // Generic
    somethingWentWrong: 'Something went wrong',
    tryAgainLater: 'Please try again later',
    contactSupport: 'Contact support',
  },

  // 🎉 Celebrations & Motivations
  celebrations: {
    // Congratulations
    congratulations: 'Congratulations!',
    wellDone: 'Well done!',
    excellent: 'Excellent!',
    amazing: 'Amazing!',
    fantastic: 'Fantastic!',
    awesome: 'Awesome!',
    
    // Encouragement
    keepGoing: 'Keep going!',
    almostThere: 'Almost there!',
    dontGiveUp: "Don't give up!",
    youCanDoIt: 'You can do it!',
    stayStrong: 'Stay strong!',
    
    // Milestones
    firstLesson: 'First lesson completed!',
    firstWeek: 'First week completed!',
    firstMonth: 'First month completed!',
    hundredWords: 'First 100 words!',
    perfectScore: 'Perfect score!',
  },

  // 🎭 Chinese Culture
  culture: {
    culture: 'Chinese Culture',
    traditions: 'Traditions',
    festivals: 'Festivals',
    food: 'Food',
    history: 'History',
    philosophy: 'Philosophy',
    art: 'Art',
    literature: 'Literature',
    
    // Festivals
    chineseNewYear: 'Chinese New Year',
    midAutumnFestival: 'Mid-Autumn Festival',
    dragonBoatFestival: 'Dragon Boat Festival',
    lanternFestival: 'Lantern Festival',
    
    // Zodiac
    zodiac: 'Zodiac',
    zodiacAnimals: 'Twelve Zodiac Animals',
    
    // Tea culture
    teaCulture: 'Tea Culture',
    teaCeremony: 'Tea Ceremony',
    
    // Martial arts
    martialArts: 'Martial Arts',
    taichi: 'Tai Chi',
    kungfu: 'Kung Fu',
    
    // Calligraphy
    calligraphy: 'Calligraphy',
    brushPainting: 'Brush Painting',
  },
} as const;

export default en; 