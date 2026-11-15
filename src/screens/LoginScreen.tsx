import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Paper from '../components/Paper';
import { colors, font, notebook, radius, shadow, space } from '../theme';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function LoginScreen({ onLogin }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const canStart = name.trim().length > 0;

  const start = () => {
    if (canStart) onLogin({ name: capitalize(name.trim()) });
  };

  return (
    <Paper>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, space.xl) }]}
    >
      <View style={styles.hero}>
        <View style={styles.glow} />
        <Image source={require('../../assets/mainicon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brand}>OPLA</Text>
        <Text style={styles.tagline}>Ta liste, à ta façon.{'\n'}Écris, coche, barre.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Comment tu t'appelles ?</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ton prénom"
          placeholderTextColor={colors.textSubtle}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={start}
          maxLength={30}
        />
        <Pressable
          onPress={start}
          disabled={!canStart}
          style={({ pressed }) => [styles.cta, !canStart && styles.ctaDisabled, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>C'est parti !</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
    </Paper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingLeft: notebook.margin + space.lg, paddingRight: space.xl },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primarySoft,
    top: '50%',
    marginTop: -170,
  },
  logo: { width: 128, height: 128, marginBottom: space.xl },
  brand: { fontSize: font.display, fontWeight: font.bold, color: colors.brandBlue, letterSpacing: 4 },
  tagline: {
    fontFamily: font.hand,
    fontSize: font.handL, lineHeight: font.handLLine,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: space.md,
  },
  form: { paddingBottom: space.lg },
  label: { fontFamily: font.hand, fontSize: font.handL, lineHeight: font.handLLine, color: colors.primary, marginBottom: space.xs },
  input: {
    height: 56,
    fontFamily: font.hand,
    fontSize: font.handM, lineHeight: font.handMLine,
    color: colors.ink,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    marginBottom: space.xl,
  },
  cta: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    ...shadow(colors.primary, 1.5),
  },
  ctaDisabled: { opacity: 0.4 },
  ctaPressed: { transform: [{ scale: 0.98 }] },
  ctaText: { color: colors.white, fontSize: font.body, fontWeight: font.bold },
});
