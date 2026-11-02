import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppHeader } from "@/components/ui/AppHeader";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { FormationPicker } from "@/components/setup/FormationPicker";
import { SetupFields } from "@/components/setup/SetupFields";
import { StepDots } from "@/components/setup/StepDots";
import { PitchDiagram } from "@/components/game/PitchDiagram";
import { MAX_GAME_PLAYERS, MIN_GAME_PLAYERS } from "@/engine/formations";
import { isGameError } from "@/engine/room-reducer";
import type { Position } from "@/engine/types";
import { hapticSelect, hapticSuccess, hapticWarning } from "@/lib/feedback";
import { defaultSetup, previewSetup, type SetupValue } from "@/lib/setup";
import { roomRepository } from "@/storage/async-storage";
import { colors, radii, spacing } from "@/theme";

const STEPS = [
  { title: "Who's playing?", subtitle: "Between 2 and 6 managers share one phone." },
  { title: "Pick a shape", subtitle: "Every manager drafts the same formation." },
  { title: "Ready to bid", subtitle: "Check the table, then open the auction." },
];

function validateManagers(names: string[]): string | null {
  if (names.length < MIN_GAME_PLAYERS) return `Add at least ${MIN_GAME_PLAYERS} managers.`;
  if (names.length > MAX_GAME_PLAYERS) return `At most ${MAX_GAME_PLAYERS} managers can play.`;
  if (names.some((name) => !name.trim())) return "Give every manager a name.";
  const unique = new Set(names.map((name) => name.trim().toLowerCase()));
  if (unique.size !== names.length) return "Every manager needs a different name.";
  return null;
}

export default function NewGameScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [setup, setSetup] = useState<SetupValue>(() => defaultSetup(4));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => previewSetup(setup), [setup]);
  const meta = STEPS[step];

  function next() {
    setError(null);
    if (step === 0) {
      const message = validateManagers(setup.playerNames);
      if (message) {
        setError(message);
        hapticWarning();
        return;
      }
      hapticSelect();
      setStep(1);
      return;
    }
    if (step === 1) {
      hapticSelect();
      setStep(2);
      return;
    }
    void create();
  }

  function back() {
    setError(null);
    if (step === 0) {
      router.back();
      return;
    }
    setStep((current) => Math.max(0, current - 1));
  }

  async function create() {
    const message = validateManagers(setup.playerNames);
    if (message) {
      setError(message);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { code } = await roomRepository.create({
        formationKey: setup.formationKey,
        playerNames: setup.playerNames.map((name) => name.trim()),
      });
      await roomRepository.start(code);
      hapticSuccess();
      router.replace({ pathname: "/game/[code]", params: { code } });
    } catch (err) {
      setError(isGameError(err) ? err.message : "Could not create the game. Please try again.");
      hapticWarning();
    } finally {
      setSubmitting(false);
    }
  }

  const positions: { key: Position; label: string }[] = [
    { key: "GK", label: "Goalkeepers" },
    { key: "DEF", label: "Defenders" },
    { key: "MID", label: "Midfielders" },
    { key: "FWD", label: "Forwards" },
  ];

  return (
    <Screen
      header={<AppHeader title={meta.title} subtitle={meta.subtitle} onBack={back} />}
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          {error ? (
            <AppText variant="caption" color={colors.danger} numberOfLines={2}>
              {error}
            </AppText>
          ) : null}
          <View style={styles.footerRow}>
            {step > 0 ? (
              <Button
                label="Back"
                variant="secondary"
                size="lg"
                fullWidth={false}
                onPress={back}
                style={styles.backButton}
              />
            ) : null}
            <Button
              label={step === 2 ? "Start auction" : "Continue"}
              size="lg"
              loading={submitting}
              onPress={next}
              icon={
                step === 2 ? (
                  <Ionicons name="play" size={18} color={colors.textInverse} />
                ) : (
                  <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
                )
              }
              style={styles.nextButton}
            />
          </View>
        </View>
      }
    >
      <StepDots step={step} total={STEPS.length} />

      {step === 0 ? (
        <SetupFields
          value={setup}
          onChange={setSetup}
          showFormation={false}
          showCount
          showNames
        />
      ) : null}

      {step === 1 ? (
        <View style={styles.block}>
          <FormationPicker value={setup.formationKey} onChange={(key) => setSetup({ ...setup, formationKey: key })} />
          <Card style={styles.previewCard}>
            <View style={styles.previewRow}>
              <PitchDiagram formation={preview.counts} dot={6} gap={6} />
              <View style={styles.previewInfo}>
                <AppText variant="heading">{setup.formationKey}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {preview.slots} players per squad
                </AppText>
                <AppText variant="caption" color={colors.textDim}>
                  {preview.pool} footballers in the pool
                </AppText>
              </View>
            </View>
            <View style={styles.breakdown}>
              {positions.map((position) => (
                <View key={position.key} style={styles.breakdownItem}>
                  <AppText variant="label" color={colors.textDim}>
                    {position.key}
                  </AppText>
                  <AppText variant="bodyStrong">{preview.breakdown[position.key]}</AppText>
                </View>
              ))}
            </View>
          </Card>
          <AppText variant="caption" color={colors.textDim}>
            The pool is redrawn from a different shuffle every time. Goalkeepers go first, forwards last.
          </AppText>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.block}>
          <Card style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewIcon}>
                <Ionicons name="people" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="subheading">{setup.playerNames.length} managers</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {setup.playerNames.join(" · ")}
                </AppText>
              </View>
            </View>

            <View style={styles.rule} />

            <View style={styles.reviewRow}>
              <AppText variant="caption" color={colors.textMuted}>
                Formation
              </AppText>
              <AppText variant="bodyStrong">{setup.formationKey}</AppText>
            </View>
            <View style={styles.reviewRow}>
              <AppText variant="caption" color={colors.textMuted}>
                Squad slots
              </AppText>
              <AppText variant="bodyStrong">{preview.slots}</AppText>
            </View>
            <View style={styles.reviewRow}>
              <AppText variant="caption" color={colors.textMuted}>
                Auction pool
              </AppText>
              <AppText variant="bodyStrong">{preview.pool} footballers</AppText>
            </View>
            <View style={styles.reviewRow}>
              <AppText variant="caption" color={colors.textMuted}>
                Starting bank
              </AppText>
              <AppText variant="bodyStrong">100 points each</AppText>
            </View>
          </Card>

          <View style={styles.tipRow}>
            {["Bids are shouted", "You type the price", "Highest squad score wins"].map((tip) => (
              <Chip key={tip} label={tip} selected={false} />
            ))}
          </View>

          <AppText variant="caption" color={colors.textDim}>
            You are the host: you never draft a squad, you run the table. Names, squads and results save
            automatically on this phone.
          </AppText>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 160,
  },
  block: {
    gap: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
  footerRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  backButton: {
    minWidth: 96,
  },
  nextButton: {
    flex: 1,
  },
  previewCard: {
    gap: spacing.lg,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
  },
  previewInfo: {
    flex: 1,
    gap: 2,
  },
  breakdown: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  breakdownItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
  },
  reviewCard: {
    gap: spacing.md,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  reviewIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
