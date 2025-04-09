import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ref, push, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { Plus, Clock } from 'lucide-react-native';

interface Medication {
  id: string;
  name: string;
  hour: number;
  minute: number;
  chamber: number;
  dispensed: boolean;
  lastDispensed: string;
}

export default function ScheduleScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    hour: 8,
    minute: 0,
    chamber: 1
  });

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
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddMedication = async () => {
    try {
      const medicationsRef = ref(database, 'medications');
      await push(medicationsRef, {
        ...newMedication,
        dispensed: false,
        lastDispensed: ''
      });
      setShowAddForm(false);
      setNewMedication({ name: '', hour: 8, minute: 0, chamber: 1 });
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication Schedule</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Medication Name"
            value={newMedication.name}
            onChangeText={(text) => setNewMedication({ ...newMedication, name: text })}
          />
          <View style={styles.timeContainer}>
            <TextInput
              style={styles.timeInput}
              placeholder="Hour (0-23)"
              keyboardType="number-pad"
              value={String(newMedication.hour)}
              onChangeText={(text) => setNewMedication({ ...newMedication, hour: parseInt(text) || 0 })}
            />
            <Text style={styles.timeSeparator}>:</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="Minute"
              keyboardType="number-pad"
              value={String(newMedication.minute)}
              onChangeText={(text) => setNewMedication({ ...newMedication, minute: parseInt(text) || 0 })}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Chamber (1-6)"
            keyboardType="number-pad"
            value={String(newMedication.chamber)}
            onChangeText={(text) => setNewMedication({ ...newMedication, chamber: parseInt(text) || 1 })}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddMedication}>
            <Text style={styles.submitButtonText}>Add Medication</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.scheduleList}>
        {medications.map((med) => (
          <View key={med.id} style={styles.medicationCard}>
            <View style={styles.medicationHeader}>
              <Text style={styles.medicationName}>{med.name}</Text>
              <View style={styles.timeDisplay}>
                <Clock size={16} color="#64748b" />
                <Text style={styles.timeText}>
                  {String(med.hour).padStart(2, '0')}:{String(med.minute).padStart(2, '0')}
                </Text>
              </View>
            </View>
            <View style={styles.medicationDetails}>
              <Text style={styles.chamberText}>Chamber {med.chamber}</Text>
              <Text style={[
                styles.statusText,
                { color: med.dispensed ? '#22c55e' : '#64748b' }
              ]}>
                {med.dispensed ? 'Dispensed' : 'Pending'}
              </Text>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  addButton: {
    backgroundColor: '#0891b2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    width: 80,
    fontSize: 16,
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 12,
    color: '#64748b',
  },
  submitButton: {
    backgroundColor: '#0891b2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleList: {
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
});