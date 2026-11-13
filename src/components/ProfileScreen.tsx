import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  //ImagePickerIOS,
  Platform,
} from 'react-native';
//import * as ImagePicker from 'expo-image-picker';

interface ProfileScreenProps {
  userData: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  onBack: () => void;
  onLogout: () => void;
  onUpdateAvatar: (newAvatar: string) => void;
}

export default function ProfileScreen({ userData, onBack, onLogout, onUpdateAvatar }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userData);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      onUpdateAvatar(result.assets[0].uri);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Ici, vous pourriez sauvegarder les modifications dans un état global ou une base de données
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le profil',
      'Voulez-vous vraiment supprimer votre profil et toutes vos tâches ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          {/* <View style={styles.editAvatarOverlay}>
            <Text style={styles.editAvatarText}>Modifier la photo</Text>
          </View> */}
        </TouchableOpacity>
      </View>

      {/* Information Section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.iconText}>@</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedData.email}
                onChangeText={text => setEditedData({ ...editedData, email: text })}
                onBlur={handleSave}
              />
            ) : (
              <Text style={styles.infoText}>{userData.email}</Text>
            )}
            {!isEditing && (
              <TouchableOpacity onPress={handleEdit}>
                <Text style={styles.editIcon}>✎</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.iconText}>📱</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedData.phone}
                onChangeText={text => setEditedData({ ...editedData, phone: text })}
                onBlur={handleSave}
              />
            ) : (
              <Text style={styles.infoText}>{userData.phone}</Text>
            )}
            {!isEditing && (
              <TouchableOpacity onPress={handleEdit}>
                <Text style={styles.editIcon}>✎</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View> */}

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tâches complétées</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tâches en cours</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Productivité</Text>
            <Text style={styles.statValue}>0%</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Déconnecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  editAvatarText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  editIcon: {
    color: '#3b82f6',
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingVertical: 5,
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 