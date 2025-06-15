import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  level: string;
  experiencePoints: number;
  dailyStreak: number;
  totalLessonsCompleted: number;
  achievements: string[];
  currentCourse?: string;
  lastLessonId?: string;
}

interface UserState {
  profile: UserProfile | null;
  dailyGoal: number;
  dailyProgress: number;
  weeklyStats: number[];
}

const initialState: UserState = {
  profile: {
    id: '1',
    username: '学习者',
    email: 'learner@example.com',
    level: 'HSK1',
    experiencePoints: 1250,
    dailyStreak: 7,
    totalLessonsCompleted: 23,
    achievements: ['first_lesson', 'daily_streak_7', 'vocabulary_master'],
    currentCourse: 'HSK1',
    lastLessonId: 'hsk1-lesson-3',
  },
  dailyGoal: 30, // minutes
  dailyProgress: 15, // minutes completed today
  weeklyStats: [25, 30, 20, 35, 40, 15, 30], // minutes per day for the week
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    addExperiencePoints: (state, action: PayloadAction<number>) => {
      if (state.profile) {
        state.profile.experiencePoints += action.payload;
      }
    },
    incrementDailyStreak: (state) => {
      if (state.profile) {
        state.profile.dailyStreak += 1;
      }
    },
    updateDailyProgress: (state, action: PayloadAction<number>) => {
      state.dailyProgress = Math.min(state.dailyProgress + action.payload, state.dailyGoal);
    },
    completeLesson: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.totalLessonsCompleted += 1;
        state.profile.lastLessonId = action.payload;
      }
    },
    unlockAchievement: (state, action: PayloadAction<string>) => {
      if (state.profile && !state.profile.achievements.includes(action.payload)) {
        state.profile.achievements.push(action.payload);
      }
    },
  },
});

export const {
  updateProfile,
  addExperiencePoints,
  incrementDailyStreak,
  updateDailyProgress,
  completeLesson,
  unlockAchievement,
} = userSlice.actions;
export default userSlice.reducer;