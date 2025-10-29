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
}

interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: number;
  cashier: string;
  paymentMethod: 'cash' | 'card';
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
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [carts, setCarts] = useState<Cart[]>([{ id: '1', name: 'Корзина 1', items: [], createdAt: Date.now() }]);
  const [activeCartId, setActiveCartId] = useState('1');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [addProductDialog, setAddProductDialog] = useState(false);
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [editProductDialog, setEditProductDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'pies', price: '', image: '🍞' });
  const [newCategory, setNewCategory] = useState({ id: '', label: '', emoji: '📦' });
  
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

  const handleLogin = () => {
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      setIsAuthenticated(true);
      setCurrentUser(ADMIN_USER);
      setSessionStartTime(Date.now());
      toast({ title: `Добро пожаловать, ${ADMIN_USER.name}!` });
    } else {
      toast({ title: 'Неверный логин или пароль', variant: 'destructive' });
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
          if (existingItem) {
            return {
              ...cart,
              items: cart.items.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              )
            };
          } else {
            return { ...cart, items: [...cart.items, { ...product, quantity: 1 }] };
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

  const completeSale = (paymentMethod: 'cash' | 'card') => {
    if (activeCart.items.length === 0) return;
    const total = activeCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const sale: Sale = {
      id: Date.now().toString(),
      items: activeCart.items,
      total,
      timestamp: Date.now(),
      cashier: currentUser?.name || 'Unknown',
      paymentMethod
    };
    
    setSales([...sales, sale]);
    
    activeCart.items.forEach(cartItem => {
      setProducts(products.map(p =>
        p.id === cartItem.id ? { ...p, salesCount: (p.salesCount || 0) + cartItem.quantity } : p
      ));
    });
    
    setCarts(carts.map(cart =>
      cart.id === activeCartId ? { ...cart, items: [] } : cart
    ));
    
    setPaymentDialog(false);
    toast({ title: `Продажа завершена! Сумма: ${total} ₽`, description: `Способ оплаты: ${paymentMethod === 'cash' ? 'Наличные' : 'Карта'}` });
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

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

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
              <p className="text-xs text-center text-muted-foreground">
                По умолчанию: admin / admin
              </p>
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
                </>
              )}
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
          const sessionRevenue = sessionSales.reduce((sum, s) => sum + s.total, 0);
          const sessionItemsCount = sessionSales.reduce((sum, s) => 
            sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0), 0
          );
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-primary to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Выручка за смену</p>
                      <p className="text-3xl font-bold">{sessionRevenue} ₽</p>
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
                <Card
                  className="category-card cursor-pointer hover:shadow-lg border-2 border-transparent hover:border-primary"
                  onClick={() => setSelectedCategory('all')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-2">🛒</div>
                    <p className="font-semibold">Все товары</p>
                  </CardContent>
                </Card>
                
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
                    onClick={() => setSelectedCategory(category.id)}
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

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedCategory === 'all' ? 'Все товары' : categories.find(c => c.id === selectedCategory)?.label}
                </h2>
                {selectedCategory !== 'all' && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCategory('all')}>
                    <Icon name="ArrowLeft" size={16} className="mr-1" />
                    Назад
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="relative group hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="text-center mb-3">
                        <div className="text-6xl">{product.image}</div>
                      </div>
                      <h3 className="font-medium text-sm mb-2 min-h-[40px] line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary">{product.price} ₽</span>
                      </div>
                      <Button className="w-full" size="sm" onClick={(e) => addToCart(product, e)}>
                        <Icon name="ShoppingCart" size={14} className="mr-1" />
                        В корзину
                      </Button>
                      
                      {currentUser?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 bg-white"
                          onClick={() => deleteProduct(product.id)}
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

          <div className="lg:col-span-1">
            <Card className="sticky top-24" ref={cartRef}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Корзина</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
    </div>
  );
};

export default Index;