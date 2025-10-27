import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  category: 'pies' | 'coffee' | 'sweets' | 'kitchen' | 'drinks';
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

const COFFEE_SIZES = {
  small: { label: '100 мл', multiplier: 1 },
  medium: { label: '250 мл', multiplier: 1.3 },
  large: { label: '400 мл', multiplier: 1.6 }
};

const CATEGORIES = [
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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('bakery-session-active');
    return saved === 'true';
  });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('bakery-session-start');
    return saved ? parseInt(saved) : null;
  });
  const [sessionDuration, setSessionDuration] = useState('00:00:00');
  const [password, setPassword] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bakery-products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pies' | 'coffee' | 'sweets' | 'kitchen' | 'drinks'>('all');
  const [customPriceDialog, setCustomPriceDialog] = useState(false);
  const [customPrice, setCustomPrice] = useState('');
  const [editProductDialog, setEditProductDialog] = useState(false);
  const [addProductDialog, setAddProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'pies' as const, price: '', image: '🍞' });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('bakery-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bakery-session-active', isAuthenticated.toString());
  }, [isAuthenticated]);

  useEffect(() => {
    if (sessionStartTime) {
      localStorage.setItem('bakery-session-start', sessionStartTime.toString());
    }
  }, [sessionStartTime]);

  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setSessionDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const handleLogin = () => {
    if (password === '1234') {
      setIsAuthenticated(true);
      setSessionStartTime(Date.now());
      toast({
        title: "Смена открыта",
        description: "Добро пожаловать в систему учёта",
      });
    } else {
      toast({
        title: "Ошибка входа",
        description: "Неверный пароль",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSessionStartTime(null);
    setSessionDuration('00:00:00');
    localStorage.removeItem('bakery-session-active');
    localStorage.removeItem('bakery-session-start');
    toast({
      title: "Смена закрыта",
      description: "До встречи!",
    });
  };

  const addToCart = (product: Product, coffeeSize?: 'small' | 'medium' | 'large') => {
    const existingItem = cart.find(item => 
      item.id === product.id && item.coffeeSize === coffeeSize
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id && item.coffeeSize === coffeeSize
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const price = coffeeSize && product.category === 'coffee' 
        ? product.price * COFFEE_SIZES[coffeeSize].multiplier 
        : product.price;
      
      setCart([...cart, { ...product, quantity: 1, coffeeSize, price }]);
    }

    toast({
      title: "Добавлено",
      description: `${product.name} добавлен в корзину`,
    });
  };

  const addCustomPriceItem = () => {
    if (!customPrice || parseFloat(customPrice) <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную цену",
        variant: "destructive"
      });
      return;
    }

    const customItem: CartItem = {
      id: `custom-${Date.now()}`,
      name: 'Товар по свободной цене',
      category: 'pies',
      price: parseFloat(customPrice),
      image: '💰',
      salesCount: 0,
      quantity: 1
    };

    setCart([...cart, customItem]);
    setCustomPrice('');
    setCustomPriceDialog(false);
    
    toast({
      title: "Добавлено",
      description: `Товар на сумму ${customPrice}₽ добавлен`,
    });
  };

  const completeSale = () => {
    const updatedProducts = products.map(product => {
      const soldQuantity = cart
        .filter(item => item.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...product,
        salesCount: product.salesCount + soldQuantity
      };
    });

    setProducts(updatedProducts);
    setCart([]);
    
    toast({
      title: "Продажа завершена",
      description: `Сумма: ${getTotalPrice()}₽`,
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.customPrice || item.price) * item.quantity, 0).toFixed(2);
  };

  const exportSales = () => {
    const categoryNames = {
      pies: 'Пирожки и Хлеб',
      coffee: 'Кофе и Чай',
      sweets: 'Сладкое',
      kitchen: 'Кухня',
      drinks: 'Напитки'
    };

    const csvContent = [
      ['Категория', 'Товар', 'Продано', 'Цена'],
      ...products.map(p => [
        categoryNames[p.category],
        p.name,
        p.salesCount,
        p.price
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales-${new Date().toLocaleDateString()}.csv`;
    link.click();

    toast({
      title: "Экспорт выполнен",
      description: "Данные о продажах сохранены",
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setEditProductDialog(true);
  };

  const saveProductEdit = () => {
    if (!editingProduct) return;

    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditProductDialog(false);
    setEditingProduct(null);
    
    toast({
      title: "Товар обновлен",
      description: "Изменения сохранены",
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    const product: Product = {
      id: `product-${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      image: newProduct.image,
      salesCount: 0
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', category: 'pies', price: '', image: '🍞' });
    setAddProductDialog(false);
    
    toast({
      title: "Товар добавлен",
      description: `${product.name} добавлен в каталог`,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (isEdit && editingProduct) {
        setEditingProduct({ ...editingProduct, customImage: result, image: '' });
      } else {
        setNewProduct({ ...newProduct, customImage: result, image: '' });
      }
    };
    reader.readAsDataURL(file);
  };

  const [showCategoryHome, setShowCategoryHome] = useState(true);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleCategorySelect = (category: typeof selectedCategory) => {
    setSelectedCategory(category);
    setShowCategoryHome(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1410] via-[#2a1f18] to-[#1a1410] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')]"></div>
        
        <Card className="w-full max-w-md mx-4 bg-[#2a2018]/90 backdrop-blur-sm border-[#d4a574]/20 shadow-2xl animate-scale-in">
          <CardContent className="pt-8 pb-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🥖</div>
              <h1 className="text-4xl font-serif font-bold text-[#d4a574] mb-2">Хлеб Бабушкин</h1>
              <p className="text-[#e8d5b7]/70">Система учёта продаж</p>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="bg-[#1a1410] border-[#d4a574]/30 text-[#e8d5b7] placeholder:text-[#e8d5b7]/40"
                />
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-[#d4a574] hover:bg-[#c19563] text-[#1a1410] font-semibold"
              >
                Открыть смену
              </Button>
            </div>

            <p className="text-xs text-[#e8d5b7]/50 text-center mt-6">
              Пароль по умолчанию: 1234
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2a1f18] to-[#1a1410] relative pb-6">
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')]"></div>

      <header className="bg-[#2a2018]/80 backdrop-blur-sm border-b border-[#d4a574]/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🥖</div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#d4a574]">Хлеб Бабушкин</h1>
              <p className="text-sm text-[#e8d5b7]/70">Смена: {sessionDuration}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={addProductDialog} onOpenChange={setAddProductDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-transparent border-[#d4a574]/40 text-[#d4a574] hover:bg-[#d4a574]/10"
                >
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Товар
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#2a2018] border-[#d4a574]/30">
                <DialogHeader>
                  <DialogTitle className="text-[#d4a574] font-serif">Добавить товар</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#e8d5b7]">Название</Label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="bg-[#1a1410] border-[#d4a574]/30 text-[#e8d5b7]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#e8d5b7]">Категория</Label>
                    <Select value={newProduct.category} onValueChange={(v: any) => setNewProduct({ ...newProduct, category: v })}>
                      <SelectTrigger className="bg-[#1a1410] border-[#d4a574]/30 text-[#e8d5b7]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2018] border-[#d4a574]/30">
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="text-[#e8d5b7]">
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#e8d5b7]">Цена (₽)</Label>
                    <Input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="bg-[#1a1410] border-[#d4a574]/30 text-[#e8d5b7]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#e8d5b7]">Эмодзи или фото</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        placeholder="🍞"
                        className="bg-[#1a1410] border-[#d4a574]/30 text-[#e8d5b7] flex-1"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                        id="new-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('new-image-upload')?.click()}
                        className="border-[#d4a574]/40 text-[#d4a574]"
                      >
                        <Icon name="Upload" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddProduct} className="bg-[#d4a574] hover:bg-[#c19563] text-[#1a1410]">
                    Добавить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={exportSales}
              className="bg-transparent border-[#d4a574]/40 text-[#d4a574] hover:bg-[#d4a574]/10"
            >
              <Icon name="Download" className="mr-2 h-4 w-4" />
              Экспорт
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-transparent border-[#d4a574]/40 text-[#d4a574] hover:bg-[#d4a574]/10"
            >
              <Icon name="LogOut" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {showCategoryHome ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center">
            <div className="text-center mb-12 animate-fade-in">
              <div className="text-7xl mb-4">🥖</div>
              <h2 className="text-4xl font-serif font-bold text-[#d4a574] mb-2">Выберите категорию</h2>
              <p className="text-[#e8d5b7]/70">Нажмите на категорию для начала работы</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
              {CATEGORIES.map((category, index) => (
                <Card
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id as any)}
                  className="bg-[#2a2018]/90 border-[#d4a574]/30 hover:border-[#d4a574] cursor-pointer transition-all hover:scale-105 animate-fade-in group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{category.emoji}</div>
                    <h3 className="text-2xl font-serif font-bold text-[#d4a574] mb-2">
                      {category.label.replace(/[🍽️☕🍰🍔🥤]\s*/, '')}
                    </h3>
                    <Badge variant="outline" className="border-[#d4a574]/40 text-[#d4a574]">
                      {products.filter(p => p.category === category.id).length} товаров
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={() => handleCategorySelect('all')}
              variant="outline"
              className="mt-8 border-[#d4a574]/40 text-[#d4a574] hover:bg-[#d4a574]/10 px-8 py-6 text-lg"
            >
              <Icon name="Package" className="mr-2 h-5 w-5" />
              Показать все товары
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button
                onClick={() => setShowCategoryHome(true)}
                variant="outline"
                className="border-[#d4a574]/40 text-[#d4a574] hover:bg-[#d4a574]/10"
              >
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                К категориям
              </Button>

              <div className="flex gap-2 flex-wrap flex-1">
                <Button
                  onClick={() => setSelectedCategory('all')}
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className={selectedCategory === 'all' 
                    ? 'bg-[#d4a574] hover:bg-[#c19563] text-[#1a1410]'
                    : 'border-[#d4a574]/40 text-[#d4a574] hover:bg-[#d4a574]/10'
                  }
                >
                  Все
                </Button>
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    className={selectedCategory === category.id
                      ? 'bg-[#d4a574] hover:bg-[#c19563] text-[#1a1410]'
                      : 'border-[#d4a574]/40 text-[#d4a574] hover:bg-[#d4a574]/10'
                    }
                  >
                    {category.emoji} {category.label.replace(/[🍽️☕🍰🍔🥤]\s*/, '')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-[#2a2018]/80 backdrop-blur-sm border-[#d4a574]/20 hover:border-[#d4a574]/50 transition-all hover:scale-105 animate-fade-in group relative"
                >
                  <CardContent className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#d4a574] hover:bg-[#d4a574]/20"
                    >
                      <Icon name="Pencil" className="h-4 w-4" />
                    </Button>

                    {product.customImage ? (
                      <img src={product.customImage} alt={product.name} className="w-full h-20 object-cover rounded mb-3" />
                    ) : (
                      <div className="text-5xl mb-3 text-center group-hover:scale-110 transition-transform">
                        {product.image}
                      </div>
                    )}

                    <h3 className="font-serif text-lg text-[#e8d5b7] mb-2 text-center min-h-[3.5rem] flex items-center justify-center">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#d4a574] font-bold">{product.price}₽</span>
                      <Badge variant="outline" className="border-[#d4a574]/40 text-[#d4a574]">
                        {product.salesCount}
                      </Badge>
                    </div>

                    {product.category === 'coffee' && product.id !== '21' && product.id !== '23' ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-[#d4a574] hover:bg-[#c19563] text-[#1a1410]">
                            <Icon name="Plus" className="h-4 w-4 mr-1" />
                            Добавить
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#2a2018] border-[#d4a574]/30">
                          <DialogHeader>
                            <DialogTitle className="text-[#d4a574] font-serif">Выберите объём</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            {Object.entries(COFFEE_SIZES).map(([size, info]) => (
                              <Button
                                key={size}
                                onClick={() => addToCart(product, size as any)}
                                className="w-full bg-[#d4a574]/20 hover:bg-[#d4a574] text-[#e8d5b7] hover:text-[#1a1410] border border-[#d4a574]/40"
                              >
                                {info.label} — {(product.price * info.multiplier).toFixed(0)}₽
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button
                        onClick={() => addToCart(product)}
                        className="w-full bg-[#d4a574] hover:bg-[#c19563] text-[#1a1410]"
                      >
                        <Icon name="Plus" className="h-4 w-4 mr-1" />
                        Добавить
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-[#2a2018]/90 backdrop-blur-sm border-[#d4a574]/30 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-2xl font-serif font-bold text-[#d4a574] mb-4">Корзина</h2>

                {cart.length === 0 ? (
                  <div className="text-center py-8 text-[#e8d5b7]/50">
                    <Icon name="ShoppingCart" className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Корзина пуста</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#1a1410]/50 p-3 rounded-lg border border-[#d4a574]/20">
                          <div className="flex-1">
                            <p className="text-[#e8d5b7] font-medium text-sm">{item.name}</p>
                            {item.coffeeSize && (
                              <p className="text-xs text-[#d4a574]">
                                {COFFEE_SIZES[item.coffeeSize].label}
                              </p>
                            )}
                            <p className="text-sm text-[#e8d5b7]/70">
                              {item.quantity} × {(item.customPrice || item.price).toFixed(2)}₽
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                            className="text-[#d4a574] hover:text-[#c19563] hover:bg-[#d4a574]/10"
                          >
                            <Icon name="X" className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#d4a574]/30 pt-4 mb-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span className="text-[#e8d5b7]">Итого:</span>
                        <span className="text-[#d4a574]">{getTotalPrice()}₽</span>
                      </div>
                    </div>

                    <Button
                      onClick={completeSale}
                      className="w-full bg-[#d4a574] hover:bg-[#c19563] text-[#1a1410] font-bold py-6 text-lg"
                    >
                      <Icon name="Check" className="mr-2 h-5 w-5" />
                      Завершить продажу
                    </Button>
                  </>
                )}

                <Dialog open={customPriceDialog} onOpenChange={setCustomPriceDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-3 border-[#d4a574]/40 text-[#d4a574] hover:bg-[#d4a574]/10"
                    >
                      <Icon name="Coins" className="mr-2 h-4 w-4" />
                      Свободная цена
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#2a2018] border-[#d4a574]/30">
                    <DialogHeader>
                      <DialogTitle className="text-[#d4a574] font-serif">Введите цену</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="number"
                        placeholder="Введите сумму"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="bg-[#1a1410] border-[#d4a574]/30 text-[#e8d5b7]"
                      />
                      <Button
                        onClick={addCustomPriceItem}
                        className="w-full bg-[#d4a574] hover:bg-[#c19563] text-[#1a1410]"
                      >
                        Добавить в корзину
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
        </>
        )}
      </div>

      <Dialog open={editProductDialog} onOpenChange={setEditProductDialog}>
        <DialogContent className="bg-[#2a2018] border-[#d4a574]/30">
          <DialogHeader>
            <DialogTitle className="text-[#d4a574] font-serif">Редактировать товар</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label className="text-[#e8d5b7]">Название</Label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="bg-[#1a1410] border-[#d4a574]/30 text-[#e8d5b7]"
                />
              </div>
              <div>
                <Label className="text-[#e8d5b7]">Цена (₽)</Label>
                <Input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  className="bg-[#1a1410] border-[#d4a574]/30 text-[#e8d5b7]"
                />
              </div>
              <div>
                <Label className="text-[#e8d5b7]">Эмодзи или фото</Label>
                <div className="flex gap-2">
                  <Input
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="bg-[#1a1410] border-[#d4a574]/30 text-[#e8d5b7] flex-1"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('edit-image-upload')?.click()}
                    className="border-[#d4a574]/40 text-[#d4a574]"
                  >
                    <Icon name="Upload" className="h-4 w-4" />
                  </Button>
                </div>
                {editingProduct.customImage && (
                  <img src={editingProduct.customImage} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={saveProductEdit} className="bg-[#d4a574] hover:bg-[#c19563] text-[#1a1410]">
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;