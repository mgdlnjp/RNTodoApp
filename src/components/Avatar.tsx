import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  uri?: string;
  size: number;
  style?: ViewStyle;
}

// Photo de profil si disponible, sinon silhouette neutre (façon Messenger).
export default function Avatar({ uri, size, style }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const round = { width: size, height: size, borderRadius: size / 2 };

  if (uri && !failed) {
    return (
      <View style={[styles.frame, round, style]}>
        <Image source={{ uri }} style={round} onError={() => setFailed(true)} />
      </View>
    );
  }

  return (
    <View style={[styles.frame, styles.placeholder, round, style]}>
      <Ionicons
        name="person"
        size={Math.round(size * 0.56)}
        color="#FFFFFF"
        style={{ lineHeight: Math.round(size * 0.56), textAlign: 'center' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  placeholder: { backgroundColor: '#C4CBD8' },
});
