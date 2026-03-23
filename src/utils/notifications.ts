/**
 * Sends a notification message to a Telegram chat using a bot.
 * @param botToken The Telegram Bot Token.
 * @param chatId The Telegram Chat ID.
 * @param message The message to send.
 */
export async function sendTelegramNotification(botToken: string, chatId: string, message: string) {
  if (!botToken || !chatId) return;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API Error:', errorData);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

/**
 * Sends a Zalo ZNS notification using the proxy API.
 */
export async function sendZaloNotification(
  phone: string, 
  templateId: string, 
  accessToken: string, 
  templateData: any
) {
  if (!phone || !templateId || !accessToken) return;

  try {
    const response = await fetch('/api/zalo/send-zns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        templateId,
        accessToken,
        templateData
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Zalo API Error:', errorData);
      return { success: false, error: errorData.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send Zalo notification:', error);
    return { success: false, error: 'Network error' };
  }
}
