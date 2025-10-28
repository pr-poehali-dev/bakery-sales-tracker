import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'admin' | 'cashier';

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
}

interface User {
  username: string;
  password: string;
  role: UserRole;
}

const COFFEE_SIZES = {
  small: { label: '100 мл', multiplier: 1 },
  medium: { label: '250 мл', multiplier: 1.3 },
  large: { label: '400 мл', multiplier: 1.6 }
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 'pies', label: '🍽️ Пирожки', emoji: '🍽️' },
  { id: 'coffee', label: '☕ Кофе и Чай', emoji: '☕' },
  { id: 'sweets', label: '🍰 Сладкое', emoji: '🍰' },
  { id: 'kitchen', label: '🍔 Кухня', emoji: '🍔' },
  { id: 'drinks', label: '🥤 Напитки', emoji: '🥤' }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Пирожок с капустой', category: 'pies', price: 50, image: '🥟', salesCount: 0 },
  { id: '2', name: 'Пирожок с картошкой', category: 'pies', price: 50, image: '🥟', salesCount: 0 },
  { id: '3', name: 'Пирожок с мясом', category: 'pies', price: 60, image: '🥟', salesCount: 0 },
  { id: '4', name: 'Чебурек с мясом', category: 'pies', price: 80, image: '🥙', salesCount: 0 },
  { id: '5', name: 'Чебурек с сыром', category: 'pies', price: 75, image: '🥙', salesCount: 0 },
  { id: '6', name: 'Хачапури с сыром', category: 'pies', price: 90, image: '🫓', salesCount: 0 },
  { id: '7', name: 'Хачапури с сыром и зеленью', category: 'pies', price: 95, image: '🫓', salesCount: 0 },
  { id: '8', name: 'Хачапури с мясом', category: 'pies', price: 100, image: '🫓', salesCount: 0 },
  { id: '9', name: 'Матнакаш', category: 'pies', price: 120, image: '🍞', salesCount: 0 },
  { id: '10', name: 'Армянский тонкий лаваш', category: 'pies', price: 40, image: '🥖', salesCount: 0 },
  { id: '11', name: 'Хлеб ржаной', category: 'pies', price: 60, image: '🍞', salesCount: 0 },
  { id: '12', name: 'Хлеб рижский', category: 'pies', price: 65, image: '🍞', salesCount: 0 },
  { id: '13', name: 'Хлеб черный с семечками', category: 'pies', price: 70, image: '🍞', salesCount: 0 },
  
  { id: '14', name: 'Эспрессо', category: 'coffee', price: 100, image: '☕', salesCount: 0 },
  { id: '15', name: 'Капучино', category: 'coffee', price: 140, image: '☕', salesCount: 0 },
  { id: '16', name: 'Латте', category: 'coffee', price: 150, image: '☕', salesCount: 0 },
  { id: '17', name: 'Американо', category: 'coffee', price: 110, image: '☕', salesCount: 0 },
  { id: '18', name: 'Флэт уайт', category: 'coffee', price: 155, image: '☕', salesCount: 0 },
  { id: '19', name: 'Раф', category: 'coffee', price: 160, image: '☕', salesCount: 0 },
  { id: '20', name: 'Кофе на песке', category: 'coffee', price: 180, image: '☕', salesCount: 0 },
  { id: '21', name: 'Чай пакетированный', category: 'coffee', price: 50, image: '🍵', salesCount: 0 },
  { id: '22', name: 'Лавандовый раф', category: 'coffee', price: 170, image: '☕', salesCount: 0 },
  { id: '23', name: 'Облепиховый чай', category: 'coffee', price: 120, image: '🍵', salesCount: 0 },
  
  { id: '24', name: 'Шоколадный кекс', category: 'sweets', price: 80, image: '🧁', salesCount: 0 },
  { id: '25', name: 'Армянская пахлава', category: 'sweets', price: 100, image: '🥮', salesCount: 0 },
  { id: '26', name: 'Чизкейк классический', category: 'sweets', price: 150, image: '🍰', salesCount: 0 },
  { id: '27', name: 'Чизкейк шоколадный', category: 'sweets', price: 160, image: '🍰', salesCount: 0 },
  { id: '28', name: 'Наполеон', category: 'sweets', price: 120, image: '🍰', salesCount: 0 },
  { id: '29', name: 'Медовик', category: 'sweets', price: 110, image: '🍰', salesCount: 0 },
  { id: '30', name: 'Булочки с изюмом, маком', category: 'sweets', price: 45, image: '🥐', salesCount: 0 },
  { id: '31', name: 'Пончики', category: 'sweets', price: 60, image: '🍩', salesCount: 0 },
  { id: '32', name: 'Сушки', category: 'sweets', price: 40, image: '🍪', salesCount: 0 },
  { id: '33', name: 'Печенье монетки', category: 'sweets', price: 50, image: '🍪', salesCount: 0 },
  { id: '34', name: 'Печенье с джемом', category: 'sweets', price: 55, image: '🍪', salesCount: 0 },
  { id: '35', name: 'Козинаки в шоколаде', category: 'sweets', price: 70, image: '🍫', salesCount: 0 },
  
  { id: '36', name: 'Твистер', category: 'kitchen', price: 180, image: '🌯', salesCount: 0 },
  { id: '37', name: 'Твистер де люкс', category: 'kitchen', price: 220, image: '🌯', salesCount: 0 },
  { id: '38', name: 'Бургер', category: 'kitchen', price: 200, image: '🍔', salesCount: 0 },
  { id: '39', name: 'Бургер де люкс', category: 'kitchen', price: 250, image: '🍔', salesCount: 0 },
  { id: '40', name: 'Картофель фри средний', category: 'kitchen', price: 100, image: '🍟', salesCount: 0 },
  { id: '41', name: 'Картофель фри большой', category: 'kitchen', price: 130, image: '🍟', salesCount: 0 },
  { id: '42', name: 'Комбо (фри, бургер/твистер, кола)', category: 'kitchen', price: 350, image: '🍱', salesCount: 0 },
  
  { id: '43', name: 'Добрый кола', category: 'drinks', price: 80, image: '🥤', salesCount: 0 },
  { id: '44', name: 'Азвкус сок', category: 'drinks', price: 70, image: '🧃', salesCount: 0 },
  { id: '45', name: 'Аскания', category: 'drinks', price: 60, image: '💧', salesCount: 0 },
  { id: '46', name: 'Вода негазированная святой источник', category: 'drinks', price: 50, image: '💧', salesCount: 0 },
];

const Index = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bakery-users');
    return saved ? JSON.parse(saved) : [
      { username: 'admin', password: 'admin123', role: 'admin' as UserRole },
      { username: 'cashier', password: '1234', role: 'cashier' as UserRole }
    ];
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('bakery-session-active');
    return saved === 'true';
  });
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('bakery-user-role');
    return (saved as UserRole) || 'cashier';
  });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('bakery-session-start');
    return saved ? parseInt(saved) : null;
  });
  const [sessionDuration, setSessionDuration] = useState('00:00:00');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('cashier');
  const [carts, setCarts] = useState<Cart[]>([{ id: '1', name: 'Корзина 1', items: [], createdAt: Date.now() }]);
  const [activeCartId, setActiveCartId] = useState('1');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bakery-products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('bakery-categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryHome, setShowCategoryHome] = useState(true);
  const [customPriceDialog, setCustomPriceDialog] = useState(false);
  const [customPrice, setCustomPrice] = useState('');
  const [editProductDialog, setEditProductDialog] = useState(false);
  const [addProductDialog, setAddProductDialog] = useState(false);
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState(() => {
    return localStorage.getItem('bakery-telegram-token') || '';
  });
  const [telegramChatId, setTelegramChatId] = useState(() => {
    return localStorage.getItem('bakery-telegram-chat') || '';
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'pies', price: '', image: '🍞', customImage: '' });
  const [newCategory, setNewCategory] = useState({ id: '', label: '', emoji: '📦' });
  const [cartTimers, setCartTimers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const activeCart = carts.find(c => c.id === activeCartId) || carts[0];

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUKrk77RgGwU7k9n0ynsrBSp+zPLaizsKElyx6+mrVxMJR6Hh8r9vIAUrgs/y2Ik2CBdqvfDknE4MDlCq5O+0YBsFO5PZ9Mp8KwUqfszy2os7ChJcsevrq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA5QquTvtGAbBTuT2fTKfCsFKn7M8tqLOwoSXLHr66tXEwlHoeHyv28gBSuCz/LYiTYIF2q98OScTgwOUKrk77RgGwU7k9n0ynwrBSp+zPLaizsKElyx6+urVxMJR6Hh8r9vIAUrgs/y2Ik2CBdqvfDknE4MDlCq5O+0YBsFO5PZ9Mp8KwUqfszy2os7ChJcsevrq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA5QquTvtGAbBTuT2fTKfCsFKn7M8tqLOwoSXLHr66tXEwlHoeHyv28gBSuCz/LYiTYIF2q98OScTgwOUKrk77RgGwU7k9n0ynwrBSp+zPLaizsKElyx6+urVxMJR6Hh8r9vIAUrgs/y2Ik2CBdqvfDknE4MDlCq5O+0YBsFO5PZ9Mp8KwUqfszy2os7ChJcsevrq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA5QquTvtGAbBTuT2fTKfCsFKn7M8tqLOwoSXLHr66tXEwlHoeHyv28gBSuCz/LYiTYIF2q98OScTgwOUKrk77RgGwU7k9n0ynwrBSp+zPLaizsKElyx6+urq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA==');
  }, []);

  useEffect(() => {
    localStorage.setItem('bakery-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bakery-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('bakery-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (!isAuthenticated || !sessionStartTime) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const duration = now - sessionStartTime;
      const hours = Math.floor(duration / 3600000);
      const minutes = Math.floor((duration % 3600000) / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      setSessionDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, sessionStartTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      const timers: Record<string, string> = {};
      carts.forEach(cart => {
        if (cart.items.length > 0) {
          const duration = Date.now() - cart.createdAt;
          const minutes = Math.floor(duration / 60000);
          const seconds = Math.floor((duration % 60000) / 1000);
          timers[cart.id] = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
      });
      setCartTimers(timers);
    }, 1000);

    return () => clearInterval(interval);
  }, [carts]);

  const playSuccessSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleLogin = () => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const now = Date.now();
      setIsAuthenticated(true);
      setUserRole(user.role);
      setCurrentUser(user.username);
      setSessionStartTime(now);
      localStorage.setItem('bakery-session-active', 'true');
      localStorage.setItem('bakery-user-role', user.role);
      localStorage.setItem('bakery-session-start', now.toString());
      toast({ 
        title: 'Вход выполнен',
        description: `Добро пожаловать, ${user.role === 'admin' ? 'Администратор' : 'Кассир'}!`
      });
    } else {
      toast({ title: 'Неверный логин или пароль', variant: 'destructive' });
    }
  };

  const handleRegister = () => {
    if (!registerUsername || !registerPassword) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    
    if (users.find(u => u.username === registerUsername)) {
      toast({ title: 'Пользователь уже существует', variant: 'destructive' });
      return;
    }

    const newUser: User = {
      username: registerUsername,
      password: registerPassword,
      role: registerRole
    };

    setUsers([...users, newUser]);
    toast({ title: 'Регистрация успешна!', description: 'Теперь можете войти' });
    setRegisterUsername('');
    setRegisterPassword('');
    setRegisterRole('cashier');
  };

  const handleLogout = () => {
    const hasActiveOrders = carts.some(cart => cart.items.length > 0);

    if (hasActiveOrders) {
      toast({ 
        title: 'Закрытие смены', 
        description: 'Есть незавершённые корзины. Завершите или очистите их.',
        variant: 'destructive'
      });
      return;
    }

    setIsAuthenticated(false);
    setSessionStartTime(null);
    setUserRole('cashier');
    setCurrentUser('');
    localStorage.removeItem('bakery-session-active');
    localStorage.removeItem('bakery-user-role');
    localStorage.removeItem('bakery-session-start');
    setUsername('');
    setPassword('');
    toast({ title: 'Смена закрыта' });
  };

  const addToCart = (product: Product) => {
    setCarts(carts.map(cart => {
      if (cart.id === activeCartId) {
        const existingItem = cart.items.find(item => item.id === product.id);
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
            items: [...cart.items, { ...product, quantity: 1 }]
          };
        }
      }
      return cart;
    }));
  };

  const removeFromCart = (id: string) => {
    setCarts(carts.map(cart => {
      if (cart.id === activeCartId) {
        const item = cart.items.find(c => c.id === id);
        if (item && item.quantity > 1) {
          return {
            ...cart,
            items: cart.items.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c)
          };
        } else {
          return {
            ...cart,
            items: cart.items.filter(c => c.id !== id)
          };
        }
      }
      return cart;
    }));
  };

  const setCoffeeSize = (id: string, size: 'small' | 'medium' | 'large') => {
    setCarts(carts.map(cart => {
      if (cart.id === activeCartId) {
        return {
          ...cart,
          items: cart.items.map(item => item.id === id ? { ...item, coffeeSize: size } : item)
        };
      }
      return cart;
    }));
  };

  const setItemCustomPrice = (id: string, price: number) => {
    setCarts(carts.map(cart => {
      if (cart.id === activeCartId) {
        return {
          ...cart,
          items: cart.items.map(item => item.id === id ? { ...item, customPrice: price } : item)
        };
      }
      return cart;
    }));
  };

  const completeSale = () => {
    const cart = activeCart;
    const updatedProducts = products.map(product => {
      const cartItem = cart.items.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, salesCount: product.salesCount + cartItem.quantity };
      }
      return product;
    });
    
    setProducts(updatedProducts);
    setCarts(carts.map(c => c.id === activeCartId ? { ...c, items: [], createdAt: Date.now() } : c));
    playSuccessSound();
    toast({ 
      title: '✅ Продажа завершена',
      description: 'Спасибо за покупку!'
    });
  };

  const addNewCart = () => {
    const newCartId = (carts.length + 1).toString();
    setCarts([...carts, { id: newCartId, name: `Корзина ${newCartId}`, items: [], createdAt: Date.now() }]);
    setActiveCartId(newCartId);
    toast({ title: 'Новая корзина создана' });
  };

  const deleteCart = (cartId: string) => {
    if (carts.length === 1) {
      toast({ title: 'Нельзя удалить последнюю корзину', variant: 'destructive' });
      return;
    }
    setCarts(carts.filter(c => c.id !== cartId));
    if (activeCartId === cartId) {
      setActiveCartId(carts[0].id);
    }
    toast({ title: 'Корзина удалена' });
  };

  const addNewProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      image: newProduct.image,
      salesCount: 0,
      customImage: newProduct.customImage || undefined
    };
    
    setProducts([...products, product]);
    setNewProduct({ name: '', category: 'pies', price: '', image: '🍞', customImage: '' });
    setAddProductDialog(false);
    toast({ title: 'Товар добавлен' });
  };

  const addNewCategory = () => {
    if (!newCategory.id || !newCategory.label || !newCategory.emoji) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    
    if (categories.find(c => c.id === newCategory.id)) {
      toast({ title: 'Категория с таким ID уже существует', variant: 'destructive' });
      return;
    }
    
    setCategories([...categories, { ...newCategory, label: `${newCategory.emoji} ${newCategory.label}` }]);
    setNewCategory({ id: '', label: '', emoji: '📦' });
    setAddCategoryDialog(false);
    toast({ title: 'Категория добавлена' });
  };

  const deleteCategory = (categoryId: string) => {
    const hasProducts = products.some(p => p.category === categoryId);
    if (hasProducts) {
      toast({ title: 'Нельзя удалить категорию с товарами', variant: 'destructive' });
      return;
    }
    setCategories(categories.filter(c => c.id !== categoryId));
    toast({ title: 'Категория удалена' });
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({ title: 'Товар удалён' });
  };

  const updateProduct = () => {
    if (!editingProduct) return;
    
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditProductDialog(false);
    setEditingProduct(null);
    toast({ title: 'Товар обновлён' });
  };

  const saveTelegramSettings = () => {
    localStorage.setItem('bakery-telegram-token', telegramBotToken);
    localStorage.setItem('bakery-telegram-chat', telegramChatId);
    toast({ title: 'Настройки Telegram сохранены' });
  };

  const exportToTelegram = async () => {
    if (!telegramBotToken || !telegramChatId) {
      toast({ title: 'Настройте токен бота и Chat ID', variant: 'destructive' });
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const totalSales = products.reduce((sum, p) => sum + (p.price * p.salesCount), 0);
    const totalItems = products.reduce((sum, p) => sum + p.salesCount, 0);
    
    let report = `📊 *Отчет о продажах*\n\n`;
    report += `📅 Дата: ${dateStr} ${timeStr}\n`;
    report += `👤 Кассир: ${currentUser}\n`;
    report += `⏰ Смена: ${sessionDuration}\n`;
    report += `💰 Общая выручка: ${totalSales}₽\n`;
    report += `📦 Продано товаров: ${totalItems} шт\n\n`;
    report += `*Детализация по товарам:*\n`;
    
    products
      .filter(p => p.salesCount > 0)
      .sort((a, b) => b.salesCount - a.salesCount)
      .forEach(p => {
        report += `\n${p.image} ${p.name}\n`;
        report += `   Продано: ${p.salesCount} шт × ${p.price}₽ = ${p.price * p.salesCount}₽\n`;
      });

    try {
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: report,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        toast({ title: '✅ Отчет отправлен в Telegram!' });
        setExportDialog(false);
      } else {
        toast({ title: 'Ошибка отправки в Telegram', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isEdit && editingProduct) {
        setEditingProduct({ ...editingProduct, customImage: result, image: '' });
      } else {
        setNewProduct({ ...newProduct, customImage: result, image: '' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryHome(false);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const topProducts = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.salesCount), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF6B4A] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF6B4A] rounded-full blur-3xl"></div>
        </div>
        
        <Card className="w-full max-w-md mx-4 bg-[#2a2a2a] border-[#3a3a3a] shadow-2xl">
          <CardContent className="pt-8 pb-6">
            <div className="text-center mb-8">
              <div className="text-7xl mb-4">🥖</div>
              <h1 className="text-5xl font-bold text-white mb-2">
                ХЛЕБНИК
              </h1>
              <p className="text-gray-400">Система учёта продаж</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#3a3a3a]">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#FF6B4A] data-[state=active]:text-white">
                  Вход
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-[#FF6B4A] data-[state=active]:text-white">
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <div>
                  <Label className="text-sm text-gray-400 mb-2 block">Логин</Label>
                  <Input
                    type="text"
                    placeholder="Введите логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#3a3a3a] border-[#4a4a4a] text-white placeholder:text-gray-500 h-12"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-400 mb-2 block">Пароль</Label>
                  <Input
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="bg-[#3a3a3a] border-[#4a4a4a] text-white placeholder:text-gray-500 h-12"
                  />
                </div>
                
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-[#FF6B4A] hover:bg-[#ff5a39] text-white font-semibold h-12 shadow-lg"
                >
                  <Icon name="LogIn" className="mr-2" size={20} />
                  Войти
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <div>
                  <Label className="text-sm text-gray-400 mb-2 block">Логин</Label>
                  <Input
                    type="text"
                    placeholder="Придумайте логин"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="bg-[#3a3a3a] border-[#4a4a4a] text-white placeholder:text-gray-500 h-12"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-400 mb-2 block">Пароль</Label>
                  <Input
                    type="password"
                    placeholder="Придумайте пароль"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="bg-[#3a3a3a] border-[#4a4a4a] text-white placeholder:text-gray-500 h-12"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-400 mb-2 block">Роль</Label>
                  <Select value={registerRole} onValueChange={(v) => setRegisterRole(v as UserRole)}>
                    <SelectTrigger className="bg-[#3a3a3a] border-[#4a4a4a] text-white h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#3a3a3a] border-[#4a4a4a]">
                      <SelectItem value="cashier" className="text-white">💼 Кассир</SelectItem>
                      <SelectItem value="admin" className="text-white">👑 Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleRegister}
                  className="w-full bg-[#FF6B4A] hover:bg-[#ff5a39] text-white font-semibold h-12 shadow-lg"
                >
                  <Icon name="UserPlus" className="mr-2" size={20} />
                  Зарегистрироваться
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative pb-6">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF6B4A] rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF6B4A] rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <header className="bg-[#2a2a2a] border-b border-[#3a3a3a] sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🥖</div>
              <div>
                <h1 className="text-3xl font-bold text-white">Хлеб Бабушкин</h1>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Icon name="Clock" size={14} />
                    {sessionDuration}
                  </p>
                  <Badge variant="outline" className={`${userRole === 'admin' ? 'bg-[#FF6B4A]/20 text-[#FF6B4A] border-[#FF6B4A]/40' : 'bg-gray-600/20 text-gray-300 border-gray-600/40'}`}>
                    {userRole === 'admin' ? '👑 Администратор' : '💼 Кассир'}
                  </Badge>
                  <p className="text-sm text-gray-400">{currentUser}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Dialog open={exportDialog} onOpenChange={setExportDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-blue-500/10 border-blue-500/40 text-blue-400 hover:bg-blue-500/20"
                  >
                    <Icon name="Send" className="mr-2 h-4 w-4" />
                    Telegram
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#2a2a2a] border-[#3a3a3a] max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-[#FF6B4A] text-xl">Экспорт отчета в Telegram</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {userRole === 'admin' && (
                      <>
                        <div>
                          <Label className="text-white">Bot Token</Label>
                          <Input
                            value={telegramBotToken}
                            onChange={(e) => setTelegramBotToken(e.target.value)}
                            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                            className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Chat ID</Label>
                          <Input
                            value={telegramChatId}
                            onChange={(e) => setTelegramChatId(e.target.value)}
                            placeholder="123456789"
                            className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                          />
                        </div>
                        <p className="text-xs text-gray-400">
                          Создайте бота через @BotFather и получите Chat ID через @userinfobot
                        </p>
                        <Button onClick={saveTelegramSettings} variant="outline" className="w-full border-[#FF6B4A]/40 text-[#FF6B4A] hover:bg-[#FF6B4A]/10">
                          <Icon name="Save" className="mr-2" size={16} />
                          Сохранить настройки
                        </Button>
                      </>
                    )}
                    {userRole === 'cashier' && (
                      <p className="text-sm text-gray-400">
                        Отчет будет отправлен в Telegram по настройкам администратора
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={exportToTelegram} className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Icon name="Send" className="mr-2" size={16} />
                      Отправить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {userRole === 'admin' && (
                <>
                  <Dialog open={addCategoryDialog} onOpenChange={setAddCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-[#FF6B4A]/10 border-[#FF6B4A]/40 text-[#FF6B4A] hover:bg-[#FF6B4A]/20"
                      >
                        <Icon name="FolderPlus" className="mr-2 h-4 w-4" />
                        Категория
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#2a2a2a] border-[#3a3a3a] max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-[#FF6B4A] text-xl">Добавить категорию</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">ID категории (англ.)</Label>
                          <Input
                            value={newCategory.id}
                            onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value.toLowerCase() })}
                            placeholder="snacks"
                            className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Название</Label>
                          <Input
                            value={newCategory.label}
                            onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                            placeholder="Закуски"
                            className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Эмодзи</Label>
                          <Input
                            value={newCategory.emoji}
                            onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                            placeholder="🍿"
                            className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addNewCategory} className="bg-[#FF6B4A] hover:bg-[#ff5a39] text-white">
                          <Icon name="Check" className="mr-2" size={16} />
                          Добавить
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={addProductDialog} onOpenChange={setAddProductDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-[#FF6B4A]/10 border-[#FF6B4A]/40 text-[#FF6B4A] hover:bg-[#FF6B4A]/20"
                      >
                        <Icon name="Plus" className="mr-2 h-4 w-4" />
                        Товар
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#2a2a2a] border-[#3a3a3a] max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-[#FF6B4A] text-xl">Добавить товар</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Название</Label>
                          <Input
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Категория</Label>
                          <Select value={newProduct.category} onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}>
                            <SelectTrigger className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id} className="text-white">
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-white">Цена (₽)</Label>
                          <Input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Эмодзи</Label>
                          <Input
                            value={newProduct.image}
                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                            placeholder="🍞"
                            className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Изображение (опционально)</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, false)}
                            className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                          />
                          {newProduct.customImage && (
                            <img src={newProduct.customImage} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addNewProduct} className="bg-[#FF6B4A] hover:bg-[#ff5a39] text-white">
                          <Icon name="Check" className="mr-2" size={16} />
                          Добавить
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20"
              >
                <Icon name="LogOut" className="mr-2 h-4 w-4" />
                Выход
              </Button>
            </div>
          </div>

          {userRole === 'admin' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-[#3a3a3a] border-[#4a4a4a]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Выручка</p>
                      <p className="text-2xl font-bold text-[#FF6B4A]">{totalRevenue}₽</p>
                    </div>
                    <Icon name="TrendingUp" size={32} className="text-[#FF6B4A]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#3a3a3a] border-[#4a4a4a]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Товаров</p>
                      <p className="text-2xl font-bold text-white">{products.length}</p>
                    </div>
                    <Icon name="Package" size={32} className="text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#3a3a3a] border-[#4a4a4a]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Продано</p>
                      <p className="text-2xl font-bold text-white">{products.reduce((sum, p) => sum + p.salesCount, 0)}</p>
                    </div>
                    <Icon name="ShoppingCart" size={32} className="text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#3a3a3a] border-[#4a4a4a]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Категорий</p>
                      <p className="text-2xl font-bold text-white">{categories.length}</p>
                    </div>
                    <Icon name="Folder" size={32} className="text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 pt-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {showCategoryHome ? (
              <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">
                    Вся наша <span className="text-[#FF6B4A]">продукция</span> в одном каталоге
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat, index) => (
                    <Card 
                      key={cat.id}
                      className="cursor-pointer bg-[#2a2a2a] border-[#3a3a3a] hover:border-[#FF6B4A]/50 hover:bg-[#3a3a3a] transition-all group hover:shadow-lg hover:shadow-[#FF6B4A]/20 animate-scale-in relative"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-8 text-center" onClick={() => handleCategorySelect(cat.id)}>
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{cat.emoji}</div>
                        <h3 className="font-semibold text-lg text-white group-hover:text-[#FF6B4A] transition-colors">
                          {cat.label.replace(cat.emoji + ' ', '')}
                        </h3>
                      </CardContent>
                      {userRole === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCategory(cat.id);
                          }}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">
                    {selectedCategory === 'all' ? 'Все товары' : categories.find(c => c.id === selectedCategory)?.label}
                  </h2>
                  <Button 
                    variant="outline"
                    onClick={() => setShowCategoryHome(true)}
                    className="bg-[#FF6B4A]/10 border-[#FF6B4A]/40 text-[#FF6B4A] hover:bg-[#FF6B4A]/20"
                  >
                    <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                    Категории
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product, index) => (
                    <Card 
                      key={product.id}
                      className="bg-[#2a2a2a] border-[#3a3a3a] hover:border-[#FF6B4A]/40 transition-all hover:shadow-lg hover:shadow-[#FF6B4A]/10 group animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          {product.customImage ? (
                            <img src={product.customImage} alt={product.name} className="w-14 h-14 object-cover rounded-lg" />
                          ) : (
                            <div className="text-4xl group-hover:scale-110 transition-transform">{product.image}</div>
                          )}
                          {userRole === 'admin' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setEditingProduct(product)}
                                  className="text-gray-400 hover:text-[#FF6B4A]"
                                >
                                  <Icon name="Settings" size={16} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#2a2a2a] border-[#3a3a3a] max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="text-[#FF6B4A] text-xl">Редактировать товар</DialogTitle>
                                </DialogHeader>
                                {editingProduct && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-white">Название</Label>
                                      <Input
                                        value={editingProduct.name}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                        className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-white">Цена (₽)</Label>
                                      <Input
                                        type="number"
                                        value={editingProduct.price}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                        className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-white">Эмодзи</Label>
                                      <Input
                                        value={editingProduct.image}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                        className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-white">Изображение (опционально)</Label>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, true)}
                                        className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                                      />
                                      {editingProduct.customImage && (
                                        <img src={editingProduct.customImage} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                                      )}
                                    </div>
                                  </div>
                                )}
                                <DialogFooter className="gap-2">
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => {
                                      if (editingProduct) {
                                        deleteProduct(editingProduct.id);
                                        setEditProductDialog(false);
                                      }
                                    }}
                                  >
                                    <Icon name="Trash2" className="mr-2" size={16} />
                                    Удалить
                                  </Button>
                                  <Button onClick={updateProduct} className="bg-[#FF6B4A] hover:bg-[#ff5a39] text-white">
                                    <Icon name="Check" className="mr-2" size={16} />
                                    Сохранить
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-sm mb-2 text-white line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-[#FF6B4A]">{product.price}₽</span>
                          {product.salesCount > 0 && (
                            <Badge variant="secondary" className="text-xs bg-[#FF6B4A]/20 text-[#FF6B4A] border-[#FF6B4A]/30">
                              {product.salesCount} шт
                            </Badge>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => addToCart(product)}
                          className="w-full bg-[#FF6B4A]/20 hover:bg-[#FF6B4A]/30 text-[#FF6B4A] border border-[#FF6B4A]/40 hover:border-[#FF6B4A]/60 transition-all"
                          size="sm"
                        >
                          <Icon name="Plus" className="mr-1" size={14} />
                          В корзину
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {carts.map(cart => (
                <Button
                  key={cart.id}
                  variant={activeCartId === cart.id ? "default" : "outline"}
                  onClick={() => setActiveCartId(cart.id)}
                  className={`relative min-w-fit ${
                    activeCartId === cart.id 
                      ? 'bg-[#FF6B4A] text-white' 
                      : 'bg-[#2a2a2a] border-[#3a3a3a] text-white hover:bg-[#3a3a3a]'
                  }`}
                >
                  {cart.name}
                  <Badge variant="secondary" className="ml-2 bg-[#3a3a3a]">
                    {cart.items.length}
                  </Badge>
                  {carts.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCart(cart.id);
                      }}
                      className="ml-2 hover:text-red-400"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  )}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addNewCart}
                className="bg-[#FF6B4A]/10 border-[#FF6B4A]/40 text-[#FF6B4A] hover:bg-[#FF6B4A]/20 min-w-fit"
              >
                <Icon name="Plus" size={16} />
              </Button>
            </div>

            <Card className="sticky top-24 bg-[#2a2a2a] border-[#3a3a3a] shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#FF6B4A] flex items-center gap-2">
                      <Icon name="ShoppingCart" size={24} />
                      {activeCart.name}
                    </h2>
                    {activeCart.items.length > 0 && cartTimers[activeCart.id] && (
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <Icon name="Timer" size={14} />
                        {cartTimers[activeCart.id]}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="bg-[#FF6B4A]/20 text-[#FF6B4A] border-[#FF6B4A]/30 text-base px-3 py-1">
                    {activeCart.items.length}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
                  {activeCart.items.map((item) => {
                    const basePrice = item.coffeeSize && item.category === 'coffee'
                      ? item.price * COFFEE_SIZES[item.coffeeSize].multiplier
                      : item.price;
                    const finalPrice = item.customPrice || basePrice;

                    return (
                      <Card key={item.id} className="bg-[#3a3a3a] border-[#4a4a4a]">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            {item.customImage ? (
                              <img src={item.customImage} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                              <div className="text-3xl">{item.image}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white line-clamp-1">{item.name}</h4>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromCart(item.id)}
                                  className="h-7 w-7 p-0 bg-[#4a4a4a] border-[#5a5a5a] text-[#FF6B4A] hover:bg-[#5a5a5a]"
                                >
                                  <Icon name="Minus" size={14} />
                                </Button>
                                <span className="text-base font-bold text-[#FF6B4A] min-w-[20px] text-center">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addToCart(item)}
                                  className="h-7 w-7 p-0 bg-[#4a4a4a] border-[#5a5a5a] text-[#FF6B4A] hover:bg-[#5a5a5a]"
                                >
                                  <Icon name="Plus" size={14} />
                                </Button>
                              </div>
                              
                              {item.category === 'coffee' && (
                                <div className="flex gap-1 mt-2">
                                  {Object.entries(COFFEE_SIZES).map(([size, data]) => (
                                    <Button
                                      key={size}
                                      size="sm"
                                      variant={item.coffeeSize === size ? "default" : "outline"}
                                      onClick={() => setCoffeeSize(item.id, size as any)}
                                      className={`h-6 text-xs px-2 ${
                                        item.coffeeSize === size 
                                          ? 'bg-[#FF6B4A] text-white' 
                                          : 'bg-[#4a4a4a] border-[#5a5a5a] text-white hover:bg-[#5a5a5a]'
                                      }`}
                                    >
                                      {data.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-base font-bold text-[#FF6B4A]">{(finalPrice * item.quantity).toFixed(0)}₽</div>
                              {userRole === 'admin' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 mt-1 text-xs text-gray-400 hover:text-[#FF6B4A]"
                                    >
                                      <Icon name="Edit" size={12} />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                                    <DialogHeader>
                                      <DialogTitle className="text-[#FF6B4A]">Изменить цену</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-white">Новая цена (₽)</Label>
                                        <Input
                                          type="number"
                                          placeholder={basePrice.toString()}
                                          value={customPrice}
                                          onChange={(e) => setCustomPrice(e.target.value)}
                                          className="bg-[#3a3a3a] border-[#4a4a4a] text-white mt-1"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        onClick={() => {
                                          if (customPrice) {
                                            setItemCustomPrice(item.id, parseFloat(customPrice));
                                            setCustomPrice('');
                                          }
                                        }}
                                        className="bg-[#FF6B4A] hover:bg-[#ff5a39] text-white"
                                      >
                                        Применить
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-2xl font-bold pb-4 border-t border-[#3a3a3a] pt-4">
                    <span className="text-white">Итого:</span>
                    <span className="text-[#FF6B4A]">
                      {activeCart.items.reduce((sum, item) => {
                        const price = item.customPrice || (item.coffeeSize && item.category === 'coffee' ? item.price * COFFEE_SIZES[item.coffeeSize].multiplier : item.price);
                        return sum + (price * item.quantity);
                      }, 0).toFixed(0)}₽
                    </span>
                  </div>

                  <Button
                    onClick={completeSale}
                    disabled={activeCart.items.length === 0}
                    className="w-full bg-[#FF6B4A] hover:bg-[#ff5a39] text-white font-semibold h-14 shadow-lg disabled:opacity-50 text-base transition-all"
                  >
                    <Icon name="Check" className="mr-2" size={20} />
                    Завершить продажу
                  </Button>
                  
                  <Button
                    onClick={() => setCarts(carts.map(c => c.id === activeCartId ? { ...c, items: [], createdAt: Date.now() } : c))}
                    disabled={activeCart.items.length === 0}
                    variant="outline"
                    className="w-full bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20 h-12"
                  >
                    <Icon name="Trash2" className="mr-2" size={16} />
                    Очистить корзину
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;