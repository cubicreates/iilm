import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { Battery, Signal, CircleAlert as AlertCircle } from 'lucide-react-native';

interface DeviceStatus {
  isOnline: boolean;
  lastSeen: string;
  currentChamber: number;
  lastDispenseTime: string;
}

interface Chamber {
  id: number;
  pillCount: number;
  medication: string;
}

export default function HomeScreen() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [chambers, setChambers] = useState<Chamber[]>([]);

  useEffect(() => {
    const statusRef = ref(database, 'pillDispenser');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeviceStatus({
          isOnline: data.isOnline,
          lastSeen: data.lastSeen,
          currentChamber: data.currentChamber,
          lastDispenseTime: data.lastDispenseTime
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DoseBuddy</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: deviceStatus?.isOnline ? '#22c55e' : '#ef4444' }]} />
          <Text style={styles.statusText}>{deviceStatus?.isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      <View style={styles.deviceInfo}>
        <View style={styles.infoItem}>
          <Signal size={24} color="#0891b2" />
          <Text style={styles.infoText}>Last Seen: {deviceStatus?.lastSeen || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Battery size={24} color="#0891b2" />
          <Text style={styles.infoText}>Chamber: {deviceStatus?.currentChamber || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <AlertCircle size={24} color="#0891b2" />
          <Text style={styles.infoText}>Last Dispense: {deviceStatus?.lastDispenseTime || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.chambersGrid}>
        {[1, 2, 3, 4, 5, 6].map((chamber) => (
          <View key={chamber} style={styles.chamberCard}>
            <Text style={styles.chamberTitle}>Chamber {chamber}</Text>
            <Text style={styles.chamberStatus}>
              {deviceStatus?.currentChamber === chamber ? 'Active' : 'Standby'}
            </Text>
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#64748b',
  },
  deviceInfo: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#334155',
  },
  chambersGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chamberCard: {
    width: '48%',
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
  chamberTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  chamberStatus: {
    fontSize: 14,
    color: '#64748b',
  },
});