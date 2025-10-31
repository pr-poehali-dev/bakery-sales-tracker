import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface LoginFormProps {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
}

export const LoginForm = ({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onLogin
}: LoginFormProps) => {
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
                onChange={(e) => onUsernameChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onLogin()}
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onLogin()}
              />
            </div>
            <Button className="w-full" size="lg" onClick={onLogin}>
              Войти
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
