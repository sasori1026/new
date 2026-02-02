import { Component, inject, computed, output } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in-up">
      <!-- Workflow Launchpad (Sequential Logic) -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
         <h3 class="font-bold text-zinc-800 mb-4 flex items-center gap-2">
           <span class="w-1 h-6 bg-cyan-600 rounded"></span>
           Iniciar Flujo de Trabajo
         </h3>
         <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Step 1: Diagnosis -->
            <button (click)="onNavigate.emit('pathology')" class="p-4 rounded-xl border border-zinc-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md transition-all text-left group">
               <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-zinc-400 group-hover:text-purple-600">PASO 1</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-300 group-hover:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
               </div>
               <p class="font-bold text-zinc-700 group-hover:text-purple-900">Diagnóstico</p>
               <p class="text-xs text-zinc-500 mt-1">Identificar patologías con IA</p>
            </button>

            <!-- Step 2: Prep -->
            <button (click)="onNavigate.emit('surface-prep')" class="p-4 rounded-xl border border-zinc-200 hover:border-amber-400 hover:bg-amber-50 hover:shadow-md transition-all text-left group">
               <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-zinc-400 group-hover:text-amber-600">PASO 2</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-300 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
               </div>
               <p class="font-bold text-zinc-700 group-hover:text-amber-900">Estrategia</p>
               <p class="text-xs text-zinc-500 mt-1">Preparación de Superficie</p>
            </button>

            <!-- Step 3: Calc -->
            <button (click)="onNavigate.emit('calculator')" class="p-4 rounded-xl border border-zinc-200 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md transition-all text-left group">
               <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-zinc-400 group-hover:text-cyan-600">PASO 3</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-300 group-hover:text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
               </div>
               <p class="font-bold text-zinc-700 group-hover:text-cyan-900">Cuantificación</p>
               <p class="text-xs text-zinc-500 mt-1">Cálculo de materiales</p>
            </button>
            
             <!-- Step 4: ROI -->
            <button (click)="onNavigate.emit('comparator')" class="p-4 rounded-xl border border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md transition-all text-left group">
               <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-zinc-400 group-hover:text-emerald-600">PASO 4</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-300 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <p class="font-bold text-zinc-700 group-hover:text-emerald-900">Análisis</p>
               <p class="text-xs text-zinc-500 mt-1">Comparativa de Costos</p>
            </button>
         </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Card 1 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center space-x-4 relative overflow-hidden group">
          <div class="absolute right-0 top-0 w-24 h-24 bg-cyan-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div class="relative z-10 p-3 bg-cyan-100 text-cyan-600 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="relative z-10">
            <p class="text-xs text-zinc-500 font-bold uppercase tracking-wide">Activos</p>
            <p class="text-2xl font-bold text-zinc-800">{{ projectService.activeProjects() }}</p>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center space-x-4 relative overflow-hidden group">
           <div class="absolute right-0 top-0 w-24 h-24 bg-violet-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div class="relative z-10 p-3 bg-violet-100 text-violet-600 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div class="relative z-10">
            <p class="text-xs text-zinc-500 font-bold uppercase tracking-wide">Material Total</p>
            <p class="text-2xl font-bold text-zinc-800">{{ projectService.totalMaterialNeeded() }} <span class="text-sm font-normal text-zinc-400">kg</span></p>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center space-x-4 relative overflow-hidden group">
           <div class="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div class="relative z-10 p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="relative z-10">
            <p class="text-xs text-zinc-500 font-bold uppercase tracking-wide">Completados</p>
            <p class="text-2xl font-bold text-zinc-800">{{ completedCount() }}</p>
          </div>
        </div>

        <!-- Card 4 (Alerts) -->
        <div class="bg-gradient-to-br from-zinc-800 to-zinc-900 text-white p-6 rounded-2xl shadow-lg flex items-center space-x-4 relative overflow-hidden">
           <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white opacity-5 rounded-full"></div>
           <div class="relative z-10 p-3 bg-white/10 rounded-xl">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
             </svg>
           </div>
           <div class="relative z-10">
             <p class="text-xs text-zinc-400 font-bold uppercase tracking-wide">Mantenimiento</p>
             <p class="text-xl font-bold">{{ maintenanceDueCount() }} <span class="text-sm font-normal opacity-70">Pendientes</span></p>
           </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Activity List -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
          <div class="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h3 class="font-bold text-zinc-800">Proyectos Recientes</h3>
            <span class="text-xs text-zinc-500 font-medium px-2 py-1 bg-white rounded border border-zinc-200">Últimos 5</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-zinc-600">
              <thead class="bg-zinc-50 text-xs uppercase font-bold text-zinc-400">
                <tr>
                  <th class="px-6 py-4">Proyecto</th>
                  <th class="px-6 py-4">Cliente</th>
                  <th class="px-6 py-4">Estado</th>
                  <th class="px-6 py-4 text-right">Material</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                @for (project of projectService.projects().slice(0, 5); track project.id) {
                  <tr class="hover:bg-zinc-50 transition-colors group">
                    <td class="px-6 py-4 font-medium text-zinc-800 group-hover:text-cyan-600 transition-colors">{{ project.name }}</td>
                    <td class="px-6 py-4">{{ project.client }}</td>
                    <td class="px-6 py-4">
                      @if (project.status === 'Completado') {
                        <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-200">Completado</span>
                      } @else if (project.status === 'En Proceso') {
                        <span class="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 text-[10px] font-bold uppercase tracking-wide border border-cyan-200">En Proceso</span>
                      } @else {
                        <span class="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wide border border-zinc-200">Pendiente</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-right font-mono text-zinc-700">{{ project.materialRequired }} kg</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Smart Alerts -->
        <div class="space-y-6">
           <!-- Maintenance List -->
           <div class="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
              <h3 class="font-bold text-zinc-800 mb-4 flex items-center gap-2">
                 <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                 Próximos Mantenimientos
              </h3>
              <div class="space-y-3">
                 @for (proj of upcomingMaintenance(); track proj.id) {
                    <div class="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                       <div class="truncate mr-2">
                          <p class="text-sm font-medium text-zinc-700 truncate">{{ proj.name }}</p>
                          <p class="text-xs text-zinc-500">{{ proj.nextMaintenance }}</p>
                       </div>
                       <button class="text-xs bg-white border border-zinc-200 px-2 py-1 rounded text-zinc-600 hover:text-cyan-600 hover:border-cyan-300 transition-colors">
                          Ver
                       </button>
                    </div>
                 }
                 @if (upcomingMaintenance().length === 0) {
                    <p class="text-sm text-zinc-400 italic text-center py-2">No hay inspecciones pendientes.</p>
                 }
              </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  projectService = inject(ProjectService);
  onNavigate = output<string>();

  completedCount = computed(() => this.projectService.projects().filter(p => p.status === 'Completado').length);
  
  upcomingMaintenance = computed(() => {
     return this.projectService.projects()
       .filter(p => p.nextMaintenance)
       .sort((a, b) => new Date(a.nextMaintenance!).getTime() - new Date(b.nextMaintenance!).getTime())
       .slice(0, 3);
  });

  maintenanceDueCount = computed(() => this.upcomingMaintenance().length);
}