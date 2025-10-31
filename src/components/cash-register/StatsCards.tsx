import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Sale, WriteOff } from '@/types';

interface StatsCardsProps {
  sessionStartTime: number | null;
  sales: Sale[];
  writeOffs: WriteOff[];
}

export const StatsCards = ({ sessionStartTime, sales, writeOffs }: StatsCardsProps) => {
  if (!sessionStartTime) return null;

  const sessionSales = sales.filter(s => s.timestamp >= sessionStartTime);
  const sessionWriteOffs = writeOffs.filter(w => w.timestamp >= sessionStartTime);
  
  const notReturnedSales = sessionSales.filter(s => !s.returned);
  const returnedSales = sessionSales.filter(s => s.returned);
  
  const salesTotal = notReturnedSales.reduce((sum, s) => sum + s.total, 0);
  const returnsTotal = returnedSales.reduce((sum, s) => sum + s.total, 0);
  const writeOffsTotal = sessionWriteOffs.reduce((sum, w) => sum + w.totalAmount, 0);
  const sessionRevenue = salesTotal - writeOffsTotal;
  
  const sessionItemsCount = notReturnedSales.reduce((sum, s) => 
    sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0), 0
  );

  const cashRevenue = notReturnedSales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
  const cardRevenue = notReturnedSales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);
  const cashReturns = returnedSales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
  const cardReturns = returnedSales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
      <Card className="bg-gradient-to-br from-primary to-orange-600 text-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Выручка за смену</p>
              <p className="text-2xl md:text-3xl font-bold">{sessionRevenue} ₽</p>
              <div className="text-xs opacity-70 mt-1 space-y-0.5">
                {returnsTotal > 0 && (
                  <p>Возвраты: -{returnsTotal} ₽</p>
                )}
                {writeOffsTotal > 0 && (
                  <p>Списания: -{writeOffsTotal} ₽</p>
                )}
                <p>Наличные: {cashRevenue - cashReturns} ₽</p>
                <p>Безнал: {cardRevenue - cardReturns} ₽</p>
              </div>
            </div>
            <Icon name="TrendingUp" size={40} className="opacity-80" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Продано товаров</p>
              <p className="text-2xl md:text-3xl font-bold">{sessionItemsCount} шт</p>
            </div>
            <Icon name="Package" size={32} className="opacity-80 md:w-10 md:h-10" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Количество продаж</p>
              <p className="text-2xl md:text-3xl font-bold">{sessionSales.length}</p>
            </div>
            <Icon name="ShoppingBag" size={32} className="opacity-80 md:w-10 md:h-10" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
