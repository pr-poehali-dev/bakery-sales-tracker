import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { User } from '@/types';

interface HeaderProps {
  currentUser: User | null;
  sendingReport: boolean;
  onAddCategory: () => void;
  onAddProduct: () => void;
  onManageCashiers: () => void;
  onTelegramSettings: () => void;
  onSendReport: () => void;
  onReturn: () => void;
  onCloseShift: () => void;
}

export const Header = ({
  currentUser,
  sendingReport,
  onAddCategory,
  onAddProduct,
  onManageCashiers,
  onTelegramSettings,
  onSendReport,
  onReturn,
  onCloseShift
}: HeaderProps) => {
  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Store" size={20} className="text-white md:hidden" />
              <Icon name="Store" size={24} className="text-white hidden md:block" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Хлеб Бабушкин</h1>
              <p className="text-xs md:text-sm text-muted-foreground">{currentUser?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            {currentUser?.role === 'admin' && (
              <>
                <Button variant="ghost" size="sm" onClick={onAddCategory} className="hidden md:flex">
                  <Icon name="FolderPlus" size={18} className="md:mr-1" />
                  <span className="hidden lg:inline">Категория</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={onAddProduct} className="hidden md:flex">
                  <Icon name="Plus" size={18} className="md:mr-1" />
                  <span className="hidden lg:inline">Товар</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={onManageCashiers} className="hidden md:flex">
                  <Icon name="Users" size={18} className="md:mr-1" />
                  <span className="hidden lg:inline">Кассиры</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={onTelegramSettings} className="hidden md:flex">
                  <Icon name="Settings" size={18} className="md:mr-1" />
                  <span className="hidden lg:inline">Telegram</span>
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSendReport}
              disabled={sendingReport}
              className="hidden md:flex"
            >
              <Icon name="Send" size={18} className="md:mr-1" />
              <span className="hidden lg:inline">{sendingReport ? 'Отправка...' : 'Отчёт'}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onReturn}>
              <Icon name="Undo2" size={20} className="md:mr-1" />
              <span className="hidden md:inline">Возврат</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onCloseShift}>
              <Icon name="DoorOpen" size={20} className="md:mr-1" />
              <span className="hidden md:inline">Закрыть</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
