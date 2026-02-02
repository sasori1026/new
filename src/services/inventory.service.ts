import { Injectable, signal, computed, effect } from '@angular/core';

export interface StockItem {
  id: string;
  name: string;
  category: 'Material' | 'Herramienta' | 'Equipo';
  quantity: number;
  unit: string;
  minThreshold: number; // Low stock alert level
  location?: string;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly STORAGE_KEY = 'cristaline_inventory_v1';

  private initialStock: StockItem[] = [
    { id: '1', name: 'Cristaline 1', category: 'Material', quantity: 450, unit: 'kg', minThreshold: 100, location: 'Bodega Principal', lastUpdated: new Date().toISOString() },
    { id: '2', name: 'Cristaline Plug', category: 'Material', quantity: 25, unit: 'kg', minThreshold: 50, location: 'Camioneta 1', lastUpdated: new Date().toISOString() },
    { id: '3', name: 'Hidrolavadora Industrial', category: 'Equipo', quantity: 2, unit: 'und', minThreshold: 1, location: 'Obra Norte', lastUpdated: new Date().toISOString() },
    { id: '4', name: 'Arena Sílice', category: 'Material', quantity: 1200, unit: 'kg', minThreshold: 500, location: 'Bodega Principal', lastUpdated: new Date().toISOString() }
  ];

  readonly inventory = signal<StockItem[]>([]);

  readonly lowStockItems = computed(() => 
    this.inventory().filter(item => item.quantity <= item.minThreshold)
  );

  readonly totalValue = computed(() => this.inventory().length);

  constructor() {
    this.loadInventory();
    
    effect(() => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.inventory()));
    });
  }

  private loadInventory() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
        try {
            this.inventory.set(JSON.parse(saved));
        } catch {
            this.inventory.set(this.initialStock);
        }
    } else {
        this.inventory.set(this.initialStock);
    }
  }

  addItem(item: Omit<StockItem, 'id' | 'lastUpdated'>) {
    const newItem: StockItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date().toISOString()
    };
    this.inventory.update(list => [...list, newItem]);
  }

  updateStock(id: string, delta: number) {
    this.inventory.update(list => list.map(item => {
        if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty, lastUpdated: new Date().toISOString() };
        }
        return item;
    }));
  }

  deleteItem(id: string) {
    this.inventory.update(list => list.filter(i => i.id !== id));
  }
}