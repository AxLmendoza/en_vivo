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

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  progress: number;
  taskCount: number;
  completedTasks: number;
  dueDate?: string;
}

export const ProjectsScreen = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    // TODO: Cargar proyectos desde el API
    setProjects([
      {
        id: '1',
        name: 'TaskFlow AI',
        description: 'Asistente de productividad inteligente con IA',
        color: '#3b82f6',
        progress: 75,
        taskCount: 12,
        completedTasks: 9,
        dueDate: new Date(Date.now() + 604800000).toISOString(),
      },
      {
        id: '2',
        name: 'Red Social Pro',
        description: 'Plataforma de redes sociales con IA',
        color: '#10b981',
        progress: 45,
        taskCount: 20,
        completedTasks: 9,
      },
      {
        id: '3',
        name: 'E-commerce API',
        description: 'API para tienda online con pagos',
        color: '#f59e0b',
        progress: 90,
        taskCount: 15,
        completedTasks: 13,
        dueDate: new Date(Date.now() + 259200000).toISOString(),
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return theme.colors.success;
    if (progress >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <View style={[styles.projectColor, { backgroundColor: item.color }]} />
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>{item.name}</Text>
          <Text style={styles.projectDescription}>{item.description}</Text>
        </View>
      </View>

      <View style={styles.projectStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.completedTasks}/{item.taskCount}</Text>
          <Text style={styles.statLabel}>Tareas</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={[styles.statNumber, { color: getProgressColor(item.progress) }]}>
            {item.progress}%
          </Text>
          <Text style={styles.statLabel}>Progreso</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: getProgressColor(item.progress),
              width: `${item.progress}%`,
            },
          ]}
        />
      </View>

      {item.dueDate && (
        <View style={styles.dueDate}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.secondary} />
          <Text style={styles.dueDateText}>
            Vence: {format(new Date(item.dueDate), 'dd/MM/yyyy')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Proyectos</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.projectsList}>
          <FlatList
            data={projects}
            renderItem={renderProject}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.projectsContainer}
            showsVerticalScrollIndicator={false}
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  projectsList: {
    flex: 1,
  },
  projectsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  projectCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  projectColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  projectInfo: {
    marginLeft: 12,
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  projectDescription: {
    fontSize: 14,
    color: theme.colors.secondary,
    lineHeight: 20,
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dueDateText: {
    fontSize: 12,
    color: theme.colors.secondary,
  },
});