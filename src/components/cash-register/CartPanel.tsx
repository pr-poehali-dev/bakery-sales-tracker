import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Cart, Product } from '@/types';

interface CartPanelProps {
  cart: Cart;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onRemoveFromCart: (productId: string) => void;
  onOpenPayment: () => void;
  formatTime: (startTime: number | null) => string;
}

export const CartPanel = forwardRef<HTMLDivElement, CartPanelProps>(
  ({ cart, onAddToCart, onRemoveFromCart, onOpenPayment, formatTime }, ref) => {
    return (
      <Card className="sticky top-20 md:top-24" ref={ref}>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-lg md:text-xl font-bold">{cart.name}</h3>
            {cart.startTime && (
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                <Icon name="Timer" size={14} className="md:w-4 md:h-4" />
                <span className="font-mono">{formatTime(cart.startTime)}</span>
              </div>
            )}
          </div>
          <div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto">
            {cart.items.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 md:py-8 text-sm md:text-base">Корзина пуста</p>
            ) : (
              cart.items.map(item => (
                <div key={item.id} className="flex gap-2 md:gap-3 p-3 md:p-3 border rounded-lg">
                  <div className="text-2xl md:text-3xl">{item.image}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm md:text-base mb-2 truncate">{item.name}</h4>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 md:gap-2">
                        <Button variant="outline" size="sm" className="h-9 w-9 md:h-8 md:w-8 p-0 touch-manipulation" onClick={() => onRemoveFromCart(item.id)}>
                          <Icon name="Minus" size={16} className="md:w-3 md:h-3" />
                        </Button>
                        <span className="font-medium w-8 md:w-6 text-center text-sm md:text-base">{item.quantity}</span>
                        <Button variant="outline" size="sm" className="h-9 w-9 md:h-8 md:w-8 p-0 touch-manipulation" onClick={(e) => onAddToCart(item, e)}>
                          <Icon name="Plus" size={16} className="md:w-3 md:h-3" />
                        </Button>
                      </div>
                      <span className="font-bold text-primary text-sm md:text-base whitespace-nowrap">{(item.price * item.quantity)} ₽</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {cart.items.length > 0 && (
            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <span className="text-base md:text-lg font-bold">Итого:</span>
                <span className="text-xl md:text-2xl font-bold text-primary">
                  {cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₽
                </span>
              </div>
              <Button className="w-full min-h-[56px] md:min-h-[44px] text-base md:text-lg touch-manipulation" size="lg" onClick={onOpenPayment}>
                <Icon name="CreditCard" size={20} className="mr-2" />
                Оплатить
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

CartPanel.displayName = 'CartPanel';
