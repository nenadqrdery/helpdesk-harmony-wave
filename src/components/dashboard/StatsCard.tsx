
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: 'default' | 'green' | 'orange' | 'red' | 'blue';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  color = 'default'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'orange':
        return 'bg-orange-50 border-orange-200';
      case 'red':
        return 'bg-red-50 border-red-200';
      case 'blue':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-background';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'green':
        return 'text-green-600';
      case 'orange':
        return 'text-orange-600';
      case 'red':
        return 'text-red-600';
      case 'blue':
        return 'text-blue-600';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${getColorClasses()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${getIconColor()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
