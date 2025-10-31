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
import { User, Category, Product, Cart, Sale, WriteOff } from '@/types';
import { ADMIN_USER, INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/constants';
import { LoginForm } from '@/components/cash-register/LoginForm';
import { Header } from '@/components/cash-register/Header';
import { StatsCards } from '@/components/cash-register/StatsCards';
import { CategoryGrid } from '@/components/cash-register/CategoryGrid';
import { CartPanel } from '@/components/cash-register/CartPanel';

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
  const [returningSale, setReturningSale] = useState<Sale | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnQuantities, setReturnQuantities] = useState<{[key: string]: number}>({});
  const [confirmReturnDialog, setConfirmReturnDialog] = useState(false);
  const [closeShiftDialog, setCloseShiftDialog] = useState(false);
  
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
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

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

  const handleCloseShift = () => {
    setCloseShiftDialog(true);
  };

  const confirmCloseShift = async () => {
    await sendReportToTelegram();
    setCloseShiftDialog(false);
    handleLogout();
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

      const shiftStart = sessionStartTime ? new Date(sessionStartTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '-';
      const shiftEnd = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

      let reportText = `📊 ОТЧЁТ О ПРОДАЖАХ\n\n` +
        `💼 Хлеб Бабушкин\n` +
        `👤 Кассир: ${currentUser?.name}\n` +
        `📅 Дата: ${new Date().toLocaleDateString('ru-RU')}\n` +
        `🕐 Смена: ${shiftStart} - ${shiftEnd}\n\n` +
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
      
      reportText += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      if (topProducts.length > 0) {
        reportText += `🏆 ТОП-${topProducts.length} товаров:\n`;
        topProducts.forEach((product, index) => {
          reportText += `${index + 1}. ${product.name} — ${product.salesCount} шт\n`;
        });
        reportText += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
      }

      if (sessionWriteOffs.length > 0) {
        reportText += `❌ Списания (${sessionWriteOffs.length}):\n`;
        sessionWriteOffs.forEach(writeOff => {
          reportText += `• ${writeOff.productName} — ${writeOff.quantity} шт (${writeOff.totalAmount} ₽)\n`;
          reportText += `  Причина: ${writeOff.reason}\n`;
        });
        reportText += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
      }

      if (returnedSales.length > 0) {
        reportText += `🔙 Возвраты (${returnedSales.length}):\n`;
        returnedSales.forEach(sale => {
          reportText += `• Чек ${sale.id.slice(-6)} — ${sale.total} ₽\n`;
          if (sale.returnReason) {
            reportText += `  Причина: ${sale.returnReason}\n`;
          }
        });
      }

      const response = await fetch('https://functions.yandexcloud.net/d4en92b61qdi4m6gqgv1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    flyingElement.style.fontSize = '2rem';
    flyingElement.style.setProperty('--x-end', `${cartX - clickX}px`);
    flyingElement.style.setProperty('--y-end', `${cartY - clickY}px`);
    flyingElement.style.setProperty('--x-mid', `${(cartX - clickX) / 2}px`);
    flyingElement.style.setProperty('--y-mid', `${(cartY - clickY) / 2 - 50}px`);
    
    document.body.appendChild(flyingElement);
    setTimeout(() => flyingElement.remove(), 800);
  };

  const addToCart = (product: Product, event: React.MouseEvent) => {
    const existingItem = activeCart.items.find(item => item.id === product.id);
    
    if (existingItem) {
      const updatedCarts = carts.map(cart => {
        if (cart.id === activeCartId) {
          const updatedItems = cart.items.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
          return { ...cart, items: updatedItems };
        }
        return cart;
      });
      setCarts(updatedCarts);
    } else {
      const newItem = { ...product, quantity: 1 };
      const updatedCarts = carts.map(cart => {
        if (cart.id === activeCartId) {
          const updatedCart = { ...cart, items: [...cart.items, newItem] };
          if (!cart.startTime) {
            updatedCart.startTime = Date.now();
          }
          return updatedCart;
        }
        return cart;
      });
      setCarts(updatedCarts);
    }

    createFlyingAnimation(event, product);
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const removeFromCart = (productId: string) => {
    const updatedCarts = carts.map(cart => {
      if (cart.id === activeCartId) {
        const existingItem = cart.items.find(item => item.id === productId);
        
        if (existingItem && existingItem.quantity > 1) {
          const updatedItems = cart.items.map(item =>
            item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
          );
          return { ...cart, items: updatedItems };
        } else {
          const updatedItems = cart.items.filter(item => item.id !== productId);
          return { ...cart, items: updatedItems };
        }
      }
      return cart;
    });
    
    setCarts(updatedCarts);
  };

  const addNewCart = () => {
    const newId = Date.now().toString();
    const newCart: Cart = {
      id: newId,
      name: `Корзина ${carts.length + 1}`,
      items: [],
      createdAt: Date.now(),
      startTime: null
    };
    setCarts([...carts, newCart]);
    setActiveCartId(newId);
    toast({ title: `Создана ${newCart.name}` });
  };

  const closeCart = (cartId: string) => {
    const cart = carts.find(c => c.id === cartId);
    if (cart && cart.items.length > 0) {
      toast({ title: 'Сначала оплатите или очистите корзину', variant: 'destructive' });
      return;
    }
    
    const updatedCarts = carts.filter(c => c.id !== cartId);
    
    if (updatedCarts.length === 0) {
      const newId = Date.now().toString();
      setCarts([{ id: newId, name: 'Корзина 1', items: [], createdAt: Date.now(), startTime: null }]);
      setActiveCartId(newId);
    } else {
      setCarts(updatedCarts);
      if (activeCartId === cartId) {
        setActiveCartId(updatedCarts[0].id);
      }
    }
  };

  const handleHoldStart = (cartId: string) => {
    setHoldingCartId(cartId);
    setHoldProgress(0);
    
    let progress = 0;
    holdProgressRef.current = setInterval(() => {
      progress += 5;
      setHoldProgress(progress);
      if (progress >= 100) {
        handleHoldEnd();
      }
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      closeCart(cartId);
      handleHoldEnd();
    }, 1000);
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

  const openReturnDialog = (sale: Sale) => {
    setReturningSale(sale);
    setReturnReason('');
    const initialQuantities: {[key: string]: number} = {};
    sale.items.forEach(item => {
      initialQuantities[item.id] = item.quantity;
    });
    setReturnQuantities(initialQuantities);
    setConfirmReturnDialog(true);
  };

  const confirmReturn = () => {
    if (!returningSale || !returnReason.trim()) {
      toast({ title: 'Укажите причину возврата', variant: 'destructive' });
      return;
    }

    const hasItemsToReturn = Object.values(returnQuantities).some(q => q > 0);
    if (!hasItemsToReturn) {
      toast({ title: 'Выберите товары для возврата', variant: 'destructive' });
      return;
    }

    let returnTotal = 0;
    const returnedItems: typeof returningSale.items = [];

    returningSale.items.forEach(item => {
      const returnQty = returnQuantities[item.id] || 0;
      if (returnQty > 0) {
        returnTotal += item.price * returnQty;
        returnedItems.push({ ...item, quantity: returnQty });
        setProducts(products.map(p =>
          p.id === item.id ? { ...p, salesCount: Math.max(0, (p.salesCount || 0) - returnQty) } : p
        ));
      }
    });

    const allItemsReturned = returningSale.items.every(item => returnQuantities[item.id] === item.quantity);

    if (allItemsReturned) {
      setSales(sales.map(s => 
        s.id === returningSale.id 
          ? { ...s, returned: true, returnTimestamp: Date.now(), returnReason: returnReason } 
          : s
      ));
    } else {
      const partialReturnSale: Sale = {
        id: Date.now().toString(),
        items: returnedItems,
        total: returnTotal,
        timestamp: Date.now(),
        cashier: returningSale.cashier,
        paymentMethod: returningSale.paymentMethod,
        returned: true,
        returnTimestamp: Date.now(),
        returnReason: returnReason
      };
      setSales([...sales, partialReturnSale]);
    }
    
    toast({ title: 'Возврат выполнен', description: `Возвращено ${returnTotal} ₽` });
    setConfirmReturnDialog(false);
    setReturnSaleDialog(false);
    setReturningSale(null);
    setReturnReason('');
    setReturnQuantities({});
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
    setNewCategory({ id: '', label: '', emoji: '📦' });
    setAddCategoryDialog(false);
    toast({ title: 'Категория добавлена' });
  };

  const deleteCategory = (categoryId: string) => {
    const hasProducts = products.some(p => p.category === categoryId);
    if (hasProducts) {
      toast({ title: 'Сначала удалите товары из этой категории', variant: 'destructive' });
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
    
    const categoryListCopy = [...categories];
    const draggedItemContent = categoryListCopy[dragItem.current];
    categoryListCopy.splice(dragItem.current, 1);
    categoryListCopy.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    setCategories(categoryListCopy);
  };

  const formatTime = (startTime: number | null) => {
    if (!startTime) return '00:00';
    const elapsed = Math.floor((currentTime - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
      <LoginForm
        username={username}
        password={password}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header
        currentUser={currentUser}
        sendingReport={sendingReport}
        onAddCategory={() => setAddCategoryDialog(true)}
        onAddProduct={() => setAddProductDialog(true)}
        onManageCashiers={() => setManageCashiersDialog(true)}
        onTelegramSettings={() => setTelegramSettingsDialog(true)}
        onSendReport={sendReportToTelegram}
        onReturn={() => setReturnSaleDialog(true)}
        onCloseShift={handleCloseShift}
      />

      <div className="container mx-auto px-4 py-6">
        <StatsCards
          sessionStartTime={sessionStartTime}
          sales={sales}
          writeOffs={writeOffs}
        />
        
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <CategoryGrid
              categories={categories}
              userRole={currentUser?.role || 'cashier'}
              onCategoryClick={openCategoryDialog}
              onDeleteCategory={deleteCategory}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
            />
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {carts.map(cart => (
                <Button
                  key={cart.id}
                  variant={activeCartId === cart.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCartId(cart.id)}
                  className="min-w-[120px] h-auto py-2 px-3 flex-col items-start gap-1 relative"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-medium">{cart.name}</span>
                    {carts.length > 1 && (
                      <div
                        className="ml-2 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-100 transition-colors relative overflow-hidden"
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

            <CartPanel
              ref={cartRef}
              cart={activeCart}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onOpenPayment={() => setPaymentDialog(true)}
              formatTime={formatTime}
            />
          </div>
        </div>
      </div>

      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] md:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">
              {selectedCategoryId && categories.find(c => c.id === selectedCategoryId)?.emoji}{' '}
              {selectedCategoryId && categories.find(c => c.id === selectedCategoryId)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="relative group hover:shadow-lg transition-all">
                <CardContent className="p-3 md:p-4">
                  <div className="text-center mb-2 md:mb-3">
                    <div className="text-4xl md:text-5xl">{product.image}</div>
                  </div>
                  <h3 className="font-medium text-xs md:text-sm mb-2 min-h-[32px] md:min-h-[40px] line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <span className="text-base md:text-lg font-bold text-primary">{product.price} ₽</span>
                  </div>
                  <Button className="w-full mb-2 min-h-[44px] md:min-h-[36px] touch-manipulation text-sm md:text-base" size="sm" onClick={(e) => {
                    addToCart(product, e);
                    setCategoryDialog(false);
                  }}>
                    <Icon name="ShoppingCart" size={16} className="mr-1 md:w-3.5 md:h-3.5" />
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">Выберите способ оплаты</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Button size="lg" className="h-40 md:h-32 flex-col gap-3 md:gap-2 touch-manipulation" onClick={() => completeSale('cash')}>
              <Icon name="Wallet" size={48} className="md:w-8 md:h-8" />
              <span className="text-xl md:text-lg font-semibold">Наличные</span>
            </Button>
            <Button size="lg" className="h-40 md:h-32 flex-col gap-3 md:gap-2 touch-manipulation" onClick={() => completeSale('card')}>
              <Icon name="CreditCard" size={48} className="md:w-8 md:h-8" />
              <span className="text-xl md:text-lg font-semibold">Карта</span>
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
              Назад
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
                placeholder="123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                value={telegramSettings.botToken} 
                onChange={(e) => setTelegramSettings({...telegramSettings, botToken: e.target.value})} 
              />
            </div>
            <div>
              <Label>Chat ID</Label>
              <Input 
                placeholder="123456789"
                value={telegramSettings.chatId} 
                onChange={(e) => setTelegramSettings({...telegramSettings, chatId: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTelegramSettingsDialog(false)}>Отмена</Button>
            <Button onClick={saveTelegramSettings}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={returnSaleDialog} onOpenChange={setReturnSaleDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Возврат товара</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {sales.filter(s => !s.returned && sessionStartTime && s.timestamp >= sessionStartTime).reverse().map(sale => (
              <Card key={sale.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openReturnDialog(sale)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-lg">{sale.total} ₽</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.paymentMethod === 'cash' ? 'Наличные' : 'Карта'} • 
                        {new Date(sale.timestamp).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Icon name="Undo2" size={16} className="mr-1" />
                      Вернуть
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sale.items.map((item, idx) => (
                      <Badge key={idx} variant="secondary">
                        {item.image} {item.name} ×{item.quantity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {sales.filter(s => !s.returned && sessionStartTime && s.timestamp >= sessionStartTime).length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Icon name="ShoppingBag" size={48} className="mx-auto mb-2 opacity-20" />
                <p>Нет продаж для возврата</p>
              </div>
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

      <Dialog open={confirmReturnDialog} onOpenChange={setConfirmReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение возврата</DialogTitle>
          </DialogHeader>
          {returningSale && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p className="font-semibold text-lg">{returningSale.total} ₽</p>
                <p className="text-sm text-muted-foreground">
                  {returningSale.paymentMethod === 'cash' ? 'Наличные' : 'Карта'} • 
                  {new Date(returningSale.timestamp).toLocaleString('ru-RU')}
                </p>
                <div className="pt-2 border-t space-y-3">
                  {returningSale.items.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{item.image}</span>
                        <span className="flex-1">{item.name}</span>
                        <span className="text-muted-foreground">{item.price} ₽</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Вернуть:</Label>
                        <Input 
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={returnQuantities[item.id] || 0}
                          onChange={(e) => {
                            const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), item.quantity);
                            setReturnQuantities({...returnQuantities, [item.id]: value});
                          }}
                          className="w-20 h-8 text-center"
                        />
                        <span className="text-xs text-muted-foreground">из {item.quantity} шт</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Причина возврата</Label>
                <Input 
                  placeholder="Например: брак товара, не понравилось"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReturnDialog(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmReturn}>
              Вернуть деньги
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={closeShiftDialog} onOpenChange={setCloseShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Закрытие смены</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              При закрытии смены будет автоматически отправлен отчёт в Telegram, и вы выйдете из системы.
            </p>
            {sessionStartTime && (() => {
              const sessionSales = sales.filter(s => s.timestamp >= sessionStartTime);
              const sessionWriteOffs = writeOffs.filter(w => w.timestamp >= sessionStartTime);
              
              const notReturnedSales = sessionSales.filter(s => !s.returned);
              const returnsTotal = sessionSales.filter(s => s.returned).reduce((sum, s) => sum + s.total, 0);
              
              const salesTotal = notReturnedSales.reduce((sum, s) => sum + s.total, 0);
              const writeOffsTotal = sessionWriteOffs.reduce((sum, w) => sum + w.totalAmount, 0);
              const sessionRevenue = salesTotal - writeOffsTotal;

              return (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Выручка за смену:</span>
                    <span className="font-semibold">{sessionRevenue} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Продажи:</span>
                    <span>{notReturnedSales.length}</span>
                  </div>
                  {returnsTotal > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Возвраты:</span>
                      <span>-{returnsTotal} ₽</span>
                    </div>
                  )}
                  {writeOffsTotal > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Списания:</span>
                      <span>-{writeOffsTotal} ₽</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseShiftDialog(false)}>
              Отмена
            </Button>
            <Button onClick={confirmCloseShift} disabled={sendingReport}>
              {sendingReport ? 'Отправка отчёта...' : 'Закрыть смену'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
