import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const accent = '#ff3d63';

const palettes = {
  light: {
    background: '#f8f8fa',
    text: '#141116',
    muted: '#74707a',
    card: '#ffffff',
    hero: '#21151a',
    heroMuted: '#f2c8d3',
    border: '#ece8ee',
    softAccent: '#ffe8ee',
  },
  dark: {
    background: '#0e0d10',
    text: '#f7f2f5',
    muted: '#a79fa8',
    card: '#19161b',
    hero: '#2a121a',
    heroMuted: '#f0b8c8',
    border: '#28232b',
    softAccent: 'rgba(255, 61, 99, 0.16)',
  },
};

const actions = [
  {
    title: 'Exercises',
    detail: 'Choose body parts and workouts',
    icon: 'fitness-center',
    color: '#ff3d63',
    route: '/bodyparts',
  },
  {
    title: 'AI Recommendations',
    detail: 'Get your coach plan',
    icon: 'auto-awesome',
    color: '#00a6a6',
    route: '/recommendations',
  },
  {
    title: 'Profile',
    detail: 'Progress and account',
    icon: 'person',
    color: '#7c5cff',
    route: '/profile',
  },
  {
    title: 'Guided Camera',
    detail: 'Open form correction',
    icon: 'videocam',
    color: '#f5a524',
    route: '/guided-squat',
  },
] as const;

export default function HomeScreen() {
  const palette = useColorScheme() === 'dark' ? palettes.dark : palettes.light;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: palette.hero }]}>
          <View style={styles.heroGlow} />
          <View style={styles.badge}>
            <MaterialIcons name="auto-awesome" size={16} color={accent} />
            <Text style={styles.badgeText}>AI Fitness Coach</Text>
          </View>
          <Text style={styles.heroTitle}>Train smarter with guided form correction.</Text>
          <Text style={[styles.heroCopy, { color: palette.heroMuted }]}>
            Start with exercises, get AI recommendations, or open camera-based coaching.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/bodyparts')}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Home</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/workout')}
            style={[styles.planPill, { backgroundColor: palette.softAccent }]}>
            <Text style={[styles.planPillText, { color: accent }]}>Today&apos;s plan</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {actions.map((item) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              onPress={() => router.push(item.route)}
              style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: `${item.color}22` }]}>
                <MaterialIcons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={[styles.cardTitle, { color: palette.text }]}>{item.title}</Text>
              <Text style={[styles.cardDetail, { color: palette.muted }]}>{item.detail}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 22,
    padding: 20,
    paddingBottom: 36,
  },
  hero: {
    borderRadius: 30,
    minHeight: 330,
    overflow: 'hidden',
    padding: 24,
  },
  heroGlow: {
    backgroundColor: 'rgba(255, 61, 99, 0.46)',
    borderRadius: 140,
    height: 250,
    position: 'absolute',
    right: -78,
    top: -70,
    width: 250,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 37,
    fontWeight: '900',
    lineHeight: 41,
    marginTop: 58,
  },
  heroCopy: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: accent,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  planPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  planPillText: {
    fontSize: 13,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 148,
    padding: 16,
    width: '48%',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 18,
    height: 46,
    justifyContent: 'center',
    marginBottom: 18,
    width: 46,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 21,
  },
  cardDetail: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
});
