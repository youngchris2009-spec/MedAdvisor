import React, { useRef, useState } from 'react'
import { View, StyleSheet, Image, Alert, ScrollView } from 'react-native'
import { Text, Button, ActivityIndicator, SegmentedButtons, Card, TextInput } from 'react-native-paper'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

import { db, auth } from '../firebase'


const PrescriptionScanScreen = () => {

  const cameraRef = useRef(null)

  const [permission, requestPermission] =
    useCameraPermissions()

  const [scanType, setScanType] =
    useState('prescription')

  const [photo, setPhoto] =
    useState(null)

  const [analyzing, setAnalyzing] =
    useState(false)

  const [result, setResult] =
    useState(null)

  const [saving, setSaving] =
    useState(false)


  /*
   * CAMERA PERMISSION
   */

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    )
  }


  if (!permission.granted) {

    return (
      <View style={styles.center}>

        <Text variant="titleLarge">
          Camera Permission Required
        </Text>

        <Text
          style={{
            textAlign: 'center',
            marginVertical: 15
          }}
        >
          We need camera access to scan your
          prescription or medication label.
        </Text>

        <Button
          mode="contained"
          onPress={requestPermission}
        >
          Allow Camera
        </Button>

      </View>
    )
  }


  /*
   * TAKE PHOTO
   */

  const takePhoto = async () => {

    try {

      if (!cameraRef.current) {
        return
      }

      const picture =
        await cameraRef.current.takePictureAsync({
          quality: 0.8
        })

      setPhoto(picture.uri)

      setResult(null)

    } catch (error) {

      console.log(error)

      Alert.alert(
        'Camera Error',
        'Unable to take photo.'
      )
    }
  }


  /*
   * ANALYZE IMAGE
   */

  const analyzePhoto = async () => {

    if (!photo) {
      return
    }

    try {

      setAnalyzing(true)

      const formData = new FormData()

      formData.append(
        'image',
        {
          uri: photo,
          name: 'prescription.jpg',
          type: 'image/jpeg'
        }
      )

      formData.append(
        'scanType',
        scanType
      )


      /*
       * Replace this URL with
       * your backend / Firebase function URL
       */

      const response = await fetch(
        'https://YOUR-BACKEND.com/analyze-prescription',
        {
          method: 'POST',
          body: formData
        }
      )


      if (!response.ok) {
        throw new Error(
          'Prescription analysis failed'
        )
      }


      const data = await response.json()


      /*
       * Expected AI result:
       *
       * {
       *   medicationName: "",
       *   strength: "",
       *   dosage: "",
       *   frequency: "",
       *   instructions: "",
       *   duration: "",
       *   quantity: "",
       *   refills: "",
       *   prescriber: ""
       * }
       */


      setResult({
        medicationName:
          data.medicationName || '',

        strength:
          data.strength || '',

        dosage:
          data.dosage || '',

        frequency:
          data.frequency || '',

        instructions:
          data.instructions || '',

        duration:
          data.duration || '',

        quantity:
          data.quantity?.toString() || '',

        refills:
          data.refills?.toString() || '',

        prescriber:
          data.prescriber || '',

        confidence:
          data.confidence || null
      })


    } catch (error) {

      console.log(error)

      Alert.alert(
        'Analysis Error',
        'Unable to analyze the prescription.'
      )

    } finally {

      setAnalyzing(false)
    }
  }


  /*
   * UPDATE RESULT
   */

  const updateField =
    (field, value) => {

      setResult(prev => ({
        ...prev,
        [field]: value
      }))
    }


  /*
   * SAVE FIREBASE
   */

  const saveMedication = async () => {

    if (!result?.medicationName) {

      Alert.alert(
        'Medication Name Required',
        'Please enter the medication name.'
      )

      return
    }


    try {

      setSaving(true)

      const userID =
        auth.currentUser?.uid


      if (!userID) {

        Alert.alert(
          'Login Required',
          'Please login before saving medication.'
        )

        return
      }


      await addDoc(
        collection(db, 'medications'),
        {

          userID,

          name:
            result.medicationName,

          strength:
            result.strength,

          dosage:
            result.dosage,

          frequency:
            result.frequency,

          instructions:
            result.instructions,

          duration:
            result.duration,

          quantity:
            result.quantity
              ? Number(result.quantity)
              : null,

          refills:
            result.refills
              ? Number(result.refills)
              : 0,

          prescriber:
            result.prescriber,

          sideEffects: [],

          times: [],

          thingsToAvoid: [],

          bestWayToTake: [],

          startDate: null,

          endDate: null,

          prescriptionSource:
            'scan',

          scanType,

          aiConfidence:
            result.confidence,

          createdAt:
            serverTimestamp()
        }
      )


      Alert.alert(
        'Saved',
        'Medication has been saved.'
      )


      setPhoto(null)
      setResult(null)


    } catch (error) {

      console.log(error)

      Alert.alert(
        'Save Error',
        'Unable to save medication.'
      )

    } finally {

      setSaving(false)
    }
  }


  /*
   * REVIEW SCREEN
   */

  if (result) {

    return (

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 40
        }}
      >

        <Text
          variant="headlineMedium"
          style={styles.title}
        >
          Review Medication
        </Text>

        <Text
          variant="bodyMedium"
          style={styles.subtitle}
        >
          Verify the information before saving.
        </Text>


        {photo && (

          <Image
            source={{ uri: photo }}
            style={styles.previewSmall}
          />

        )}


        <Card style={styles.reviewCard}>

          <Card.Content>


            <TextInput
              mode="outlined"
              label="Medication Name"
              value={
                result.medicationName
              }
              onChangeText={value =>
                updateField(
                  'medicationName',
                  value
                )
              }
              style={styles.input}
            />


            <TextInput
              mode="outlined"
              label="Strength"
              placeholder="500 mg"
              value={
                result.strength
              }
              onChangeText={value =>
                updateField(
                  'strength',
                  value
                )
              }
              style={styles.input}
            />


            <TextInput
              mode="outlined"
              label="Dosage"
              placeholder="1 tablet"
              value={
                result.dosage
              }
              onChangeText={value =>
                updateField(
                  'dosage',
                  value
                )
              }
              style={styles.input}
            />


            <TextInput
              mode="outlined"
              label="Frequency"
              placeholder="Twice daily"
              value={
                result.frequency
              }
              onChangeText={value =>
                updateField(
                  'frequency',
                  value
                )
              }
              style={styles.input}
            />


            <TextInput
              mode="outlined"
              label="Instructions"
              value={
                result.instructions
              }
              onChangeText={value =>
                updateField(
                  'instructions',
                  value
                )
              }
              multiline
              style={styles.input}
            />


            <TextInput
              mode="outlined"
              label="Duration"
              placeholder="7 days"
              value={
                result.duration
              }
              onChangeText={value =>
                updateField(
                  'duration',
                  value
                )
              }
              style={styles.input}
            />


            <View style={styles.row}>

              <TextInput
                mode="outlined"
                label="Quantity"
                keyboardType="numeric"
                value={
                  result.quantity
                }
                onChangeText={value =>
                  updateField(
                    'quantity',
                    value
                  )
                }
                style={styles.halfInput}
              />


              <TextInput
                mode="outlined"
                label="Refills"
                keyboardType="numeric"
                value={
                  result.refills
                }
                onChangeText={value =>
                  updateField(
                    'refills',
                    value
                  )
                }
                style={styles.halfInput}
              />

            </View>


            <TextInput
              mode="outlined"
              label="Prescriber"
              value={
                result.prescriber
              }
              onChangeText={value =>
                updateField(
                  'prescriber',
                  value
                )
              }
              style={styles.input}
            />


          </Card.Content>

        </Card>


        <Button
          mode="contained"
          loading={saving}
          disabled={saving}
          onPress={saveMedication}
          style={styles.saveButton}
          contentStyle={{
            height: 52
          }}
        >
          Save Medication
        </Button>


        <Button
          mode="text"
          onPress={() =>
            setResult(null)
          }
        >
          Back to Photo
        </Button>

      </ScrollView>
    )
  }


  /*
   * PHOTO PREVIEW
   */

  if (photo) {

    return (

      <View style={styles.container}>

        <Text
          variant="headlineMedium"
          style={styles.title}
        >
          Review Photo
        </Text>


        <Image
          source={{ uri: photo }}
          style={styles.preview}
        />


        <Button
          mode="contained"
          icon="auto-fix"
          loading={analyzing}
          disabled={analyzing}
          onPress={analyzePhoto}
          style={styles.analyzeButton}
          contentStyle={{
            height: 52
          }}
        >
          {analyzing
            ? 'Analyzing...'
            : 'Analyze Prescription'}
        </Button>


        <Button
          mode="outlined"
          icon="camera-retake"
          onPress={() =>
            setPhoto(null)
          }
        >
          Retake Photo
        </Button>

      </View>
    )
  }


  /*
   * CAMERA SCREEN
   */

  return (

    <View style={styles.cameraContainer}>

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />


      <View style={styles.overlay}>


        <Text
          variant="headlineMedium"
          style={styles.cameraTitle}
        >
          Scan Medication
        </Text>


        <Text
          style={styles.cameraSubtitle}
        >
          Place the prescription or medication
          label inside the frame.
        </Text>


        <SegmentedButtons
          value={scanType}
          onValueChange={setScanType}
          buttons={[
            {
              value: 'prescription',
              label: 'Prescription'
            },
            {
              value: 'medicine',
              label: 'Bottle / Box'
            }
          ]}
          style={styles.segment}
        />


        <View style={styles.scanFrame}>

          <View style={[
            styles.corner,
            styles.topLeft
          ]} />

          <View style={[
            styles.corner,
            styles.topRight
          ]} />

          <View style={[
            styles.corner,
            styles.bottomLeft
          ]} />

          <View style={[
            styles.corner,
            styles.bottomRight
          ]} />

        </View>


        <View style={styles.cameraBottom}>

          <Button
            mode="contained"
            icon="camera"
            onPress={takePhoto}
            contentStyle={{
              height: 58
            }}
            style={styles.captureButton}
          >
            Scan
          </Button>


          <Text style={styles.tip}>
            Make sure the medication name and
            instructions are clearly visible.
          </Text>

        </View>

      </View>

    </View>
  )
}


export default PrescriptionScanScreen


const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#F8F9FC'
  },


  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30
  },


  title: {
    fontWeight: 'bold'
  },


  subtitle: {
    marginTop: 5,
    marginBottom: 15,
    opacity: 0.65
  },


  input: {
    marginVertical: 5
  },


  row: {
    flexDirection: 'row',
    gap: 8
  },


  halfInput: {
    flex: 1,
    marginVertical: 5
  },


  preview: {
    width: '100%',
    height: 500,
    resizeMode: 'contain',
    borderRadius: 15,
    marginVertical: 20,
    backgroundColor: '#111'
  },


  previewSmall: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    borderRadius: 12,
    backgroundColor: '#111',
    marginBottom: 15
  },


  reviewCard: {
    borderRadius: 15,
    marginBottom: 15
  },


  analyzeButton: {
    marginBottom: 10
  },


  saveButton: {
    marginTop: 10,
    borderRadius: 10
  },


  /* CAMERA */


  cameraContainer: {
    flex: 1,
    backgroundColor: '#000'
  },


  overlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.35)',
    paddingHorizontal: 20,
    paddingTop: 60
  },


  cameraTitle: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold'
  },


  cameraSubtitle: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.9
  },


  segment: {
    marginTop: 20
  },


  scanFrame: {
    height: 380,
    marginTop: 35,
    position: 'relative'
  },


  corner: {
    position: 'absolute',
    width: 55,
    height: 55,
    borderColor: '#FFF'
  },


  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 15
  },


  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 15
  },


  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 15
  },


  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 15
  },


  cameraBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 35
  },


  captureButton: {
    borderRadius: 30,
    marginHorizontal: 60
  },


  tip: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 15,
    opacity: 0.8
  }

})
