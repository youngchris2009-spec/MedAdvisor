import React, { useRef, useState } from 'react'
import { View, StyleSheet, Image, Alert } from 'react-native'
import { Text, Button, ActivityIndicator, SegmentedButtons } from 'react-native-paper'
import { CameraView, useCameraPermissions } from 'expo-camera'

const PrescriptionScanScreen = ({navigation}) => {
  const cameraRef = useRef(null)

  const [permission, requestPermission] = useCameraPermissions()
  const [scanType, setScanType] = useState('prescription')
  const [photo, setPhoto] = useState(null)
    const [photoBase64, setPhotoBase64] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

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
      base64: true,
    })

    console.log('Picture URI:', picture.uri)
    console.log('Base64 exists:', !!picture.base64)
    console.log('Base64 length:', picture.base64?.length)

    setPhoto(picture.uri)
    setPhotoBase64(picture.base64)
  } catch (error) {
    console.log(error)
  }
}

  // Retake photo
  const retakePhoto = () => {
    setPhoto(null)
  }

  // For now just test the captured image
const usePhoto = async () => {
  try {
    console.log(
      'API KEY EXISTS:',
      !!process.env.EXPO_PUBLIC_OPENAI_API_KEY
    )

    console.log('PHOTO URI:', photo)
    console.log('BASE64 EXISTS:', !!photoBase64)
    console.log('BASE64 LENGTH:', photoBase64?.length)

    setLoading(true)

    const response = await fetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },

        body: JSON.stringify({
          model: 'gpt-5.6',

          input: [
            {
              role: 'user',

              content: [
                {
                  type: 'input_text',

                  text: `
Analyze this medication image.

Identify the medication from the image and provide
general medication information.

Return ONLY valid JSON in exactly this format:

{
  "name": "",
  "dosage": "",
  "frequency": "",
  "sideEffect": [],
  "time": [],
  "startDate": "",
  "thingsToAvoid": [],
  "bestWayToTake": [],
  "quantity": null
}

Rules:

- name should be the medication name visible in the image.
- dosage should only come from the image.
- frequency should only come from the prescription instructions.
- quantity should only come from the image.
- startDate should only be populated if visible.
- time should only contain times specifically indicated.
- sideEffect can contain common known side effects.
- thingsToAvoid can contain common medication precautions.
- bestWayToTake can contain general administration guidance.
- Do not guess missing prescription-specific information.
- Return JSON only. No markdown.
                  `,
                },

                {
                  type: 'input_image',

                  image_url:
                    `data:image/jpeg;base64,${photoBase64}`,
                },
              ],
            },
          ],
        }),
      }
    )

    console.log('STATUS:', response.status)

    const data = await response.json()

console.log('OPENAI FULL RESPONSE:')
console.log(JSON.stringify(data, null, 2))

if (!response.ok) {
  console.log('OPENAI ERROR:', data)

  Alert.alert(
    'Error',
    data?.error?.message ||
      'Unable to analyze medication.'
  )

  return
}

const messageOutput = data.output.find(
  item => item.type === 'message'
)

const outputText =
  messageOutput?.content?.find(
    item => item.type === 'output_text'
  )?.text

console.log('OUTPUT TEXT:', outputText)

if (!outputText) {
  throw new Error('No text returned from OpenAI')
}

const medication = JSON.parse(outputText)

console.log('MEDICATION OBJECT:')
console.log(medication)

navigation.navigate(
  'Medication Detail',
  {
    medication
  }
)
  }
  catch (error) {

    console.log(
      'USE PHOTO ERROR:',
      error
    )

    Alert.alert(
      'Error',
      'Unable to analyze medication.'
    )

  }
  finally {

    setLoading(false)

  }
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
