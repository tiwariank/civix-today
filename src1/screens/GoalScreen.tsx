import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { RootStackParamList } from '../../App';
import { Milestone } from '../types';

type GoalScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Goal'>;
type GoalScreenRouteProp = RouteProp<RootStackParamList, 'Goal'>;

interface Props {
  navigation: GoalScreenNavigationProp;
  route: GoalScreenRouteProp;
}

const GoalScreen: React.FC<Props> = ({ navigation, route }) => {
  const { goalId } = route.params;
  const { language, goals, moveMilestone } = useApp();
  const t = translations[language];

  const goal = goals.find(g => g.id === goalId);

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Goal not found</Text>
      </SafeAreaView>
    );
  }

  const columns: Record<Milestone['status'], Milestone[]> = {
    todo: goal.milestones.filter(m => m.status === 'todo'),
    doing: goal.milestones.filter(m => m.status === 'doing'),
    done: goal.milestones.filter(m => m.status === 'done'),
  };

  const getStatusColor = (status: Milestone['status']): string => {
    switch (status) {
      case 'todo': return '#6B7280';
      case 'doing': return '#3B82F6';
      case 'done': return '#00A86B';
    }
  };

  const getStatusEmoji = (status: Milestone['status']): string => {
    switch (status) {
      case 'todo': return '⭕';
      case 'doing': return '🔄';
      case 'done': return '✅';
    }
  };

  const handleMoveMilestone = (milestoneId: string, currentStatus: Milestone['status']): void => {
    const newStatus: Milestone['status'] = currentStatus === 'todo' ? 'doing' : 'done';
    moveMilestone(goalId, milestoneId, newStatus);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{goal.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView horizontal style={styles.kanbanContainer} showsHorizontalScrollIndicator={false}>
        {(['todo', 'doing', 'done'] as const).map((status) => (
          <View key={status} style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnEmoji}>{getStatusEmoji(status)}</Text>
              <Text style={styles.columnTitle}>
                {t[status]} ({columns[status].length})
              </Text>
            </View>

            <ScrollView style={styles.columnContent}>
              {columns[status].map((milestone) => (
                <View
                  key={milestone.id}
                  style={[
                    styles.milestoneCard,
                    { borderLeftColor: getStatusColor(status), borderLeftWidth: 4 }
                  ]}
                >
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <View style={styles.milestoneFooter}>
                    <Text style={styles.milestoneDate}>
                      📅 {new Date(milestone.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Text>
                  </View>

                  {status !== 'done' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: getStatusColor(status) }]}
                      onPress={() => handleMoveMilestone(milestone.id, status)}
                    >
                      <Text style={styles.actionButtonText}>
                        {status === 'todo' ? t.startNow : t.complete}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {columns[status].length === 0 && (
                <View style={styles.emptyColumn}>
                  <Text style={styles.emptyColumnText}>No items</Text>
                </View>
              )}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backIcon: {
    fontSize: 32,
    color: '#6B7280',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  kanbanContainer: {
    flex: 1,
    padding: 16,
  },
  column: {
    width: 280,
    marginRight: 16,
  },
  columnHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  columnEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  columnContent: {
    flex: 1,
  },
  milestoneCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  milestoneFooter: {
    marginBottom: 12,
  },
  milestoneDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyColumn: {
    padding: 24,
    alignItems: 'center',
  },
  emptyColumnText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default GoalScreen;