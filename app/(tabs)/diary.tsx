/**
 * Diary Tab Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DiaryScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Дневник</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Здесь будут ваши записи</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

