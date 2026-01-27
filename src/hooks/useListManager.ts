import { useState } from 'react';

export function useListManager(initialItems: string[] = [""]) {
  const [items, setItems] = useState<string[]>(initialItems);

  const addItem = (defaultValue = "") => {
    setItems([...items, defaultValue]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    setItems(newItems);
  };

  const getText = () => {
    return items.filter(item => item.trim()).join('\n');
  };

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    getText,
  };
}