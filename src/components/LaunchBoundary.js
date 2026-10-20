import React from "react";
import { Text, View } from "react-native";
import { Sentry } from "../sentry.js";

export class LaunchBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    Sentry.captureException(error, { contexts: { react: { componentStack: info && info.componentStack } } });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: "#000000", alignItems: "center", justifyContent: "center", padding: 28 }}>
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800" }}>LumenFit</Text>
        <Text style={{ color: "#8a8a8a", marginTop: 12, textAlign: "center", fontSize: 15, lineHeight: 22 }}>
          Reinicie o app para continuar.
        </Text>
      </View>
    );
  }
}
