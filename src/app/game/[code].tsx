import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppHeader } from "@/components/ui/AppHeader";
import { AppText } from "@/components/ui/AppText";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useToast } from "@/components/ui/Toast";
import { AssignSheet } from "@/components/game/AssignSheet";
import { PlayerCard } from "@/components/game/PlayerCard";
import { RecentSales } from "@/components/game/RecentSales";
import { SaleOverlay, type SaleResult } from "@/components/game/SaleOverlay";
import { SeatAvatar } from "@/components/game/SeatAvatar";
import { Standings } from "@/components/game/Standings";
import { TeamCarousel } from "@/components/game/TeamCarousel";
import { UpcomingStrip } from "@/components/game/UpcomingStrip";
import { SetupFields } from "@/components/setup/SetupFields";
import type { Position, PublicRoom } from "@/engine/types";
import { POSITION_SHORT_LABEL } from "@/engine/types";
import { useModalHandoff } from "@/hooks/use-modal-handoff";
import { useRoom } from "@/hooks/use-room";
import { playerPhoto } from "@/lib/display";
import { hapticSelect, hapticSuccess, hapticTap, hapticWarning } from "@/lib/feedback";
import { nextEntries, remainingByPosition, statusLabel, teamScore, totalFilled } from "@/lib/game-view";
import { setupFromRoomNames, type SetupValue } from "@/lib/setup";
import { roomRepository } from "@/storage/async-storage";
import { colors, radii, seatColor, shadows, spacing } from "@/theme";

export default function GameScreen() {
  useKeepAwake();
  const params = useLocalSearchParams<{ code?: string }>();
  const code = typeof params.code === "string" ? params.code : "";
  const router = useRouter();
  const { showToast } = useToast();
  const {
    room,
    loading,
    busy,
    error,
    notFound,
    undoAvailable,
    assign,
    start,
    pass,
    reset,
    undo,
    updateSettings,
  } = useRoom(code);

  const [assignOpen, setAssignOpen] = useState(false);
  const [sale, setSale] = useState<SaleResult | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSetup, setEditSetup] = useState<SetupValue | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const afterModalClose = useModalHandoff();

  const current = useMemo(
    () => (room ? room.pool.find((entry) => entry.id === room.currentEntryId) : undefined),
    [room]
  );

  // Warm the next portraits so the auction card never pops in blank.
  useEffect(() => {
    if (!room) return;
    for (const entry of nextEntries(room, 4)) {
      const uri = playerPhoto(entry);
      if (uri) void Image.prefetch(uri).catch(() => undefined);
    }
  }, [room]);

  const handleAssign = useCallback(
    async (seat: number, bid: number) => {
      if (!current) return false;
      const winner = room?.participants.find((participant) => participant.seat === seat);
      const result = {
        entryName: current.name,
        imageUrl: playerPhoto(current),
        position: current.position,
        pts: current.pts,
        winnerName: winner?.name ?? `Seat ${seat}`,
        winnerSeat: seat,
        bid,
      };
      const ok = await assign(current.id, seat, bid);
      if (!ok) return false;
      hapticSuccess();
      // Close the sheet and show the sale in one commit: never present a second
      // native modal while the sheet is dismissing (it freezes iOS).
      setAssignOpen(false);
      setSale(result);
      return true;
    },
    [assign, current, room]
  );

  const handleStart = useCallback(async () => {
    hapticTap();
    const ok = await start();
    if (ok) showToast("Auction is open — first footballer on the block");
  }, [showToast, start]);

  const handlePass = useCallback(async () => {
    hapticWarning();
    const ok = await pass();
    if (ok) showToast("Passed — nobody signed that footballer", "info");
  }, [pass, showToast]);

  const handleUndo = useCallback(async () => {
    setMenuOpen(false);
    const ok = await undo();
    showToast(ok ? "Last move undone" : "Nothing to undo", ok ? "success" : "info");
  }, [showToast, undo]);

  const handleReset = useCallback(() => {
    setMenuOpen(false);
    hapticTap();
    afterModalClose(() => {
      Alert.alert(
        "Redraw the pool?",
        "Every sale is cleared and a brand new random pool is drawn. Managers and formation stay the same.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Redraw",
            style: "destructive",
            onPress: async () => {
              const ok = await reset();
              if (ok) showToast("Fresh pool drawn", "success");
            },
          },
        ]
      );
    });
  }, [afterModalClose, reset, showToast]);

  const handleDelete = useCallback(() => {
    setMenuOpen(false);
    afterModalClose(() => {
      Alert.alert("Delete this game?", "The full auction history will be removed from this phone.", [
        { text: "Keep", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await roomRepository.remove(code);
            router.replace("/");
          },
        },
      ]);
    });
  }, [afterModalClose, code, router]);

  const openEdit = useCallback(() => {
    if (!room) return;
    setEditError(null);
    const setup = setupFromRoomNames(room.formationLabel, room.participants.map((p) => p.name));

    if (!menuOpen) {
      setEditSetup(setup);
      setEditOpen(true);
      return;
    }

    setMenuOpen(false);
    afterModalClose(() => {
      setEditSetup(setup);
      setEditOpen(true);
    });
  }, [afterModalClose, menuOpen, room]);

  const saveEdit = useCallback(async () => {
    if (!editSetup) return;
    setEditSaving(true);
    setEditError(null);
    const ok = await updateSettings({
      formationKey: editSetup.formationKey,
      playerNames: editSetup.playerNames.map((name) => name.trim()),
    });
    setEditSaving(false);
    if (ok) {
      setEditOpen(false);
      showToast("Setup saved — fresh pool drawn");
    } else {
      setEditError("Could not save the setup. Check the names and try again.");
    }
  }, [editSetup, showToast, updateSettings]);

  if (loading) {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  if (notFound || !room) {
    return (
      <Screen
        header={<AppHeader title="Game" showBack onBack={() => router.replace("/")} />}
        contentStyle={styles.center}
      >
        <EmptyState
          icon="alert-circle-outline"
          title="Game not found"
          body="This game is not saved on this phone any more. Start a new auction from the home screen."
          action={<Button label="Back to home" onPress={() => router.replace("/")} />}
        />
      </Screen>
    );
  }

  const sold = room.pool.filter((entry) => entry.status === "sold").length;
  const progress = room.totalEntries === 0 ? 0 : sold / room.totalEntries;
  const remaining = remainingByPosition(room);

  return (
    <View style={styles.root}>
      <Screen
        header={
          <View>
            <AppHeader
              title={`Room ${room.code}`}
              subtitle={`${room.formationLabel} · ${room.participants.length} managers · ${statusLabel(room.status)}`}
              onBack={() => router.back()}
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Game menu"
                  hitSlop={8}
                  onPress={() => setMenuOpen(true)}
                  style={({ pressed }) => [styles.menuButton, pressed && { opacity: 0.65 }]}
                >
                  <Ionicons name="ellipsis-horizontal" size={19} color={colors.text} />
                </Pressable>
              }
            />
            <View style={styles.progressWrap}>
              <ProgressBar value={progress} height={4} />
              <View style={styles.progressMeta}>
                <AppText variant="caption" color={colors.textDim}>
                  {sold} of {room.totalEntries} sold
                </AppText>
                <AppText variant="caption" color={colors.textDim}>
                  {room.pool.filter((entry) => entry.status === "upcoming").length} queued
                </AppText>
              </View>
            </View>
          </View>
        }
        contentStyle={styles.content}
        footer={
          room.status === "lobby" ? (
            <Button
              label="Start auction"
              size="lg"
              loading={busy}
              onPress={handleStart}
              icon={<Ionicons name="play" size={18} color={colors.textInverse} />}
            />
          ) : room.status === "auction" ? (
            <View style={styles.auctionFooter}>
              <Button
                label="Pass"
                variant="secondary"
                size="lg"
                fullWidth={false}
                onPress={handlePass}
                disabled={busy}
                icon={<Ionicons name="play-skip-forward-outline" size={17} color={colors.textMuted} />}
                style={styles.passButton}
              />
              <Button
                label="Sell player"
                size="lg"
                onPress={() => {
                  hapticSelect();
                  setAssignOpen(true);
                }}
                disabled={busy || !current}
                icon={<Ionicons name="hammer-outline" size={18} color={colors.textInverse} />}
                style={{ flex: 1 }}
              />
            </View>
          ) : (
            <View style={styles.auctionFooter}>
              <Button
                label="Home"
                variant="secondary"
                size="lg"
                fullWidth={false}
                onPress={() => router.replace("/")}
                style={styles.passButton}
              />
              <Button
                label="Play again"
                size="lg"
                loading={busy}
                onPress={handleReset}
                icon={<Ionicons name="refresh" size={17} color={colors.textInverse} />}
                style={{ flex: 1 }}
              />
            </View>
          )
        }
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="warning-outline" size={16} color={colors.danger} />
            <AppText variant="caption" color={colors.danger} style={{ flex: 1 }}>
              {error}
            </AppText>
          </View>
        ) : null}

        {room.status === "lobby" ? (
          <View style={styles.section}>
            <Card style={styles.heroCard}>
              <View style={styles.lobbyHeader}>
                <View style={styles.lobbyIcon}>
                  <Ionicons name="people" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="heading">The table is set</AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    Every manager starts with 100 bank points.
                  </AppText>
                </View>
              </View>

              <View style={styles.managers}>
                {room.participants.map((participant) => (
                  <View key={participant.seat} style={styles.managerRow}>
                    <SeatAvatar
                      name={participant.name}
                      color={seatColor(participant.seat)}
                      size={34}
                    />
                    <View style={{ flex: 1, gap: 1 }}>
                      <AppText variant="bodyStrong" numberOfLines={1}>
                        {participant.name}
                      </AppText>
                      <AppText variant="caption" color={colors.textMuted}>
                        Seat {participant.seat} · {participant.bankPoints} bank points
                      </AppText>
                    </View>
                    <View style={styles.slotTag}>
                      <AppText variant="caption" color={colors.primary} style={styles.slotText}>
                        {room.slotsPerTeam} slots
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>

              <Button
                label="Edit managers or formation"
                variant="secondary"
                size="sm"
                onPress={openEdit}
                icon={<Ionicons name="create-outline" size={15} color={colors.text} />}
              />
            </Card>

            <Card style={styles.heroCard}>
              <SectionTitle>Pool breakdown</SectionTitle>
              <View style={styles.breakdown}>
                {(["GK", "DEF", "MID", "FWD"] as Position[]).map((position) => (
                  <View key={position} style={styles.breakdownItem}>
                    <AppText variant="heading">{remaining[position]}</AppText>
                    <AppText variant="label" color={colors.textDim}>
                      {POSITION_SHORT_LABEL[position]}
                    </AppText>
                  </View>
                ))}
              </View>
              <AppText variant="caption" color={colors.textMuted}>
                {room.totalEntries} footballers waiting. Goalkeepers are called first, forwards last, so every
                squad can be completed.
              </AppText>
            </Card>

            <Card tone="alt" style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={17} color={colors.gold} />
              <AppText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
                Keep the phone where everyone can see it. Bids are shouted — the host types the winning price
                and taps the manager who won.
              </AppText>
            </Card>
          </View>
        ) : null}

        {room.status === "auction" && current ? (
          <View style={styles.section}>
            <PlayerCard entry={current} />

            <UpcomingStrip entries={nextEntries(room, 8)} />

            <View style={styles.sectionBlock}>
              <SectionTitle>Live standings</SectionTitle>
              <Standings room={room} />
            </View>

            <View style={styles.sectionBlock}>
              <SectionTitle>Recent sales</SectionTitle>
              <Card padded={false} style={styles.listCard}>
                <View style={styles.listInner}>
                  <RecentSales room={room} />
                </View>
              </Card>
            </View>

            <View style={styles.sectionBlock}>
              <SectionTitle right={<AppText variant="caption" color={colors.textDim}>Swipe</AppText>}>
                Squads
              </SectionTitle>
              <View style={styles.carouselBleed}>
                <TeamCarousel room={room} />
              </View>
            </View>
          </View>
        ) : null}

        {room.status === "finished" ? <ResultsView room={room} /> : null}
      </Screen>

      <AssignSheet
        key={assignOpen ? "open" : "closed"}
        room={room}
        entry={current ?? null}
        open={assignOpen}
        busy={busy}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Game menu" scroll={false}>
        <View style={styles.menu}>
          <MenuRow
            icon="arrow-undo-outline"
            label="Undo last move"
            hint={undoAvailable ? "Step back one action" : "Nothing to undo yet"}
            disabled={!undoAvailable || busy}
            onPress={handleUndo}
          />
          {room.status === "lobby" ? (
            <MenuRow icon="create-outline" label="Edit setup" hint="Managers and formation" onPress={openEdit} />
          ) : null}
          <MenuRow
            icon="shuffle"
            label="Redraw pool"
            hint="Clear every sale and start over"
            tone="danger"
            onPress={handleReset}
          />
          <MenuRow
            icon="trash-outline"
            label="Delete game"
            hint="Remove it from this phone"
            tone="danger"
            onPress={handleDelete}
          />
        </View>
      </BottomSheet>

      <BottomSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit setup"
        subtitle="Changing anything draws a fresh pool."
        scroll
      >
        {editSetup ? (
          <View style={{ gap: spacing.xl, paddingBottom: spacing.sm }}>
            <SetupFields value={editSetup} onChange={setEditSetup} />
            {editError ? (
              <AppText variant="caption" color={colors.danger}>
                {editError}
              </AppText>
            ) : null}
            <Button
              label="Save and redraw"
              size="lg"
              loading={editSaving}
              onPress={saveEdit}
              icon={<Ionicons name="shuffle" size={17} color={colors.textInverse} />}
            />
          </View>
        ) : null}
      </BottomSheet>

      <SaleOverlay sale={sale} onClose={() => setSale(null)} />
    </View>
  );
}

function ResultsView({ room }: { room: PublicRoom }) {
  const champion = useMemo(() => {
    return [...room.participants]
      .map((participant) => ({
        participant,
        score: teamScore(room, participant.roster),
        signed: totalFilled(room, participant.roster),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.participant.bankPoints !== a.participant.bankPoints) {
          return b.participant.bankPoints - a.participant.bankPoints;
        }
        return a.participant.seat - b.participant.seat;
      })[0];
  }, [room]);

  return (
    <View style={styles.section}>
      <Card style={styles.winnerCard}>
        <View pointerEvents="none" style={styles.winnerGlow} />
        <View style={styles.trophy}>
          <Ionicons name="trophy" size={30} color="#241A02" />
        </View>
        <AppText variant="label" color={colors.gold}>
          Auction complete
        </AppText>
        <AppText variant="title" align="center" numberOfLines={2}>
          {champion ? `${champion.participant.name} wins!` : "Auction finished"}
        </AppText>
        {champion ? (
          <View style={styles.winnerStats}>
            <View style={styles.winnerStat}>
              <AppText variant="score" color={colors.gold}>
                {champion.score}
              </AppText>
              <AppText variant="caption" color={colors.textDim}>
                team points
              </AppText>
            </View>
            <View style={styles.winnerDivider} />
            <View style={styles.winnerStat}>
              <AppText variant="score">{champion.signed}</AppText>
              <AppText variant="caption" color={colors.textDim}>
                signed
              </AppText>
            </View>
            <View style={styles.winnerDivider} />
            <View style={styles.winnerStat}>
              <AppText variant="score">{champion.participant.bankPoints}</AppText>
              <AppText variant="caption" color={colors.textDim}>
                bank left
              </AppText>
            </View>
          </View>
        ) : null}
      </Card>

      <View style={styles.sectionBlock}>
        <SectionTitle>Final standings</SectionTitle>
        <Standings room={room} final />
      </View>

      <View style={styles.sectionBlock}>
        <SectionTitle right={<AppText variant="caption" color={colors.textDim}>Swipe</AppText>}>
          Final squads
        </SectionTitle>
        <View style={styles.carouselBleed}>
          <TeamCarousel room={room} />
        </View>
      </View>

      <Card tone="alt" style={styles.tipCard}>
        <Ionicons name="information-circle-outline" size={17} color={colors.info} />
        <AppText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
          Room {room.code} · {room.formationLabel} · {room.participants.length} managers · {room.totalEntries}{" "}
          footballers auctioned. You hosted, so you do not score.
        </AppText>
      </Card>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  hint,
  tone = "default",
  disabled = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  onPress: () => void;
}) {
  const color = disabled ? colors.textDim : tone === "danger" ? colors.danger : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, pressed && !disabled ? { opacity: 0.7 } : null]}
    >
      <View
        style={[
          styles.menuIcon,
          tone === "danger" && !disabled ? { backgroundColor: colors.dangerSoft } : null,
        ]}
      >
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <AppText variant="bodyStrong" color={color}>
          {label}
        </AppText>
        {hint ? (
          <AppText variant="caption" color={colors.textDim}>
            {hint}
          </AppText>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={15} color={colors.textDim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  content: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: 150,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    gap: 4,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    gap: spacing.xl,
  },
  sectionBlock: {
    gap: spacing.md,
  },
  auctionFooter: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  passButton: {
    minWidth: 104,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,122,122,0.3)",
    backgroundColor: colors.dangerSoft,
  },
  heroCard: {
    gap: spacing.lg,
  },
  lobbyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  lobbyIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  managers: {
    gap: spacing.sm,
  },
  managerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  slotTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },
  slotText: {
    fontSize: 10,
  },
  breakdown: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  breakdownItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  listCard: {
    overflow: "hidden",
  },
  listInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  carouselBleed: {
    marginHorizontal: -spacing.lg,
  },
  winnerCard: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    overflow: "hidden",
    borderColor: "rgba(244,201,93,0.28)",
    ...shadows.card,
  },
  winnerGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.gold,
    opacity: 0.08,
    top: -110,
  },
  trophy: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  winnerStats: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  winnerStat: {
    flex: 1,
    alignItems: "center",
    gap: 1,
  },
  winnerDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: colors.border,
  },
  menu: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
