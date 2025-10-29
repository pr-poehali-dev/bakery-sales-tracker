import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShiftReport } from '@/types';
import { sendReportToTelegram } from '@/utils/telegram';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface EndShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ShiftReport;
  telegramBotToken: string;
  telegramChatId: string;
  onConfirm: () => void;
}

export const EndShiftDialog = ({ open, onOpenChange, report, telegramBotToken, telegramChatId, onConfirm }: EndShiftDialogProps) => {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendToTelegram = async () => {
    setSending(true);
    try {
      const success = await sendReportToTelegram(report, telegramBotToken, telegramChatId);
      if (success) {
        toast({ title: '✅ Отчёт отправлен в Telegram' });
        onConfirm();
        onOpenChange(false);
      } else {
        toast({ title: 'Ошибка отправки в Telegram', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : 'Ошибка отправки', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    onConfirm();
    onOpenChange(false);
  };

  const duration = report.endTime - report.startTime;
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Закрыть смену?</DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Кассир</p>
                <p className="text-lg font-semibold">{report.cashier}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Длительность смены</p>
                <p className="text-lg font-semibold">{hours}ч {minutes}мин</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Выручка</p>
                  <p className="text-2xl font-bold text-primary">{report.totalRevenue} ₽</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">💵 Наличные</p>
                  <p className="text-xl font-semibold">{report.cashRevenue} ₽</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">💳 Карта</p>
                  <p className="text-xl font-semibold">{report.cardRevenue} ₽</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Продано товаров</p>
                  <p className="text-lg font-semibold">{report.totalItems} шт</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Количество продаж</p>
                  <p className="text-lg font-semibold">{report.sales.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm font-medium mb-3">Отправить отчёт в Telegram?</p>
          <div className="flex gap-2">
            <Button
              onClick={handleSendToTelegram}
              disabled={sending || !telegramBotToken || !telegramChatId}
              className="flex-1"
            >
              <Icon name="Send" size={16} className="mr-2" />
              {sending ? 'Отправка...' : 'Отправить'}
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              <Icon name="X" size={16} className="mr-2" />
              Закрыть без отправки
            </Button>
          </div>
          {!telegramBotToken || !telegramChatId ? (
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ Настройте Telegram в разделе администратора
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
