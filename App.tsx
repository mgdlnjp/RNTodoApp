import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, UIManager, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { Task, TaskDraft, User } from './src/types';
import { loadTasks, loadUser, saveTasks, saveUser } from './src/utils/storage';
import { colors } from './src/theme';
import { deleteAvatarFile } from './src/utils/avatar';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const hydrated = useRef(false);
  const [fontsLoaded, fontError] = useFonts({ Nunito_600SemiBold, Nunito_800ExtraBold });

  // Chargement des données sauvegardées
  useEffect(() => {
    Promise.all([loadUser(), loadTasks()]).then(([u, t]) => {
      setUser(u);
      setTasks(t);
      hydrated.current = true;
      setReady(true);
    });
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    if (hydrated.current) saveTasks(tasks);
  }, [tasks]);

  const login = (u: User) => {
    setUser(u);
    saveUser(u);
  };

  const logout = () => {
    deleteAvatarFile(user?.avatarUri);
    setShowProfile(false);
    setUser(null);
    saveUser(null);
  };

  const reset = () => {
    setTasks([]);
    logout();
  };

  const changeAvatar = (avatarUri?: string) => {
    if (!user) return;
    const next = { ...user, avatarUri };
    setUser(next);
    saveUser(next);
  };

  const addTask = (draft: TaskDraft) => {
    const now = Date.now();
    setTasks(prev => [{ ...draft, id: String(now), completed: false, createdAt: now }, ...prev]);
  };

  const updateTask = (id: string, draft: TaskDraft) =>
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...draft } : t)));

  const toggleTask = (id: string) =>
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
          : t
      )
    );

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const restoreTask = (task: Task) => setTasks(prev => [task, ...prev]);
  const clearCompleted = () => setTasks(prev => prev.filter(t => !t.completed));

  let screen: React.ReactNode;
  // Si la police ne charge pas, on continue avec la police système.
  if (!ready || (!fontsLoaded && !fontError)) {
    screen = (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  } else if (!user) {
    screen = <LoginScreen onLogin={login} />;
  } else if (showProfile) {
    screen = (
      <ProfileScreen
        user={user}
        tasks={tasks}
        onBack={() => setShowProfile(false)}
        onLogout={logout}
        onReset={reset}
        onChangeAvatar={changeAvatar}
      />
    );
  } else {
    screen = (
      <MainScreen
        user={user}
        tasks={tasks}
        onAdd={addTask}
        onUpdate={updateTask}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onRestore={restoreTask}
        onClearCompleted={clearCompleted}
        onClearAll={() => setTasks([])}
        onShowProfile={() => setShowProfile(true)}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
});
