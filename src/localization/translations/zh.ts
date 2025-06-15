// 🇨🇳 Chinese translations (Simplified Chinese)
export const zh = {
  // 🏠 Common & Navigation
  common: {
    // Basic actions
    loading: '加载中...',
    save: '保存',
    cancel: '取消',
    continue: '继续',
    retry: '重试',
    start: '开始',
    finish: '完成',
    next: '下一个',
    previous: '上一个',
    skip: '跳过',
    done: '完成',
    ok: '确定',
    yes: '是',
    no: '否',
    close: '关闭',
    open: '打开',
    delete: '删除',
    edit: '编辑',
    share: '分享',
    copy: '复制',
    
    // Time & dates
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    week: '周',
    month: '月',
    year: '年',
    
    // Status
    online: '在线',
    offline: '离线',
    syncing: '同步中',
    synced: '已同步',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
  },

  // 🏠 Home Screen
  home: {
    welcome: '欢迎学习中文！',
    welcomeBack: '欢迎回来，{{name}}！',
    dailyGoal: '每日目标',
    dailyGoalProgress: '{{current}}/{{target}} 课',
    streak: '连续 {{count}} 天',
    streakToday: '今天完成以保持连续记录！',
    continueLesson: '继续学习',
    startLearning: '开始学习',
    quickPractice: '快速练习',
    todayProgress: '今日进度',
    weeklyProgress: '本周进度',
    monthlyProgress: '本月进度',
    
    // Statistics
    stats: {
      totalWords: '总学习词汇',
      wordsToday: '今日词汇',
      minutesToday: '今日学习时间',
      accuracy: '准确率',
      level: '当前级别',
      xp: '经验值',
    },
    
    // Quick actions
    quickActions: {
      vocabulary: '词汇',
      pronunciation: '发音',
      writing: '写字',
      listening: '听力',
      review: '复习',
    },
  },

  // 🧭 Navigation
  navigation: {
    home: '首页',
    lessons: '课程',
    practice: '练习',
    progress: '进度',
    profile: '个人',
    settings: '设置',
    back: '返回',
    menu: '菜单',
    search: '搜索',
  },

  // 📚 Lessons & Learning
  lessons: {
    // Lesson types
    vocabulary: '词汇',
    grammar: '语法',
    pronunciation: '发音',
    writing: '写字',
    listening: '听力',
    reading: '阅读',
    conversation: '对话',
    culture: '文化',
    
    // Lesson status
    locked: '已锁定',
    available: '可学习',
    inProgress: '学习中',
    completed: '已完成',
    mastered: '已掌握',
    
    // Actions
    startLesson: '开始课程',
    continueLesson: '继续课程',
    reviewLesson: '复习课程',
    retakeLesson: '重新学习',
    
    // Progress
    progress: '进度：{{percent}}%',
    timeSpent: '时间：{{minutes}} 分钟',
    wordsLearned: '已学 {{count}} 个词',
    accuracy: '准确率：{{percent}}%',
    
    // Lesson structure
    introduction: '介绍',
    practice: '练习',
    quiz: '测验',
    review: '复习',
    summary: '总结',
  },

  // 🔤 Chinese Language Specific
  chinese: {
    // Character types
    simplified: '简体字',
    traditional: '繁体字',
    pinyin: '拼音',
    character: '汉字',
    characters: '汉字',
    
    // Tones
    tones: '声调',
    tone1: '第一声（阴平）',
    tone2: '第二声（阳平）',
    tone3: '第三声（上声）',
    tone4: '第四声（去声）',
    neutral: '轻声',
    
    // Strokes
    stroke: '笔画',
    strokes: '笔画',
    strokeOrder: '笔顺',
    strokeCount: '{{count}} 画',
    
    // Components
    radical: '部首',
    radicals: '部首',
    component: '组成部分',
    components: '组成部分',
    
    // Grammar
    measure: '量词',
    measures: '量词',
    particle: '助词',
    particles: '助词',
    
    // Levels
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
    native: '母语',
  },

  // 🎯 HSK Levels
  hsk: {
    level: 'HSK 等级',
    hsk1: 'HSK 1 - 初级',
    hsk2: 'HSK 2 - 基础',
    hsk3: 'HSK 3 - 中级',
    hsk4: 'HSK 4 - 中高级',
    hsk5: 'HSK 5 - 高级',
    hsk6: 'HSK 6 - 精通',
    
    descriptions: {
      hsk1: '能理解和使用非常基础的中文词汇和短语',
      hsk2: '能就熟悉的话题进行简单交流',
      hsk3: '能处理日常生活中的基本交流',
      hsk4: '能就各种话题进行流利讨论',
      hsk5: '能阅读报纸、观看电影并进行演讲',
      hsk6: '能理解几乎所有听到和读到的内容',
    },
    
    wordCount: {
      hsk1: '150 个词',
      hsk2: '300 个词',
      hsk3: '600 个词',
      hsk4: '1200 个词',
      hsk5: '2500 个词',
      hsk6: '5000+ 个词',
    },
  },

  // 🔊 Audio & Pronunciation
  audio: {
    play: '播放',
    pause: '暂停',
    stop: '停止',
    replay: '重播',
    record: '录音',
    stopRecording: '停止录音',
    playRecording: '播放录音',
    deleteRecording: '删除录音',
    
    // Speed controls
    slow: '慢速',
    normal: '正常',
    fast: '快速',
    playbackSpeed: '播放速度',
    
    // Quality
    loading: '正在加载音频...',
    error: '音频播放错误',
    noAudio: '无音频',
    
    // Practice
    listenAndRepeat: '听并重复',
    compareYourPronunciation: '比较你的发音',
    goodPronunciation: '发音很好！',
    needsImprovement: '需要改进',
    tryAgain: '再试一次',
  },

  // ✍️ Writing Practice
  writing: {
    practice: '写字练习',
    strokeOrder: '笔顺',
    traceCharacter: '描字',
    writeCharacter: '写字',
    clear: '清除',
    hint: '提示',
    showStrokes: '显示笔画',
    hideStrokes: '隐藏笔画',
    
    // Feedback
    correct: '正确！',
    incorrect: '不正确，再试一次',
    almostCorrect: '基本正确',
    goodJob: '做得好！',
    perfect: '完美！',
    
    // Instructions
    followStrokeOrder: '请按正确的笔顺书写',
    writeNeatly: '写得工整一些',
    takeYourTime: '慢慢来，不要急',
  },

  // 🎮 Practice & Quiz
  practice: {
    // Types
    flashcards: '单词卡',
    multipleChoice: '选择题',
    fillInBlank: '填空',
    matching: '配对',
    translation: '翻译',
    listening: '听力',
    
    // Instructions
    selectCorrectAnswer: '选择正确答案',
    typeAnswer: '输入答案',
    speakAnswer: '说出答案',
    tapToReveal: '点击查看',
    flipCard: '翻卡片',
    
    // Feedback
    correct: '正确！',
    incorrect: '错误！',
    tryAgain: '再试一次',
    showAnswer: '显示答案',
    nextQuestion: '下一题',
    
    // Results
    score: '得分：{{score}}/{{total}}',
    accuracy: '准确率：{{percent}}%',
    timeSpent: '用时：{{time}}',
    questionsCorrect: '{{correct}}/{{total}} 题正确',
    
    // Motivation
    excellent: '优秀！',
    veryGood: '很好！',
    good: '不错！',
    needsWork: '需要努力',
    keepPracticing: '继续练习！',
  },

  // 👤 Profile & Settings
  profile: {
    // User info
    profile: '个人资料',
    name: '姓名',
    email: '邮箱',
    level: '等级',
    joinDate: '加入日期',
    
    // Statistics
    statistics: '统计',
    daysStudied: '学习天数',
    totalWords: '总词汇量',
    totalTime: '总时间',
    averageAccuracy: '平均准确率',
    currentStreak: '当前连续',
    longestStreak: '最长连续',
    
    // Achievements
    achievements: '成就',
    badges: '徽章',
    certificates: '证书',
    
    // Goals
    goals: '目标',
    dailyGoal: '每日目标',
    weeklyGoal: '每周目标',
    monthlyGoal: '每月目标',
    
    // Preferences
    preferences: '偏好设置',
    language: '界面语言',
    theme: '主题',
    notifications: '通知',
    sound: '声音',
    vibration: '震动',
  },

  // ⚙️ Settings
  settings: {
    settings: '设置',
    
    // General
    general: '通用',
    language: '语言',
    theme: '主题',
    notifications: '通知',
    
    // Learning
    learning: '学习',
    dailyReminder: '每日提醒',
    studyTime: '学习时间',
    difficulty: '难度',
    autoplay: '自动播放音频',
    
    // Audio
    audio: '音频',
    soundEffects: '音效',
    voiceSpeed: '语音速度',
    volume: '音量',
    
    // Accessibility
    accessibility: '辅助功能',
    fontSize: '字体大小',
    highContrast: '高对比度',
    reduceMotion: '减少动画',
    
    // Privacy
    privacy: '隐私',
    dataCollection: '数据收集',
    analytics: '分析',
    
    // Account
    account: '账户',
    signOut: '退出登录',
    deleteAccount: '删除账户',
    
    // About
    about: '关于',
    version: '版本',
    support: '支持',
    feedback: '反馈',
    rateApp: '评价应用',
    
    // Values
    themes: {
      light: '浅色',
      dark: '深色',
      auto: '自动',
    },
    
    difficulties: {
      easy: '简单',
      medium: '中等',
      hard: '困难',
    },
    
    speeds: {
      slower: '慢速',
      normal: '正常',
      faster: '快速',
    },
  },

  // 🎯 Gamification
  gamification: {
    // Points & Levels
    xp: '经验值',
    level: '{{level}} 级',
    levelUp: '升级！',
    pointsEarned: '+{{points}} 分',
    
    // Achievements
    achievement: '成就',
    achievementUnlocked: '成就解锁！',
    badge: '徽章',
    badgeEarned: '获得徽章！',
    
    // Streaks
    streak: '连续',
    streakContinued: '连续保持！',
    streakBroken: '连续中断',
    
    // Challenges
    challenge: '挑战',
    dailyChallenge: '每日挑战',
    weeklyChallenge: '每周挑战',
    
    // Rewards
    reward: '奖励',
    rewardEarned: '获得奖励！',
    collectReward: '收集奖励',
    
    // Leaderboard
    leaderboard: '排行榜',
    rank: '第 {{rank}} 名',
    topLearners: '优秀学习者',
  },

  // 📊 Progress & Analytics
  progress: {
    progress: '进度',
    overview: '概览',
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    
    // Metrics
    wordsLearned: '已学词汇',
    lessonsCompleted: '完成课程',
    timeSpent: '学习时间',
    accuracy: '准确率',
    consistency: '坚持性',
    
    // Charts
    learningCurve: '学习曲线',
    activityHeatmap: '活动热图',
    skillBreakdown: '技能分析',
    
    // Insights
    insights: '洞察',
    strongAreas: '强项',
    improvementAreas: '需要改进的地方',
    recommendations: '建议',
  },

  // ⚠️ Errors & Validation
  errors: {
    // Network
    networkError: '网络错误',
    serverError: '服务器错误',
    timeoutError: '连接超时',
    
    // Authentication
    loginRequired: '请登录',
    sessionExpired: '会话已过期',
    accessDenied: '访问被拒绝',
    
    // Validation
    required: '此字段为必填项',
    invalidEmail: '邮箱格式不正确',
    passwordTooShort: '密码太短',
    passwordsNotMatch: '密码不匹配',
    
    // Content
    contentNotFound: '内容未找到',
    audioNotAvailable: '音频不可用',
    loadingFailed: '加载失败',
    
    // Generic
    somethingWentWrong: '出了点问题',
    tryAgainLater: '请稍后再试',
    contactSupport: '联系客服',
  },

  // 🎉 Celebrations & Motivations
  celebrations: {
    // Congratulations
    congratulations: '恭喜！',
    wellDone: '做得好！',
    excellent: '优秀！',
    amazing: '太棒了！',
    fantastic: '太好了！',
    awesome: '很棒！',
    
    // Encouragement
    keepGoing: '继续加油！',
    almostThere: '快到了！',
    dontGiveUp: '不要放弃！',
    youCanDoIt: '你可以的！',
    stayStrong: '坚持住！',
    
    // Milestones
    firstLesson: '完成第一课！',
    firstWeek: '完成第一周！',
    firstMonth: '完成第一个月！',
    hundredWords: '学会前100个词！',
    perfectScore: '满分！',
  },

  // 🎭 Chinese Culture
  culture: {
    culture: '中华文化',
    traditions: '传统',
    festivals: '节日',
    food: '美食',
    history: '历史',
    philosophy: '哲学',
    art: '艺术',
    literature: '文学',
    
    // Festivals
    chineseNewYear: '春节',
    midAutumnFestival: '中秋节',
    dragonBoatFestival: '端午节',
    lanternFestival: '元宵节',
    
    // Zodiac
    zodiac: '生肖',
    zodiacAnimals: '十二生肖',
    
    // Tea culture
    teaCulture: '茶文化',
    teaCeremony: '茶道',
    
    // Martial arts
    martialArts: '武术',
    taichi: '太极',
    kungfu: '功夫',
    
    // Calligraphy
    calligraphy: '书法',
    brushPainting: '国画',
  },
} as const;

export default zh; 