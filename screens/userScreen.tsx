// src/screens/UserScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Storage } from '../utils/storage'; // path may vary

// -----------------------------
// Types
// -----------------------------
type User = {
  id: string;
  name: string;
  email: string;
  age: number;
  phone?: string;
};

type ModalMode = 'ADD' | 'EDIT';

// -----------------------------
// Constants
// -----------------------------
const STORAGE_KEY = 'app.users';

// -----------------------------
// Random data generator
// -----------------------------
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomName = () => {
  const first = ['Ava', 'Liam', 'Noah', 'Emma', 'Olivia', 'Ethan', 'Mia', 'Lucas', 'Aria', 'Arjun'];
  const last = ['Shah', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Iyer', 'Mehta', 'Desai', 'Rao', 'Kapoor'];
  return `${first[randomInt(0, first.length - 1)]} ${last[randomInt(0, last.length - 1)]}`;
};

const randomEmail = (name = '') => {
  const domains = ['example.com', 'mail.com', 'demo.app', 'email.co'];
  const local = name ? name.toLowerCase().replace(/\s+/g, '.') : `user${randomInt(100, 999)}`;
  return `${local}${randomInt(1, 99)}@${domains[randomInt(0, domains.length - 1)]}`;
};

const randomPhone = () => {
  // simple 10-digit phone
  const digits = Array.from({ length: 10 }, () => randomInt(0, 9)).join('');
  return digits;
};

const generateRandomUser = (): User => {
  const name = randomName();
  return {
    id: `u_${Date.now()}_${randomInt(1000, 9999)}`,
    name,
    email: randomEmail(name),
    age: randomInt(18, 60),
    phone: randomPhone(),
  };
};

// -----------------------------
// Screen
// -----------------------------
export const UserScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('ADD');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ageText, setAgeText] = useState('');
  const [phone, setPhone] = useState('');

  const isFormValid = useMemo(() => {
    return name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && Number(ageText) >= 0;
  }, [name, email, ageText]);

  // load users from storage
  const loadUsers = useCallback(async () => {
    try {
      const saved = await Storage.get<User[]>(STORAGE_KEY);
      setUsers(saved ?? []);
    } catch (err) {
      console.error('Failed to load users', err);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // persist users to storage
  const persistUsers = useCallback(
    async (nextUsers: User[]) => {
      try {
        await Storage.set<User[]>(STORAGE_KEY, nextUsers);
      } catch (err) {
        console.error('Failed to save users', err);
      }
    },
    []
  );

  // open modal helpers
  const openAddModal = () => {
    const rand = generateRandomUser();
    setModalMode('ADD');
    setEditingUserId(null);
    setName(rand.name);
    setEmail(rand.email);
    setAgeText(String(rand.age));
    setPhone(rand.phone ?? '');
    setModalVisible(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('EDIT');
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setAgeText(String(user.age));
    setPhone(user.phone ?? '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    // small delay optional: clear fields to avoid flash on next open
    setTimeout(() => {
      setName('');
      setEmail('');
      setAgeText('');
      setPhone('');
      setEditingUserId(null);
    }, 200);
  };

  // CRUD operations
  const handleSave = async () => {
    if (!isFormValid) {
      Alert.alert('Invalid input', 'Please provide a valid name, email, and age.');
      return;
    }

    const payload: User = {
      id: modalMode === 'EDIT' && editingUserId ? editingUserId : `u_${Date.now()}_${randomInt(1000, 9999)}`,
      name: name.trim(),
      email: email.trim(),
      age: Number(ageText),
      phone: phone.trim() || undefined,
    };

    let next: User[];
    if (modalMode === 'EDIT') {
      next = users.map((u) => (u.id === payload.id ? payload : u));
    } else {
      // add to top
      next = [payload, ...users];
    }

    setUsers(next);
    await persistUsers(next);
    closeModal();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete user', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const next = users.filter((u) => u.id !== id);
          setUsers(next);
          await persistUsers(next);
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear all', 'Remove all users from storage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setUsers([]);
          await persistUsers([]);
        },
      },
    ]);
  };

  // quick action: autofill modal with new random data while modal open
  const autofillRandom = () => {
    const rand = generateRandomUser();
    setName(rand.name);
    setEmail(rand.email);
    setAgeText(String(rand.age));
    setPhone(rand.phone ?? '');
  };

  // render item
  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.email}</Text>
          <Text style={styles.cardSmall}>
            Age: {item.age} • {item.phone ?? '—'}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => openEditModal(item)}>
            <Text style={styles.iconButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: '#ffe6e6' }]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={[styles.iconButtonText, { color: '#b00020' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={openAddModal}>
            <Text style={styles.headerButtonText}>+ Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.headerButton, styles.secondary]} onPress={handleClearAll}>
            <Text style={[styles.headerButtonText, { color: '#333' }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        contentContainerStyle={users.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No users yet. Tap "Add" to create one.</Text>
          </View>
        }
      />

      {/* Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={styles.modalTitle}>{modalMode === 'ADD' ? 'Add User' : 'Edit User'}</Text>

              <TextInput
                style={styles.input}
                placeholder="Full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Age"
                value={ageText}
                onChangeText={(t) => setAgeText(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone (optional)"
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
              />

              <View style={styles.modalRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f5f6f8' }]} onPress={autofillRandom}>
                  <Text style={[styles.actionBtnText, { color: '#333' }]}>Autofill Random</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, isFormValid ? styles.primaryBtn : styles.disabledBtn]}
                  onPress={handleSave}
                  disabled={!isFormValid}
                >
                  <Text style={[styles.actionBtnText, isFormValid ? { color: '#fff' } : { color: '#aaa' }]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 8 }} />

              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// -----------------------------
// Styles
// -----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fb' },
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#111' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerButton: {
    backgroundColor: '#0f62fe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  headerButtonText: { color: '#fff', fontWeight: '600' },
  secondary: { backgroundColor: '#e8eefc' },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    // shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  cardSubtitle: { color: '#666', marginTop: 4 },
  cardSmall: { color: '#777', marginTop: 6, fontSize: 12 },

  cardActions: { flexDirection: 'column', justifyContent: 'space-between' },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eef6ff',
    marginBottom: 8,
    alignItems: 'center',
  },
  iconButtonText: { color: '#0f62fe', fontWeight: '600' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#666', fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.32)' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    maxHeight: '85%',
    // shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: '#e7e9ee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fbfbff',
  },

  modalRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 6 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  primaryBtn: { backgroundColor: '#0f62fe' },
  disabledBtn: { backgroundColor: '#f0f3ff' },
  actionBtnText: { fontWeight: '700', color: '#fff' },

  cancelBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  cancelBtnText: { fontWeight: '700', color: '#333' },
});
