import { ShiftReport } from '@/types';

export const sendReportToTelegram = async (report: ShiftReport, botToken: string, chatId: string): Promise<boolean> => {
  if (!botToken || !chatId) {
    throw new Error('Не указаны настройки Telegram');
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ru-RU');
  };

  const duration = report.endTime - report.startTime;
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);

  const message = `📊 *Отчёт о смене*

👤 *Кассир:* ${report.cashier}
📅 *Дата:* ${formatDate(report.startTime)}
⏱ *Длительность смены:* ${hours}ч ${minutes}мин

💰 *Выручка за смену:* ${report.totalRevenue} ₽
├ 💵 Наличные: ${report.cashRevenue} ₽
└ 💳 Безналичные: ${report.cardRevenue} ₽

📦 *Продано товаров:* ${report.totalItems} шт
🧾 *Количество продаж:* ${report.sales.length}

${report.sales.length > 0 ? '📋 *Детали продаж:*' : ''}
${report.sales.map((sale, idx) => 
  `${idx + 1}. ${formatDate(sale.timestamp)} | ${sale.paymentMethod === 'cash' ? '💵' : '💳'} ${sale.total} ₽`
).join('\n')}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error);
    return false;
  }
};
