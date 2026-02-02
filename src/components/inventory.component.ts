import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, StockItem } from '../services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
       
       <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 class="text-2xl font-bold text-zinc-800">Inventario de Obra</h2>
             <p class="text-zinc-500">Control de materiales, equipos y herramientas en bodega.</p>
          </div>
          <button (click)="showAddModal.set(true)" class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
             </svg>
             Nuevo Ítem
          </button>
       </div>

       <!-- Alerts Section -->
       @if (inventoryService.lowStockItems().length > 0) {
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
             <div class="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 class="font-bold text-red-700">Alertas de Stock Bajo</h3>
             </div>
             <div class="flex flex-wrap gap-2">
                @for (item of inventoryService.lowStockItems(); track item.id) {
                   <span class="px-3 py-1 bg-white border border-red-200 text-red-600 text-xs rounded-full font-bold flex items-center gap-2">
                      {{ item.name }} ({{ item.quantity }} {{ item.unit }})
                      <button (click)="updateStock(item.id, 10)" class="text-blue-500 hover:text-blue-700 underline text-[10px]">+ Pedir</button>
                   </span>
                }
             </div>
          </div>
       }

       <!-- NEW: Filter and Search Toolbar -->
       <div class="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex flex-col sm:flex-row gap-4">
          <div class="relative flex-1">
             <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
             <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar por nombre..." class="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg bg-zinc-50 focus:ring-2 focus:ring-cyan-500 outline-none">
          </div>
          <div class="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
             @for (cat of categories; track cat) {
                <button (click)="selectedCategory.set(cat)" [class]="selectedCategory() === cat ? 'bg-white shadow-sm text-cyan-700' : 'text-zinc-500 hover:text-zinc-700'" class="flex-1 px-3 py-1 text-sm font-bold rounded-md transition-all">
                   {{ cat === 'All' ? 'Todos' : cat }}
                </button>
             }
          </div>
       </div>

       <!-- Inventory Table -->
       <div class="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <table class="w-full text-left text-sm">
             <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-xs">
                <tr>
                   <th class="px-6 py-4">Ítem</th>
                   <th class="px-6 py-4">Categoría</th>
                   <th class="px-6 py-4">Ubicación</th>
                   <th class="px-6 py-4 text-center">Stock Actual</th>
                   <th class="px-6 py-4 text-center">Acciones</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-zinc-100">
                @for (item of filteredInventory(); track item.id) {
                   <tr class="hover:bg-zinc-50 group">
                      <td class="px-6 py-4 font-medium text-zinc-800">{{ item.name }}</td>
                      <td class="px-6 py-4">
                         <span [class]="getCategoryColor(item.category)" class="px-2 py-1 rounded text-xs font-bold border">
                            {{ item.category }}
                         </span>
                      </td>
                      <td class="px-6 py-4 text-zinc-500">{{ item.location || 'N/A' }}</td>
                      <td class="px-6 py-4 text-center">
                         <div class="flex items-center justify-center gap-3">
                            <button (click)="updateStock(item.id, -1)" class="w-6 h-6 rounded-full bg-zinc-100 hover:bg-red-100 text-zinc-600 hover:text-red-600 flex items-center justify-center font-bold">-</button>
                            <span [class]="item.quantity <= item.minThreshold ? 'text-red-600 font-bold' : 'text-zinc-700 font-mono'">{{ item.quantity }} {{ item.unit }}</span>
                            <button (click)="updateStock(item.id, 1)" class="w-6 h-6 rounded-full bg-zinc-100 hover:bg-emerald-100 text-zinc-600 hover:text-emerald-600 flex items-center justify-center font-bold">+</button>
                         </div>
                      </td>
                      <td class="px-6 py-4 text-center">
                         <button (click)="inventoryService.deleteItem(item.id)" class="text-zinc-400 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                         </button>
                      </td>
                   </tr>
                }
                @if (filteredInventory().length === 0) {
                   <tr>
                      <td colspan="5" class="px-6 py-8 text-center text-zinc-400 italic">
                         @if (inventoryService.inventory().length === 0) {
                            No hay ítems en el inventario.
                         } @else {
                            No se encontraron ítems con los filtros actuales.
                         }
                      </td>
                   </tr>
                }
             </tbody>
          </table>
       </div>

       <!-- Add Modal -->
       @if (showAddModal()) {
          <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div class="px-6 py-4 bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-700">Nuevo Ítem</div>
                <div class="p-6 space-y-4">
                   <div>
                      <label class="block text-xs font-bold text-zinc-500 uppercase">Nombre</label>
                      <input [(ngModel)]="newItem.name" class="w-full border rounded-lg p-2 mt-1">
                   </div>
                   <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-bold text-zinc-500 uppercase">Categoría</label>
                        <select [(ngModel)]="newItem.category" class="w-full border rounded-lg p-2 mt-1 bg-white">
                           <option value="Material">Material</option>
                           <option value="Herramienta">Herramienta</option>
                           <option value="Equipo">Equipo</option>
                        </select>
                      </div>
                       <div>
                        <label class="block text-xs font-bold text-zinc-500 uppercase">Unidad</label>
                        <input [(ngModel)]="newItem.unit" class="w-full border rounded-lg p-2 mt-1" placeholder="kg, und...">
                      </div>
                   </div>
                   <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-bold text-zinc-500 uppercase">Cantidad</label>
                        <input type="number" [(ngModel)]="newItem.quantity" class="w-full border rounded-lg p-2 mt-1">
                      </div>
                       <div>
                        <label class="block text-xs font-bold text-zinc-500 uppercase">Mínimo (Alerta)</label>
                        <input type="number" [(ngModel)]="newItem.minThreshold" class="w-full border rounded-lg p-2 mt-1">
                      </div>
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-zinc-500 uppercase">Ubicación</label>
                      <input [(ngModel)]="newItem.location" class="w-full border rounded-lg p-2 mt-1">
                   </div>
                </div>
                <div class="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-2">
                   <button (click)="showAddModal.set(false)" class="px-4 py-2 text-zinc-600 hover:bg-zinc-200 rounded-lg">Cancelar</button>
                   <button (click)="addItem()" class="px-4 py-2 bg-zinc-800 text-white hover:bg-zinc-900 rounded-lg">Guardar</button>
                </div>
             </div>
          </div>
       }
    </div>
  `
})
export class InventoryComponent {
  inventoryService = inject(InventoryService);
  showAddModal = signal(false);

  // --- NEW: Filter State ---
  searchTerm = signal('');
  selectedCategory = signal<'All' | 'Material' | 'Herramienta' | 'Equipo'>('All');
  categories = ['All', 'Material', 'Herramienta', 'Equipo'] as const;

  // --- NEW: Computed Signal for Filtering ---
  filteredInventory = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();

    return this.inventoryService.inventory().filter(item => {
      const categoryMatch = category === 'All' || item.category === category;
      const termMatch = item.name.toLowerCase().includes(term);
      return categoryMatch && termMatch;
    });
  });

  newItem: any = {
     name: '', category: 'Material', quantity: 0, unit: 'kg', minThreshold: 10, location: ''
  };

  addItem() {
     if (!this.newItem.name) return;
     this.inventoryService.addItem(this.newItem);
     this.showAddModal.set(false);
     this.newItem = { name: '', category: 'Material', quantity: 0, unit: 'kg', minThreshold: 10, location: '' };
  }

  updateStock(id: string, delta: number) {
     this.inventoryService.updateStock(id, delta);
  }

  getCategoryColor(cat: string) {
     switch(cat) {
        case 'Material': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'Herramienta': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Equipo': return 'bg-purple-50 text-purple-700 border-purple-200';
        default: return 'bg-zinc-50 text-zinc-600';
     }
  }
}