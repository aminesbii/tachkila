import * as Haptics from "expo-haptics";

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

function run(action: () => Promise<unknown>): void {
  if (!enabled) return;
  action().catch(() => {
    // Haptics are optional; unsupported devices simply stay silent.
  });
}

export function hapticTap(): void {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticSelect(): void {
  run(() => Haptics.selectionAsync());
}

export function hapticSuccess(): void {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function hapticWarning(): void {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
