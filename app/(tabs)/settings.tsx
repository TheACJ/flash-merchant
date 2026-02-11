import React from "react";
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Your app settings will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: "SF Pro",
    fontWeight: "600",
    fontSize: 25,
    lineHeight: 30,
    color: "#000000",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "SF Pro",
    fontWeight: "400",
    fontSize: 16,
    color: "#657084",
    textAlign: "center",
  },
});
