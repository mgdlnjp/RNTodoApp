import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';

export type AvatarSource = 'library' | 'camera';

/**
 * Ouvre la galerie ou l'appareil photo, recadre en carré et copie l'image
 * dans le dossier Documents de l'app (le cache peut être vidé par le système).
 * Renvoie l'URI persistante, ou null si annulé. Lève 'permission' si refusé.
 */
export async function pickAvatar(source: AvatarSource): Promise<string | null> {
  const perm =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('permission');

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({ ...options, cameraType: ImagePicker.CameraType.front })
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.[0]) return null;

  const picked = new File(result.assets[0].uri);
  const dest = new File(Paths.document, `avatar-${Date.now()}.jpg`);
  picked.copy(dest);
  return dest.uri;
}

/** Supprime l'ancienne photo du disque (sans erreur si elle n'existe plus). */
export function deleteAvatarFile(uri?: string) {
  if (!uri) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch (e) {
    console.warn('[avatar] suppression impossible', e);
  }
}
