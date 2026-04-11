import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

export const DashboardScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

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
    ]);
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>¡Hola, Usuario!</Text>
          <Text style={styles.date}>
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Tareas totales</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {tasks.filter(t => t.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {tasks.filter(t => t.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tareas recientes</Text>
          {tasks.map(task => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              activeOpacity={0.7}
            >
              <View style={styles.taskHeader}>
                <Ionicons
                  name={getStatusIcon(task.status)}
                  size={24}
                  color={getPriorityColor(task.priority)}
                />
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDate}>
                    {format(new Date(task.dueDate), 'dd/MM/yyyy')}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskDescription} numberOfLines={2}>
                {task.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: theme.colors.card,
    margin: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
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
});