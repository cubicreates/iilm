import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { Clock } from 'lucide-react-native';

interface Medication {
  id: string;
  name: string;
  hour: number;
  minute: number;
  chamber: number;
  dispensed: boolean;
  lastDispensed: string;
}

export default function MedicationsScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    const medicationsRef = ref(database, 'medications');
    const unsubscribe = onValue(medicationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const medicationsList = Object.entries(data).map(([id, med]: [string, any]) => ({
          id,
          ...med
        }));
        setMedications(medicationsList);
      } else {
        setMedications([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medications</Text>
      </View>

      <View style={styles.medicationsList}>
        {medications.map((medication) => (
          <View key={medication.id} style={styles.medicationCard}>
            <View style={styles.medicationHeader}>
              <Text style={styles.medicationName}>{medication.name}</Text>
              <View style={styles.timeDisplay}>
                <Clock size={16} color="#64748b" />
                <Text style={styles.timeText}>
                  {formatTime(medication.hour, medication.minute)}
                </Text>
              </View>
            </View>
            <View style={styles.medicationDetails}>
              <Text style={styles.chamberText}>Chamber {medication.chamber}</Text>
              <Text style={[
                styles.statusText,
                { color: medication.dispensed ? '#22c55e' : '#64748b' }
              ]}>
                {medication.dispensed ? 'Dispensed' : 'Pending'}
              </Text>
            </View>
            {medication.lastDispensed && (
              <Text style={styles.lastDispensedText}>
                Last dispensed: {medication.lastDispensed}
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  medicationsList: {
    padding: 20,
  },
  medicationCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64748b',
  },
  medicationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chamberText: {
    fontSize: 14,
    color: '#64748b',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastDispensedText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
});