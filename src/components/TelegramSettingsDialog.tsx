import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getTelegramSettings, saveTelegramSettings } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface TelegramSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (botToken: string, chatId: string) => void;
}

export const TelegramSettingsDialog = ({ open, onOpenChange, onSave }: TelegramSettingsDialogProps) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const settings = getTelegramSettings();
    setBotToken(settings.botToken);
    setChatId(settings.chatId);
  }, [open]);

  const handleSave = () => {
    saveTelegramSettings(botToken, chatId);
    onSave(botToken, chatId);
    toast({ title: '✅ Настройки Telegram сохранены' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="MessageSquare" size={24} />
            Настройки Telegram
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="bot-token">Токен бота</Label>
            <Input
              id="bot-token"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Получите токен у @BotFather в Telegram
            </p>
          </div>
          <div>
            <Label htmlFor="chat-id">Chat ID</Label>
            <Input
              id="chat-id"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="-1001234567890"
            />
            <p className="text-xs text-muted-foreground mt-1">
              ID чата или канала для отправки отчётов
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
