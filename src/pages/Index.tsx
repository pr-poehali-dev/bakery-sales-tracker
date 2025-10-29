import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'admin' | 'cashier';

interface User {
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

interface Category {
  id: string;
  label: string;
  emoji: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  salesCount: number;
  customImage?: string;
}

interface CartItem extends Product {
  quantity: number;
  coffeeSize?: 'small' | 'medium' | 'large';
  customPrice?: number;
}

interface Cart {
  id: string;
  name: string;
  items: CartItem[];
  createdAt: number;
  startTime: number | null;
}

interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: number;
  cashier: string;
  paymentMethod: 'cash' | 'card';
  returned?: boolean;
}

interface WriteOff {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  reason: string;
  timestamp: number;
  cashier: string;
}

const COFFEE_SIZES = {
  small: { label: '100 мл', multiplier: 1 },
  medium: { label: '250 мл', multiplier: 1.3 },
  large: { label: '400 мл', multiplier: 1.6 }
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 'pies', label: 'Пирожки', emoji: '🥟' },
  { id: 'coffee', label: 'Кофе и Чай', emoji: '☕' },
  { id: 'sweets', label: 'Сладкое', emoji: '🍰' },
  { id: 'kitchen', label: 'Кухня', emoji: '🍔' },
  { id: 'drinks', label: 'Напитки', emoji: '🥤' }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Пирожок с капустой', category: 'pies', price: 50, image: '🥟', salesCount: 0 },
  { id: '2', name: 'Пирожок с картошкой', category: 'pies', price: 50, image: '🥟', salesCount: 0 },
  { id: '3', name: 'Пирожок с мясом', category: 'pies', price: 60, image: '🥟', salesCount: 0 },
  { id: '4', name: 'Чебурек с мясом', category: 'pies', price: 80, image: '🥙', salesCount: 0 },
  { id: '5', name: 'Чебурек с сыром', category: 'pies', price: 75, image: '🥙', salesCount: 0 },
  
  { id: '14', name: 'Эспрессо', category: 'coffee', price: 100, image: '☕', salesCount: 0 },
  { id: '15', name: 'Капучино', category: 'coffee', price: 140, image: '☕', salesCount: 0 },
  { id: '16', name: 'Латте', category: 'coffee', price: 150, image: '☕', salesCount: 0 },
  { id: '17', name: 'Американо', category: 'coffee', price: 110, image: '☕', salesCount: 0 },
  
  { id: '24', name: 'Шоколадный кекс', category: 'sweets', price: 80, image: '🧁', salesCount: 0 },
  { id: '25', name: 'Армянская пахлава', category: 'sweets', price: 100, image: '🥮', salesCount: 0 },
  { id: '26', name: 'Чизкейк классический', category: 'sweets', price: 150, image: '🍰', salesCount: 0 },
  
  { id: '36', name: 'Твистер', category: 'kitchen', price: 180, image: '🌯', salesCount: 0 },
  { id: '38', name: 'Бургер', category: 'kitchen', price: 200, image: '🍔', salesCount: 0 },
  { id: '40', name: 'Картофель фри', category: 'kitchen', price: 100, image: '🍟', salesCount: 0 },
  
  { id: '43', name: 'Кола', category: 'drinks', price: 80, image: '🥤', salesCount: 0 },
  { id: '44', name: 'Сок', category: 'drinks', price: 70, image: '🧃', salesCount: 0 },
  { id: '46', name: 'Вода', category: 'drinks', price: 50, image: '💧', salesCount: 0 },
];

const ADMIN_USER: User = {
  username: 'admin',
  password: 'admin',
  name: 'Администратор',
  role: 'admin'
};

const Index = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cartRef = useRef<HTMLDivElement | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [ADMIN_USER];
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [writeOffs, setWriteOffs] = useState<WriteOff[]>(() => {
    const saved = localStorage.getItem('writeOffs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [carts, setCarts] = useState<Cart[]>([{ id: '1', name: 'Корзина 1', items: [], createdAt: Date.now(), startTime: null }]);
  const [activeCartId, setActiveCartId] = useState('1');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryDialog, setCategoryDialog] = useState(false);
  
  const [addProductDialog, setAddProductDialog] = useState(false);
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [editProductDialog, setEditProductDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [addCashierDialog, setAddCashierDialog] = useState(false);
  const [manageCashiersDialog, setManageCashiersDialog] = useState(false);
  const [telegramSettingsDialog, setTelegramSettingsDialog] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [returnSaleDialog, setReturnSaleDialog] = useState(false);
  const [writeOffDialog, setWriteOffDialog] = useState(false);
  const [writeOffProduct, setWriteOffProduct] = useState<Product | null>(null);
  const [writeOffQuantity, setWriteOffQuantity] = useState('1');
  const [writeOffReason, setWriteOffReason] = useState('');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'pies', price: '', image: '🍞' });
  const [newCategory, setNewCategory] = useState({ id: '', label: '', emoji: '📦' });
  const [newCashier, setNewCashier] = useState({ username: '', password: '', name: '' });
  const [telegramSettings, setTelegramSettings] = useState(() => {
    const saved = localStorage.getItem('telegramSettings');
    return saved ? JSON.parse(saved) : { 
      botToken: '7547851624:AAH9HuMNryr88aJ8oLIugazpULsEaNMGlPk', 
      chatId: '444590628' 
    };
  });
  const [holdingCartId, setHoldingCartId] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdProgressRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const activeCart = carts.find(c => c.id === activeCartId) || carts[0];

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUKrk77RgGwU7k9n0ynsrBSp+zPLaizsKElyx6+mrVxMJR6Hh8r9vIAUrgs/y2Ik2CBdqvfDknE4MDlCq5O+0YBsFO5PZ9Mp8KwUqfszy2os7ChJcsevrq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA5QquTvtGAbBTuT2fTKfCsFKn7M8tqLOwoSXLHr66tXEwlHoeHyv28gBSuCz/LYiTYIF2q98OScTgwOUKrk77RgGwU7k9n0ynwrBSp+zPLaizsKElyx6+urVxMJR6Hh8r9vIAUrgs/y2Ik2CBdqvfDknE4MDlCq5O+0YBsFO5PZ9Mp8KwUqfszy2os7ChJcsevrq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA5QquTvtGAbBTuT2fTKfCsFKn7M8tqLOwoSXLHr66tXEwlHoeHyv28gBSuCz/LYiTYIF2q98OScTgwOUKrk77RgGwU7k9n0ynwrBSp+zPLaizsKElyx6+urVxMJR6Hh8r9vIAUrgs/y2Ik2CBdqvfDknE4MDlCq5O+0YBsFO5PZ9Mp8KwUqfszy2os7ChJcsevrq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA5QquTvtGAbBTuT2fTKfCsFKn7M8tqLOwoSXLHr66tXEwlHoeHyv28gBSuCz/LYiTYIF2q98OScTgwOUKrk77RgGwU7k9n0ynwrBSp+zPLaizsKElyx6+urq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA==');
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('writeOffs', JSON.stringify(writeOffs));
  }, [writeOffs]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('telegramSettings', JSON.stringify(telegramSettings));
  }, [telegramSettings]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      setSessionStartTime(Date.now());
      toast({ title: `Добро пожаловать, ${user.name}!` });
    } else {
      toast({ title: 'Неверный логин или пароль', variant: 'destructive' });
    }
  };

  const addCashier = () => {
    if (!newCashier.username || !newCashier.password || !newCashier.name) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    
    if (users.some(u => u.username === newCashier.username)) {
      toast({ title: 'Пользователь с таким логином уже существует', variant: 'destructive' });
      return;
    }

    const cashier: User = {
      username: newCashier.username,
      password: newCashier.password,
      name: newCashier.name,
      role: 'cashier'
    };

    setUsers([...users, cashier]);
    setNewCashier({ username: '', password: '', name: '' });
    setAddCashierDialog(false);
    toast({ title: `Кассир ${cashier.name} добавлен` });
  };

  const deleteCashier = (username: string) => {
    setUsers(users.filter(u => u.username !== username));
    toast({ title: 'Кассир удалён' });
  };

  const saveTelegramSettings = () => {
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    setTelegramSettingsDialog(false);
    toast({ title: 'Настройки Telegram сохранены' });
  };

  const sendReportToTelegram = async () => {
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      toast({ title: 'Настройте Telegram в настройках', variant: 'destructive' });
      return;
    }

    setSendingReport(true);

    try {
      const sessionSales = sessionStartTime 
        ? sales.filter(s => s.timestamp >= sessionStartTime)
        : sales;
      
      const sessionWriteOffs = sessionStartTime 
        ? writeOffs.filter(w => w.timestamp >= sessionStartTime)
        : writeOffs;

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

      const topProducts = products
        .filter(p => p.salesCount > 0)
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 5);

      let reportText = `📊 ОТЧЁТ О ПРОДАЖАХ\n\n` +
        `💼 Хлеб Бабушкин\n` +
        `👤 Кассир: ${currentUser?.name}\n` +
        `📅 Дата: ${new Date().toLocaleDateString('ru-RU')}\n` +
        `⏰ Время: ${new Date().toLocaleTimeString('ru-RU')}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `💰 Выручка за смену: ${sessionRevenue} ₽\n` +
        `   Продажи: ${salesTotal} ₽\n`;
      
      if (returnsTotal > 0) {
        reportText += `   Возвраты: -${returnsTotal} ₽\n`;
      }
      
      if (writeOffsTotal > 0) {
        reportText += `   Списания: -${writeOffsTotal} ₽\n`;
      }
      
      reportText += `\n💵 Наличные: ${cashRevenue} ₽`;
      if (cashReturns > 0) {
        reportText += ` (-${cashReturns} ₽ возврат)`;
      }
      reportText += `\n💳 Безналичные: ${cardRevenue} ₽`;
      if (cardReturns > 0) {
        reportText += ` (-${cardReturns} ₽ возврат)`;
      }
      
      reportText += `\n\n📦 Продано товаров: ${sessionItemsCount} шт\n` +
        `🛋️ Количество продаж: ${notReturnedSales.length}\n`;
      
      if (returnedSales.length > 0) {
        reportText += `🔙 Возвратов: ${returnedSales.length}\n`;
      }
      
      reportText += `\n━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🏆 ТОП-5 ТОВАРОВ:\n` +
        topProducts.map((p, i) => 
          `${i + 1}. ${p.name} - ${p.salesCount} шт`
        ).join('\n');
      
      if (sessionWriteOffs.length > 0) {
        reportText += `\n\n━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📋 СПИСАНИЯ (${sessionWriteOffs.length}):\n` +
          sessionWriteOffs.map((w) => 
            `${w.productName} - ${w.quantity} шт (${w.totalAmount} ₽)\n   Причина: ${w.reason}`
          ).join('\n');
      }

      const response = await fetch('https://functions.poehali.dev/c8e9896a-524b-4164-912d-ec49d9af0f35', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramSettings.botToken,
          chatId: telegramSettings.chatId,
          reportText: reportText
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка отправки');
      }

      toast({ title: 'Отчёт отправлен в Telegram!' });
    } catch (error) {
      toast({ 
        title: 'Ошибка отправки', 
        description: 'Проверьте настройки Telegram',
        variant: 'destructive' 
      });
    } finally {
      setSendingReport(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSessionStartTime(null);
    setUsername('');
    setPassword('');
    toast({ title: 'До свидания!' });
  };

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  const createFlyingAnimation = (event: React.MouseEvent, product: Product) => {
    if (!cartRef.current) return;
    const clickX = event.clientX;
    const clickY = event.clientY;
    const cartRect = cartRef.current.getBoundingClientRect();
    const cartX = cartRect.left + cartRect.width / 2;
    const cartY = cartRect.top + cartRect.height / 2;

    const flyingElement = document.createElement('div');
    flyingElement.textContent = product.image;
    flyingElement.className = 'fly-animation';
    flyingElement.style.left = `${clickX}px`;
    flyingElement.style.top = `${clickY}px`;
    flyingElement.style.fontSize = '48px';
    flyingElement.style.setProperty('--x-mid', `${(cartX - clickX) * 0.5}px`);
    flyingElement.style.setProperty('--y-mid', `${(cartY - clickY) * 0.5 - 100}px`);
    flyingElement.style.setProperty('--x-end', `${cartX - clickX}px`);
    flyingElement.style.setProperty('--y-end', `${cartY - clickY}px`);

    document.body.appendChild(flyingElement);
    setTimeout(() => document.body.removeChild(flyingElement), 800);
  };

  const addToCart = (product: Product, event: React.MouseEvent) => {
    createFlyingAnimation(event, product);
    setTimeout(() => {
      setCarts(carts.map(cart => {
        if (cart.id === activeCartId) {
          const existingItem = cart.items.find(item => item.id === product.id);
          const isFirstItem = cart.items.length === 0;
          
          if (existingItem) {
            return {
              ...cart,
              items: cart.items.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              )
            };
          } else {
            return { 
              ...cart, 
              items: [...cart.items, { ...product, quantity: 1 }],
              startTime: isFirstItem ? Date.now() : cart.startTime
            };
          }
        }
        return cart;
      }));
      audioRef.current?.play().catch(() => {});
    }, 400);
  };

  const removeFromCart = (id: string) => {
    setCarts(carts.map(cart => {
      if (cart.id === activeCartId) {
        return {
          ...cart,
          items: cart.items.map(item =>
            item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
          ).filter(item => item.id !== id || item.quantity > 1)
        };
      }
      return cart;
    }));
  };

  const addNewCart = () => {
    const newCartNumber = carts.length + 1;
    const newCart: Cart = {
      id: Date.now().toString(),
      name: `Корзина ${newCartNumber}`,
      items: [],
      createdAt: Date.now(),
      startTime: null
    };
    setCarts([...carts, newCart]);
    setActiveCartId(newCart.id);
    toast({ title: `Открыта ${newCart.name}` });
  };

  const closeCart = (cartId: string) => {
    if (carts.length === 1) {
      toast({ title: 'Нельзя закрыть единственную корзину', variant: 'destructive' });
      return;
    }
    const cartToClose = carts.find(c => c.id === cartId);
    if (cartToClose?.items.length > 0) {
      toast({ title: 'Очистите корзину перед закрытием', variant: 'destructive' });
      return;
    }
    
    const remainingCarts = carts.filter(c => c.id !== cartId);
    setCarts(remainingCarts);
    
    if (activeCartId === cartId && remainingCarts.length > 0) {
      setActiveCartId(remainingCarts[0].id);
    }
    toast({ title: 'Корзина закрыта' });
  };

  const handleHoldStart = (cartId: string) => {
    if (carts.length === 1) return;
    const cart = carts.find(c => c.id === cartId);
    if (cart?.items.length > 0) return;

    setHoldingCartId(cartId);
    setHoldProgress(0);

    let progress = 0;
    holdProgressRef.current = setInterval(() => {
      progress += 5;
      setHoldProgress(progress);
    }, 100);

    holdTimerRef.current = setTimeout(() => {
      closeCart(cartId);
      handleHoldEnd();
    }, 2000);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdProgressRef.current) {
      clearInterval(holdProgressRef.current);
      holdProgressRef.current = null;
    }
    setHoldingCartId(null);
    setHoldProgress(0);
  };

  const completeSale = (paymentMethod: 'cash' | 'card') => {
    if (activeCart.items.length === 0) return;
    const total = activeCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const sale: Sale = {
      id: Date.now().toString(),
      items: activeCart.items,
      total,
      timestamp: Date.now(),
      cashier: currentUser?.name || 'Unknown',
      paymentMethod,
      returned: false
    };
    
    setSales([...sales, sale]);
    
    activeCart.items.forEach(cartItem => {
      setProducts(products.map(p =>
        p.id === cartItem.id ? { ...p, salesCount: (p.salesCount || 0) + cartItem.quantity } : p
      ));
    });
    
    const updatedCarts = carts.filter(c => c.id !== activeCartId);
    if (updatedCarts.length === 0) {
      const newId = Date.now().toString();
      setCarts([{ id: newId, name: 'Корзина 1', items: [], createdAt: Date.now(), startTime: null }]);
      setActiveCartId(newId);
    } else {
      setCarts(updatedCarts);
      setActiveCartId(updatedCarts[0].id);
    }
    
    setPaymentDialog(false);
    toast({ title: `Продажа завершена! Сумма: ${total} ₽`, description: `Способ оплаты: ${paymentMethod === 'cash' ? 'Наличные' : 'Карта'}` });
  };

  const returnSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale || sale.returned) return;

    sale.items.forEach(item => {
      setProducts(products.map(p =>
        p.id === item.id ? { ...p, salesCount: Math.max(0, (p.salesCount || 0) - item.quantity) } : p
      ));
    });

    setSales(sales.map(s => s.id === saleId ? { ...s, returned: true } : s));
    toast({ title: 'Возврат выполнен', description: `Возвращено ${sale.total} ₽` });
    setReturnSaleDialog(false);
  };

  const openWriteOffDialog = (product: Product) => {
    setWriteOffProduct(product);
    setWriteOffQuantity('1');
    setWriteOffReason('');
    setWriteOffDialog(true);
  };

  const performWriteOff = () => {
    if (!writeOffProduct || !writeOffReason.trim()) {
      toast({ title: 'Укажите причину списания', variant: 'destructive' });
      return;
    }

    const quantity = parseInt(writeOffQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: 'Укажите корректное количество', variant: 'destructive' });
      return;
    }

    const totalAmount = writeOffProduct.price * quantity;

    const writeOff: WriteOff = {
      id: Date.now().toString(),
      productId: writeOffProduct.id,
      productName: writeOffProduct.name,
      quantity,
      price: writeOffProduct.price,
      totalAmount,
      reason: writeOffReason,
      timestamp: Date.now(),
      cashier: currentUser?.name || 'Unknown'
    };

    setWriteOffs([...writeOffs, writeOff]);
    toast({ title: 'Товар списан', description: `${writeOffProduct.name} — ${quantity} шт (${totalAmount} ₽)` });
    setWriteOffDialog(false);
  };

  const addProduct = () => {
    const price = parseFloat(newProduct.price);
    if (!newProduct.name || isNaN(price) || price <= 0) {
      toast({ title: 'Заполните все поля корректно', variant: 'destructive' });
      return;
    }
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      price,
      image: newProduct.image,
      salesCount: 0
    };
    setProducts([...products, product]);
    setAddProductDialog(false);
    setNewProduct({ name: '', category: 'pies', price: '', image: '🍞' });
    toast({ title: 'Товар добавлен' });
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({ title: 'Товар удалён' });
  };

  const addCategory = () => {
    if (!newCategory.id || !newCategory.label) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    if (categories.some(c => c.id === newCategory.id)) {
      toast({ title: 'Категория с таким ID уже существует', variant: 'destructive' });
      return;
    }
    setCategories([...categories, newCategory]);
    setAddCategoryDialog(false);
    setNewCategory({ id: '', label: '', emoji: '📦' });
    toast({ title: 'Категория добавлена' });
  };

  const deleteCategory = (categoryId: string) => {
    const hasProducts = products.some(p => p.category === categoryId);
    if (hasProducts) {
      toast({ title: 'В категории есть товары', variant: 'destructive' });
      return;
    }
    setCategories(categories.filter(c => c.id !== categoryId));
    toast({ title: 'Категория удалена' });
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newCategories = [...categories];
    const draggedItem = newCategories[dragItem.current];
    newCategories.splice(dragItem.current, 1);
    newCategories.splice(dragOverItem.current, 0, draggedItem);
    setCategories(newCategories);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const formatTime = (startTime: number | null) => {
    if (!startTime) return '--:--';
    
    const milliseconds = currentTime - startTime;
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const openCategoryDialog = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCategoryDialog(true);
  };
  
  const filteredProducts = selectedCategoryId
    ? products.filter(p => p.category === selectedCategoryId)
    : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Store" size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Хлеб Бабушкин</h1>
              <p className="text-muted-foreground">Вход в систему</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button className="w-full" size="lg" onClick={handleLogin}>
                Войти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Store" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Хлеб Бабушкин</h1>
                <p className="text-sm text-muted-foreground">{currentUser?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUser?.role === 'admin' && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setAddCategoryDialog(true)}>
                    <Icon name="FolderPlus" size={16} className="mr-1" />
                    Категория
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setAddProductDialog(true)}>
                    <Icon name="Plus" size={16} className="mr-1" />
                    Товар
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setManageCashiersDialog(true)}>
                    <Icon name="Users" size={16} className="mr-1" />
                    Кассиры
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setTelegramSettingsDialog(true)}>
                    <Icon name="Settings" size={16} className="mr-1" />
                    Telegram
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={sendReportToTelegram}
                disabled={sendingReport}
              >
                <Icon name="Send" size={16} className="mr-1" />
                {sendingReport ? 'Отправка...' : 'Отчёт в Telegram'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setReturnSaleDialog(true)}>
                <Icon name="Undo2" size={16} className="mr-1" />
                Возврат
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <Icon name="LogOut" size={16} className="mr-1" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {sessionStartTime && (() => {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-primary to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Выручка за смену</p>
                      <p className="text-3xl font-bold">{sessionRevenue} ₽</p>
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
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Продано товаров</p>
                      <p className="text-3xl font-bold">{sessionItemsCount} шт</p>
                    </div>
                    <Icon name="Package" size={40} className="opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Количество продаж</p>
                      <p className="text-3xl font-bold">{sessionSales.length}</p>
                    </div>
                    <Icon name="ShoppingBag" size={40} className="opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()}
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Категории</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <Card
                    key={category.id}
                    className={`category-card cursor-pointer hover:shadow-lg border-2 border-transparent hover:border-primary ${
                      currentUser?.role === 'admin' ? 'drag-handle' : ''
                    }`}
                    draggable={currentUser?.role === 'admin'}
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => openCategoryDialog(category.id)}
                  >
                    <CardContent className="p-6 text-center relative">
                      <div className="text-5xl mb-2">{category.emoji}</div>
                      <p className="font-semibold">{category.label}</p>
                      {currentUser?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCategory(category.id);
                          }}
                        >
                          <Icon name="Trash2" size={14} className="text-red-600" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {carts.map(cart => (
                <Button
                  key={cart.id}
                  variant={activeCartId === cart.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCartId(cart.id)}
                  className="relative min-w-[140px] h-auto py-2 px-3 flex flex-col items-start"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-xs">{cart.name}</span>
                    {carts.length > 1 && cart.items.length === 0 && (
                      <div
                        className="relative ml-2 w-6 h-6 flex items-center justify-center cursor-pointer"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleHoldStart(cart.id);
                        }}
                        onMouseUp={(e) => {
                          e.stopPropagation();
                          handleHoldEnd();
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                          handleHoldEnd();
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          handleHoldStart(cart.id);
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          handleHoldEnd();
                        }}
                      >
                        {holdingCartId === cart.id && (
                          <div 
                            className="absolute inset-0 rounded-full bg-red-500"
                            style={{
                              transform: `scale(${holdProgress / 100})`,
                              opacity: 0.3,
                              transition: 'none'
                            }}
                          />
                        )}
                        <Icon 
                          name="X" 
                          size={14} 
                          className={`relative z-10 transition-colors ${
                            holdingCartId === cart.id ? 'text-red-600' : 'hover:text-red-500'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <Icon name="Clock" size={12} className="opacity-70" />
                    <span className="text-xs opacity-80">
                      {formatTime(cart.startTime)}
                    </span>
                  </div>
                  {cart.items.length > 0 && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addNewCart}
                className="min-w-[40px] h-auto py-2 px-2"
              >
                <Icon name="Plus" size={16} />
              </Button>
            </div>

            <Card className="sticky top-24" ref={cartRef}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{activeCart.name}</h3>
                  {activeCart.startTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Timer" size={16} />
                      <span className="font-mono">{formatTime(activeCart.startTime)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {activeCart.items.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
                  ) : (
                    activeCart.items.map(item => (
                      <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                        <div className="text-3xl">{item.image}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-2">{item.name}</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => removeFromCart(item.id)}>
                                <Icon name="Minus" size={12} />
                              </Button>
                              <span className="font-medium w-6 text-center">{item.quantity}</span>
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={(e) => addToCart(item, e as any)}>
                                <Icon name="Plus" size={12} />
                              </Button>
                            </div>
                            <span className="font-bold text-primary">{(item.price * item.quantity)} ₽</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {activeCart.items.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Итого:</span>
                      <span className="text-2xl font-bold text-primary">
                        {activeCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₽
                      </span>
                    </div>
                    <Button className="w-full" size="lg" onClick={() => setPaymentDialog(true)}>
                      <Icon name="CreditCard" size={20} className="mr-2" />
                      Оплатить
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedCategoryId && categories.find(c => c.id === selectedCategoryId)?.emoji}{' '}
              {selectedCategoryId && categories.find(c => c.id === selectedCategoryId)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="relative group hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <div className="text-5xl">{product.image}</div>
                  </div>
                  <h3 className="font-medium text-sm mb-2 min-h-[40px] line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary">{product.price} ₽</span>
                  </div>
                  <Button className="w-full mb-2" size="sm" onClick={(e) => {
                    addToCart(product, e);
                    setCategoryDialog(false);
                  }}>
                    <Icon name="ShoppingCart" size={14} className="mr-1" />
                    В корзину
                  </Button>
                  
                  {currentUser?.role === 'admin' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setCategoryDialog(false);
                          openWriteOffDialog(product);
                        }}
                      >
                        <Icon name="PackageMinus" size={14} className="mr-1" />
                        Списать
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 bg-white"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Icon name="Trash2" size={14} className="text-red-600" />
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выберите способ оплаты</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" className="h-32 flex-col gap-2" onClick={() => completeSale('cash')}>
              <Icon name="Wallet" size={32} />
              <span className="text-lg">Наличные</span>
            </Button>
            <Button size="lg" className="h-32 flex-col gap-2" onClick={() => completeSale('card')}>
              <Icon name="CreditCard" size={32} />
              <span className="text-lg">Карта</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addProductDialog} onOpenChange={setAddProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить товар</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название</Label>
              <Input value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
            </div>
            <div>
              <Label>Категория</Label>
              <Select value={newProduct.category} onValueChange={(v) => setNewProduct({...newProduct, category: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Цена (₽)</Label>
              <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
            </div>
            <div>
              <Label>Эмодзи</Label>
              <Input value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProductDialog(false)}>Отмена</Button>
            <Button onClick={addProduct}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addCategoryDialog} onOpenChange={setAddCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить категорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ID (латиницей)</Label>
              <Input value={newCategory.id} onChange={(e) => setNewCategory({...newCategory, id: e.target.value})} />
            </div>
            <div>
              <Label>Название</Label>
              <Input value={newCategory.label} onChange={(e) => setNewCategory({...newCategory, label: e.target.value})} />
            </div>
            <div>
              <Label>Эмодзи</Label>
              <Input value={newCategory.emoji} onChange={(e) => setNewCategory({...newCategory, emoji: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialog(false)}>Отмена</Button>
            <Button onClick={addCategory}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={manageCashiersDialog} onOpenChange={setManageCashiersDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Управление кассирами</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button className="w-full" onClick={() => {
              setManageCashiersDialog(false);
              setAddCashierDialog(true);
            }}>
              <Icon name="UserPlus" size={16} className="mr-2" />
              Добавить кассира
            </Button>
            
            <div className="border rounded-lg divide-y">
              {users.filter(u => u.role === 'cashier').map(cashier => (
                <div key={cashier.username} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cashier.name}</p>
                    <p className="text-sm text-muted-foreground">Логин: {cashier.username}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCashier(cashier.username)}
                  >
                    <Icon name="Trash2" size={16} className="text-red-600" />
                  </Button>
                </div>
              ))}
              {users.filter(u => u.role === 'cashier').length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Icon name="Users" size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Нет кассиров</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addCashierDialog} onOpenChange={setAddCashierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить кассира</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Имя кассира</Label>
              <Input 
                placeholder="Например: Мария Иванова"
                value={newCashier.name} 
                onChange={(e) => setNewCashier({...newCashier, name: e.target.value})} 
              />
            </div>
            <div>
              <Label>Логин</Label>
              <Input 
                placeholder="Например: maria"
                value={newCashier.username} 
                onChange={(e) => setNewCashier({...newCashier, username: e.target.value})} 
              />
            </div>
            <div>
              <Label>Пароль</Label>
              <Input 
                type="password"
                placeholder="Придумайте пароль"
                value={newCashier.password} 
                onChange={(e) => setNewCashier({...newCashier, password: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddCashierDialog(false);
              setManageCashiersDialog(true);
            }}>
              Отмена
            </Button>
            <Button onClick={addCashier}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={telegramSettingsDialog} onOpenChange={setTelegramSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки Telegram</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Bot Token</Label>
              <Input 
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={telegramSettings.botToken} 
                onChange={(e) => setTelegramSettings({...telegramSettings, botToken: e.target.value})} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Получите токен у @BotFather в Telegram
              </p>
            </div>
            <div>
              <Label>Chat ID</Label>
              <Input 
                placeholder="-1001234567890"
                value={telegramSettings.chatId} 
                onChange={(e) => setTelegramSettings({...telegramSettings, chatId: e.target.value})} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                ID чата или группы для отправки отчётов
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTelegramSettingsDialog(false)}>
              Отмена
            </Button>
            <Button onClick={saveTelegramSettings}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={returnSaleDialog} onOpenChange={setReturnSaleDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Возврат товара</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {sessionStartTime && sales.filter(s => s.timestamp >= sessionStartTime && !s.returned).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Package" size={48} className="mx-auto mb-2 opacity-20" />
                <p>Нет продаж для возврата</p>
              </div>
            ) : (
              sales
                .filter(s => sessionStartTime && s.timestamp >= sessionStartTime && !s.returned)
                .reverse()
                .map(sale => (
                  <Card key={sale.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.timestamp).toLocaleTimeString('ru-RU')}
                        </p>
                        <p className="font-semibold text-lg">{sale.total} ₽</p>
                        <p className="text-xs text-muted-foreground">
                          {sale.paymentMethod === 'cash' ? 'Наличные' : 'Карта'} • {sale.cashier}
                        </p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => returnSale(sale.id)}
                      >
                        <Icon name="Undo2" size={16} className="mr-1" />
                        Вернуть
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-lg">{item.image}</span>
                          <span className="flex-1">{item.name}</span>
                          <span className="text-muted-foreground">{item.quantity} шт</span>
                          <span className="font-medium">{item.price * item.quantity} ₽</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={writeOffDialog} onOpenChange={setWriteOffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Списание товара</DialogTitle>
          </DialogHeader>
          {writeOffProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-3xl">{writeOffProduct.image}</span>
                <div>
                  <p className="font-medium">{writeOffProduct.name}</p>
                  <p className="text-sm text-muted-foreground">{writeOffProduct.price} ₽</p>
                </div>
              </div>
              <div>
                <Label>Количество</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={writeOffQuantity}
                  onChange={(e) => setWriteOffQuantity(e.target.value)}
                />
              </div>
              <div>
                <Label>Причина списания</Label>
                <Input 
                  placeholder="Например: брак, истёк срок годности"
                  value={writeOffReason}
                  onChange={(e) => setWriteOffReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setWriteOffDialog(false)}>
              Отмена
            </Button>
            <Button onClick={performWriteOff}>Списать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;