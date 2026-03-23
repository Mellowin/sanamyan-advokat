import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, message, locale } = body;

    // Токен бота
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    
    // Два получателя (ты и жена)
    const CHAT_IDS = [
      '793675387',    // Твой ID
      '85590002'      // Жена
    ];

    // Формируем сообщение
    const text = `
🔔 <b>Нова заявка з сайту!</b>

👤 <b>Ім'я:</b> ${name}
📞 <b>Телефон:</b> ${phone}
🌐 <b>Мова:</b> ${locale === 'ua' ? 'Українська' : 'Русский'}

💬 <b>Повідомлення:</b>
${message || 'Не вказано'}

⏰ <b>Час:</b> ${new Date().toLocaleString('uk-UA')}
    `.trim();

    // Отправляем на оба chat_id (параллельно, независимо)
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const sendPromises = CHAT_IDS.map(async (chatId) => {
      try {
        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
          }),
        });
        return { chatId, ok: response.ok };
      } catch (error) {
        return { chatId, ok: false, error };
      }
    });

    const results = await Promise.all(sendPromises);
    
    // Считаем успешным если хотя бы одно сообщение дошло
    const anyOk = results.some(r => r.ok);
    
    console.log('Telegram send results:', results);

    if (!anyOk) {
      return NextResponse.json(
        { error: 'Failed to send message to any recipient' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
