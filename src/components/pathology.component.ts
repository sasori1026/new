import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { ProjectService, Project } from '../services/project.service';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-pathology',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-500 opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-start gap-4">
           <div>
              <h2 class="text-3xl font-bold mb-2 flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
                 Peritaje Forense IA
              </h2>
              <p class="text-slate-300 max-w-xl">
                Análisis de Causa Raíz con validación en normativa internacional (ACI, ASTM, ICRI) y búsqueda web en tiempo real.
              </p>
           </div>
           @if (project()) {
            <span class="px-4 py-2 bg-white/10 text-indigo-100 border border-white/20 rounded-lg text-sm font-bold backdrop-blur-md flex items-center gap-2">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {{ project()?.name }}
            </span>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        <!-- Left Column: Input & Evidence (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
           <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
              <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">1. Evidencia de Campo</h3>
              
              <!-- Image Upload -->
              <div class="mb-4">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Fotografía del Daño</label>
                @if (!selectedImage()) {
                  <label class="block w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer group">
                    <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
                    <div class="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-500 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p class="text-sm font-medium text-slate-600">Subir Evidencia Visual</p>
                  </label>
                } @else {
                  <div class="relative rounded-xl overflow-hidden border border-slate-200 group">
                    <img [src]="selectedImage()" class="w-full h-48 object-cover">
                    <button (click)="removeImage()" class="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                }
              </div>

              <!-- Description -->
              <div class="flex-1">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Observaciones Técnicas</label>
                <textarea 
                  [(ngModel)]="description" 
                  class="w-full h-full min-h-[150px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  placeholder="Describa síntomas (ej: eflorescencia, oxidación, filtración activa), antigüedad de la estructura y ubicación..."></textarea>
              </div>

              <button 
                (click)="analyze()" 
                [disabled]="(!description() && !selectedImage()) || loading()"
                class="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                @if (loading()) {
                  <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Investigando...
                } @else {
                  <span>Ejecutar Análisis Forense</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              </button>
           </div>
        </div>

        <!-- Right Column: Analysis Results (8 cols) -->
        <div class="lg:col-span-8">
           @if (result()) {
              <div class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col animate-fade-in-up">
                 
                 <!-- Diagnosis Header -->
                 <div class="bg-slate-50 border-b border-slate-200 p-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h3 class="text-2xl font-bold text-slate-800 leading-tight">
                                {{ extractedData()?.diagnosis?.title || 'Análisis Completado' }}
                            </h3>
                            <div class="flex flex-wrap gap-2 mt-2">
                                <span class="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600 shadow-sm flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    Causa Raíz: <strong>{{ extractedData()?.diagnosis?.root_cause || 'Investigando...' }}</strong>
                                </span>
                                @if (extractedData()?.diagnosis?.scientific_backing) {
                                    <span class="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 font-bold">
                                        Norma: {{ extractedData()?.diagnosis?.scientific_backing }}
                                    </span>
                                }
                            </div>
                        </div>
                        @if (extractedData()?.diagnosis?.severity) {
                           <span [class]="getSeverityColor(extractedData()?.diagnosis?.severity)" class="px-3 py-1 rounded-full text-xs font-bold uppercase border shadow-sm">
                              Severidad {{ extractedData()?.diagnosis?.severity }}
                           </span>
                        }
                    </div>
                 </div>

                 <!-- Main Content -->
                 <div class="flex-1 p-8 overflow-y-auto max-h-[600px]">
                    <!-- Report Text -->
                    <div class="prose prose-slate prose-sm max-w-none prose-headings:text-indigo-900 prose-headings:font-bold prose-strong:text-slate-900 mb-8">
                       <markdown [data]="result()"></markdown>
                    </div>

                    <!-- SEQUENTIAL ACTION PLAN (Integration Hub) -->
                    @if (extractedData()?.action_plan_steps; as steps) {
                       <div class="bg-slate-50 rounded-xl border border-slate-200 p-6">
                          <h4 class="text-sm font-bold text-slate-500 uppercase mb-4 tracking-wider flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                             </svg>
                             Plan de Intervención Integral
                          </h4>
                          
                          <div class="space-y-4">
                             @for (step of steps; track step.step_number) {
                                <div class="flex gap-4 relative">
                                   <!-- Connector Line -->
                                   @if (!$last) {
                                     <div class="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-slate-200"></div>
                                   }
                                   
                                   <!-- Step Badge -->
                                   <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0 z-10">
                                      {{ step.step_number }}
                                   </div>
                                   
                                   <!-- Content -->
                                   <div class="flex-1 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                      <h5 class="font-bold text-slate-800">{{ step.phase_name }}</h5>
                                      
                                      <div class="flex flex-wrap gap-2 mt-2">
                                         @if (step.product_id) {
                                            <span class="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded border border-indigo-100 flex items-center gap-1">
                                               <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                                               {{ step.product_id }}
                                            </span>
                                         }
                                         @if (step.generic_resources) {
                                            @for (res of step.generic_resources; track $index) {
                                               <span class="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded">
                                                  {{ res }}
                                               </span>
                                            }
                                         }
                                      </div>
                                   </div>
                                </div>
                             }
                          </div>

                          <!-- Module Integration Buttons -->
                          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <button (click)="applyFullPlan()" class="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2 group">
                                <span class="bg-white/20 p-1 rounded group-hover:bg-white/30 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </span>
                                Enviar Materiales al Presupuesto (BOQ)
                             </button>
                             <button (click)="sendToPrep()" class="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                Configurar Preparación (CSP)
                             </button>
                          </div>
                       </div>
                    }

                    <!-- Sources Footer (Grounding) -->
                    @if (sources().length > 0) {
                       <div class="mt-8">
                          <h4 class="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-wider">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                             </svg>
                             Referencias y Validación Web
                          </h4>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                             @for (src of sources(); track $index) {
                                <a [href]="src.uri" target="_blank" class="group flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-xs text-slate-600 hover:text-blue-700">
                                   <div class="flex items-center gap-2 truncate">
                                      <span class="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-blue-500"></span>
                                      <span class="truncate font-medium">{{ src.title }}</span>
                                   </div>
                                   <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                   </svg>
                                </a>
                             }
                          </div>
                       </div>
                    }
                 </div>
                 
                 <!-- Footer Actions -->
                 @if (!project()) {
                   <div class="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                      <button (click)="createProjectFromDiagnosis()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                         Crear Proyecto desde Diagnóstico
                      </button>
                   </div>
                 } @else {
                    <div class="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                       <button (click)="saveToProject()" class="text-slate-600 hover:text-slate-800 font-medium text-sm px-4 py-2 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          {{ saved() ? 'Guardado ✓' : 'Guardar en Historial' }}
                       </button>
                    </div>
                 }
              </div>
           } @else {
              <!-- Empty State -->
              <div class="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400">
                 <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                 </div>
                 <h3 class="font-bold text-slate-600 text-lg">Laboratorio Forense IA</h3>
                 <p class="text-sm max-w-xs text-center mt-2">Sube una foto y describe la patología. Realizaré un análisis de causa raíz, validación normativa y plan de intervención.</p>
              </div>
           }
        </div>
      </div>
    </div>
  `
})
export class PathologyComponent {
  private geminiService = inject(GeminiService);
  private projectService = inject(ProjectService);
  
  onCreateProject = output<void>();
  onGoToCalculator = output<void>();
  onGoToPrep = output<void>();

  project = input<Project | null>(null);
  
  description = signal('');
  selectedImage = signal<string | null>(null);
  
  result = signal('');
  extractedData = signal<any>(null); // For JSON data
  sources = signal<{ title: string; uri: string }[]>([]);
  
  loading = signal(false);
  saved = signal(false);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 15 * 1024 * 1024) { 
        alert('La imagen es demasiado grande. Máximo 15MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImage.set(null);
  }

  async analyze() {
    if (!this.description() && !this.selectedImage()) return;
    
    this.loading.set(true);
    this.result.set(''); 
    this.extractedData.set(null);
    this.sources.set([]);
    this.saved.set(false);
    
    const analysis = await this.geminiService.analyzePathology(
      this.description(), 
      this.selectedImage() || undefined
    );
    
    this.result.set(analysis.text);
    this.extractedData.set(analysis.structuredData);
    this.sources.set(analysis.sources);
    this.loading.set(false);
  }

  getSeverityColor(severity: string): string {
    const s = severity.toLowerCase();
    if (s.includes('crítica') || s.includes('critical')) return 'bg-red-600 text-white border-red-700';
    if (s.includes('alta') || s.includes('high')) return 'bg-orange-500 text-white border-orange-600';
    if (s.includes('media') || s.includes('medium')) return 'bg-yellow-500 text-white border-yellow-600';
    return 'bg-emerald-500 text-white border-emerald-600';
  }

  saveToProject() {
    const p = this.project();
    if (!p) return;

    this.projectService.addToHistory(p.id, {
      type: 'pathology',
      title: this.extractedData()?.diagnosis?.title || 'Diagnóstico Forense',
      details: this.description() || 'Análisis de causa raíz e investigación web.',
      data: { 
        result: this.result(), 
        structuredData: this.extractedData(),
        sources: this.sources(),
        image: this.selectedImage() || null 
      }
    });
    
    this.saved.set(true);
  }

  createProjectFromDiagnosis() {
    const title = this.extractedData()?.diagnosis?.title || 'Proyecto Reparación';
    const rootCause = this.extractedData()?.diagnosis?.root_cause || 'N/A';
    
    // 1. Prepare Rich Log for History
    this.projectService.pendingPathologyLog.set({
      date: new Date().toISOString(),
      type: 'pathology',
      title: 'Diagnóstico Inicial (Origen)',
      details: `Origen: Análisis Forense IA.\nCausa Raíz: ${rootCause}\n\nDescripción Original: ${this.description()}`,
      data: {
        result: this.result(), // Full text
        structuredData: this.extractedData(),
        sources: this.sources(),
        image: this.selectedImage() || null
      }
    });

    // 2. Draft Project Data
    this.projectService.draftProject.set({
      name: title.length > 30 ? title.substring(0, 30) + '...' : title,
      type: 'Reparación/Fugas',
      notes: `Patología: ${title}.\nCausa: ${rootCause}.\n`,
      status: 'Pendiente'
    });
    
    this.onCreateProject.emit();
  }

  applyFullPlan() {
    const data = this.extractedData();
    if (!data || !data.action_plan_steps) return;

    // Iterate steps and add to BOQ
    data.action_plan_steps.forEach((step: any) => {
       // Add Product if exists
       if (step.product_id) {
          this.projectService.addQuoteItem({
             id: Math.random().toString(36),
             name: step.product_id, 
             type: 'cristaline',
             quantity: 0, // Quantity to be determined in Calc
             unit: 'kg', 
             phase: `Paso ${step.step_number}: ${step.phase_name}`
          });
       }
       // Add Generic Resources
       if (step.generic_resources) {
          step.generic_resources.forEach((res: string) => {
             // Heuristic for type
             let type: any = 'commodity';
             if (res.toLowerCase().match(/taladro|lavadora|pulidora|cincel|mezcladora/)) type = 'equipment';
             if (res.toLowerCase().match(/guantes|casco|lentes/)) type = 'equipment';
             
             this.projectService.addQuoteItem({
                id: Math.random().toString(36),
                name: res,
                type: type,
                quantity: 1,
                unit: 'und',
                phase: `Paso ${step.step_number}: ${step.phase_name}`
             });
          });
       }
    });

    this.onGoToCalculator.emit();
  }

  sendToPrep() {
    const config = this.extractedData()?.modules_config?.prep;
    if (config) {
        this.projectService.surfacePrepContext.set({
            scenario: config.scenario,
            task: config.task,
            age: config.age,
            diagnosisSummary: `Protocolo para: ${this.extractedData()?.diagnosis?.title}`
        });
    } else {
        this.projectService.surfacePrepContext.set({
            scenario: 'wall',
            task: 'scarify',
            age: 'old'
        });
    }
    this.onGoToPrep.emit();
  }
}