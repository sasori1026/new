import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService, ProjectLog } from '../services/project.service';
import { CalculatorComponent } from './calculator.component';
import { PathologyComponent } from './pathology.component';
import { ComparatorComponent } from './comparator.component';
import { SurfacePrepComponent } from './surface-prep.component';
import { MixGeneratorComponent } from './mix-generator.component';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, CalculatorComponent, PathologyComponent, ComparatorComponent, SurfacePrepComponent, MixGeneratorComponent, MarkdownModule],
  template: `
    @if (project()) {
      <div class="space-y-6 relative">
        <!-- Project Header -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
           <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                 <div class="flex items-center gap-3">
                    <h2 class="text-2xl font-bold text-slate-800">{{ project()?.name }}</h2>
                    <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">{{ project()?.status }}</span>
                 </div>
                 <p class="text-slate-500">{{ project()?.client }} | {{ project()?.type }} | {{ project()?.area }} m²</p>
              </div>
              <div class="flex gap-2">
                 <!-- Stats Summary -->
                 <div class="text-right">
                    <p class="text-xs text-slate-400 uppercase font-semibold">Material Requerido</p>
                    <p class="font-bold text-slate-800">{{ project()?.materialRequired }} kg</p>
                 </div>
                 <div class="w-px bg-slate-200 mx-2"></div>
                 <div class="text-right">
                    <p class="text-xs text-slate-400 uppercase font-semibold">Material Usado</p>
                    <p class="font-bold text-slate-800">{{ project()?.materialUsed }} kg</p>
                 </div>
              </div>
           </div>
        </div>

        <!-- Sequential Tabs Navigation -->
        <div class="flex overflow-x-auto space-x-1 border-b border-slate-200 pb-1">
           <button 
             (click)="activeTab.set('overview')" 
             [class]="activeTab() === 'overview' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'"
             class="px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
             </svg>
             Resumen
           </button>
           
           <!-- Step 1 -->
           <button 
             (click)="activeTab.set('pathology')" 
             [class]="activeTab() === 'pathology' ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-transparent text-slate-500 hover:text-purple-600'"
             class="px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 rounded-t-lg">
             <span class="text-xs font-bold opacity-50">1.</span>
             Patologías
           </button>

           <!-- Step 2 -->
           <button 
             (click)="activeTab.set('prep')" 
             [class]="activeTab() === 'prep' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' : 'border-transparent text-slate-500 hover:text-yellow-600'"
             class="px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 rounded-t-lg">
             <span class="text-xs font-bold opacity-50">2.</span>
             Preparación
           </button>

            <!-- Step 3 -->
            <button 
             (click)="activeTab.set('mixes')" 
             [class]="activeTab() === 'mixes' ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-transparent text-slate-500 hover:text-indigo-600'"
             class="px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 rounded-t-lg">
             <span class="text-xs font-bold opacity-50">3.</span>
             Mezclas
           </button>

           <!-- Step 4 -->
           <button 
             (click)="activeTab.set('calculator')" 
             [class]="activeTab() === 'calculator' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:text-blue-600'"
             class="px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 rounded-t-lg">
             <span class="text-xs font-bold opacity-50">4.</span>
             Calculadora
           </button>
           
           <!-- Step 5 -->
           <button 
             (click)="activeTab.set('comparator')" 
             [class]="activeTab() === 'comparator' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-slate-500 hover:text-emerald-600'"
             class="px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 rounded-t-lg">
             <span class="text-xs font-bold opacity-50">5.</span>
             Finanzas
           </button>
        </div>

        <!-- Content Area -->
        <div class="bg-slate-50 min-h-[500px]">
           @if (activeTab() === 'overview') {
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <!-- Activity Log -->
                 <div class="lg:col-span-2 space-y-4">
                    <h3 class="font-bold text-slate-700">Historial de Actividad</h3>
                    
                    @if (project()?.history?.length === 0) {
                       <div class="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                          <p>No hay registros de actividad aún.</p>
                          <p class="text-sm mt-1">Sigue el flujo: 1. Diagnóstico -> 2. Preparación -> 3. Cálculo</p>
                       </div>
                    }

                    @for (log of project()?.history; track $index) {
                       <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4 transition-all hover:shadow-md">
                          <div class="mt-1 shrink-0">
                             @if (log.type === 'calculation') {
                                <div class="bg-blue-100 p-2 rounded-lg text-blue-600">
                                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                   </svg>
                                </div>
                             } @else if (log.type === 'pathology') {
                                <div class="bg-purple-100 p-2 rounded-lg text-purple-600">
                                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                   </svg>
                                </div>
                             } @else if (log.type === 'comparison') {
                                <div class="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                   </svg>
                                </div>
                             }
                          </div>
                          <div class="flex-1 min-w-0">
                             <div class="flex justify-between items-start">
                                <h4 class="font-bold text-slate-800 text-sm">{{ log.title }}</h4>
                                <span class="text-xs text-slate-400 whitespace-nowrap ml-2">{{ log.date | date:'short' }}</span>
                             </div>
                             <p class="text-sm text-slate-600 mt-1 whitespace-pre-line">{{ log.details }}</p>
                             
                             <!-- Render attached image preview -->
                             @if (log.data?.image) {
                                <div class="mt-3">
                                   <p class="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Evidencia:</p>
                                   <div class="relative group w-fit">
                                      <img [src]="log.data.image" class="h-20 w-auto rounded-lg border border-slate-200 shadow-sm object-cover" alt="Evidencia">
                                   </div>
                                </div>
                             }
                             
                             <!-- View Full Report Button (If rich data exists) -->
                             @if (hasRichData(log)) {
                                <button (click)="viewFullLog(log)" class="mt-3 text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1 shadow-sm">
                                   <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                   </svg>
                                   Ver Reporte Completo
                                </button>
                             }

                             <!-- Render structured tags if exists (e.g. Severity) -->
                             @if (log.data?.structuredData?.severity) {
                                <div class="mt-2 flex gap-2">
                                   <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                      {{ log.data.structuredData.severity }}
                                   </span>
                                </div>
                             }
                          </div>
                       </div>
                    }
                 </div>

                 <!-- Quick Info -->
                 <div class="space-y-6">
                    <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                       <h3 class="font-bold text-slate-700 mb-4">Notas del Proyecto</h3>
                       <p class="text-sm text-slate-600 italic whitespace-pre-line">{{ project()?.notes }}</p>
                    </div>

                    @if (project()?.nextMaintenance) {
                      <div class="bg-amber-50 p-6 rounded-xl border border-amber-100">
                         <h3 class="font-bold text-amber-800 mb-2">Próximo Mantenimiento</h3>
                         <div class="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span class="font-bold text-amber-900">{{ project()?.nextMaintenance }}</span>
                         </div>
                      </div>
                    }
                 </div>
              </div>
           }
           
           @if (activeTab() === 'calculator') {
              <app-calculator [project]="project()"></app-calculator>
           }
           @if (activeTab() === 'pathology') {
              <app-pathology [project]="project()"></app-pathology>
           }
           @if (activeTab() === 'comparator') {
              <app-comparator [project]="project()"></app-comparator>
           }
           @if (activeTab() === 'prep') {
              <app-surface-prep [project]="project()"></app-surface-prep>
           }
           @if (activeTab() === 'mixes') {
              <app-mix-generator></app-mix-generator>
           }
        </div>
      </div>
      
      <!-- Full Details Modal -->
      @if (selectedLog()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" (click)="closeLogDetails()">
          <div class="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-fade-in-up" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 class="font-bold text-slate-800 text-lg">{{ selectedLog()?.title }}</h3>
                <p class="text-xs text-slate-500">{{ selectedLog()?.date | date:'medium' }}</p>
              </div>
              <button (click)="closeLogDetails()" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Body -->
            <div class="p-6 overflow-y-auto">
               <!-- Evidence Image if available -->
               @if (selectedLog()?.data?.image) {
                 <div class="mb-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex justify-center">
                    <img [src]="selectedLog()?.data?.image" class="max-h-64 object-contain" alt="Evidencia Full">
                 </div>
               }

               <!-- Structured Info Tags -->
               @if (selectedLog()?.data?.structuredData) {
                  <div class="flex flex-wrap gap-2 mb-6">
                     <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">
                        Severidad: {{ selectedLog()?.data?.structuredData?.severity }}
                     </span>
                     @if (selectedLog()?.data?.structuredData?.recommended_product_id) {
                        <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                           Producto: {{ selectedLog()?.data?.structuredData?.recommended_product_id }}
                        </span>
                     }
                  </div>
               }

               <!-- Full Text Content -->
               <div class="prose prose-slate prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-900 bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <markdown [data]="getLogContent(selectedLog())"></markdown>
               </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
               <button (click)="closeLogDetails()" class="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition-colors">
                  Cerrar Reporte
               </button>
            </div>
          </div>
        </div>
      }
    } @else {
       <div class="text-center py-20 text-slate-400">
          <p>No hay proyecto seleccionado.</p>
       </div>
    }
  `
})
export class ProjectDetailComponent {
  projectService = inject(ProjectService);
  project = this.projectService.currentProject;
  activeTab = signal<'overview' | 'calculator' | 'pathology' | 'comparator' | 'prep' | 'mixes'>('overview');
  
  // State for the modal
  selectedLog = signal<ProjectLog | null>(null);

  hasRichData(log: ProjectLog): boolean {
    return !!(log.data?.result || log.data?.protocolText || log.data?.emergResult);
  }

  viewFullLog(log: ProjectLog) {
    this.selectedLog.set(log);
  }

  closeLogDetails() {
    this.selectedLog.set(null);
  }

  getLogContent(log: ProjectLog | null): string {
    if (!log || !log.data) return '';
    // Priority check for content fields
    return log.data.result || log.data.protocolText || log.data.emergResult || log.details;
  }
}