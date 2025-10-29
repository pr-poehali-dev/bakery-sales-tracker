import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { PaymentMethod } from '@/types';

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (method: PaymentMethod) => void;
  total: number;
}

export const PaymentMethodDialog = ({ open, onOpenChange, onSelect, total }: PaymentMethodDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Выберите способ оплаты</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">Сумма к оплате</p>
            <p className="text-4xl font-bold">{total} ₽</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="h-24 flex-col gap-2"
              onClick={() => {
                onSelect('cash');
                onOpenChange(false);
              }}
            >
              <Icon name="Wallet" size={32} />
              <span className="text-lg">Наличные</span>
            </Button>

            <Button
              size="lg"
              className="h-24 flex-col gap-2"
              onClick={() => {
                onSelect('card');
                onOpenChange(false);
              }}
            >
              <Icon name="CreditCard" size={32} />
              <span className="text-lg">Карта</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
