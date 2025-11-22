import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import PushNotification from 'react-native-push-notification';
import { AppContextType, User, Goal, FilterType, Language, Milestone } from '../types';
// import notifee from '@notifee/react-native';
import notifee, { TimestampTrigger, TriggerType, AndroidImportance } from '@notifee/react-native';


const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User>({
    name: 'User',
    avatar: '👨',
    streak: 0,
    progress: 0
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<FilterType>('week');

  useEffect(() => {
    loadData();
    setupNotifications();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const goalsData = await AsyncStorage.getItem('goals');
      const langData = await AsyncStorage.getItem('language');
      
      if (userData) setUser(JSON.parse(userData));
      if (goalsData) setGoals(JSON.parse(goalsData));
      if (langData) setLanguage(langData as Language);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('goals', JSON.stringify(goals));
      await AsyncStorage.setItem('language', language);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  async function setupNotifications() {
    // 1. Request Permission (Required for iOS and Android 13+)
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus) {
        console.log('Permission granted:', settings.authorizationStatus);
    } else {
        console.log('Permission denied');
    }

    // 2. Create an Android Channel (Required for Android 8.0+)
    // This is safe to call repeatedly; Notifee will only create it once.
    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH, // Use HIGH importance for sounds/vibration
        description: 'Notifications for general updates',
        // You can also set sound and vibration here for Android
        // sound: 'default', 
    });
    
    // Return the channel ID for use in display functions
    return 'default'; 
 }

//   const setupNotifications = (): void => {
    
//     PushNotification.configure({
//       onNotification: function (notification) {
//         console.log('NOTIFICATION:', notification);
//       },
//       permissions: {
//         alert: true,
//         badge: true,
//         sound: true,
//       },
//       popInitialNotification: true,
//       requestPermissions: true,
//     });

//     PushNotification.createChannel(
//       {
//         channelId: 'goaleasy-channel',
//         channelName: 'GoalEasy Notifications',
//       },
//       (created) => console.log(`Channel created: ${created}`)
//     );
//   };




//   const scheduleNotification = (title: string, message: string, date: Date): void => {
//     // PushNotification.localNotificationSchedule({
//     //   channelId: 'goaleasy-channel',
//     //   title: title,
//     //   message: message,
//     //   date: date,
//     //   playSound: true,
//     //   soundName: 'default',
//     // });
//   };

  const generateMilestones = (goal: Partial<Goal>): Milestone[] => {
    const count = goal.size === 'small' ? 3 : goal.size === 'medium' ? 5 : 8;
    const milestones: Milestone[] = [];
    const startDate = new Date();
    const endDate = goal.targetDate 
      ? new Date(goal.targetDate) 
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
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

  const addGoal = (goal: Partial<Goal>): void => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goal.title || '',
      targetDate: goal.targetDate || new Date().toISOString(),
      size: goal.size || 'medium',
      current: 0,
      target: 10000,
      createdAt: new Date().toISOString(),
      tasks: [
        { id: '1', title: 'Start working on goal', done: false },
        { id: '2', title: 'Make first progress', done: false },
      ],
      milestones: generateMilestones(goal)
    };
    setGoals([...goals, newGoal]);
    
    // Schedule morning notification
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0);
    // scheduleNotification(
    //   'Good Morning! 🌅',
    //   `Time to work on: ${goal.title}`,
    //   tomorrow
    // );
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>): void => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates } : g));
  };

  const deleteGoal = (goalId: string): void => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const addTask = (goalId: string, taskTitle: string): void => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          tasks: [...goal.tasks, {
            id: Date.now().toString(),
            title: taskTitle,
            done: false
          }]
        };
      }
      return goal;
    }));
  };

  const toggleTask = (goalId: string, taskId: string): void => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedTasks = goal.tasks.map(task =>
          task.id === taskId ? { ...task, done: !task.done } : task
        );
        
        // Update streak if task completed
        const completedTasks = updatedTasks.filter(t => t.done).length;
        if (completedTasks > goal.tasks.filter(t => t.done).length) {
          setUser(prev => ({ ...prev, streak: prev.streak + 1 }));
        }
        
        return { ...goal, tasks: updatedTasks };
      }
      return goal;
    }));
  };

  const moveMilestone = (goalId: string, milestoneId: string, newStatus: Milestone['status']): void => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: goal.milestones.map(m =>
            m.id === milestoneId ? { ...m, status: newStatus } : m
          )
        };
      }
      return goal;
    }));

    // if (newStatus === 'done') {
    //   PushNotification.localNotification({
    //     channelId: 'goaleasy-channel',
    //     title: 'Milestone Completed! 🎉',
    //     message: 'Keep up the great work!',
    //   });
    // }
  };

  useEffect(() => {
    saveData();
  }, [user, goals, language]);

  return (
    <AppContext.Provider value={{
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
      moveMilestone
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
