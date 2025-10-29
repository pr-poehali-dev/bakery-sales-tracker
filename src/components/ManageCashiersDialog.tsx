import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getUsersFromStorage, createCashier } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface ManageCashiersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageCashiersDialog = ({ open, onOpenChange }: ManageCashiersDialogProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [refresh, setRefresh] = useState(0);
  const { toast } = useToast();

  const cashiers = getUsersFromStorage().filter(u => u.role === 'cashier');

  const handleCreate = () => {
    if (!username || !password || !name) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    if (username.length < 3) {
      toast({ title: 'Логин должен быть не менее 3 символов', variant: 'destructive' });
      return;
    }

    if (password.length < 4) {
      toast({ title: 'Пароль должен быть не менее 4 символов', variant: 'destructive' });
      return;
    }

    if (createCashier(username, password, name)) {
      toast({ title: '✅ Кассир создан' });
      setUsername('');
      setPassword('');
      setName('');
      setRefresh(r => r + 1);
    } else {
      toast({ title: 'Логин уже используется', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Управление кассирами</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Создать нового кассира</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="cashier-name">Имя</Label>
                <Input
                  id="cashier-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                />
              </div>
              <div>
                <Label htmlFor="cashier-username">Логин</Label>
                <Input
                  id="cashier-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ivan"
                />
              </div>
              <div>
                <Label htmlFor="cashier-password">Пароль</Label>
                <Input
                  id="cashier-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleCreate} className="mt-3">
              <Icon name="UserPlus" size={16} className="mr-2" />
              Создать кассира
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Список кассиров</h3>
            <div className="space-y-2">
              {cashiers.length === 0 ? (
                <p className="text-muted-foreground text-sm">Кассиры не созданы</p>
              ) : (
                cashiers.map(cashier => (
                  <Card key={cashier.username}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cashier.name}</p>
                        <p className="text-sm text-muted-foreground">@{cashier.username}</p>
                      </div>
                      <Icon name="User" size={20} />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
