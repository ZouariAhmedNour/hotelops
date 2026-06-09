import React from "react";
import { View } from "react-native";

import AppButton from "../../../components/ui/AppButton";
import { styles } from "../styles/agentTaskDetail.styles";

type Props = {
  loading: boolean;

  showAccept: boolean;
  showStart: boolean;
  showPause: boolean;

  onAccept: () => void;
  onStart: () => void;
  onPause: () => void;
};

export default function AgentTaskActions({
  loading,
  showAccept,
  showStart,
  showPause,
  onAccept,
  onStart,
  onPause,
}: Props) {
  if (!showAccept && !showStart && !showPause) {
    return null;
  }

  return (
    <View style={styles.actions}>
      {showAccept && (
        <AppButton
          title="Accepter"
          onPress={onAccept}
          loading={loading}
          style={styles.actionButton}
        />
      )}

      {showStart && (
        <AppButton
          title="Démarrer"
          onPress={onStart}
          loading={loading}
          style={styles.actionButton}
        />
      )}

      {showPause && (
        <AppButton
          title="Pause"
          variant="secondary"
          onPress={onPause}
          loading={loading}
          style={styles.actionButton}
        />
      )}
    </View>
  );
}