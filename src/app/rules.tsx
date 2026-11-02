import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppHeader } from "@/components/ui/AppHeader";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { colors, radii, spacing } from "@/theme";

const FLOW: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: "people",
    title: "Set the table",
    body: "Two to six managers share one phone. Pick a formation — every manager drafts the same eleven — and give everyone a name.",
  },
  {
    icon: "megaphone",
    title: "Call the next name",
    body: "The app shows one footballer at a time: goalkeeper first, then defenders, midfielders and finally forwards. Every manager can see the squad, bank and points.",
  },
  {
    icon: "hand-left",
    title: "Shout the bid",
    body: "Bids happen out loud. There is no timer and no automatic bidding: the room decides its own pace.",
  },
  {
    icon: "hammer",
    title: "Record the sale",
    body: "Tap Sell player, pick the manager who won, then type the final price on the number pad. Bank points are deducted instantly.",
  },
  {
    icon: "trophy",
    title: "Crown the champion",
    body: "When the pool is empty, the manager with the most team points wins. Ties break on bank points left, then seat order.",
  },
];

const LIMITS = [
  "A manager can never bid more than their remaining bank points.",
  "A squad can never hold more players than its formation allows at that position.",
  "A manager only has one slot per position group — overspend and you may run out of room.",
  "Passing marks the footballer unsold. He leaves the draft for good.",
];

export default function RulesScreen() {
  const router = useRouter();

  return (
    <Screen header={<AppHeader title="How to play" subtitle="Auction night, in five beats" onBack={() => router.back()} />}>
      <Card tone="alt" style={styles.intro}>
        <Ionicons name="football-outline" size={20} color={colors.primary} />
        <AppText variant="body" color={colors.textMuted} style={{ flex: 1 }}>
          Tachkila is a live auction draft for one phone. Everybody bids by voice, one host taps the results, and
          the app keeps every squad and every point.
        </AppText>
      </Card>

      <View style={styles.flow}>
        {FLOW.map((item, index) => (
          <View key={item.title} style={styles.step}>
            <View style={styles.stepRail}>
              <View style={styles.stepIcon}>
                <Ionicons name={item.icon} size={17} color={colors.primary} />
              </View>
              {index < FLOW.length - 1 ? <View style={styles.stepLine} /> : null}
            </View>
            <View style={styles.stepBody}>
              <AppText variant="bodyStrong">{item.title}</AppText>
              <AppText variant="caption" color={colors.textMuted} style={styles.stepText}>
                {item.body}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.block}>
        <SectionTitle>The rules that matter</SectionTitle>
        <Card style={styles.list}>
          {LIMITS.map((rule) => (
            <View key={rule} style={styles.rule}>
              <View style={styles.bullet} />
              <AppText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
                {rule}
              </AppText>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.block}>
        <SectionTitle>Points</SectionTitle>
        <View style={styles.pointsRow}>
          {[
            { pts: 4, label: "World class" },
            { pts: 3, label: "Elite" },
            { pts: 2, label: "Solid" },
            { pts: 1, label: "Squad" },
          ].map((row) => (
            <View key={row.pts} style={styles.pointCard}>
              <View
                style={[
                  styles.pointBadge,
                  {
                    backgroundColor:
                      row.pts === 4
                        ? colors.gold
                        : row.pts === 3
                          ? colors.primary
                          : row.pts === 2
                            ? colors.info
                            : colors.textMuted,
                  },
                ]}
              >
                <AppText style={styles.pointValue}>{row.pts}</AppText>
              </View>
              <AppText variant="caption" color={colors.textMuted} style={styles.pointLabel}>
                {row.label}
              </AppText>
            </View>
          ))}
        </View>
        <AppText variant="caption" color={colors.textDim}>
          Each footballer is worth their printed points. A full squad of bargains can beat a squad of stars.
        </AppText>
      </View>

      <View style={styles.block}>
        <SectionTitle>Good to know</SectionTitle>
        <Card style={styles.list}>
          <View style={styles.rule}>
            <Ionicons name="save-outline" size={15} color={colors.textDim} />
            <AppText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
              Every action is saved automatically on this phone. Close the app mid-auction and come straight
              back.
            </AppText>
          </View>
          <View style={styles.rule}>
            <Ionicons name="arrow-undo-outline" size={15} color={colors.textDim} />
            <AppText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
              Tapped the wrong manager? Open the game menu and undo the last move. The last twelve actions are
              kept.
            </AppText>
          </View>
          <View style={styles.rule}>
            <Ionicons name="shuffle" size={15} color={colors.textDim} />
            <AppText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
              Redrawing the pool clears every sale and deals a fresh set of footballers. Managers and the
              formation stay put.
            </AppText>
          </View>
        </Card>
      </View>

      <AppText variant="caption" color={colors.textDim} align="center" style={styles.footer}>
        Built for the table, not the cloud.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  flow: {
    gap: spacing.lg,
  },
  step: {
    flexDirection: "row",
    gap: spacing.md,
  },
  stepRail: {
    alignItems: "center",
    width: 34,
  },
  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(56,225,160,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: {
    flex: 1,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
    marginVertical: 4,
  },
  stepBody: {
    flex: 1,
    gap: 2,
    paddingTop: 6,
    paddingBottom: spacing.sm,
  },
  stepText: {
    lineHeight: 19,
  },
  block: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  rule: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  pointsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pointCard: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  pointValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#07100C",
  },
  pointLabel: {
    fontSize: 10,
  },
  footer: {
    marginTop: spacing.sm,
  },
});
