import { Component, signal, computed, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, Project } from '../services/project.service';

@Component({
  selector: 'app-comparator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
         <div>
            <h2 class="text-2xl font-bold text-slate-800">Análisis Financiero Comparativo</h2>
            <p class="text-slate-500">Evaluación de costos directos e indirectos: Cristaline vs. Sistemas Tradicionales.</p>
         </div>
         @if (project()) {
            <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
               Proyecto: {{ project()?.name }}
            </span>
         }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Controls (Left) -->
        <div class="lg:col-span-4 space-y-6">
           <!-- Form -->
           <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div class="bg-slate-50 border-b border-slate-100 p-4">
                 <h3 class="font-bold text-slate-700">Parámetros de Costo</h3>
              </div>
              <div class="p-6 space-y-5">
                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Área del Proyecto (m²)</label>
                    <input type="number" [(ngModel)]="area" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                 </div>

                 <!-- System A (Cristaline) -->
                 <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 class="text-xs font-bold uppercase text-blue-700 mb-3 border-b border-blue-200 pb-1">Cristaline Pro</h4>
                    <div class="grid grid-cols-2 gap-3">
                       <div>
                          <label class="block text-[10px] text-slate-500 mb-1">$/kg</label>
                          <input type="number" [(ngModel)]="priceCristaline" class="w-full px-2 py-1.5 text-sm border border-blue-200 rounded">
                       </div>
                       <div>
                          <label class="block text-[10px] text-slate-500 mb-1">kg/m²</label>
                          <input type="number" [(ngModel)]="consumptionCristaline" class="w-full px-2 py-1.5 text-sm border border-blue-200 rounded">
                       </div>
                    </div>
                    <div class="mt-3">
                       <label class="block text-[10px] text-slate-500 mb-1">Mano de Obra Global ($)</label>
                       <input type="number" [(ngModel)]="laborCristaline" class="w-full px-2 py-1.5 text-sm border border-blue-200 rounded">
                    </div>
                 </div>

                 <!-- System B (Competitor) -->
                 <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 class="text-xs font-bold uppercase text-slate-600 mb-3 border-b border-slate-200 pb-1">Sistema Tradicional (Membrana)</h4>
                    <div class="grid grid-cols-2 gap-3">
                       <div>
                          <label class="block text-[10px] text-slate-500 mb-1">$/Unidad</label>
                          <input type="number" [(ngModel)]="priceCompetitor" class="w-full px-2 py-1.5 text-sm border border-slate-300 rounded">
                       </div>
                       <div>
                          <label class="block text-[10px] text-slate-500 mb-1">Consumo/m²</label>
                          <input type="number" [(ngModel)]="consumptionCompetitor" class="w-full px-2 py-1.5 text-sm border border-slate-300 rounded">
                       </div>
                    </div>
                    <div class="mt-3">
                       <label class="block text-[10px] text-slate-500 mb-1">Mano de Obra Global ($)</label>
                       <input type="number" [(ngModel)]="laborCompetitor" class="w-full px-2 py-1.5 text-sm border border-slate-300 rounded">
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Visualization (Right) -->
        <div class="lg:col-span-8 space-y-6">
           
           <!-- Main Visual Chart -->
           <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h3 class="font-bold text-xl text-slate-800 mb-8">Comparativa Visual de Costos</h3>
              
              <!-- Bar Chart: Cristaline -->
              <div class="mb-8">
                 <div class="flex justify-between text-sm font-medium mb-2">
                    <span class="text-blue-700 flex items-center gap-2">
                       <span class="w-3 h-3 bg-blue-600 rounded-full"></span> Cristaline Pro
                    </span>
                    <span class="font-bold text-slate-800">{{ formatCurrency(totalCristaline()) }}</span>
                 </div>
                 <div class="w-full h-8 bg-slate-100 rounded-full overflow-hidden flex relative">
                    <!-- Material Segment -->
                    <div class="h-full bg-blue-500 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] text-white/90" [style.width.%]="getPercent(costMaterialCristaline(), maxTotal())">
                       Mat
                    </div>
                    <!-- Labor Segment -->
                    <div class="h-full bg-blue-300 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] text-blue-900" [style.width.%]="getPercent(laborCristaline(), maxTotal())">
                       MO
                    </div>
                 </div>
                 <p class="text-xs text-slate-400 mt-1">Material: {{ formatCurrency(costMaterialCristaline()) }} | Mano Obra: {{ formatCurrency(laborCristaline()) }}</p>
              </div>

              <!-- Bar Chart: Competitor -->
              <div>
                 <div class="flex justify-between text-sm font-medium mb-2">
                    <span class="text-slate-600 flex items-center gap-2">
                       <span class="w-3 h-3 bg-slate-400 rounded-full"></span> Tradicional
                    </span>
                    <span class="font-bold text-slate-800">{{ formatCurrency(totalCompetitor()) }}</span>
                 </div>
                 <div class="w-full h-8 bg-slate-100 rounded-full overflow-hidden flex relative">
                    <!-- Material Segment -->
                    <div class="h-full bg-slate-500 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] text-white/90" [style.width.%]="getPercent(costMaterialCompetitor(), maxTotal())">
                       Mat
                    </div>
                    <!-- Labor Segment -->
                    <div class="h-full bg-slate-300 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] text-slate-800" [style.width.%]="getPercent(laborCompetitor(), maxTotal())">
                       MO
                    </div>
                 </div>
                 <p class="text-xs text-slate-400 mt-1">Material: {{ formatCurrency(costMaterialCompetitor()) }} | Mano Obra: {{ formatCurrency(laborCompetitor()) }}</p>
              </div>
           </div>

           <!-- Analysis Cards -->
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Savings / ROI -->
              @if (totalCristaline() < totalCompetitor()) {
                <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden">
                   <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-200 rounded-full opacity-30 blur-xl"></div>
                   <h4 class="text-emerald-800 font-bold text-lg mb-2">💰 Ahorro Proyectado</h4>
                   <div class="text-4xl font-extrabold text-emerald-600 mb-2">{{ formatCurrency(totalCompetitor() - totalCristaline()) }}</div>
                   <p class="text-emerald-700 text-sm">
                      Representa una reducción de costos del <span class="font-bold bg-emerald-200 px-1 rounded">{{ savingsPercent() }}%</span>.
                   </p>
                </div>
              } @else {
                 <div class="bg-blue-50 border border-blue-100 rounded-2xl p-6 relative">
                    <h4 class="text-blue-800 font-bold text-lg mb-2">💎 Valor a Largo Plazo</h4>
                    <p class="text-blue-700 text-sm">
                       Aunque la inversión inicial es mayor, la tecnología cristalina elimina costos de mantenimiento futuro (re-impermeabilización cada 5-7 años), ofreciendo un TCO (Total Cost of Ownership) menor.
                    </p>
                 </div>
              }

              <!-- Actions -->
              <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-center gap-3">
                 @if (project()) {
                    <button (click)="saveToProject()" class="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl transition-colors font-medium flex justify-center items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                       </svg>
                       Guardar Análisis
                    </button>
                    @if (saved()) {
                       <p class="text-center text-xs text-emerald-600 font-bold animate-pulse">Guardado en Historial</p>
                    }
                 } @else {
                    <p class="text-center text-slate-400 text-sm italic">Seleccione un proyecto para guardar este análisis.</p>
                 }
              </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class ComparatorComponent {
  project = input<Project | null>(null);
  projectService = inject(ProjectService);
  saved = signal(false);

  area = signal(100);
  
  // Cristaline Defaults
  priceCristaline = signal(15); 
  consumptionCristaline = signal(1.6);
  laborCristaline = signal(500);

  // Competitor Defaults
  priceCompetitor = signal(10);
  consumptionCompetitor = signal(2.5);
  laborCompetitor = signal(800);

  costMaterialCristaline = computed(() => this.area() * this.consumptionCristaline() * this.priceCristaline());
  costMaterialCompetitor = computed(() => this.area() * this.consumptionCompetitor() * this.priceCompetitor());

  totalCristaline = computed(() => this.costMaterialCristaline() + this.laborCristaline());
  totalCompetitor = computed(() => this.costMaterialCompetitor() + this.laborCompetitor());

  // Helper for Chart Scales
  maxTotal = computed(() => Math.max(this.totalCristaline(), this.totalCompetitor()) * 1.1); // 10% buffer

  savingsPercent = computed(() => {
    const diff = this.totalCompetitor() - this.totalCristaline();
    if (diff <= 0) return 0;
    return Math.round((diff / this.totalCompetitor()) * 100);
  });

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  getPercent(value: number, total: number): number {
     if (total === 0) return 0;
     return (value / total) * 100;
  }

  saveToProject() {
    const p = this.project();
    if (!p) return;

    this.projectService.addToHistory(p.id, {
      type: 'comparison',
      title: 'Comparativa Financiera',
      details: `Inversión: ${this.formatCurrency(this.totalCristaline())}. ${this.totalCristaline() < this.totalCompetitor() ? 'Ahorro: ' + this.savingsPercent() + '%' : 'Premium'}`,
      data: { 
         totalCristaline: this.totalCristaline(),
         totalCompetitor: this.totalCompetitor()
      }
    });
    
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}