import { Category, Product, User } from '@/types';

export const COFFEE_SIZES = {
  small: { label: '100 мл', multiplier: 1 },
  medium: { label: '250 мл', multiplier: 1.3 },
  large: { label: '400 мл', multiplier: 1.6 }
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'pies', label: 'Пирожки', emoji: '🥟' },
  { id: 'coffee', label: 'Кофе и Чай', emoji: '☕' },
  { id: 'sweets', label: 'Сладкое', emoji: '🍰' },
  { id: 'kitchen', label: 'Кухня', emoji: '🍔' },
  { id: 'drinks', label: 'Напитки', emoji: '🥤' }
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Пирожок с капустой', category: 'pies', price: 50, image: '🥟', salesCount: 0 },
  { id: '2', name: 'Пирожок с картошкой', category: 'pies', price: 50, image: '🥟', salesCount: 0 },
  { id: '3', name: 'Пирожок с мясом', category: 'pies', price: 60, image: '🥟', salesCount: 0 },
  { id: '4', name: 'Чебурек с мясом', category: 'pies', price: 80, image: '🥙', salesCount: 0 },
  { id: '5', name: 'Чебурек с сыром', category: 'pies', price: 75, image: '🥙', salesCount: 0 },
  { id: '6', name: 'Хачапури с сыром', category: 'pies', price: 120, image: '🫓', salesCount: 0 },
  { id: '7', name: 'Хачапури с сыром и зеленью', category: 'pies', price: 130, image: '🫓', salesCount: 0 },
  { id: '8', name: 'Хачапури с мясом', category: 'pies', price: 140, image: '🫓', salesCount: 0 },
  { id: '9', name: 'Матнакаш', category: 'pies', price: 90, image: '🍞', salesCount: 0 },
  { id: '10', name: 'Армянский тонкий лаваш', category: 'pies', price: 40, image: '🫓', salesCount: 0 },
  { id: '11', name: 'Хлеб ржаной', category: 'pies', price: 60, image: '🍞', salesCount: 0 },
  { id: '12', name: 'Хлеб рижский', category: 'pies', price: 70, image: '🍞', salesCount: 0 },
  { id: '13', name: 'Хлеб черный с семечками', category: 'pies', price: 80, image: '🍞', salesCount: 0 },
  
  { id: '14', name: 'Эспрессо', category: 'coffee', price: 100, image: '☕', salesCount: 0 },
  { id: '15', name: 'Капучино', category: 'coffee', price: 140, image: '☕', salesCount: 0 },
  { id: '16', name: 'Латте', category: 'coffee', price: 150, image: '☕', salesCount: 0 },
  { id: '17', name: 'Американо', category: 'coffee', price: 110, image: '☕', salesCount: 0 },
  { id: '18', name: 'Флэт уайт', category: 'coffee', price: 145, image: '☕', salesCount: 0 },
  { id: '19', name: 'Раф', category: 'coffee', price: 160, image: '☕', salesCount: 0 },
  { id: '20', name: 'Кофе на песке', category: 'coffee', price: 180, image: '☕', salesCount: 0 },
  { id: '21', name: 'Чай пакетированный', category: 'coffee', price: 60, image: '🍵', salesCount: 0 },
  { id: '22', name: 'Лавандовый раф', category: 'coffee', price: 170, image: '☕', salesCount: 0 },
  { id: '23', name: 'Облепиховый чай', category: 'coffee', price: 120, image: '🍵', salesCount: 0 },
  
  { id: '24', name: 'Шоколадный кекс', category: 'sweets', price: 80, image: '🧁', salesCount: 0 },
  { id: '25', name: 'Армянская пахлава', category: 'sweets', price: 100, image: '🥮', salesCount: 0 },
  { id: '26', name: 'Чизкейк классический', category: 'sweets', price: 150, image: '🍰', salesCount: 0 },
  { id: '27', name: 'Чизкейк шоколадный', category: 'sweets', price: 160, image: '🍰', salesCount: 0 },
  { id: '28', name: 'Наполеон', category: 'sweets', price: 130, image: '🍰', salesCount: 0 },
  { id: '29', name: 'Медовик', category: 'sweets', price: 140, image: '🍰', salesCount: 0 },
  { id: '30', name: 'Булочка с изюмом', category: 'sweets', price: 50, image: '🥐', salesCount: 0 },
  { id: '31', name: 'Булочка с маком', category: 'sweets', price: 50, image: '🥐', salesCount: 0 },
  { id: '32', name: 'Булочка яблоко корица', category: 'sweets', price: 55, image: '🥐', salesCount: 0 },
  { id: '33', name: 'Пончик', category: 'sweets', price: 60, image: '🍩', salesCount: 0 },
  { id: '34', name: 'Сушки', category: 'sweets', price: 40, image: '🍪', salesCount: 0 },
  { id: '35', name: 'Печенье монетки', category: 'sweets', price: 45, image: '🍪', salesCount: 0 },
  { id: '36', name: 'Печенье с джемом', category: 'sweets', price: 50, image: '🍪', salesCount: 0 },
  { id: '37', name: 'Козинаки в шоколаде', category: 'sweets', price: 70, image: '🍫', salesCount: 0 },
  
  { id: '38', name: 'Твистер', category: 'kitchen', price: 180, image: '🌯', salesCount: 0 },
  { id: '39', name: 'Твистер де люкс', category: 'kitchen', price: 220, image: '🌯', salesCount: 0 },
  { id: '40', name: 'Бургер', category: 'kitchen', price: 200, image: '🍔', salesCount: 0 },
  { id: '41', name: 'Бургер де люкс', category: 'kitchen', price: 250, image: '🍔', salesCount: 0 },
  { id: '42', name: 'Картофель фри средний', category: 'kitchen', price: 100, image: '🍟', salesCount: 0 },
  { id: '43', name: 'Картофель фри большой', category: 'kitchen', price: 140, image: '🍟', salesCount: 0 },
  { id: '44', name: 'Комбо (фри, бургер/твистер, кола)', category: 'kitchen', price: 350, image: '🍱', salesCount: 0 },
  
  { id: '45', name: 'Добрый кола', category: 'drinks', price: 80, image: '🥤', salesCount: 0 },
  { id: '46', name: 'Азвкус сок', category: 'drinks', price: 70, image: '🧃', salesCount: 0 },
  { id: '47', name: 'Аскания', category: 'drinks', price: 60, image: '🥤', salesCount: 0 },
  { id: '48', name: 'Вода негазированная святой источник', category: 'drinks', price: 50, image: '💧', salesCount: 0 },
];

export const ADMIN_USER: User = {
  username: 'admin',
  password: 'admin',
  name: 'Администратор',
  role: 'admin'
};
