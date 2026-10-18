/** @param {string} message @param {{ token?: string, chatId?: string, fetcher?: typeof fetch }} options */
export async function sendNotification(message, { token, chatId, fetcher = fetch } = {}) {
  if (!token || !chatId) throw new Error('Our online booking desk is not configured yet. Please use an available contact option.');
  let response;
  try {
    response = await fetcher(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(10000), cache: 'no-store',
    });
  } catch (error) {
    const code = error?.cause?.code || error?.code || 'NETWORK_ERROR';
    console.error('Telegram notification network failure:', code);
    throw new Error('We could not reach our booking desk. Please retry in a moment.');
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.ok !== true) {
    console.error('Telegram notification rejected:', response.status, result?.error_code || 'UNKNOWN');
    throw new Error('We could not reach our booking desk. Please retry in a moment.');
  }
  return true;
}
