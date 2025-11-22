import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { RootStackParamList } from '../../App';
import { Goal } from '../types';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

interface NewGoalData {
  title: string;
  size: 'small' | 'medium' | 'big';
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { 
    language, 
    setLanguage, 
    user, 
    goals, 
    filter, 
    setFilter, 
    toggleTask, 
    addGoal, 
    addTask 
  } = useApp();
  
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [newGoal, setNewGoal] = useState<NewGoalData>({ title: '', size: 'medium' });
  const [newTask, setNewTask] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [confettiAnim] = useState(new Animated.Value(0));
  
  const t = translations[language];

  const handleToggleTask = (goalId: string, taskId: string): void => {
    toggleTask(goalId, taskId);
    setShowConfetti(true);
    
    Animated.sequence([
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(confettiAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setShowConfetti(false));
  };

  const handleCreateGoal = (): void => {
    if (!newGoal.title) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    
    addGoal({
      ...newGoal,
      targetDate: targetDate.toISOString(),
    });
    
    setShowGoalModal(false);
    setNewGoal({ title: '', size: 'medium' });
  };

  const handleAddTask = (): void => {
    if (!newTask.trim() || !selectedGoalId) {
      Alert.alert('Error', 'Please enter a task');
      return;
    }
    
    addTask(selectedGoalId, newTask);
    setShowTaskModal(false);
    setNewTask('');
    setSelectedGoalId(null);
  };

  const renderGoalCard = (goal: Goal): JSX.Element => {
    const progress = goal.target ? (goal.current / goal.target) * 100 : 0;
    const targetDate = new Date(goal.targetDate);
    const daysLeft = Math.max(0, Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

    return (
      <View key={goal.id}>
        <TouchableOpacity
          style={styles.goalCard}
          onPress={() => navigation.navigate('Goal', { goalId: goal.id })}
        >
          <View style={styles.goalHeader}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              {goal.target && (
                <Text style={styles.goalAmount}>
                  ₹{goal.current?.toLocaleString() || 0} / ₹{goal.target?.toLocaleString()}
                </Text>
              )}
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          <View style={styles.progressInfo}>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            <Text style={[styles.daysLeft, daysLeft < 7 && styles.daysLeftUrgent]}>
              {daysLeft} {t.daysRemaining}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
        </TouchableOpacity>

        {goal.tasks && goal.tasks.length > 0 && (
          <View style={styles.tasksCard}>
            <Text style={styles.tasksTitle}>{t.todayTasks}</Text>
            {goal.tasks.slice(0, 3).map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() => handleToggleTask(goal.id, task.id)}
              >
                <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
                  {task.done && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.taskText, task.done && styles.taskTextDone]}>
                  {task.title}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => {
                setSelectedGoalId(goal.id);
                setShowTaskModal(true);
              }}
            >
              <Text style={styles.addTaskText}>+ {t.addTask}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {showConfetti && (
        <Animated.View style={[
          styles.confetti,
          {
            opacity: confettiAnim,
            transform: [{
              scale: confettiAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1.5],
              })
            }]
          }
        ]}>
          <Text style={styles.confettiText}>🎉</Text>
        </Animated.View>
      )}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.avatar}</Text>
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>
              {t.hi} {user.name} 👋
            </Text>
            <View style={styles.streakContainer}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakCount}>
                {user.streak} {t.streak}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.languageToggle}
          onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        >
          <Text style={styles.languageText}>{language === 'en' ? 'हिं' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {(['today', 'week', 'month', 'all'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {t[f === 'today' ? 'today' : f === 'week' ? 'thisWeek' : f === 'month' ? 'thisMonth' : 'allTime']}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No goals yet!</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create your first goal</Text>
          </View>
        ) : (
          goals.map((goal) => renderGoalCard(goal))
        )}

        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>💪</Text>
          <Text style={styles.motivationText}>"{t.motivation}"</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowGoalModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Goal Modal */}
      <Modal
        visible={showGoalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.createGoal}</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder={t.goalTitle}
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
              placeholderTextColor="#999"
            />

            <Text style={styles.modalLabel}>{t.howBig}</Text>
            <View style={styles.sizeButtons}>
              {(['small', 'medium', 'big'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    newGoal.size === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => setNewGoal({ ...newGoal, size })}
                >
                  <Text style={styles.sizeEmoji}>
                    {size === 'small' ? '😊' : size === 'medium' ? '🙂' : '😓'}
                  </Text>
                  <Text style={styles.sizeText}>{t[size]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonCreate}
                onPress={handleCreateGoal}
              >
                <Text style={styles.modalButtonCreateText}>{t.breakIntoSteps}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        visible={showTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaskModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.addTask}</Text>
              <TouchableOpacity onPress={() => setShowTaskModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter task name"
              value={newTask}
              onChangeText={setNewTask}
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowTaskModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonCreate}
                onPress={handleAddTask}
              >
                <Text style={styles.modalButtonCreateText}>{t.addTask}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  confetti: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1000,
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  confettiText: {
    fontSize: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  languageToggle: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    maxHeight: 50,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#00A86B',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00A86B',
  },
  chevron: {
    fontSize: 28,
    color: '#D1D5DB',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysLeft: {
    fontSize: 14,
    color: '#6B7280',
  },
  daysLeftUrgent: {
    color: '#FF9800',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00A86B',
    borderRadius: 4,
  },
  tasksCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: '#00A86B',
    borderColor: '#00A86B',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  addTaskButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  motivationCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 80,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
  },
  motivationEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00A86B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 28,
    color: '#6B7280',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  sizeButtonActive: {
    borderColor: '#00A86B',
    backgroundColor: '#F0F9F6',
  },
  sizeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalButtonCreate: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#00A86B',
    alignItems: 'center',
  },
  modalButtonCreateText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default DashboardScreen;