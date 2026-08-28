import { fullTitle } from '../format';
import type { Notifier, PriceDropNotice } from './types';

/**
 * 任意のWebhookに値下げをPOSTする。
 *
 * PRICE_ALERT_WEBHOOK_URL に Slack / Discord の Incoming Webhook URL をそのまま
 * 入れれば動く（どちらも `text` / `content` を読む）。自前のエンドポイントを
 * 指定した場合は `drops` 配列をそのまま使える。
 */
export const webhookNotifier: Notifier = {
  id: 'webhook',
  name: 'Webhook（Slack / Discord など）',
  isEnabled: () => Boolean(process.env.PRICE_ALERT_WEBHOOK_URL),

  async send(notices: PriceDropNotice[]) {
    const url = process.env.PRICE_ALERT_WEBHOOK_URL;
    if (!url || notices.length === 0) return;

    const lines = notices.map((n) => {
      const low = n.isAllTimeLow ? '【過去最安】' : '';
      return `${low}${fullTitle(n.productName, n.brand)} — ¥${n.previousJpy.toLocaleString('ja-JP')} → ¥${n.currentJpy.toLocaleString(
        'ja-JP',
      )}（${n.changePct.toFixed(1)}%／${n.shopName}）\n${n.url}`;
    });
    const text = `値下げ ${notices.length} 件\n\n${lines.join('\n\n')}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // text は Slack、content は Discord、drops は自前エンドポイント向け
      body: JSON.stringify({ text, content: text, drops: notices }),
    });
    if (!res.ok) throw new Error(`Webhookの送信に失敗しました: ${res.status}`);
  },
};
