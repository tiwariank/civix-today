import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import { launchImageLibrary } from "react-native-image-picker";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Icon from "@react-native-vector-icons/Feather"; // or any other icon set

// ------------------------------------------------------------------
// Validation schema
// ------------------------------------------------------------------
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),
  bio: yup.string().max(200, "Bio must be ≤ 200 chars"),
});

// ------------------------------------------------------------------
// Helper: simple TextInput wrapper (you can replace with your own UI lib)
// ------------------------------------------------------------------
const Input = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
}: any) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View
      style={[
        styles.inputContainer,
        error ? styles.inputError : null,
        multiline ? { height: numberOfLines * 40 } : null,
      ]}
    >
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
    {error && <Text style={styles.errorText}>{error.message}</Text>}
  </View>
);

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
export default function ProfileEditScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      bio: "",
    },
  });

  // ----------------------------------------------------------------
  // Image picker (gallery only – you can add camera easily)
  // ----------------------------------------------------------------
  const pickImage = () => {
    const options: any = {
      mediaType: "photo",
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled");
      } else if (response.errorCode) {
        Alert.alert("Error", response.errorMessage ?? "Unknown error");
      } else if (response.assets && response.assets[0]) {
        setAvatarUri(response.assets[0].uri ?? null);
      }
    });
  };

  // ----------------------------------------------------------------
  // Save handler – replace with your API call
  // ----------------------------------------------------------------
  const onSave = (data: any) => {
    console.log("Saved:", { ...data, avatarUri });
    Alert.alert("Success", "Profile updated!");
    setModalVisible(false);
    reset();
    setAvatarUri(null);
  };

  // ----------------------------------------------------------------
  // UI
  // ----------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Header with edit icon */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.iconBtn}
        >
          <Icon name="edit-3" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={styles.modalTitle}>Edit Profile</Text>

            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Icon name="user" size={40} color="#aaa" />
                </View>
              )}
              <TouchableOpacity onPress={pickImage} style={styles.changeBtn}>
                <Text style={styles.changeText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Form fields */}
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  label="Full Name"
                  {...field}
                  error={errors.name}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  label="Email"
                  keyboardType="email-address"
                  {...field}
                  error={errors.email}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  label="Phone"
                  keyboardType="phone-pad"
                  {...field}
                  error={errors.phone}
                />
              )}
            />

            <Controller
              control={control}
              name="bio"
              render={({ field }) => (
                <Input
                  label="Bio (optional)"
                  multiline
                  numberOfLines={4}
                  {...field}
                  error={errors.bio}
                />
              )}
            />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.saveBtn]}
                onPress={handleSubmit(onSave)}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ------------------------------------------------------------------
// Styles (feel free to adapt to your design system)
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: "600" },
  iconBtn: { padding: 8 },

  // Modal
  modal: { margin: 0, justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  modalTitle: { fontSize: 20, fontWeight: "600", marginBottom: 16 },

  // Avatar
  avatarContainer: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  changeBtn: { marginTop: 8 },
  changeText: { color: "#007AFF", fontSize: 15 },

  // Form
  field: { marginBottom: 16 },
  label: { marginBottom: 4, fontSize: 14, color: "#333" },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "#d32f2f" },
  input: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  errorText: { color: "#d32f2f", fontSize: 12, marginTop: 4 },

  // Buttons
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, marginHorizontal: 6 },
  cancelBtn: { backgroundColor: "#eee" },
  cancelBtnText: { textAlign: "center", color: "#333", fontWeight: "600" },
  saveBtn: { backgroundColor: "#007AFF" },
  saveBtnText: { textAlign: "center", color: "#fff", fontWeight: "600" },
});

// Simple TextInput shim (React Native core)
const TextInput = (props: any) => {
  const { style, ...rest } = props;
  return <View style={style}>
    {/* <android.widget.EditText {...rest} /> */}
  </View>;
};