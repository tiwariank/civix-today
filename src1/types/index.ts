
export interface User {
  name: string;
  avatar: string;
  streak: number;
  progress: number;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  date: string;
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  size: 'small' | 'medium' | 'big';
  current: number;
  target: number;
  createdAt: string;
  tasks: Task[];
  milestones: Milestone[];
}

export type FilterType = 'today' | 'week' | 'month' | 'all';

export type Language = 'en' | 'hi';

export interface Translations {
  welcome: string;
  whatGoal: string;
  byWhen: string;
  breakSteps: string;
  start: string;
  skip: string;
  next: string;
  hi: string;
  today: string;
  thisWeek: string;
  thisMonth: string;
  allTime: string;
  daysRemaining: string;
  todayTasks: string;
  addTask: string;
  motivation: string;
  createGoal: string;
  goalTitle: string;
  targetDate: string;
  howBig: string;
  small: string;
  medium: string;
  big: string;
  breakIntoSteps: string;
  todo: string;
  doing: string;
  done: string;
  achievements: string;
  addNewGoal: string;
  editProfile: string;
  toGoal: string;
  streak: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  complete: string;
  startNow: string;
  backToDashboard: string;
  goalProgress: string;
}

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User;
  setUser: (user: User) => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  addGoal: (goal: Partial<Goal>) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  addTask: (goalId: string, taskTitle: string) => void;
  toggleTask: (goalId: string, taskId: string) => void;
  moveMilestone: (goalId: string, milestoneId: string, newStatus: Milestone['status']) => void;
}
