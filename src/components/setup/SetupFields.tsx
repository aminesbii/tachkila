import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Field } from "@/components/ui/Field";
import { FormationPicker } from "@/components/setup/FormationPicker";
import { GAME_PLAYER_COUNTS } from "@/engine/formations";
import type { SetupValue } from "@/lib/setup";
import { normalizePlayerNames, previewSetup } from "@/lib/setup";
import { colors, radii, spacing } from "@/theme";

export function SetupFields({
  value,
  onChange,
  showFormation = true,
  showCount = true,
  showNames = true,
}: {
  value: SetupValue;
  onChange: (next: SetupValue) => void;
  showFormation?: boolean;
  showCount?: boolean;
  showNames?: boolean;
}) {
  const count = value.playerNames.length;
  const preview = previewSetup(value);

  function setCount(next: number) {
    onChange({ ...value, playerNames: normalizePlayerNames(value.playerNames, next) });
  }

  function setName(index: number, name: string) {
    onChange({
      ...value,
      playerNames: value.playerNames.map((current, i) => (i === index ? name.slice(0, 24) : current)),
    });
  }

  return (
    <View style={styles.wrap}>
      {showFormation ? (
        <View style={styles.block}>
          <AppText variant="label" color={colors.textMuted}>
            Formation
          </AppText>
          <FormationPicker value={value.formationKey} onChange={(key) => onChange({ ...value, formationKey: key })} />
          <AppText variant="caption" color={colors.textDim}>
            {preview.slots} slots per squad — every manager drafts a full XI.
          </AppText>
        </View>
      ) : null}

      {showCount ? (
        <View style={styles.block}>
          <AppText variant="label" color={colors.textMuted}>
            Managers around the table
          </AppText>
          <View style={styles.countRow}>
            {GAME_PLAYER_COUNTS.map((option) => {
              const selected = option === count;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option} managers`}
                  onPress={() => setCount(option)}
                  style={({ pressed }) => [
                    styles.countChip,
                    selected && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <AppText
                    variant={selected ? "heading" : "bodyStrong"}
                    color={selected ? colors.primary : colors.text}
                  >
                    {option}
                  </AppText>
                </Pressable>
              );
            })}
            <View style={styles.poolBadge}>
              <Ionicons name="football-outline" size={13} color={colors.gold} />
              <AppText variant="caption" color={colors.gold} style={styles.poolText}>
                {preview.pool} players
              </AppText>
            </View>
          </View>
        </View>
      ) : null}

      {showNames ? (
        <View style={styles.block}>
          <AppText variant="label" color={colors.textMuted}>
            Names
          </AppText>
          <View style={styles.names}>
            {value.playerNames.map((name, index) => (
              <View key={index} style={styles.nameField}>
                <View style={styles.seatNumber}>
                  <AppText style={styles.seatText}>{index + 1}</AppText>
                </View>
                <Field
                  value={name}
                  onChangeText={(text) => setName(index, text)}
                  placeholder={`Manager ${index + 1}`}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  maxLength={24}
                  style={styles.input}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <AppText variant="caption" color={colors.textDim}>
            Goalkeepers
          </AppText>
          <AppText variant="bodyStrong">{preview.breakdown.GK}</AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText variant="caption" color={colors.textDim}>
            Defenders
          </AppText>
          <AppText variant="bodyStrong">{preview.breakdown.DEF}</AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText variant="caption" color={colors.textDim}>
            Midfielders
          </AppText>
          <AppText variant="bodyStrong">{preview.breakdown.MID}</AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText variant="caption" color={colors.textDim}>
            Forwards
          </AppText>
          <AppText variant="bodyStrong">{preview.breakdown.FWD}</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xxl,
  },
  block: {
    gap: spacing.sm,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  countChip: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  poolBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: "auto",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.goldSoft,
  },
  poolText: {
    fontSize: 11,
  },
  names: {
    gap: spacing.sm,
  },
  nameField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  seatNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  seatText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
  },
  input: {
    flex: 1,
  },
  summary: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
});
