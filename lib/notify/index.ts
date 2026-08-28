import { webhookNotifier } from './webhook';
import type { Notifier, PriceDropNotice } from './types';

export type { Notifier, PriceDropNotice } from './types';

/**
 * 通知先の一覧。
 * メール（Resend / SendGrid）や Web Push を足すときは、ここに実装を登録する。
 */
export const NOTIFIERS: Notifier[] = [webhookNotifier];

export function enabledNotifiers(): Notifier[] {
  return NOTIFIERS.filter((n) => n.isEnabled());
}

/**
 * 有効な通知先すべてに送る。
 * 1つの通知先が失敗しても他は送るため、失敗した通知先の名前を返す。
 */
export async function notifyAll(notices: PriceDropNotice[]): Promise<string[]> {
  const targets = enabledNotifiers();
  const results = await Promise.allSettled(targets.map((n) => n.send(notices)));
  return targets.filter((_, i) => results[i].status === 'rejected').map((n) => n.name);
}
