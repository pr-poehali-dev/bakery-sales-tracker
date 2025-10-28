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
  const [showCategoryHome, setShowCategoryHome] = useState(true);
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

  const handleLogin = () => {
    if (password === '1234') {
      const now = Date.now();
      setIsAuthenticated(true);
      setSessionStartTime(now);
      localStorage.setItem('bakery-session-active', 'true');
      localStorage.setItem('bakery-session-start', now.toString());
      toast({ title: 'Смена открыта' });
    } else {
      toast({ title: 'Неверный пароль', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    const totalSales = cart.reduce((sum, item) => {
      const price = item.customPrice || (item.coffeeSize && item.category === 'coffee' ? item.price * COFFEE_SIZES[item.coffeeSize].multiplier : item.price);
      return sum + (price * item.quantity);
    }, 0);

    if (totalSales > 0 || cart.length > 0) {
      toast({ 
        title: 'Закрытие смены', 
        description: `Незавершённая корзина на ${totalSales}₽. Завершите или очистите её.`,
        variant: 'destructive'
      });
      return;
    }

    setIsAuthenticated(false);
    setSessionStartTime(null);
    localStorage.removeItem('bakery-session-active');
    localStorage.removeItem('bakery-session-start');
    setPassword('');
    toast({ title: 'Смена закрыта' });
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    const item = cart.find(c => c.id === id);
    if (item && item.quantity > 1) {
      setCart(cart.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c));
    } else {
      setCart(cart.filter(c => c.id !== id));
    }
  };

  const setCoffeeSize = (id: string, size: 'small' | 'medium' | 'large') => {
    setCart(cart.map(item => item.id === id ? { ...item, coffeeSize: size } : item));
  };

  const setItemCustomPrice = (id: string, price: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, customPrice: price } : item));
  };

  const completeSale = () => {
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, salesCount: product.salesCount + cartItem.quantity };
      }
      return product;
    });
    
    setProducts(updatedProducts);
    setCart([]);
    toast({ title: 'Продажа завершена' });
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
      salesCount: 0
    };
    
    setProducts([...products, product]);
    setNewProduct({ name: '', category: 'pies', price: '', image: '🍞' });
    setAddProductDialog(false);
    toast({ title: 'Товар добавлен' });
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, customImage: result, image: '' });
      } else {
        setNewProduct({ ...newProduct, customImage: result, image: '' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategorySelect = (category: typeof selectedCategory) => {
    setSelectedCategory(category);
    setShowCategoryHome(false);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0b1a] via-[#151628] to-[#1a1b35] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <Card className="w-full max-w-md mx-4 bg-card/50 backdrop-blur-xl border-primary/20 shadow-2xl animate-scale-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          <CardContent className="pt-8 pb-6 relative z-10">
            <div className="text-center mb-8">
              <div className="text-7xl mb-4 animate-float">🥖</div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                Хлеб Бабушкин
              </h1>
              <p className="text-muted-foreground">Система учёта продаж</p>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="bg-background/50 border-primary/30 text-foreground placeholder:text-muted-foreground h-12"
                />
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 shadow-lg hover:shadow-primary/50 transition-all"
              >
                Открыть смену
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Пароль по умолчанию: 1234
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b1a] via-[#151628] to-[#1a1b35] relative pb-6">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <header className="bg-card/30 backdrop-blur-xl border-b border-primary/20 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="text-5xl animate-float">🥖</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Хлеб Бабушкин
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Icon name="Clock" size={14} />
                Смена: {sessionDuration}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={addProductDialog} onOpenChange={setAddProductDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-primary/10 border-primary/40 text-primary hover:bg-primary/20 hover:border-primary/60"
                >
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Товар
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/30">
                <DialogHeader>
                  <DialogTitle className="text-primary">Добавить товар</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground">Название</Label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="bg-background/50 border-primary/30 text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Категория</Label>
                    <Select value={newProduct.category} onValueChange={(v: any) => setNewProduct({ ...newProduct, category: v })}>
                      <SelectTrigger className="bg-background/50 border-primary/30 text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-primary/30">
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="text-foreground">
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-foreground">Цена</Label>
                    <Input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="bg-background/50 border-primary/30 text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Эмодзи или изображение</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        placeholder="🍞"
                        className="bg-background/50 border-primary/30 text-foreground"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="bg-background/50 border-primary/30 text-foreground"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addNewProduct} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Добавить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-destructive/10 border-destructive/40 text-destructive hover:bg-destructive/20"
            >
              <Icon name="LogOut" className="mr-2 h-4 w-4" />
              Закрыть смену
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {showCategoryHome ? (
              <div className="animate-slide-up">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Выберите категорию
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat, index) => (
                    <Card 
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id as any)}
                      className="cursor-pointer bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 hover:bg-card/70 transition-all group hover:shadow-lg hover:shadow-primary/20 animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-8 text-center">
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{cat.emoji}</div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {cat.label.replace(cat.emoji + ' ', '')}
                        </h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {selectedCategory === 'all' ? 'Все товары' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </h2>
                  <Button 
                    variant="outline"
                    onClick={() => setShowCategoryHome(true)}
                    className="bg-primary/10 border-primary/40 text-primary hover:bg-primary/20"
                  >
                    <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                    К категориям
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product, index) => (
                    <Card 
                      key={product.id}
                      className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10 group animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          {product.customImage ? (
                            <img src={product.customImage} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                          ) : (
                            <div className="text-4xl group-hover:scale-110 transition-transform">{product.image}</div>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingProduct(product)}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Icon name="Settings" size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/30">
                              <DialogHeader>
                                <DialogTitle className="text-primary">Редактировать товар</DialogTitle>
                              </DialogHeader>
                              {editingProduct && (
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-foreground">Название</Label>
                                    <Input
                                      value={editingProduct.name}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                      className="bg-background/50 border-primary/30 text-foreground"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-foreground">Цена</Label>
                                    <Input
                                      type="number"
                                      value={editingProduct.price}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                      className="bg-background/50 border-primary/30 text-foreground"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-foreground">Эмодзи</Label>
                                    <Input
                                      value={editingProduct.image}
                                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                      className="bg-background/50 border-primary/30 text-foreground"
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter className="gap-2">
                                <Button 
                                  variant="destructive" 
                                  onClick={() => {
                                    if (editingProduct) deleteProduct(editingProduct.id);
                                  }}
                                >
                                  Удалить
                                </Button>
                                <Button onClick={updateProduct} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                  Сохранить
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        <h3 className="font-semibold text-sm mb-2 text-foreground line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">{product.price}₽</span>
                          {product.salesCount > 0 && (
                            <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                              {product.salesCount} шт
                            </Badge>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => addToCart(product)}
                          className="w-full mt-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 hover:border-primary/60"
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

          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-card/50 backdrop-blur-xl border-primary/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Icon name="ShoppingCart" size={24} />
                    Корзина
                  </h2>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                    {cart.length}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {cart.map((item) => {
                    const basePrice = item.coffeeSize && item.category === 'coffee'
                      ? item.price * COFFEE_SIZES[item.coffeeSize].multiplier
                      : item.price;
                    const finalPrice = item.customPrice || basePrice;

                    return (
                      <Card key={item.id} className="bg-background/50 border-primary/20">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            {item.customImage ? (
                              <img src={item.customImage} alt={item.name} className="w-10 h-10 object-cover rounded" />
                            ) : (
                              <div className="text-2xl">{item.image}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromCart(item.id)}
                                  className="h-6 w-6 p-0 bg-background/50 border-primary/30 text-primary hover:bg-primary/20"
                                >
                                  <Icon name="Minus" size={12} />
                                </Button>
                                <span className="text-sm font-bold text-primary">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addToCart(item)}
                                  className="h-6 w-6 p-0 bg-background/50 border-primary/30 text-primary hover:bg-primary/20"
                                >
                                  <Icon name="Plus" size={12} />
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
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-background/50 border-primary/30 text-foreground hover:bg-primary/20'
                                      }`}
                                    >
                                      {data.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-primary">{(finalPrice * item.quantity).toFixed(0)}₽</div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 mt-1 text-xs text-muted-foreground hover:text-primary"
                                  >
                                    <Icon name="Edit" size={12} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/30">
                                  <DialogHeader>
                                    <DialogTitle className="text-primary">Изменить цену</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-foreground">Новая цена</Label>
                                      <Input
                                        type="number"
                                        placeholder={basePrice.toString()}
                                        value={customPrice}
                                        onChange={(e) => setCustomPrice(e.target.value)}
                                        className="bg-background/50 border-primary/30 text-foreground"
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
                                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                      Применить
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xl font-bold pb-4 border-t border-primary/20 pt-4">
                    <span className="text-foreground">Итого:</span>
                    <span className="text-primary">
                      {cart.reduce((sum, item) => {
                        const price = item.customPrice || (item.coffeeSize && item.category === 'coffee' ? item.price * COFFEE_SIZES[item.coffeeSize].multiplier : item.price);
                        return sum + (price * item.quantity);
                      }, 0).toFixed(0)}₽
                    </span>
                  </div>

                  <Button
                    onClick={completeSale}
                    disabled={cart.length === 0}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 shadow-lg hover:shadow-primary/50 disabled:opacity-50"
                  >
                    <Icon name="Check" className="mr-2" size={20} />
                    Завершить продажу
                  </Button>
                  
                  <Button
                    onClick={() => setCart([])}
                    disabled={cart.length === 0}
                    variant="outline"
                    className="w-full bg-destructive/10 border-destructive/40 text-destructive hover:bg-destructive/20"
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
