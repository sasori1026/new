import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { CatalogService, ProductSpec } from '../services/catalog.service';
import { ProjectService } from '../services/project.service';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-mix-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- Mode Toggle -->
      <div class="flex justify-center mb-8">
        <div class="bg-slate-200 p-1 rounded-xl inline-flex relative shadow-inner">
           <button (click)="mode.set('tecnica'); resetEmergency()" class="relative z-10 px-6 py-2 text-sm font-medium transition-colors rounded-lg" [class]="mode() === 'tecnica' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'">Mezcla Técnica</button>
           <button (click)="mode.set('emergencia')" class="relative z-10 px-6 py-2 text-sm font-medium transition-colors rounded-lg" [class]="mode() === 'emergencia' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'">Diseño de Emergencia</button>
        </div>
      </div>

      @if (mode() === 'tecnica') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
           
           <!-- Input Card -->
           <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <h3 class="font-bold text-slate-700">1. Parámetros de Diseño</h3>
              
              <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase">Volumen a Rellenar</label>
                 <div class="flex items-center mt-1">
                    <input type="number" [(ngModel)]="volumeLiters" class="w-full px-3 py-2 border border-slate-300 rounded-l-lg" placeholder="0">
                    <span class="px-3 py-2 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-slate-500 text-sm">Litros (dm³)</span>
                 </div>
              </div>

              <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase">Tipo de Mezcla</label>
                 <select [(ngModel)]="mixType" class="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    <option value="cristaline">Mortero Reparación Cristaline</option>
                    <option value="base-cemento">Mortero Base Cemento-Arena</option>
                 </select>
              </div>

              @if (mixType() === 'base-cemento') {
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in-up">
                   <label class="block text-xs font-bold text-slate-500 uppercase">Proporción (Cemento:Arena)</label>
                   <select [(ngModel)]="ratio" class="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg bg-white">
                      <option value="1:3">1:3 (Alta Resistencia)</option>
                      <option value="1:4">1:4 (Uso General)</option>
                   </select>
                </div>
              }

              <div>
                <h4 class="block text-xs font-bold text-slate-500 uppercase mb-2">2. Aditivos Opcionales</h4>
                <div class="space-y-2">
                  <label class="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer" [class]="addFiber() ? 'bg-slate-100 border-indigo-300' : 'border-slate-200'">
                    <input type="checkbox" [(ngModel)]="addFiber" class="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 shrink-0">
                    <div class="flex-1">
                      <span class="text-sm font-medium text-slate-700">Fibra de Polipropileno</span>
                      <p class="text-xs text-slate-500 leading-tight mt-0.5">Reduce las micro-fisuras por contracción plástica en el mortero fresco.</p>
                    </div>
                  </label>
                   <label class="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer" [class]="addAdhesive() ? 'bg-slate-100 border-indigo-300' : 'border-slate-200'">
                    <input type="checkbox" [(ngModel)]="addAdhesive" class="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 shrink-0">
                    <div class="flex-1">
                      <span class="text-sm font-medium text-slate-700">Adhesivo Acrílico (Látex)</span>
                      <p class="text-xs text-slate-500 leading-tight mt-0.5">Mejora la adherencia del mortero a sustratos viejos o lisos.</p>
                    </div>
                  </label>
                </div>
              </div>
           </div>

           <!-- Output Card -->
           <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
               <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
               <h3 class="font-bold text-indigo-900 mb-4 relative z-10">Dosificación Calculada</h3>
               
               <div class="space-y-2 relative z-10">
                  @if (mixType() === 'cristaline') {
                    <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                       <span class="text-sm font-medium text-slate-600">{{ cristalineMortarProduct()?.name }}</span>
                       <span class="font-bold text-slate-800">{{ calcCristalineMortarKg() | number:'1.0-1' }} kg</span>
                    </div>
                    <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                       <span class="text-sm font-medium text-slate-600">Agua Aprox.</span>
                       <span class="font-bold text-slate-800">{{ calcCristalineWater() | number:'1.0-1' }} L</span>
                    </div>
                  } @else {
                     <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                        <span class="text-sm font-medium text-slate-600">Cemento Gris</span>
                        <span class="font-bold text-slate-800">{{ calcCement() | number:'1.0-1' }} kg</span>
                     </div>
                     <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                        <span class="text-sm font-medium text-slate-600">Arena Lavada</span>
                        <span class="font-bold text-slate-800">{{ calcSand() | number:'1.0-1' }} kg</span>
                     </div>
                     <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                        <span class="text-sm font-medium text-slate-600">Agua Aprox.</span>
                        <span class="font-bold text-slate-800">{{ calcWater() | number:'1.0-1' }} L</span>
                     </div>
                  }

                  @if (addFiber()) {
                     <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg border-t-2 border-dashed border-indigo-200">
                        <span class="text-sm font-medium text-indigo-600">Fibra PP</span>
                        <span class="font-bold text-indigo-800">{{ calcFiberGr() | number:'1.0-0' }} gr</span>
                     </div>
                  }
                  @if (addAdhesive()) {
                      <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg border-t-2 border-dashed border-indigo-200">
                        <span class="text-sm font-medium text-indigo-600">Adhesivo Acrílico</span>
                        <span class="font-bold text-indigo-800">{{ calcAdhesiveL() | number:'1.0-2' }} L</span>
                     </div>
                  }
               </div>

               <button (click)="addToBoq()" class="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold text-sm shadow-sm transition-colors relative z-10">
                  Enviar a Presupuesto
               </button>
               @if (added()) {
                  <p class="text-center text-xs text-emerald-600 font-bold mt-2 animate-pulse">¡Agregado al Presupuesto!</p>
               }
           </div>
        </div>
      } @else { <!-- Emergency Mode -->
         <div class="animate-fade-in-up">
            
            <!-- Stage 1: Generate Additive -->
            @if (emergencyStage() === 'additive') {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <!-- Inputs -->
                 <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <h3 class="font-bold text-red-800">Paso 1: Formular Aditivo de Emergencia</h3>
                    <div>
                       <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Materiales Disponibles en Obra</label>
                       <textarea [(ngModel)]="availableMaterials" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"></textarea>
                       <p class="text-xs text-slate-400 mt-1">Ej: Cemento, arena, ceniza, sílice, cal...</p>
                    </div>
                    <div>
                       <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Contexto / Problema a Resolver</label>
                       <textarea [(ngModel)]="problemContext" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"></textarea>
                    </div>
                    <button (click)="generateEmergencyAdditive()" [disabled]="emergencyLoading()" class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300">
                      @if (emergencyLoading()) {
                         <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         <span>Consultando al Químico IA...</span>
                      } @else {
                         <span>Generar Fórmula de Aditivo</span>
                      }
                    </button>
                 </div>
                 
                 <!-- Result -->
                 <div class="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm flex flex-col">
                    @if (emergencyLoading()) {
                       <div class="m-auto text-center text-slate-500">
                          <svg class="animate-spin h-8 w-8 mx-auto mb-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          <p>Formulando...</p>
                       </div>
                    } @else if (emergencyAdditiveRecipe()) {
                       <h3 class="font-bold text-red-900 mb-4">Fórmula Generada por IA</h3>
                       <div class="prose prose-sm max-w-none prose-slate prose-strong:text-red-900 overflow-y-auto flex-1">
                          <markdown [data]="emergencyAdditiveRecipe()"></markdown>
                       </div>
                       <button (click)="useEmergencyAdditive()" class="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-md shadow-red-200 transition-all">
                          Paso 2: Preparar Mezcla con este Aditivo →
                       </button>
                    } @else {
                       <div class="m-auto text-center text-red-400 p-8">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                         </svg>
                         <p class="text-sm">La fórmula del aditivo aparecerá aquí.</p>
                       </div>
                    }
                 </div>
              </div>
            }
            
            <!-- Stage 2: Create Mix -->
            @if (emergencyStage() === 'mix') {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Mix Inputs -->
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                   <h3 class="font-bold text-red-800">Paso 2: Dosificar Mortero de Emergencia</h3>
                   <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase">Volumen de Mortero a Preparar</label>
                      <div class="flex items-center mt-1">
                         <input type="number" [(ngModel)]="emergencyVolumeLiters" class="w-full px-3 py-2 border border-slate-300 rounded-l-lg">
                         <span class="px-3 py-2 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-slate-500 text-sm">Litros</span>
                      </div>
                   </div>
                   <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p class="text-xs font-bold text-red-700 uppercase">Aditivo Activo</p>
                      <p class="text-sm text-red-900 truncate">Fórmula de Emergencia generada por IA.</p>
                      <button (click)="resetEmergency()" class="text-xs text-slate-500 hover:underline mt-2">← Volver a formular</button>
                   </div>
                </div>
                
                <!-- Mix Results -->
                <div class="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                   <h3 class="font-bold text-red-900 mb-4">Dosificación del Mortero</h3>
                   <div class="space-y-2">
                      <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                         <span class="text-sm font-medium text-slate-600">Cemento Gris</span>
                         <span class="font-bold text-slate-800">{{ emergencyCement() | number:'1.0-1' }} kg</span>
                      </div>
                      <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                         <span class="text-sm font-medium text-slate-600">Arena Lavada (1:3)</span>
                         <span class="font-bold text-slate-800">{{ emergencySand() | number:'1.0-1' }} kg</span>
                      </div>
                      <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                         <span class="text-sm font-medium text-red-700">Aditivo de Emergencia</span>
                         <span class="font-bold text-red-800">{{ emergencyAdditiveKg() | number:'1.0-2' }} kg</span>
                      </div>
                       <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                         <span class="text-sm font-medium text-slate-600">Agua Aprox. (A/C ~0.45)</span>
                         <span class="font-bold text-slate-800">{{ emergencyWater() | number:'1.0-1' }} L</span>
                      </div>
                   </div>
                   <button (click)="addEmergencyMixToBoq()" class="w-full mt-6 bg-slate-800 hover:bg-black text-white py-2 rounded-lg font-bold text-sm shadow-sm transition-colors">
                      Enviar Mezcla a Presupuesto
                   </button>
                   @if (addedEmergency()) {
                      <p class="text-center text-xs text-emerald-600 font-bold mt-2 animate-pulse">¡Agregado al Presupuesto!</p>
                   }
                </div>
              </div>
            }
         </div>
      }
    </div>
  `
})
export class MixGeneratorComponent {
  geminiService = inject(GeminiService);
  projectService = inject(ProjectService);
  catalogService = inject(CatalogService);

  // --- UI State ---
  mode = signal<'tecnica' | 'emergencia'>('tecnica');
  added = signal(false);
  addedEmergency = signal(false);

  // --- Technical Mix State ---
  mixType = signal<'cristaline' | 'base-cemento'>('cristaline');
  volumeLiters = signal(10);
  ratio = signal('1:3'); // For base-cemento
  addFiber = signal(false);
  addAdhesive = signal(false);

  // --- Emergency Mix State ---
  emergencyStage = signal<'additive' | 'mix'>('additive');
  availableMaterials = signal('Cemento gris, arena lavada, sílice en polvo, ceniza volante (fly ash)');
  problemContext = signal('Sellar una junta fría con filtración menor en un muro de contención de 25 MPa.');
  emergencyAdditiveRecipe = signal<string | null>(null);
  emergencyLoading = signal(false);
  emergencyVolumeLiters = signal(10);

  // --- Calculations for Cristaline Mix ---
  cristalineMortarProduct = computed(() => this.catalogService.getProductByCategory('mortar'));
  calcCristalineMortarKg = computed(() => this.volumeLiters() * (this.cristalineMortarProduct()?.defaultDosage || 2.1));
  calcCristalineWater = computed(() => this.calcCristalineMortarKg() * (this.cristalineMortarProduct()?.waterRatio || 0.18));

  // --- Calculations for Cement-Sand Mix ---
  calcCement = computed(() => {
     const vol = this.volumeLiters();
     if (this.ratio() === '1:3') return vol * 0.55; 
     if (this.ratio() === '1:4') return vol * 0.45;
     return vol * 0.38;
  });
  calcSand = computed(() => {
     const cement = this.calcCement();
     const r = parseInt(this.ratio().split(':')[1]);
     return cement * r;
  });
  calcWater = computed(() => this.calcCement() * 0.5); // 0.5 w/c ratio

  // --- Calculations for Additives ---
  calcFiberGr = computed(() => this.volumeLiters() * 0.6); // Standard dosage: ~600g/m³ -> 0.6g/L
  calcAdhesiveL = computed(() => {
    const totalPowderKg = this.mixType() === 'cristaline' 
        ? this.calcCristalineMortarKg() 
        : this.calcCement();
    return (totalPowderKg / 50) * 1; // Common dosage: 1L per 50kg bag
  });

  // --- Calculations for Emergency Mix ---
  emergencyCement = computed(() => this.emergencyVolumeLiters() * 0.55); // Based on 1:3 ratio
  emergencySand = computed(() => this.emergencyCement() * 3);
  emergencyWater = computed(() => this.emergencyCement() * 0.45); // A bit drier for repair
  emergencyAdditiveKg = computed(() => this.emergencyCement() * 0.02); // Assume 2% dosage unless AI says otherwise.

  // --- Actions ---
  addToBoq() {
    if (this.mixType() === 'cristaline') {
        this.projectService.addQuoteItem({
            id: Math.random().toString(36),
            name: this.cristalineMortarProduct()?.name || 'Cristaline Repair Mortar',
            type: 'cristaline',
            quantity: parseFloat(this.calcCristalineMortarKg().toFixed(1)),
            unit: 'kg',
            phase: 'Mezcla Técnica'
        });
    } else { // 'base-cemento'
        this.projectService.addQuoteItem({
            id: Math.random().toString(36),
            name: 'Cemento Gris (Mortero)',
            type: 'commodity',
            quantity: parseFloat(this.calcCement().toFixed(1)),
            unit: 'kg',
            phase: 'Mezcla en Sitio'
        });
        this.projectService.addQuoteItem({
            id: Math.random().toString(36),
            name: 'Arena (Mortero)',
            type: 'commodity',
            quantity: parseFloat(this.calcSand().toFixed(1)),
            unit: 'kg',
            phase: 'Mezcla en Sitio'
        });
    }

    if (this.addFiber()) {
        this.projectService.addQuoteItem({
            id: Math.random().toString(36),
            name: 'Fibra de Polipropileno',
            type: 'commodity',
            quantity: parseFloat(this.calcFiberGr().toFixed(0)),
            unit: 'gr',
            phase: 'Aditivo'
        });
    }

    if (this.addAdhesive()) {
        this.projectService.addQuoteItem({
            id: Math.random().toString(36),
            name: 'Adhesivo Acrílico (Látex)',
            type: 'commodity',
            quantity: parseFloat(this.calcAdhesiveL().toFixed(2)),
            unit: 'L',
            phase: 'Aditivo'
        });
    }

    this.added.set(true);
    setTimeout(() => this.added.set(false), 2500);
  }

  async generateEmergencyAdditive() {
    this.emergencyLoading.set(true);
    this.emergencyAdditiveRecipe.set(null);
    const recipe = await this.geminiService.generateEmergencyAdditive(this.availableMaterials(), this.problemContext());
    this.emergencyAdditiveRecipe.set(recipe);
    this.emergencyLoading.set(false);
  }

  useEmergencyAdditive() {
    if (this.emergencyAdditiveRecipe()) {
      this.emergencyStage.set('mix');
    }
  }

  resetEmergency() {
    this.emergencyStage.set('additive');
    this.emergencyAdditiveRecipe.set(null);
  }

  addEmergencyMixToBoq() {
    this.projectService.addQuoteItem({
        id: Math.random().toString(36), name: 'Cemento Gris (Mortero Emergencia)', type: 'commodity',
        quantity: parseFloat(this.emergencyCement().toFixed(1)), unit: 'kg', phase: 'Mezcla de Emergencia'
    });
    this.projectService.addQuoteItem({
        id: Math.random().toString(36), name: 'Arena (Mortero Emergencia)', type: 'commodity',
        quantity: parseFloat(this.emergencySand().toFixed(1)), unit: 'kg', phase: 'Mezcla de Emergencia'
    });
    this.projectService.addQuoteItem({
        id: Math.random().toString(36), name: 'Aditivo de Emergencia (Sitio)', type: 'commodity',
        quantity: parseFloat(this.emergencyAdditiveKg().toFixed(2)), unit: 'kg', phase: 'Mezcla de Emergencia'
    });

    this.addedEmergency.set(true);
    setTimeout(() => this.addedEmergency.set(false), 2500);
  }
}
