// src/components/ImagePickerComponent.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import type { ImagePickerResponse, Asset } from 'react-native-image-picker';
import { launchCamera, launchImageLibrary, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';

/**
 * Types
 */
export type SelectedImage = {
  uri: string;
  fileName?: string | null;
  fileSize?: number | null;
  type?: string | null;
  width?: number | null;
  height?: number | null;
  base64?: string | undefined; // only if requested
};

type Props = {
  /**
   * Called when an image is selected (or null when removed)
   */
  onImageSelected?: (img: SelectedImage | null) => void;

  /**
   * Maximum image file size in bytes (optional). If image is bigger, user will be alerted.
   */
  maxFileSizeBytes?: number;

  /**
   * Allow editing/cropping? (image-picker's "cropping" is limited across platforms; some options available)
   */
  includeBase64?: boolean;
};

/**
 * ImagePickerComponent
 *
 * Buttons:
 *  - Take Photo (camera)
 *  - Choose from Library
 *  - Remove
 *
 * Preview shows selected image (scaled to container) and basic metadata.
 */
export const ImagePickerComponent: React.FC<Props> = ({ onImageSelected, maxFileSizeBytes = 5 * 1024 * 1024, includeBase64 = false }) => {
  const [selected, setSelected] = useState<SelectedImage | null>(null);
  const [loading, setLoading] = useState(false);

  // Options
  const commonOptions: CameraOptions & ImageLibraryOptions = {
    mediaType: 'photo',
    includeBase64: includeBase64,
    saveToPhotos: true,
    quality: 0.8, // 0 .. 1 (reduce file size)
  };

  const handleResponse = (res: ImagePickerResponse) => {
    setLoading(false);
    if (res.didCancel) {
      return;
    }
    if (res.errorCode) {
      Alert.alert('Error', res.errorMessage ?? 'Unknown error selecting image');
      return;
    }

    const asset: Asset | undefined = res.assets && res.assets.length > 0 ? res.assets[0] : undefined;
    if (!asset || !asset.uri) {
      Alert.alert('Error', 'No image returned from picker');
      return;
    }

    // file size check
    if (maxFileSizeBytes && asset.fileSize && asset.fileSize > maxFileSizeBytes) {
      Alert.alert('File too large', `Image is ${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB. Max allowed ${(maxFileSizeBytes / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }

    const img: SelectedImage = {
      uri: asset.uri,
      fileName: asset.fileName ?? null,
      fileSize: asset.fileSize ?? null,
      type: asset.type ?? null,
      width: asset.width ?? null,
      height: asset.height ?? null,
      base64: asset.base64,
    };

    setSelected(img);
    onImageSelected?.(img);
  };

  const onLaunchCamera = async () => {
    setLoading(true);
    try {
      // on Android camera permission is requested automatically by the library
      const options: CameraOptions = { ...commonOptions };
      launchCamera(options, handleResponse);
    } catch (err) {
      setLoading(false);
      console.error('launchCamera error', err);
      Alert.alert('Error', 'Could not open camera');
    }
  };

  const onLaunchLibrary = async () => {
    setLoading(true);
    try {
      const options: ImageLibraryOptions = { ...commonOptions };
      launchImageLibrary(options, handleResponse);
    } catch (err) {
      setLoading(false);
      console.error('launchImageLibrary error', err);
      Alert.alert('Error', 'Could not open image library');
    }
  };

  const onRemove = () => {
    Alert.alert('Remove photo', 'Remove the selected photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setSelected(null);
          onImageSelected?.(null);
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.label}>Photo</Text>

      <View style={styles.previewBox}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : selected ? (
          <Image source={{ uri: selected.uri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No photo selected</Text>
          </View>
        )}
      </View>

      {selected && (
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{selected.fileName ?? 'Image'}</Text>
          <Text style={styles.metaText}>
            {selected.fileSize ? `${(selected.fileSize / 1024).toFixed(0)} KB` : `${selected.width ?? '-'}x${selected.height ?? '-'}`}
          </Text>
        </View>
      )}

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.button} onPress={onLaunchCamera}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onLaunchLibrary}>
          <Text style={styles.buttonText}>Choose from Library</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <TouchableOpacity
          style={[styles.actionSmall, { backgroundColor: selected ? '#ff4d4f' : '#ddd' }]}
          onPress={onRemove}
          disabled={!selected}
        >
          <Text style={[styles.actionSmallText, { color: selected ? '#fff' : '#666' }]}>Remove</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionSmall, { backgroundColor: selected ? '#0f62fe' : '#ddd' }]}
          onPress={() => {
            if (!selected) {
              Alert.alert('No image', 'Please select or capture an image first.');
              return;
            }
            // Example: you might upload here or pass to parent via onImageSelected (already called)
            Alert.alert('Image ready', 'Image is selected and ready to be uploaded.');
          }}
          disabled={!selected}
        >
          <Text style={[styles.actionSmallText, { color: selected ? '#fff' : '#666' }]}>Use Image</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Tip: images are compressed by quality setting. To include base64, pass <Text style={{ fontWeight: '700' }}>includeBase64</Text> prop.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { marginVertical: 12 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#111' },

  previewBox: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f2f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#888' },

  image: { width: '100%', height: '100%' },

  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  metaText: { color: '#666', fontSize: 12 },

  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#e6e8ee',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: { color: '#0f62fe', fontWeight: '700' },

  actionSmall: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
  },
  actionSmallText: { fontWeight: '700' },

  hint: { marginTop: 10, fontSize: 12, color: '#888' },
});
