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
import { Category, Product, CartItem, Cart, PaymentMethod, User } from '@/types';
import { authenticateUser, saveSale, getCurrentShiftReport, getTelegramSettings, getUsersFromStorage } from '@/utils/storage';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { ManageCashiersDialog } from '@/components/ManageCashiersDialog';
import { PaymentMethodDialog } from '@/components/PaymentMethodDialog';
import { EndShiftDialog } from '@/components/EndShiftDialog';
import { TelegramSettingsDialog } from '@/components/TelegramSettingsDialog';

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
  const cartRef = useRef<HTMLDivElement | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('bakery-session-active') === 'true');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bakery-current-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('bakery-session-start');
    return saved ? parseInt(saved) : null;
  });
  const [sessionDuration, setSessionDuration] = useState('00:00:00');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
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
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [manageCashiersDialog, setManageCashiersDialog] = useState(false);
  const [telegramSettingsDialog, setTelegramSettingsDialog] = useState(false);
  const [paymentMethodDialog, setPaymentMethodDialog] = useState(false);
  const [endShiftDialog, setEndShiftDialog] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'pies', price: '', image: '🍞', customImage: '' });
  const [newCategory, setNewCategory] = useState({ id: '', label: '', emoji: '📦' });
  const [cartTimers, setCartTimers] = useState<Record<string, string>>({});
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [selectedItemForCustomPrice, setSelectedItemForCustomPrice] = useState<string | null>(null);
  
  const { toast } = useToast();
  const activeCart = carts.find(c => c.id === activeCartId) || carts[0];

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUKrk77RgGwU7k9n0ynsrBSp+zPLaizsKElyx6+mrVxMJR6Hh8r9vIAUrgs/y2Ik2CBdqvfDknE4MDlCq5O+0YBsFO5PZ9Mp8KwUqfszy2os7ChJcsevrq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA5QquTvtGAbBTuT2fTKfCsFKn7M8tqLOwoSXLHr66tXEwlHoeHyv28gBSuCz/LYiTYIF2q98OScTgwOUKrk77RgGwU7k9n0ynwrBSp+zPLaizsKElyx6+urVxMJR6Hh8r9vIAUrgs/y2Ik2CBdqvfDknE4MDlCq5O+0YBsFO5PZ9Mp8KwUqfszy2os7ChJcsevrq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA5QquTvtGAbBTuT2fTKfCsFKn7M8tqLOwoSXLHr66tXEwlHoeHyv28gBSuCz/LYiTYIF2q98OScTgwOUKrk77RgGwU7k9n0ynwrBSp+zPLaizsKElyx6+urVxMJR6Hh8r9vIAUrgs/y2Ik2CBdqvfDknE4MDlCq5O+0YBsFO5PZ9Mp8KwUqfszy2os7ChJcsevrq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA5QquTvtGAbBTuT2fTKfCsFKn7M8tqLOwoSXLHr66tXEwlHoeHyv28gBSuCz/LYiTYIF2q98OScTgwOUKrk77RgGwU7k9n0ynwrBSp+zPLaizsKElyx6+urq1cTCUeh4fK/byAFK4LP8tiJNggXar3w5JxODA==');
    const settings = getTelegramSettings();
    setTelegramBotToken(settings.botToken);
    setTelegramChatId(settings.chatId);
  }, []);

  useEffect(() => {
    localStorage.setItem('bakery-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bakery-categories', JSON.stringify(categories));
  }, [categories]);

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

  const handleLogin = () => {
    const user = authenticateUser(username, password);
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      const startTime = Date.now();
      setSessionStartTime(startTime);
      localStorage.setItem('bakery-session-active', 'true');
      localStorage.setItem('bakery-current-user', JSON.stringify(user));
      localStorage.setItem('bakery-session-start', startTime.toString());
      toast({ title: `✅ Добро пожаловать, ${user.name}!` });
    } else {
      toast({ title: 'Неверный логин или пароль', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    const hasItems = carts.some(cart => cart.items.length > 0);
    if (hasItems) {
      toast({ title: 'Завершите все активные заказы перед выходом', variant: 'destructive' });
      return;
    }
    setEndShiftDialog(true);
  };

  const confirmLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSessionStartTime(null);
    localStorage.removeItem('bakery-session-active');
    localStorage.removeItem('bakery-current-user');
    localStorage.removeItem('bakery-session-start');
    setCarts([{ id: '1', name: 'Корзина 1', items: [], createdAt: Date.now() }]);
    setActiveCartId('1');
    toast({ title: '👋 До свидания!' });
  };

  const createFlyingAnimation = (event: React.MouseEvent, product: Product) => {
    if (!cartRef.current) return;

    const clickX = event.clientX;
    const clickY = event.clientY;
    const cartRect = cartRef.current.getBoundingClientRect();
    const cartX = cartRect.left + cartRect.width / 2;
    const cartY = cartRect.top + cartRect.height / 2;

    const flyingElement = document.createElement('div');
    flyingElement.textContent = product.customImage || product.image;
    flyingElement.className = 'fly-animation';
    flyingElement.style.left = `${clickX}px`;
    flyingElement.style.top = `${clickY}px`;
    flyingElement.style.fontSize = '48px';
    flyingElement.style.setProperty('--x-mid', `${(cartX - clickX) * 0.5}px`);
    flyingElement.style.setProperty('--y-mid', `${(cartY - clickY) * 0.5 - 100}px`);
    flyingElement.style.setProperty('--x-end', `${cartX - clickX}px`);
    flyingElement.style.setProperty('--y-end', `${cartY - clickY}px`);

    document.body.appendChild(flyingElement);
    setTimeout(() => {
      document.body.removeChild(flyingElement);
    }, 800);
  };

  const addToCart = (product: Product, event: React.MouseEvent) => {
    createFlyingAnimation(event, product);
    
    setTimeout(() => {
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
      playSuccessSound();
    }, 400);
  };

  const removeFromCart = (id: string) => {
    setCarts(carts.map(cart => {
      if (cart.id === activeCartId) {
        return {
          ...cart,
          items: cart.items.map(item =>
            item.id === id && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ).filter(item => item.id !== id || item.quantity > 1)
        };
      }
      return cart;
    }));
  };

  const setCoffeeSize = (id: string, size: 'small' | 'medium' | 'large') => {
    setCarts(carts.map(cart => {
      if (cart.id === activeCartId) {
        return {
          ...cart,
          items: cart.items.map(item =>
            item.id === id ? { ...item, coffeeSize: size } : item
          )
        };
      }
      return cart;
    }));
  };

  const setItemCustomPrice = (id: string) => {
    const price = parseFloat(customPrice);
    if (isNaN(price) || price <= 0) {
      toast({ title: 'Введите корректную цену', variant: 'destructive' });
      return;
    }
    
    setCarts(carts.map(cart => {
      if (cart.id === activeCartId) {
        return {
          ...cart,
          items: cart.items.map(item =>
            item.id === id ? { ...item, customPrice: price } : item
          )
        };
      }
      return cart;
    }));
    
    setCustomPriceDialog(false);
    setCustomPrice('');
    setSelectedItemForCustomPrice(null);
    toast({ title: '✅ Цена изменена' });
  };

  const completeSale = () => {
    if (activeCart.items.length === 0) {
      toast({ title: 'Корзина пуста', variant: 'destructive' });
      return;
    }
    setPaymentMethodDialog(true);
  };

  const finalizeSale = (paymentMethod: PaymentMethod) => {
    const total = activeCart.items.reduce((sum, item) => {
      const basePrice = item.coffeeSize && item.category === 'coffee'
        ? item.price * COFFEE_SIZES[item.coffeeSize].multiplier
        : item.price;
      return sum + (item.customPrice || basePrice) * item.quantity;
    }, 0);

    saveSale({
      id: Date.now().toString(),
      items: activeCart.items,
      total,
      timestamp: Date.now(),
      cashier: currentUser?.name || 'Unknown',
      paymentMethod
    });

    const updatedProducts = products.map(product => {
      const cartItem = activeCart.items.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, salesCount: product.salesCount + cartItem.quantity };
      }
      return product;
    });
    setProducts(updatedProducts);

    setCarts(carts.map(cart =>
      cart.id === activeCartId
        ? { ...cart, items: [], createdAt: Date.now() }
        : cart
    ));

    playSuccessSound();
    toast({ title: `✅ Продажа завершена! ${paymentMethod === 'cash' ? '💵 Наличные' : '💳 Карта'}`, description: `Сумма: ${total} ₽` });
  };

  const addNewCart = () => {
    const newId = (Math.max(...carts.map(c => parseInt(c.id))) + 1).toString();
    setCarts([...carts, { id: newId, name: `Корзина ${newId}`, items: [], createdAt: Date.now() }]);
    setActiveCartId(newId);
  };

  const deleteCart = (cartId: string) => {
    if (carts.length === 1) {
      toast({ title: 'Нельзя удалить последнюю корзину', variant: 'destructive' });
      return;
    }
    setCarts(carts.filter(c => c.id !== cartId));
    if (activeCartId === cartId) {
      setActiveCartId(carts.find(c => c.id !== cartId)?.id || '1');
    }
  };

  const playSuccessSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
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
    toast({ title: '✅ Товар добавлен' });
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({ title: '🗑️ Товар удалён' });
  };

  const updateProduct = () => {
    if (!editingProduct) return;
    setProducts(products.map(p =>
      p.id === editingProduct.id ? editingProduct : p
    ));
    setEditProductDialog(false);
    setEditingProduct(null);
    toast({ title: '✅ Товар обновлён' });
  };

  const addNewCategory = () => {
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
    toast({ title: '✅ Категория добавлена' });
  };

  const deleteCategory = (categoryId: string) => {
    const hasProducts = products.some(p => p.category === categoryId);
    if (hasProducts) {
      toast({ title: 'В категории есть товары', variant: 'destructive' });
      return;
    }
    setCategories(categories.filter(c => c.id !== categoryId));
    toast({ title: '🗑️ Категория удалена' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (isEdit && editingProduct) {
          setEditingProduct({ ...editingProduct, customImage: result });
        } else {
          setNewProduct({ ...newProduct, customImage: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <Card className="w-full max-w-md relative z-10 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🍞</div>
              <h1 className="text-3xl font-bold mb-2">Касса</h1>
              <p className="text-muted-foreground">Войдите в систему</p>
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
                <Icon name="LogIn" size={20} className="mr-2" />
                Войти
              </Button>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium mb-1">По умолчанию:</p>
              <p className="text-muted-foreground">admin / admin</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🍞</div>
              <div>
                <h1 className="text-2xl font-bold">Касса</h1>
                <p className="text-sm text-muted-foreground">Смена: {sessionDuration}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {currentUser?.name} ({currentUser?.role === 'admin' ? 'Администратор' : 'Кассир'})
              </Badge>
              
              {currentUser?.role === 'admin' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setTelegramSettingsDialog(true)}>
                    <Icon name="MessageSquare" size={16} className="mr-2" />
                    Telegram
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setManageCashiersDialog(true)}>
                    <Icon name="Users" size={16} className="mr-2" />
                    Кассиры
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAddCategoryDialog(true)}>
                    <Icon name="FolderPlus" size={16} className="mr-2" />
                    Категория
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAddProductDialog(true)}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Товар
                  </Button>
                </>
              )}
              
              <Button variant="outline" size="sm" onClick={() => setChangePasswordDialog(true)}>
                <Icon name="Key" size={16} className="mr-2" />
                Пароль
              </Button>
              
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {showCategoryHome ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Выберите категорию</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card
                    className="cursor-pointer hover:bg-accent/50 transition-all hover:scale-105"
                    onClick={() => {
                      setSelectedCategory('all');
                      setShowCategoryHome(false);
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-2">🛒</div>
                      <p className="font-medium">Все товары</p>
                    </CardContent>
                  </Card>
                  
                  {categories.map(category => (
                    <Card
                      key={category.id}
                      className="cursor-pointer hover:bg-accent/50 transition-all hover:scale-105 relative group"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowCategoryHome(false);
                      }}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="text-5xl mb-2">{category.emoji}</div>
                        <p className="font-medium">{category.label}</p>
                      </CardContent>
                      
                      {currentUser?.role === 'admin' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCategory(category.id);
                          }}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button variant="outline" onClick={() => setShowCategoryHome(true)}>
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Назад к категориям
                </Button>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="relative group hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="text-center mb-3">
                          {product.customImage ? (
                            <img src={product.customImage} alt={product.name} className="w-20 h-20 object-cover rounded-lg mx-auto" />
                          ) : (
                            <div className="text-6xl">{product.image}</div>
                          )}
                        </div>
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-primary">{product.price} ₽</span>
                          {product.salesCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {product.salesCount} шт
                            </Badge>
                          )}
                        </div>
                        <Button className="w-full" size="sm" onClick={(e) => addToCart(product, e)}>
                          <Icon name="ShoppingCart" size={14} className="mr-1" />
                          В корзину
                        </Button>
                        
                        {currentUser?.role === 'admin' && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product);
                                setEditProductDialog(true);
                              }}
                            >
                              <Icon name="Pencil" size={14} />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {carts.map(cart => (
                  <div
                    key={cart.id}
                    className={`relative flex-shrink-0 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                      activeCartId === cart.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setActiveCartId(cart.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cart.name}</span>
                      {cart.items.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </Badge>
                      )}
                    </div>
                    {carts.length > 1 && (
                      <button
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCart(cart.id);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addNewCart} className="flex-shrink-0">
                  <Icon name="Plus" size={14} />
                </Button>
              </div>

              <Card className="sticky top-24" ref={cartRef}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{activeCart.name}</h2>
                    {activeCart.items.length > 0 && cartTimers[activeCart.id] && (
                      <Badge variant="secondary">⏱️ {cartTimers[activeCart.id]}</Badge>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {activeCart.items.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
                    ) : (
                      activeCart.items.map(item => {
                        const basePrice = item.coffeeSize && item.category === 'coffee'
                          ? item.price * COFFEE_SIZES[item.coffeeSize].multiplier
                          : item.price;
                        const finalPrice = item.customPrice || basePrice;

                        return (
                          <Card key={item.id}>
                            <CardContent className="p-3">
                              <div className="flex gap-3">
                                <div className="text-3xl flex-shrink-0">
                                  {item.customImage ? (
                                    <img src={item.customImage} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                  ) : (
                                    item.image
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                                  
                                  {item.category === 'coffee' && (
                                    <Select
                                      value={item.coffeeSize || 'small'}
                                      onValueChange={(value) => setCoffeeSize(item.id, value as any)}
                                    >
                                      <SelectTrigger className="w-full h-8 text-xs mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.entries(COFFEE_SIZES).map(([key, { label }]) => (
                                          <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}

                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => removeFromCart(item.id)}
                                      >
                                        <Icon name="Minus" size={12} />
                                      </Button>
                                      <span className="font-medium">{item.quantity}</span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => {
                                          setCarts(carts.map(cart => {
                                            if (cart.id === activeCartId) {
                                              return {
                                                ...cart,
                                                items: cart.items.map(i =>
                                                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                                                )
                                              };
                                            }
                                            return cart;
                                          }));
                                        }}
                                      >
                                        <Icon name="Plus" size={12} />
                                      </Button>
                                    </div>
                                    
                                    <div className="text-right">
                                      <p className="text-sm font-bold">{(finalPrice * item.quantity).toFixed(0)} ₽</p>
                                      {currentUser?.role === 'admin' && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs"
                                          onClick={() => {
                                            setSelectedItemForCustomPrice(item.id);
                                            setCustomPrice(finalPrice.toString());
                                            setCustomPriceDialog(true);
                                          }}
                                        >
                                          <Icon name="Pencil" size={10} className="mr-1" />
                                          Цена
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Итого:</span>
                      <span className="text-3xl font-bold text-primary">
                        {activeCart.items.reduce((sum, item) => {
                          const basePrice = item.coffeeSize && item.category === 'coffee'
                            ? item.price * COFFEE_SIZES[item.coffeeSize].multiplier
                            : item.price;
                          return sum + (item.customPrice || basePrice) * item.quantity;
                        }, 0).toFixed(0)} ₽
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={completeSale}
                      disabled={activeCart.items.length === 0}
                    >
                      <Icon name="CheckCircle" size={20} className="mr-2" />
                      Завершить продажу
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setCarts(carts.map(cart =>
                          cart.id === activeCartId ? { ...cart, items: [], createdAt: Date.now() } : cart
                        ));
                      }}
                      disabled={activeCart.items.length === 0}
                    >
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Очистить корзину
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={addCategoryDialog} onOpenChange={setAddCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить категорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-id">ID категории</Label>
              <Input
                id="category-id"
                value={newCategory.id}
                onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                placeholder="drinks"
              />
            </div>
            <div>
              <Label htmlFor="category-label">Название</Label>
              <Input
                id="category-label"
                value={newCategory.label}
                onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                placeholder="🥤 Напитки"
              />
            </div>
            <div>
              <Label htmlFor="category-emoji">Эмодзи</Label>
              <Input
                id="category-emoji"
                value={newCategory.emoji}
                onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                placeholder="🥤"
                maxLength={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialog(false)}>
              Отмена
            </Button>
            <Button onClick={addNewCategory}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addProductDialog} onOpenChange={setAddProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить товар</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Название</Label>
              <Input
                id="product-name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="product-category">Категория</Label>
              <Select
                value={newProduct.category}
                onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
              >
                <SelectTrigger id="product-category">
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
              <Label htmlFor="product-price">Цена</Label>
              <Input
                id="product-price"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="product-emoji">Эмодзи</Label>
              <Input
                id="product-emoji"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="product-image">Изображение (опционально)</Label>
              <Input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, false)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProductDialog(false)}>
              Отмена
            </Button>
            <Button onClick={addNewProduct}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editProductDialog} onOpenChange={setEditProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать товар</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Цена</Label>
                <Input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Эмодзи</Label>
                <Input
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  maxLength={2}
                />
              </div>
              <div>
                <Label>Изображение (опционально)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProductDialog(false)}>
              Отмена
            </Button>
            <Button onClick={updateProduct}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={customPriceDialog} onOpenChange={setCustomPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить цену</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="custom-price">Новая цена</Label>
            <Input
              id="custom-price"
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="Введите цену"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomPriceDialog(false)}>
              Отмена
            </Button>
            <Button onClick={() => selectedItemForCustomPrice && setItemCustomPrice(selectedItemForCustomPrice)}>
              Применить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentUser && (
        <>
          <ChangePasswordDialog
            open={changePasswordDialog}
            onOpenChange={setChangePasswordDialog}
            username={currentUser.username}
          />
          <ManageCashiersDialog
            open={manageCashiersDialog}
            onOpenChange={setManageCashiersDialog}
          />
          <TelegramSettingsDialog
            open={telegramSettingsDialog}
            onOpenChange={setTelegramSettingsDialog}
            onSave={(token, chatId) => {
              setTelegramBotToken(token);
              setTelegramChatId(chatId);
            }}
          />
          <PaymentMethodDialog
            open={paymentMethodDialog}
            onOpenChange={setPaymentMethodDialog}
            onSelect={finalizeSale}
            total={activeCart.items.reduce((sum, item) => {
              const basePrice = item.coffeeSize && item.category === 'coffee'
                ? item.price * COFFEE_SIZES[item.coffeeSize].multiplier
                : item.price;
              return sum + (item.customPrice || basePrice) * item.quantity;
            }, 0)}
          />
          <EndShiftDialog
            open={endShiftDialog}
            onOpenChange={setEndShiftDialog}
            report={getCurrentShiftReport(currentUser.name, sessionStartTime || Date.now())}
            telegramBotToken={telegramBotToken}
            telegramChatId={telegramChatId}
            onConfirm={confirmLogout}
          />
        </>
      )}
    </div>
  );
};

export default Index;
