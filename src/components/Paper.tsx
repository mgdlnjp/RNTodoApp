import React from 'react';
import { StyleSheet, useWindowDimensions, View, ViewProps } from 'react-native';
import { colors, notebook } from '../theme';

/** Trait vertical de la marge du cahier. */
export function MarginLine({ left = notebook.margin }: { left?: number }) {
  return <View pointerEvents="none" style={[styles.margin, { left }]} />;
}

/** Lignes horizontales qui remplissent l'écran (fond fixe). */
export function RuledLines({ offset = 0 }: { offset?: number }) {
  const { height } = useWindowDimensions();
  const count = Math.ceil((height - offset) / notebook.line) + 1;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { top: offset }]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.rule, { top: (i + 1) * notebook.line - 1 }]} />
      ))}
    </View>
  );
}

/** Page de cahier complète : papier + lignes + marge. */
export default function Paper({ children, style, ruled = true, ...rest }: ViewProps & { ruled?: boolean }) {
  return (
    <View style={[styles.paper, style]} {...rest}>
      {ruled && <RuledLines />}
      <MarginLine />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { flex: 1, backgroundColor: colors.paper },
  rule: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.rule },
  margin: { position: 'absolute', top: 0, bottom: 0, width: 1.5, backgroundColor: colors.margin },
});
