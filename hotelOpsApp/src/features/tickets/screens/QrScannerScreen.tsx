import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { Feather } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import { extractQrToken } from "../utils/qrToken";
import { publicQrService } from "../api/publicQrService";

export default function QrScannerScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScan = async (result: BarcodeScanningResult) => {
    if (scanned || loading) return;

    const token = extractQrToken(result.data);

    if (!token) {
      Alert.alert("QR invalide", "Ce QR code ne contient pas un token valide.");
      return;
    }

    try {
      setScanned(true);
      setLoading(true);

      const qrInfo = await publicQrService.getQrInfo(token);

      navigation.navigate("PublicCreateTicket", {
        token,
        qrInfo,
      });
    } catch (error: any) {
      console.log("QR SCAN ERROR =", error?.response?.data || error.message);

      Alert.alert(
        "QR invalide",
        "Ce QR code est désactivé, expiré ou incorrect.",
        [
          {
            text: "Réessayer",
            onPress: () => setScanned(false),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <View style={styles.permissionIcon}>
          <Feather name="camera" size={34} color={colors.primary} />
        </View>

        <Text style={styles.title}>Scanner un QR code</Text>

        <Text style={styles.subtitle}>
          Autorise l’accès à la caméra pour scanner le QR code de la chambre ou
          de la zone.
        </Text>

        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Autoriser la caméra</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.kicker}>SCAN QR</Text>
          <Text style={styles.titleWhite}>Scanner la localisation</Text>
          <Text style={styles.subtitleWhite}>
            Place le QR code dans le cadre pour détecter automatiquement
            l’endroit.
          </Text>
        </View>

        <View style={styles.scanFrame} />

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.white} />
            <Text style={styles.loadingText}>Vérification du QR...</Text>
          </View>
        )}

        {scanned && !loading && (
          <Pressable
            style={styles.retryButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.retryText}>Scanner à nouveau</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },

  camera: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 36,
    justifyContent: "space-between",
  },

  header: {
    alignItems: "center",
  },

  kicker: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },

  titleWhite: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitleWhite: {
    marginTop: 10,
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },

  scanFrame: {
    alignSelf: "center",
    width: 260,
    height: 260,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  loadingBox: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    backgroundColor: "rgba(19,35,75,0.9)",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  loadingText: {
    color: colors.white,
    fontWeight: "700",
  },

  retryButton: {
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },

  retryText: {
    color: colors.primary,
    fontWeight: "800",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  permissionScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: colors.background,
  },

  permissionIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.primary,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: colors.mutedLight,
    textAlign: "center",
    lineHeight: 22,
  },

  button: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },

  buttonText: {
    color: colors.white,
    fontWeight: "800",
  },
});