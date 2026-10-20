import React from 'react';
import {
  Utensils,
  Coffee,
  Train,
  Wifi,
  Shirt,
  Zap,
  HeartPulse,
  ShoppingBag,
  Luggage,
  Bike,
  Coins,
  CupSoda,
  Tag,
  CircleDollarSign,
  Flame,
  Cigarette,
  Pill,
  Plane
} from 'lucide-react';

export default function CategoryIcon({ name, size = 18, color = 'currentColor' }) {
  const iconMap = {
    Utensils: <Utensils size={size} color={color} />,
    CupSoda: <CupSoda size={size} color={color} />,
    Coffee: <Coffee size={size} color={color} />,
    Train: <Train size={size} color={color} />,
    Wifi: <Wifi size={size} color={color} />,
    Shirt: <Shirt size={size} color={color} />,
    Zap: <Zap size={size} color={color} />,
    HeartPulse: <HeartPulse size={size} color={color} />,
    ShoppingBag: <ShoppingBag size={size} color={color} />,
    Luggage: <Luggage size={size} color={color} />,
    Bike: <Bike size={size} color={color} />,
    Coins: <Coins size={size} color={color} />,
    CircleDollarSign: <CircleDollarSign size={size} color={color} />,
    Flame: <Flame size={size} color={color} />,
    Cigarette: <Cigarette size={size} color={color} />,
    Pill: <Pill size={size} color={color} />,
    Plane: <Plane size={size} color={color} />
  };

  return iconMap[name] || <Tag size={size} color={color} />;
}
