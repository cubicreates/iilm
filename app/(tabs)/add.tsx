import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { ref, push, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { Clock } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { router } from 'expo-router';

interface Chamber {
  id: number;
  isOccupied: boolean;
}

export default function AddMedicationScreen() {
  const [name, setName] = useState('');
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [selectedChamber, setSelectedChamber] = useState<number | null>(null);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const medsRef = ref(database, 'medications');
    const unsubscribe = onValue(medsRef, (snapshot) => {
      const data = snapshot.val();
      const occupiedChambers = data ? Object.values(data).map((med: any) => med.chamber) : [];
      
      const updatedChambers = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        isOccupied: occupiedChambers.includes(i + 1)
      }));
      
      setChambers(updatedChambers);
    });

    return () => unsubscribe();
  }, []);

  const handleAddMedication = async () => {
    if (!name.trim()) {
      setError('Please enter a medication name');
      return;
    }

    if (selectedChamber === null) {
      setError('Please select a chamber');
      return;
    }

    try {
      const medicationsRef = ref(database, 'medications');
      await push(medicationsRef, {
        name: name.trim(),
        hour,
        minute,
        chamber: selectedChamber,
        dispensed: false,
        lastDispensed: ''
      });

      router.push('/medications');
    } catch (error) {
      setError('Failed to add medication. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Medication</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Medication Name"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.timeContainer}>
          <Clock size={24} color="#0891b2" />
          <View style={styles.timeInputs}>
            <TextInput
              style={styles.timeInput}
              placeholder="Hour (0-23)"
              keyboardType="number-pad"
              value={String(hour)}
              onChangeText={(text) => setHour(parseInt(text) || 0)}
            />
            <Text style={styles.timeSeparator}>:</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="Minute"
              keyboardType="number-pad"
              value={String(minute)}
              onChangeText={(text) => setMinute(parseInt(text) || 0)}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Chamber</Text>
        <View style={styles.chambersGrid}>
          {chambers.map((chamber) => (
            <TouchableOpacity
              key={chamber.id}
              style={[
                styles.chamberButton,
                chamber.isOccupied && styles.chamberOccupied,
                selectedChamber === chamber.id && styles.chamberSelected,
              ]}
              onPress={() => !chamber.isOccupied && setSelectedChamber(chamber.id)}
              disabled={chamber.isOccupied}
            >
              <Text style={[
                styles.chamberText,
                chamber.isOccupied && styles.chamberTextOccupied,
                selectedChamber === chamber.id && styles.chamberTextSelected,
              ]}>
                {chamber.id}
              </Text>
              {chamber.isOccupied && (
                <Text style={styles.occupiedText}>Occupied</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddMedication}
        >
          <Text style={styles.addButtonText}>Add Medication</Text>
        </TouchableOpacity>
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
  errorContainer: {
    margin: 20,
    padding: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  form: {
    padding: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  timeInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 20,
    marginHorizontal: 8,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  chambersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  chamberButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  chamberOccupied: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  chamberSelected: {
    borderColor: '#0891b2',
    backgroundColor: '#ecfeff',
  },
  chamberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  chamberTextOccupied: {
    color: '#64748b',
  },
  chamberTextSelected: {
    color: '#0891b2',
  },
  occupiedText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#0891b2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});