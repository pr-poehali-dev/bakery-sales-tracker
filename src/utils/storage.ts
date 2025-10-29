import { User, Sale, ShiftReport } from '@/types';

const DEFAULT_ADMIN: User = {
  username: 'admin',
  password: 'admin',
  role: 'admin',
  name: 'Администратор'
};

export const getUsersFromStorage = (): User[] => {
  const stored = localStorage.getItem('bakery-users');
  if (!stored) {
    const defaultUsers = [DEFAULT_ADMIN];
    localStorage.setItem('bakery-users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(stored);
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem('bakery-users', JSON.stringify(users));
};

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsersFromStorage();
  return users.find(u => u.username === username && u.password === password) || null;
};

export const createCashier = (username: string, password: string, name: string): boolean => {
  const users = getUsersFromStorage();
  if (users.some(u => u.username === username)) {
    return false;
  }
  users.push({ username, password, role: 'cashier', name });
  saveUsers(users);
  return true;
};

export const updateUserPassword = (username: string, newPassword: string): boolean => {
  const users = getUsersFromStorage();
  const user = users.find(u => u.username === username);
  if (!user) return false;
  user.password = newPassword;
  saveUsers(users);
  return true;
};

export const getTodaySales = (): Sale[] => {
  const stored = localStorage.getItem('bakery-sales');
  if (!stored) return [];
  const allSales: Sale[] = JSON.parse(stored);
  const todayStart = new Date().setHours(0, 0, 0, 0);
  return allSales.filter(s => s.timestamp >= todayStart);
};

export const saveSale = (sale: Sale) => {
  const stored = localStorage.getItem('bakery-sales');
  const sales: Sale[] = stored ? JSON.parse(stored) : [];
  sales.push(sale);
  localStorage.setItem('bakery-sales', JSON.stringify(sales));
};

export const getCurrentShiftReport = (cashier: string, startTime: number): ShiftReport => {
  const sales = getTodaySales().filter(s => s.timestamp >= startTime && s.cashier === cashier);
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalItems = sales.reduce((sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const cashRevenue = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
  const cardRevenue = sales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);

  return {
    startTime,
    endTime: Date.now(),
    cashier,
    sales,
    totalRevenue,
    totalItems,
    cashRevenue,
    cardRevenue
  };
};

export const getTelegramSettings = () => {
  const botToken = localStorage.getItem('telegram-bot-token') || '';
  const chatId = localStorage.getItem('telegram-chat-id') || '';
  return { botToken, chatId };
};

export const saveTelegramSettings = (botToken: string, chatId: string) => {
  localStorage.setItem('telegram-bot-token', botToken);
  localStorage.setItem('telegram-chat-id', chatId);
};
