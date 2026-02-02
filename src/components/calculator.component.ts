import { Component, signal, computed, input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, Project, QuoteItem } from '../services/project.service';
import { CatalogService, ApplicationMethod, ProductSpec } from '../services/catalog.service';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      .print-page { 
         padding: 40px; 
         background: white; 
         font-family: 'Inter', sans-serif;
         color: black;
      }
    }
    .print-only { display: none; }
  `],
  template: `
    <div class="max-w-6xl mx-auto space-y-8 animate-fade-in-up no-print">
      
      <!-- Header -->
      <div class="flex justify-between items-end border-b border-zinc-200 pb-4">
        <div>
          <h2 class="text-2xl font-bold text-zinc-800">Estimación y Presupuesto</h2>
          <p class="text-zinc-500">Gestión integral de materiales, agregados, maquinaria y mano de obra.</p>
        </div>
        <div class="flex gap-4 items-center">
            @if (project()) {
               <div class="text-right">
                  <span class="text-xs text-zinc-400 uppercase font-bold">Total Presupuestado</span>
                  <p class="text-3xl font-bold text-emerald-600">{{ totalPrice() | currency:'USD':'symbol':'1.0-0' }}</p>
               </div>
               <button (click)="printQuote()" class="bg-zinc-800 hover:bg-zinc-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir Cotización PDF
               </button>
            }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left: Calculators (Add to List) (5 Cols) -->
        <div class="lg:col-span-5 space-y-6">
           
           <!-- Tabs -->
           <div class="flex space-x-1 bg-zinc-100 p-1 rounded-xl">
              <button (click)="activeTab.set('products')" [class]="activeTab() === 'products' ? 'bg-white text-cyan-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'" class="flex-1 py-2 text-sm font-bold rounded-lg transition-all">Productos</button>
              <button (click)="activeTab.set('extras')" [class]="activeTab() === 'extras' ? 'bg-white text-cyan-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'" class="flex-1 py-2 text-sm font-bold rounded-lg transition-all">Agregados/Maq</button>
           </div>

           <!-- Tab: Cristaline Products -->
           @if (activeTab() === 'products') {
             <div class="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                <h3 class="font-bold text-zinc-700">Calculadora Técnica</h3>
                
                <!-- Category Select -->
                <div class="grid grid-cols-3 gap-2">
                   @for (cat of categories; track cat.id) {
                      <button (click)="setCategory(cat.id)" [class]="selectedCategory() === cat.id ? 'bg-cyan-50 border-cyan-300 text-cyan-700' : 'bg-white border-zinc-200 text-zinc-600'" class="p-2 border rounded-lg text-xs font-medium text-center hover:bg-zinc-50">
                         {{ cat.label }}
                      </button>
                   }
                </div>

                <!-- Calc Inputs -->
                <div class="space-y-4">
                   @if (selectedCategory() === 'plug') {
                      <div>
                         <label class="text-xs font-bold text-zinc-500 uppercase">Metros Lineales</label>
                         <input type="number" [(ngModel)]="linearMeters" class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg">
                      </div>
                   } @else if (selectedCategory() === 'admix') {
                       <div>
                         <label class="text-xs font-bold text-zinc-500 uppercase">Volumen Concreto (m³)</label>
                         <input type="number" [(ngModel)]="volume" class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg">
                      </div>
                   } @else {
                      <div>
                         <label class="text-xs font-bold text-zinc-500 uppercase">Área (m²)</label>
                         <input type="number" [(ngModel)]="area" class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg">
                      </div>
                   }
                   
                   @if (selectedCategory() === 'slurry' || selectedCategory() === 'repellent') {
                      <div>
                         <label class="text-xs font-bold text-zinc-500 uppercase">Capas (Manos)</label>
                         <select [(ngModel)]="coats" class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg bg-white">
                            <option [value]="1">1 Capa</option>
                            <option [value]="2">2 Capas</option>
                         </select>
                      </div>
                   }

                   <div class="p-3 bg-zinc-50 rounded-lg flex justify-between items-center">
                      <span class="text-sm font-medium text-zinc-700">{{ currentProduct()?.name }}</span>
                      <span class="text-lg font-bold text-cyan-600">{{ calcResult() }} {{ currentProduct()?.category === 'repellent' ? 'L' : 'kg' }}</span>
                   </div>

                   <button (click)="addProductToQuote()" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-bold shadow-md shadow-cyan-200 transition-all flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar al Presupuesto
                   </button>
                </div>
             </div>
           }

           <!-- Tab: Extras (Generic) -->
           @if (activeTab() === 'extras') {
              <div class="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                 <h3 class="font-bold text-zinc-700">Recursos Adicionales</h3>
                 
                 <div class="space-y-4">
                    <div>
                       <label class="text-xs font-bold text-zinc-500 uppercase">Concepto / Ítem</label>
                       <input type="text" [(ngModel)]="extraName" placeholder="Ej: Cemento Gris, Arena, Taladro..." class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                       <div>
                          <label class="text-xs font-bold text-zinc-500 uppercase">Tipo</label>
                          <select [(ngModel)]="extraType" class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg bg-white">
                             <option value="commodity">Material (Arena/Cemento)</option>
                             <option value="equipment">Equipo/Herramienta</option>
                             <option value="labor">Mano de Obra (Horas/Días)</option>
                          </select>
                       </div>
                       <div>
                          <label class="text-xs font-bold text-zinc-500 uppercase">Unidad</label>
                          <select [(ngModel)]="extraUnit" class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg bg-white">
                             <option value="kg">kg</option>
                             <option value="bultos">Bultos</option>
                             <option value="m3">m³</option>
                             <option value="und">Unidad</option>
                             <option value="dia">Día</option>
                             <option value="gl">Global</option>
                          </select>
                       </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                       <div>
                          <label class="text-xs font-bold text-zinc-500 uppercase">Cantidad</label>
                          <input type="number" [(ngModel)]="extraQty" class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg">
                       </div>
                       <div>
                          <label class="text-xs font-bold text-zinc-500 uppercase">Precio Unit. ($)</label>
                          <input type="number" [(ngModel)]="extraPrice" class="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg">
                       </div>
                    </div>

                    <button (click)="addExtraToQuote()" [disabled]="!extraName()" class="w-full bg-zinc-800 hover:bg-zinc-900 disabled:bg-zinc-300 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                       Añadir Recurso
                    </button>
                 </div>
              </div>
           }
        </div>

        <!-- Right: The BOQ List (7 Cols) -->
        <div class="lg:col-span-7">
           <div class="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden flex flex-col h-full">
              <div class="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
                 <h3 class="font-bold text-zinc-800">Lista de Cuantificación (BOQ)</h3>
                 <button (click)="projectService.clearQuote()" class="text-xs text-rose-500 hover:text-rose-700 font-medium">Limpiar Todo</button>
              </div>
              
              <div class="flex-1 overflow-y-auto min-h-[400px]">
                 @if (items().length === 0) {
                    <div class="flex flex-col items-center justify-center h-full text-zinc-400 p-8">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                       </svg>
                       <p class="text-sm">No hay ítems en el presupuesto.</p>
                       <p class="text-xs mt-1">Utiliza el módulo de Patología o Mezclas para cargar automáticamente.</p>
                    </div>
                 } @else {
                    <table class="w-full text-left text-sm">
                       <thead class="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100">
                          <tr>
                             <th class="px-6 py-3">Concepto</th>
                             <th class="px-6 py-3 text-right">Cant.</th>
                             <th class="px-6 py-3 text-right">P. Unit</th>
                             <th class="px-6 py-3 text-right">Total</th>
                             <th class="px-4 py-3 w-10"></th>
                          </tr>
                       </thead>
                       <tbody class="divide-y divide-zinc-100">
                          @for (item of items(); track item.id) {
                             <tr class="hover:bg-zinc-50 group">
                                <td class="px-6 py-3">
                                   <div class="flex items-center gap-3">
                                      <span [class]="getTypeColor(item.type)" class="w-2 h-2 rounded-full shrink-0"></span>
                                      <div>
                                         <p class="font-bold text-zinc-700">{{ item.name }}</p>
                                         <p class="text-xs text-zinc-400">{{ item.phase || getTypeName(item.type) }}</p>
                                      </div>
                                   </div>
                                </td>
                                <td class="px-6 py-3 text-right font-mono text-zinc-600">
                                   {{ item.quantity }} <span class="text-xs text-zinc-400">{{ item.unit }}</span>
                                </td>
                                <td class="px-6 py-3 text-right font-mono text-zinc-600">
                                   <input type="number" [ngModel]="item.unitPrice" (ngModelChange)="updatePrice(item.id, $event)" class="w-20 text-right bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-cyan-500 outline-none transition-colors" placeholder="0">
                                </td>
                                <td class="px-6 py-3 text-right font-mono font-bold text-zinc-800">
                                   {{ (item.quantity * (item.unitPrice || 0)) | currency:'USD':'symbol':'1.0-0' }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                   <button (click)="projectService.removeQuoteItem(item.id)" class="text-zinc-300 hover:text-rose-500 transition-colors">
                                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                   </button>
                                </td>
                             </tr>
                          }
                       </tbody>
                    </table>
                 }
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Hidden Print Layout -->
    <div class="print-only print-page">
       <div class="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
          <div>
             <h1 class="text-3xl font-bold">Cotización Formal</h1>
             <p class="text-sm text-gray-600 mt-1">Generado por Cristaline Pro Manager</p>
          </div>
          <div class="text-right">
             <div class="text-2xl font-bold uppercase tracking-widest text-zinc-900">Cristaline</div>
             <p class="text-xs">Soluciones de Impermeabilización</p>
          </div>
       </div>

       <div class="grid grid-cols-2 gap-8 mb-8">
          <div>
             <p class="text-xs uppercase font-bold text-gray-500">Cliente</p>
             <p class="text-lg font-bold">{{ project()?.client || 'Cliente General' }}</p>
             <p>{{ project()?.name }}</p>
          </div>
          <div class="text-right">
             <p class="text-xs uppercase font-bold text-gray-500">Fecha</p>
             <p>{{ dateNow | date:'longDate' }}</p>
          </div>
       </div>

       <table class="w-full mb-8">
          <thead class="border-b border-black">
             <tr class="text-left text-xs uppercase">
                <th class="py-2">Descripción</th>
                <th class="py-2 text-right">Cant</th>
                <th class="py-2 text-right">Unid</th>
                <th class="py-2 text-right">P. Unit</th>
                <th class="py-2 text-right">Total</th>
             </tr>
          </thead>
          <tbody>
             @for (item of items(); track item.id) {
                <tr class="border-b border-gray-200">
                   <td class="py-3">
                      <p class="font-bold text-sm">{{ item.name }}</p>
                      <p class="text-xs text-gray-500">{{ item.phase }}</p>
                   </td>
                   <td class="py-3 text-right">{{ item.quantity }}</td>
                   <td class="py-3 text-right text-xs">{{ item.unit }}</td>
                   <td class="py-3 text-right">{{ item.unitPrice | currency }}</td>
                   <td class="py-3 text-right font-bold">{{ (item.quantity * (item.unitPrice || 0)) | currency }}</td>
                </tr>
             }
          </tbody>
          <tfoot>
             <tr>
                <td colspan="4" class="text-right py-4 font-bold uppercase text-sm">Total Estimado</td>
                <td class="text-right py-4 font-bold text-xl">{{ totalPrice() | currency }}</td>
             </tr>
          </tfoot>
       </table>

       <div class="mt-12 pt-4 border-t border-gray-200 text-xs text-center text-gray-500">
          <p>Esta cotización tiene una validez de 15 días. Precios sujetos a cambios sin previo aviso.</p>
          <p class="mt-1">Cristaline Technologies - Construyendo Futuro.</p>
       </div>
    </div>
  `
})
export class CalculatorComponent {
  project = input<Project | null>(null);
  projectService = inject(ProjectService);
  catalogService = inject(CatalogService);

  // Bind directly to Service State
  items = this.projectService.activeQuoteItems;
  totalPrice = computed(() => this.items().reduce((acc, i) => acc + (i.quantity * (i.unitPrice || 0)), 0));

  dateNow = new Date();

  // Tab State
  activeTab = signal<'products' | 'extras'>('products');
  
  // Product Calc State
  categories: {id: ApplicationMethod, label: string}[] = [
    { id: 'slurry', label: 'Slurry' },
    { id: 'plug', label: 'Plug' },
    { id: 'mortar', label: 'Mortero' },
    { id: 'admix', label: 'Admix' },
    { id: 'repellent', label: 'Silane' },
  ];
  selectedCategory = signal<ApplicationMethod>('slurry');
  currentProduct = signal<ProductSpec | undefined>(undefined);
  
  area = signal(0);
  linearMeters = signal(0);
  volume = signal(0);
  coats = signal(2);

  // Extra Calc State
  extraName = signal('');
  extraType = signal<'commodity' | 'equipment' | 'labor'>('commodity');
  extraUnit = signal('kg');
  extraQty = signal(0);
  extraPrice = signal(0);

  constructor() {
     this.setCategory('slurry');
     effect(() => {
        const ctx = this.projectService.calculationContext();
        if (ctx) {
           this.setCategory(ctx.category as ApplicationMethod);
        }
     });
  }

  printQuote() {
     window.print();
  }

  setCategory(cat: ApplicationMethod) {
    this.selectedCategory.set(cat);
    this.currentProduct.set(this.catalogService.getProductByCategory(cat));
  }

  calcResult = computed(() => {
     const prod = this.currentProduct();
     if (!prod) return 0;
     let q = 0;
     if (this.selectedCategory() === 'plug') q = this.linearMeters() * prod.defaultDosage;
     else if (this.selectedCategory() === 'admix') q = this.volume() * 300 * prod.defaultDosage; // Assume 300kg cement/m3
     else q = this.area() * this.coats() * prod.defaultDosage;
     return Math.ceil(q);
  });

  addProductToQuote() {
     const prod = this.currentProduct();
     if (!prod || this.calcResult() <= 0) return;
     
     this.projectService.addQuoteItem({
        id: Math.random().toString(36),
        name: prod.name,
        type: 'cristaline',
        quantity: this.calcResult(),
        unit: prod.category === 'repellent' ? 'L' : 'kg',
        phase: 'Impermeabilización'
     });
  }

  addExtraToQuote() {
     if (!this.extraName() || this.extraQty() <= 0) return;
     
     this.projectService.addQuoteItem({
        id: Math.random().toString(36),
        name: this.extraName(),
        type: this.extraType(),
        quantity: this.extraQty(),
        unit: this.extraUnit(),
        unitPrice: this.extraPrice(),
        phase: 'Adicionales'
     });

     // Reset
     this.extraName.set('');
     this.extraQty.set(0);
  }

  updatePrice(id: string, price: number) {
     this.items.update(list => list.map(i => i.id === id ? { ...i, unitPrice: price } : i));
  }

  getTypeColor(type: string) {
     switch(type) {
        case 'cristaline': return 'bg-cyan-500';
        case 'commodity': return 'bg-amber-500';
        case 'equipment': return 'bg-zinc-500';
        case 'labor': return 'bg-violet-500';
        default: return 'bg-zinc-300';
     }
  }

  getTypeName(type: string) {
     switch(type) {
        case 'cristaline': return 'Producto Cristaline';
        case 'commodity': return 'Material / Agregado';
        case 'equipment': return 'Maquinaria / Equipo';
        case 'labor': return 'Mano de Obra';
        default: return 'Otro';
     }
  }
}