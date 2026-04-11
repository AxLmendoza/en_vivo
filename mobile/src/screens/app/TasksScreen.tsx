import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

export const TasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const loadTasks = async () => {
    // TODO: Cargar tareas desde el API
    setTasks([
      {
        id: '1',
        title: 'Revisar documentación del proyecto',
        description: 'Revisar y actualizar la documentación del TaskFlow AI',
        dueDate: new Date().toISOString(),
        priority: 'high',
        status: 'pending',
      },
      {
        id: '2',
        title: 'Implementar autenticación',
        description: 'Agregar sistema de login y registro con JWT',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: 'medium',
        status: 'in_progress',
      },
      {
        id: '3',
        title: 'Configurar base de datos',
        description: 'Configurar Prisma y PostgreSQL para el backend',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        priority: 'high',
        status: 'completed',
      },
    ]);
  };

  const filterTasks = () => {
    let result = tasks;

    if (searchQuery) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(result);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'time';
      default:
        return 'ellipse-outline';
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'pending' : 'completed',
            }
          : task
      )
    );
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      activeOpacity={0.7}
      onPress={() => toggleTaskStatus(item.id)}
    >
      <View style={styles.taskHeader}>
        <Ionicons
          name={getStatusIcon(item.status)}
          size={24}
          color={item.status === 'completed' ? theme.colors.success : getPriorityColor(item.priority)}
        />
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, item.status === 'completed' && styles.completedText]}>
            {item.title}
          </Text>
          <Text style={styles.taskDate}>
            {format(new Date(item.dueDate), 'dd/MM/yyyy')}
          </Text>
        </View>
      </View>
      <Text style={[styles.taskDescription, item.status === 'completed' && styles.completedText]} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Tareas</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.secondary}
          />

          <View style={styles.filters}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Estado:</Text>
              <TouchableOpacity
                style={[styles.filterButton, statusFilter === 'all' && styles.filterButtonActive]}
                onPress={() => setStatusFilter('all')}
              >
                <Text style={[styles.filterButtonText, statusFilter === 'all' && styles.filterButtonTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, statusFilter === 'pending' && styles.filterButtonActive]}
                onPress={() => setStatusFilter('pending')}
              >
                <Text style={[styles.filterButtonText, statusFilter === 'pending' && styles.filterButtonTextActive]}>
                  Pendientes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, statusFilter === 'completed' && styles.filterButtonActive]}
                onPress={() => setStatusFilter('completed')}
              >
                <Text style={[styles.filterButtonText, statusFilter === 'completed' && styles.filterButtonTextActive]}>
                  Completadas
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.tasksList}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 15,
  },
  filters: {
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginRight: 5,
  },
  filterButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  tasksList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskInfo: {
    marginLeft: 10,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  taskDate: {
    fontSize: 12,
    color: theme.colors.secondary,
  },
  taskDescription: {
    fontSize: 14,
    color: theme.colors.secondary,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});