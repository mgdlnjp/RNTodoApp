import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Image,
} from 'react-native';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Haute' | 'Moyenne' | 'Basse';
  category: 'Travail' | 'Personnel' | 'Courses' | 'Autre';
  completed: boolean;
}

interface MainScreenProps {
  userData: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  onShowProfile: () => void;
}

export default function MainScreen({ userData, onShowProfile }: MainScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const newProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    setProgress(newProgress);
  }, [tasks]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'low' as const,
    category: 'work' as const,
  });

  const addTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask,
        completed: true,
      };
      setTasks([task, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        priority: 'low',
        category: 'work',
      });
      setShowAddModal(false);
    }
  };

  const editTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const updateTask = () => {
    if (selectedTask) {
      setTasks(tasks.map(task => 
        task.id === selectedTask.id ? selectedTask : task
      ));
      setShowEditModal(false);
      setSelectedTask(null);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute':
        return '#ef4444';
      case 'Moyenne':
        return '#f59e0b';
      case 'Basse':
        return '#10b981';
      default:
        return '#10b981';
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Travail':
        return { backgroundColor: '#e0f2fe', color: '#0369a1' };
      case 'Personnel':
        return { backgroundColor: '#ede9fe', color: '#7c3aed' };
      case 'Courses':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Autre':
        return { backgroundColor: '#fce7f3', color: '#9d174d' };
      default:
        return { backgroundColor: '#e0f2fe', color: '#0369a1' };
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={[styles.taskContainer, { borderLeftColor: getPriorityColor(item.priority) }]}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => editTask(item)}
      >
        <TouchableOpacity 
          style={[styles.checkbox, item.completed && styles.checkedBox]}
          onPress={() => toggleTask(item.id)}
        >
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, item.completed && styles.completedTask]}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.taskDescription}>{item.description}</Text>
          ) : null}
        </View>
        <View style={styles.taskMeta}>
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: getCategoryStyle(item.category).backgroundColor },
            ]}
          >
            <Text style={{ color: getCategoryStyle(item.category).color }}>
              {item.category}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteTask(item.id)}
          >
            <Text style={styles.deleteIcon}>×</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>SALUT {userData.name} !</Text>
          <Text style={styles.subtitle}>Voici tes missions du jour</Text>
        </View>
        {/* <TouchableOpacity style={styles.profileButton} onPress={onShowProfile}>
          <Image
            source={{ uri: userData.avatar }}
            style={styles.avatar}
          />
        </TouchableOpacity> */}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Progression du jour</Text>
          <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.progressStats}>
          <Text style={styles.statsText}>
            {tasks.filter(t => t.completed).length}/{tasks.length} Missions
          </Text>
          <Text style={styles.statsText}>
            {tasks.length - tasks.filter(t => t.completed).length} restantes
          </Text>
        </View>
      </View>

      {/* Tasks List */}
      <View style={styles.tasksContainer}>
        <View style={styles.tasksHeader}>
          <Text style={styles.tasksTitle}>Mes Missions</Text>
          {tasks.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setTasks([])}
            >
              <Text style={styles.clearButtonText}>Effacer tout</Text>
            </TouchableOpacity>
          )}
        </View>

        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>Aucune Mission pour le moment</Text>
            <Text style={styles.emptyText}>
              Ajoutez en une nouvelle en cliquant sur le bouton +
            </Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={item => item.id}
            style={styles.taskList}
          />
        )}
      </View>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle Mission</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Titre"
              value={newTask.title}
              onChangeText={text => setNewTask({ ...newTask, title: text })}
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Description"
              value={newTask.description}
              onChangeText={text => setNewTask({ ...newTask, description: text })}
              multiline
            />

            <View style={styles.priorityContainer}>
              <Text style={styles.sectionTitle}>Priorité</Text>
              <View style={styles.priorityButtons}>
                {['Haute', 'Moyenne', 'Basse'].map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      {
                        backgroundColor:
                          newTask.priority === priority
                            ? getPriorityColor(priority)
                            : `${getPriorityColor(priority)}20`,
                      },
                    ]}
                    onPress={() =>
                      setNewTask({ ...newTask, priority: priority as any })
                    }
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        {
                          color:
                            newTask.priority === priority ? '#fff' : getPriorityColor(priority),
                        },
                      ]}
                    >
                      {priority === 'Haute'
                        ? 'Haute'
                        : priority === 'Moyenne'
                        ? 'Moyenne'
                        : 'Basse'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.categoryContainer}>
              <Text style={styles.sectionTitle}>Catégorie</Text>
              <View style={styles.categoryButtons}>
                {['Travail', 'Personnel', 'Courses', 'Autre'].map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          newTask.category === category
                            ? getCategoryStyle(category).backgroundColor
                            : `${getCategoryStyle(category).backgroundColor}20`,
                      },
                    ]}
                    onPress={() =>
                      setNewTask({ ...newTask, category: category as any })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        {
                          color:
                            newTask.category === category
                              ? getCategoryStyle(category).color
                              : getCategoryStyle(category).color,
                        },
                      ]}
                    >
                   {category === 'Travail'
                            ? 'Travail'
                            : category === 'Personnel'
                            ? 'Personnel'
                            : category === 'Courses'
                            ? 'Courses'
                            : 'Autre'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={addTask}
            >
              <Text style={styles.confirmButtonText}>Ajouter!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier la Mission</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Titre"
                  value={selectedTask.title}
                  onChangeText={text => setSelectedTask({ ...selectedTask, title: text })}
                />

                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Description"
                  value={selectedTask.description}
                  onChangeText={text => setSelectedTask({ ...selectedTask, description: text })}
                  multiline
                />

                <View style={styles.priorityContainer}>
                  <Text style={styles.sectionTitle}>Priorité</Text>
                  <View style={styles.priorityButtons}>
                    {['Haute', 'Moyenne', 'Basse'].map(priority => (
                      <TouchableOpacity
                        key={priority}
                        style={[
                          styles.priorityButton,
                          {
                            backgroundColor:
                              selectedTask.priority === priority
                                ? getPriorityColor(priority)
                                : `${getPriorityColor(priority)}20`,
                          },
                        ]}
                        onPress={() =>
                          setSelectedTask({ ...selectedTask, priority: priority as any })
                        }
                      >
                        <Text
                          style={[
                            styles.priorityButtonText,
                            {
                              color:
                                selectedTask.priority === priority ? '#fff' : getPriorityColor(priority),
                            },
                          ]}
                        >
                          {priority === 'Haute'
                            ? 'Haute'
                            : priority === 'Moyenne'
                            ? 'Moyenne'
                            : 'Basse'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.categoryContainer}>
                  <Text style={styles.sectionTitle}>Catégorie</Text>
                  <View style={styles.categoryButtons}>
                    {['Travail', 'Personnel', 'Courses', 'Autre'].map(category => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          {
                            backgroundColor:
                              selectedTask.category === category
                                ? getCategoryStyle(category).backgroundColor
                                : `${getCategoryStyle(category).backgroundColor}20`,
                          },
                        ]}
                        onPress={() =>
                          setSelectedTask({ ...selectedTask, category: category as any })
                        }
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            {
                              color:
                                selectedTask.category === category
                                  ? getCategoryStyle(category).color
                                  : getCategoryStyle(category).color,
                            },
                          ]}
                        >
                          {category === 'Travail'
                            ? 'Travail'
                            : category === 'Personnel'
                            ? 'Personnel'
                            : category === 'Courses'
                            ? 'Courses'
                            : 'Autre'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={updateTask}
                >
                  <Text style={styles.confirmButtonText}>Enregistrer les modifications</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
   marginTop:-35,
    backgroundColor: '#fe5410',
    padding: 20,
    //flexDirection: 'row',
    //justifyContent: 'space-between',
    //flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    color: '#fe5410',
    fontSize: 16,
  },
  progressPercentage: {
    color: '#fe5410',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fe5410',
    borderRadius: 5,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsText: {
    color: '#6b7280',
    fontSize: 12,
  },
  tasksContainer: {
    flex: 1,
    padding: 15,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tasksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: '#ef4444',
  },
  taskList: {
    flex: 1,
  },
  taskContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#fe5410',
    borderColor: '#fe5410',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  deleteButton: {
    padding: 5,
  },
  deleteIcon: {
    color: '#ef4444',
    fontSize: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 50,
    color: '#d1d5db',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fe5410',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
  modalInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 10,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    padding: 8,
    borderRadius: 20,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#fe5410',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 