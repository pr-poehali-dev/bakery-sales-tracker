import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Category, UserRole } from '@/types';

interface CategoryGridProps {
  categories: Category[];
  userRole: UserRole;
  onCategoryClick: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
}

export const CategoryGrid = ({
  categories,
  userRole,
  onCategoryClick,
  onDeleteCategory,
  onDragStart,
  onDragEnter,
  onDragEnd
}: CategoryGridProps) => {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Категории</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {categories.map((category, index) => (
          <Card
            key={category.id}
            className={`category-card cursor-pointer hover:shadow-lg border-2 border-transparent hover:border-primary ${
              userRole === 'admin' ? 'drag-handle' : ''
            }`}
            draggable={userRole === 'admin'}
            onDragStart={() => onDragStart(index)}
            onDragEnter={() => onDragEnter(index)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => onCategoryClick(category.id)}
          >
            <CardContent className="p-4 md:p-6 text-center relative min-h-[120px] md:min-h-[140px] flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl mb-2">{category.emoji}</div>
              <p className="font-semibold text-sm md:text-base">{category.label}</p>
              {userRole === 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category.id);
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
  );
};
