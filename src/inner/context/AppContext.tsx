import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

// === Types & Interfaces ===

interface Task {
  id: string;
  title: string;
  done: boolean;
}

interface Milestone {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  date: string;
}

interface Goal {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  targetDate?: string;
  createdAt: string;
  current: number;
  target: number;
  tasks: Task[];
  milestones: Milestone[];
}

interface User {
  name: string;
  avatar: string;
  streak: number;
  progress: number;
}

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  user: User;
  setUser: (user: User) => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  filter: 'week' | 'month' | 'all';
  setFilter: (filter: 'week' | 'month' | 'all') => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'current' | 'target' | 'tasks' | 'milestones'>) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  addTask: (goalId: string, taskTitle: string) => void;
  toggleTask: (goalId: string, taskId: string) => void;
  moveMilestone: (goalId: string, milestoneId: string, newStatus: 'todo' | 'in-progress' | 'done') => void;
}

// === Context Creation ===
const AppContext = createContext<AppContextType | undefined>(undefined);

// === Provider Component ===
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');
  const [user, setUser] = useState<User>({
    name: 'User',
    avatar: '👨',
    streak: 0,
    progress: 0,
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<'week' | 'month' | 'all'>('week');

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
    setupNotifications();
  }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const goalsData = await AsyncStorage.getItem('goals');
      const langData = await AsyncStorage.getItem('language');

      if (userData) setUser(JSON.parse(userData));
      if (goalsData) setGoals(JSON.parse(goalsData));
      if (langData) setLanguage(langData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('goals', JSON.stringify(goals));
      await AsyncStorage.setItem('language', language);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const setupNotifications = () => {
    PushNotification.configure({
      onNotification: (notification) => {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    PushNotification.createChannel(
      {
        channelId: 'goaleasy-channel',
        channelName: 'GoalEasy Notifications',
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  };

  const scheduleNotification = (title: string, message: string, date: Date) => {
    PushNotification.localNotificationSchedule({
      channelId: 'goaleasy-channel',
      title,
      message,
      date,
      playSound: true,
      soundName: 'default',
    });
  };

  const addGoal = (
    goal: Omit<Goal, 'id' | 'createdAt' | 'current' | 'target' | 'tasks' | 'milestones'>
  ) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      current: 0,
      target: 10000,
      tasks: [
        { id: '1', title: 'Start working on goal', done: false },
        { id: '2', title: 'Make first progress', done: false },
      ],
      milestones: generateMilestones(goal),
    };

    setGoals((prev) => [...prev, newGoal]);

    // Schedule morning reminder for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0);
    scheduleNotification('Good Morning! 🌅', `Time to work on: ${goal.title}`, tomorrow);
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, ...updates } : g))
    );
  };

  const deleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const addTask = (goalId: string, taskTitle: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          return {
            ...goal,
            tasks: [
              ...goal.tasks,
              {
                id: Date.now().toString(),
                title: taskTitle,
                done: false,
              },
            ],
          };
        }
        return goal;
      })
    );
  };

  const toggleTask = (goalId: string, taskId: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const wasDoneCount = goal.tasks.filter((t) => t.done).length;

          const updatedTasks = goal.tasks.map((task) =>
            task.id === taskId ? { ...task, done: !task.done } : task
          );

          const nowDoneCount = updatedTasks.filter((t) => t.done).length;

          // Increase streak only when a task is newly completed
          if (nowDoneCount > wasDoneCount) {
            setUser((prev) => ({ ...prev, streak: prev.streak + 1 }));
          }

          return { ...goal, tasks: updatedTasks };
        }
        return goal;
      })
    );
  };

  const moveMilestone = (
    goalId: string,
    milestoneId: string,
    newStatus: 'todo' | 'in-progress' | 'done'
  ) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          return {
            ...goal,
            milestones: goal.milestones.map((m) =>
              m.id === milestoneId ? { ...m, status: newStatus } : m
            ),
          };
        }
        return goal;
      })
    );

    if (newStatus === 'done') {
      PushNotification.localNotification({
        channelId: 'goaleasy-channel',
        title: 'Milestone Completed! 🎉',
        message: 'Keep up the great work!',
      });
    }
  };

  const generateMilestones = (
    goal: Omit<Goal, 'id' | 'createdAt' | 'current' | 'target' | 'tasks' | 'milestones'>
  ): Milestone[] => {
    const count =
      goal.size === 'small' ? 3 : goal.size === 'medium' ? 5 : 8;
    const milestones: Milestone[] = [];
    const startDate = new Date();
    const endDate = goal.targetDate
      ? new Date(goal.targetDate)
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const interval = Math.floor(daysDiff / count);

    for (let i = 0; i < count; i++) {
      const milestoneDate = new Date(startDate);
      milestoneDate.setDate(startDate.getDate() + interval * (i + 1));
      milestones.push({
        id: (Date.now() + i).toString(),
        title: `Milestone ${i + 1}: ${goal.title}`,
        status: 'todo',
        date: milestoneDate.toISOString(),
      });
    }

    return milestones;
  };

  // Auto-save whenever user, goals, or language changes
  useEffect(() => {
    saveData();
  }, [user, goals, language]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        user,
        setUser,
        goals,
        setGoals,
        filter,
        setFilter,
        addGoal,
        updateGoal,
        deleteGoal,
        addTask,
        toggleTask,
        moveMilestone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// === Custom Hook ===
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};