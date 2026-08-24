import React, { useRef, useState } from 'react'
import { View, StyleSheet, Image, Alert } from 'react-native'
import { Text, Button, ActivityIndicator, SegmentedButtons } from 'react-native-paper'
import { CameraView, useCameraPermissions } from 'expo-camera'

const PrescriptionScanScreen = () => {
  const cameraRef = useRef(null)

  const [permission, requestPermission] = useCameraPermissions()
  const [scanType, setScanType] = useState('prescription')
  const [photo, setPhoto] = useState(null)

  // Wait while checking camera permission
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // Ask user for camera permission
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text variant="titleLarge">
          Camera Permission Required
        </Text>

        <Text style={styles.permissionText}>
          Camera access is needed to scan your prescription
          or medication label.
        </Text>

        <Button
          mode="contained"
          icon="camera"
          onPress={requestPermission}
        >
          Allow Camera
        </Button>
      </View>
    )
  }

  // Take photo
  const takePhoto = async () => {
    try {
      if (!cameraRef.current) {
        return
      }

      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      })

      setPhoto(picture.uri)
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Camera Error',
        'Unable to take photo.'
      )
    }
  }

  // Retake photo
  const retakePhoto = () => {
    setPhoto(null)
  }

  // For now just test the captured image
  const usePhoto = () => {
    console.log('Photo:', photo)
    console.log('Scan Type:', scanType)

    Alert.alert(
      'Photo Ready',
      'The next step will send this image to AI for analysis.'
    )
  }

  // PHOTO PREVIEW
  if (photo) {
    return (
      <View style={styles.previewContainer}>
        <Text
          variant="headlineMedium"
          style={styles.previewTitle}
        >
          Review Photo
        </Text>

        <Text style={styles.previewSubtitle}>
          Make sure the medication information is clear and readable.
        </Text>

        <Image
          source={{ uri: photo }}
          style={styles.previewImage}
        />

        <Button
          mode="contained"
          icon="check"
          onPress={usePhoto}
          style={styles.useButton}
          contentStyle={styles.buttonContent}
        >
          Use Photo
        </Button>

        <Button
          mode="outlined"
          icon="camera-retake"
          onPress={retakePhoto}
          style={styles.retakeButton}
          contentStyle={styles.buttonContent}
        >
          Retake
        </Button>
      </View>
    )
  }

  // CAMERA SCREEN
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      <View style={styles.overlay}>
        {/* Header */}
        <Text
          variant="headlineMedium"
          style={styles.cameraTitle}
        >
          Scan Medication
        </Text>

        <Text style={styles.cameraSubtitle}>
          Place your prescription or medication label within the frame
        </Text>

        {/* Scan type */}
        <SegmentedButtons
          value={scanType}
          onValueChange={setScanType}
          buttons={[
            {
              value: 'prescription',
              label: 'Prescription',
              icon: 'file-document-outline',
            },
            {
              value: 'medicine',
              label: 'Bottle / Box',
              icon: 'pill',
            },
          ]}
          style={styles.segment}
        />

        {/* Scan Frame */}
        <View style={styles.scanFrame}>
          <View
            style={[
              styles.corner,
              styles.topLeft,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.topRight,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.bottomLeft,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.bottomRight,
            ]}
          />
        </View>

        {/* Bottom Controls */}
        <View style={styles.cameraBottom}>
          <Text style={styles.tip}>
            Make sure the medication name, dosage, and instructions are clearly visible.
          </Text>

          <Button
            mode="contained"
            icon="camera"
            onPress={takePhoto}
            style={styles.captureButton}
            contentStyle={styles.captureButtonContent}
          >
            Scan
          </Button>
        </View>
      </View>
    </View>
  )
}

export default PrescriptionScanScreen

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  permissionText: {
    textAlign: 'center',
    marginVertical: 20,
  },

  // CAMERA

  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.30)',
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  cameraTitle: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  cameraSubtitle: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },

  segment: {
    marginTop: 25,
  },

  // SCAN FRAME

  scanFrame: {
    flex: 1,
    marginTop: 35,
    marginBottom: 30,
    position: 'relative',
  },

  corner: {
    position: 'absolute',
    width: 55,
    height: 55,
    borderColor: '#fff',
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 15,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 15,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 15,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 15,
  },

  // BOTTOM

  cameraBottom: {
    paddingBottom: 35,
  },

  tip: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.85,
  },

  captureButton: {
    borderRadius: 30,
    marginHorizontal: 60,
  },

  captureButtonContent: {
    height: 58,
  },

  // PREVIEW

  previewContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#F8F9FC',
  },

  previewTitle: {
    fontWeight: 'bold',
  },

  previewSubtitle: {
    marginTop: 5,
    opacity: 0.6,
  },

  previewImage: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
    backgroundColor: '#111',
    borderRadius: 15,
    marginVertical: 20,
  },

  useButton: {
    borderRadius: 10,
    marginBottom: 10,
  },

  retakeButton: {
    borderRadius: 10,
    marginBottom: 20,
  },

  buttonContent: {
    height: 52,
  },
})
