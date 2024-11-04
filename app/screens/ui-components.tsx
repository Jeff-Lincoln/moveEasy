import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export const Card: React.FC = ({ children }) => {
  return <View style={styles.card}>{children}</View>;
};

export const CardHeader: React.FC = ({ children }) => {
  return <View style={styles.cardHeader}>{children}</View>;
};

export const CardTitle: React.FC = ({ children }) => {
  return <Text style={styles.cardTitle}>{children}</Text>;
};

export const CardDescription: React.FC = ({ children, style }) => {
  return <Text style={[styles.cardDescription, style]}>{children}</Text>;
};

export const CardContent: React.FC = ({ children }) => {
  return <View style={styles.cardContent}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 2,
    marginVertical: 16,
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  cardDescription: {
    fontSize: 16,
    color: '#4B5563',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});