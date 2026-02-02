import { Component, inject, signal, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { ProjectService, Project } from '../services/project.service';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-surface-prep',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      
      <!-- Header -->
      <div class="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
         <div class="absolute right-0 top-0 w-64 h-64 bg-yellow-500 opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div class="relative z-10 flex justify-between items-start">
            <div>
               <h2 class="text-3xl font-bold mb-2 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Preparación de Superficies
               </h2>
               <p class="text-slate-300 max-w-2xl">
                  El 80% del éxito de la cristalización depende de abrir el poro capilar y sanear la geometría.
               </p>
            </div>
            @if (project()) {
               <span class="px-3 py-1 bg-white/20 border border-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                  Proyecto: {{ project()?.name }}
               </span>
            }
         </div>
      </div>

      <!-- Context Banner -->
      @if (contextBanner()) {
        <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
           <div class="text-indigo-600 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <div>
              <h4 class="font-bold text-indigo-900 text-sm">Configuración basada en Diagnóstico Patológico</h4>
              <p class="text-xs text-indigo-700 mt-1">Hemos pre-seleccionado los valores basándonos en su análisis anterior.</p>
           </div>
           <button (click)="contextBanner.set(null)" class="ml-auto text-indigo-400 hover:text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
           </button>
        </div>
      }

      <!-- Selectors Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         <!-- 1. Scenario -->
         <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">
               <span class="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
               Ubicación
            </h3>
            <div class="space-y-2">
               @for (opt of scenarios; track opt.id) {
                  <button 
                     (click)="scenario.set(opt.id)"
                     [class]="scenario() === opt.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
                     class="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3">
                     <span class="text-xl">{{ opt.icon }}</span>
                     <span class="font-medium text-sm">{{ opt.label }}</span>
                  </button>
               }
            </div>
         </div>

         <!-- 2. Concrete Age -->
         <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">
               <span class="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
               Edad del Concreto
            </h3>
            <div class="space-y-2">
               <button 
                  (click)="age.set('fresh')"
                  [class]="age() === 'fresh' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
                  class="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3">
                  <span>🌱</span>
                  <div>
                     <span class="font-medium text-sm block">Fresco / Verde</span>
                     <span class="text-xs opacity-80 font-light">< 28 días (Curado)</span>
                  </div>
               </button>
               <button 
                  (click)="age.set('old')"
                  [class]="age() === 'old' ? 'bg-slate-700 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
                  class="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3">
                  <span>🏛️</span>
                  <div>
                     <span class="font-medium text-sm block">Viejo / Existente</span>
                     <span class="text-xs opacity-80 font-light">> 28 días (Carbonatado)</span>
                  </div>
               </button>
            </div>
         </div>

         <!-- 3. Task -->
         <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">
               <span class="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
               Tipo de Tarea (Múltiple)
            </h3>
            <div class="space-y-2">
               @for (opt of tasks; track opt.id) {
                  <button 
                     (click)="toggleTask(opt.id)"
                     [class]="selectedTasks().includes(opt.id) ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
                     class="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3">
                     <span class="text-xl">{{ opt.icon }}</span>
                     <div class="leading-tight">
                        <span class="font-medium text-sm block">{{ opt.label }}</span>
                        <span class="text-[10px] opacity-80 font-light">{{ opt.desc }}</span>
                     </div>
                  </button>
               }
            </div>
         </div>
      </div>

      <!-- Generate Button -->
      <div class="flex justify-center">
         <button 
            (click)="generateProtocol()" 
            [disabled]="loading() || selectedTasks().length === 0"
            class="bg-slate-800 hover:bg-black text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-300/50 transition-all transform hover:-translate-y-1 flex items-center gap-3 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none">
            @if (loading()) {
               <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Generando Protocolo...
            } @else {
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
               </svg>
               Generar Protocolo Técnico
            }
         </button>
      </div>

      <!-- Result Section -->
      @if (protocol()) {
         <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            
            <!-- Quick Tools Card -->
            <div class="lg:col-span-1 space-y-6">
               <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 class="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Herramientas Recomendadas</h3>
                  <div class="space-y-3">
                     @if (selectedTasks().includes('scarify')) {
                        <div class="flex items-center gap-3 text-sm text-slate-700">
                           <span class="p-2 bg-slate-100 rounded text-xl">🚿</span>
                           <span>Hidrolavadora ( > 3000 PSI)</span>
                        </div>
                     }
                     @if (selectedTasks().includes('cracks') || selectedTasks().includes('geometry')) {
                        <div class="flex items-center gap-3 text-sm text-slate-700">
                           <span class="p-2 bg-slate-100 rounded text-xl">🔄</span>
                           <span>Pulidora con Copa Diamante</span>
                        </div>
                     }
                      @if (selectedTasks().includes('steel')) {
                        <div class="flex items-center gap-3 text-sm text-slate-700">
                           <span class="p-2 bg-slate-100 rounded text-xl">✨</span>
                           <span>Cepillo de Acero / Sandblast</span>
                        </div>
                     }
                      @if (selectedTasks().includes('coating')) {
                        <div class="flex items-center gap-3 text-sm text-slate-700">
                           <span class="p-2 bg-slate-100 rounded text-xl">🧪</span>
                           <span>Removedor Químico / Mecánico</span>
                        </div>
                     }
                     <div class="flex items-center gap-3 text-sm text-slate-700">
                        <span class="p-2 bg-slate-100 rounded text-xl">🧽</span>
                        <span>Cepillo de cerda dura</span>
                     </div>
                  </div>
               </div>
               
               <!-- Continue Flow Actions -->
               <div class="bg-slate-800 rounded-xl p-4 text-white shadow-lg">
                  <p class="text-xs text-slate-400 mb-3 uppercase font-bold tracking-wider">Siguientes Pasos</p>
                  <div class="space-y-2">
                     <button (click)="onGoToMixes.emit()" class="w-full flex items-center justify-between px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors group">
                        <span>Ver Mezclas</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                     </button>
                     <button (click)="onGoToCalculator.emit()" class="w-full flex items-center justify-between px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors group">
                        <span class="font-bold">Ir a Calculadora</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-200 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                     </button>
                  </div>
               </div>

               @if (project()) {
                 <button (click)="saveProtocol()" class="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-colors">
                    Guardar en Historial
                 </button>
                 @if (saved()) {
                   <p class="text-xs text-emerald-600 text-center font-bold animate-pulse mt-2">Guardado en Historial</p>
                 }
               }
            </div>

            <!-- Protocol Content -->
            <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                  <h3 class="font-bold text-slate-800">Protocolo de Ejecución</h3>
                  <span class="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-500 font-mono">ICRI-CSP Spec</span>
               </div>
               <div class="p-8 prose prose-slate max-w-none prose-sm">
                  <markdown [data]="protocol()"></markdown>
               </div>
            </div>
         </div>
      }
    </div>
  `
})
export class SurfacePrepComponent {
  private geminiService = inject(GeminiService);
  private projectService = inject(ProjectService);
  
  onGoToCalculator = output<void>();
  onGoToMixes = output<void>();
  project = input<Project | null>(null);

  scenarios = [
    { id: 'wall', label: 'Muro / Vertical', icon: '🧱' },
    { id: 'floor', label: 'Piso / Losa', icon: '🛣️' },
    { id: 'ceiling', label: 'Techo / Casetón', icon: '☝️' }
  ];

  tasks = [
    { id: 'scarify', label: 'Limpieza / Poro', icon: '🚿', desc: 'Escarificado, sandblast' },
    { id: 'cracks', label: 'Apertura Grietas', icon: '⚡', desc: 'Ruteo de juntas y fisuras' },
    { id: 'geometry', label: 'Geometría', icon: '📐', desc: 'Medias cañas, vértices' },
    { id: 'coating', label: 'Remoción de Recubrimiento', icon: '🧪', desc: 'Pintura, epóxico, membranas' },
    { id: 'steel', label: 'Tratamiento de Acero', icon: '⛓️', desc: 'Fosfatizado, pasivación' },
    { id: 'injection', label: 'Inyecciones', icon: '💉', desc: 'Epóxicas o poliuretano' },
  ];

  scenario = signal('wall');
  age = signal('old');
  selectedTasks = signal<string[]>(['scarify']);

  protocol = signal('');
  loading = signal(false);
  contextBanner = signal<string | null>(null);
  saved = signal(false);

  constructor() {
    // Check for context from Pathology
    effect(() => {
      const ctx = this.projectService.surfacePrepContext();
      if (ctx) {
        this.scenario.set(ctx.scenario);
        this.age.set(ctx.age);
        this.selectedTasks.set([ctx.task]); // Set as an array with the single recommended task
        this.contextBanner.set(ctx.diagnosisSummary || 'Configurado desde Patología');
        
        this.projectService.surfacePrepContext.set(null);
      }
    });
  }

  toggleTask(taskId: string) {
    this.selectedTasks.update(currentTasks => {
      if (currentTasks.includes(taskId)) {
        return currentTasks.filter(t => t !== taskId); // Remove task
      } else {
        return [...currentTasks, taskId]; // Add task
      }
    });
  }

  async generateProtocol() {
    if (this.selectedTasks().length === 0) return;

    this.loading.set(true);
    this.protocol.set('');
    
    // Get labels for prompt
    const sLabel = this.scenarios.find(s => s.id === this.scenario())?.label || '';
    const tLabels = this.selectedTasks()
      .map(id => this.tasks.find(t => t.id === id)?.label)
      .filter(label => !!label)
      .join(', ');

    const ageLabel = this.age() === 'fresh' ? 'Concreto Fresco (<28 días)' : 'Concreto Viejo (>28 días)';

    const result = await this.geminiService.generatePrepProtocol(sLabel, ageLabel, tLabels);
    
    this.protocol.set(result);
    this.loading.set(false);
  }

  saveProtocol() {
    const p = this.project();
    if (!p || !this.protocol()) return;

    const tLabels = this.selectedTasks()
      .map(id => this.tasks.find(t => t.id === id)?.label)
      .filter(label => !!label)
      .join(', ');

    this.projectService.addToHistory(p.id, {
      type: 'calculation', // Reuse calculation type icon for technical data
      title: 'Protocolo de Preparación',
      details: `Escenario: ${this.scenario()}, Tareas: ${tLabels}.`,
      data: { 
         protocolText: this.protocol(),
         config: { s: this.scenario(), t: this.selectedTasks(), a: this.age() }
      }
    });
    
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}