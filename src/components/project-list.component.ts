import { Component, inject, signal, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 class="text-xl font-bold text-slate-800">Lista de Proyectos</h2>
        <button (click)="showModal.set(true)" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Proyecto
        </button>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        @for (project of projectService.projects(); track project.id) {
          <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors cursor-pointer" (click)="manageProject(project.id)">{{ project.name }}</h3>
                <p class="text-sm text-slate-500">{{ project.client }}</p>
              </div>
              <div class="relative">
                <button (click)="toggleMenu(project.id)" class="text-slate-400 hover:text-slate-600">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                   </svg>
                </button>
                @if (openMenuId() === project.id) {
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-10">
                    <button (click)="manageProject(project.id)" class="block w-full text-left px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50">Gestionar Proyecto</button>
                    <div class="border-t border-slate-100 my-1"></div>
                    <button (click)="changeStatus(project.id, 'Pendiente')" class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Marcar Pendiente</button>
                    <button (click)="changeStatus(project.id, 'En Proceso')" class="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">Marcar En Proceso</button>
                    <button (click)="changeStatus(project.id, 'Completado')" class="block w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50">Marcar Completado</button>
                    <div class="border-t border-slate-100 my-1"></div>
                    <button (click)="deleteProject(project.id)" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Eliminar</button>
                  </div>
                }
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
              <div class="bg-slate-50 p-3 rounded-lg">
                <p class="text-xs text-slate-500 uppercase font-semibold">Tipo</p>
                <p class="text-slate-700 font-medium">{{ project.type }}</p>
              </div>
              <div class="bg-slate-50 p-3 rounded-lg">
                <p class="text-xs text-slate-500 uppercase font-semibold">Área</p>
                <p class="text-slate-700 font-medium">{{ project.area }} m²</p>
              </div>
              <div class="bg-slate-50 p-3 rounded-lg">
                <p class="text-xs text-slate-500 uppercase font-semibold">Material</p>
                <p class="text-slate-700 font-medium">{{ project.materialRequired }} kg</p>
              </div>
              <div class="bg-slate-50 p-3 rounded-lg">
                <p class="text-xs text-slate-500 uppercase font-semibold">Estado</p>
                @if (project.status === 'Completado') {
                  <span class="text-emerald-600 font-bold">Completado</span>
                } @else if (project.status === 'En Proceso') {
                  <span class="text-blue-600 font-bold">En Proceso</span>
                } @else {
                  <span class="text-slate-600 font-bold">Pendiente</span>
                }
              </div>
            </div>

            <p class="text-sm text-slate-500 italic pt-3 border-t border-slate-100 line-clamp-2">{{ project.notes }}</p>
            
            <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
               <button (click)="manageProject(project.id)" class="text-blue-600 text-sm font-semibold hover:text-blue-800 flex items-center">
                  Gestionar & Módulos
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
               </button>
               @if (project.history.length > 0) {
                 <span class="text-xs text-slate-400 flex items-center gap-1">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   {{ project.history.length }} registros
                 </span>
               }
            </div>

            @if (project.status === 'Completado' && project.nextMaintenance) {
               <div class="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-center gap-2">
                  <div class="text-amber-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="text-xs">
                    <p class="text-amber-700 font-semibold">Mantenimiento Sugerido</p>
                    <p class="text-amber-600">{{ project.nextMaintenance }} (Revisión Anual)</p>
                  </div>
               </div>
            }
          </div>
        }
      </div>

      <!-- Add Modal with Scrollbar and Flex Layout -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 class="font-bold text-slate-800">Nuevo Proyecto</h3>
              <button (click)="showModal.set(false)" class="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Nombre del Proyecto</label>
                <input type="text" [(ngModel)]="newProject.name" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <input type="text" [(ngModel)]="newProject.client" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              </div>
              <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select [(ngModel)]="newProject.type" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Cimentación">Cimentación</option>
                      <option value="Tanque">Tanque/Cisterna</option>
                      <option value="Techo">Techo/Losa</option>
                      <option value="Muro">Muro Contención</option>
                      <option value="Reparación/Fugas">Reparación (Fugas/Plug)</option>
                      <option value="Pisos/Revoques">Pisos/Revoques (Mortero)</option>
                      <option value="Otro">Otro</option>
                    </select>
                 </div>
                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Área (m²)</label>
                    <input type="number" [(ngModel)]="newProject.area" (change)="calculateMaterial()" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                 </div>
              </div>
               <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Material Estimado (kg)</label>
                <input type="number" [(ngModel)]="newProject.materialRequired" class="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 cursor-not-allowed" readonly>
              </div>
               <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea [(ngModel)]="newProject.notes" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 bg-slate-50 flex justify-end gap-2 shrink-0 border-t border-slate-100">
              <button (click)="showModal.set(false)" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button (click)="addProject()" class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Guardar Proyecto</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProjectListComponent {
  projectService = inject(ProjectService);
  onManage = output<void>(); // Signal to parent to switch view
  
  showModal = signal(false);
  openMenuId = signal<string | null>(null);

  newProject: any = {
    name: '',
    client: '',
    type: 'Cimentación',
    area: 0,
    status: 'Pendiente',
    materialRequired: 0,
    materialUsed: 0,
    notes: '',
    date: new Date().toISOString()
  };

  constructor() {
    // Effect to detect if we need to open modal from draft
    effect(() => {
      const draft = this.projectService.draftProject();
      if (draft) {
        this.newProject = { ...this.newProject, ...draft };
        this.showModal.set(true);
        // Clear draft so it doesn't reopen unexpectedly later
        this.projectService.draftProject.set(null);
      }
    });
  }

  calculateMaterial() {
    // Basic estimate: 1.6kg/m2 for 2 coats
    this.newProject.materialRequired = Math.ceil(this.newProject.area * 1.6);
  }

  addProject() {
    if (!this.newProject.name || this.newProject.area < 0) return; // Allow 0 area for diagnosis projects
    this.projectService.addProject(this.newProject);
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm() {
    this.newProject = {
      name: '',
      client: '',
      type: 'Cimentación',
      area: 0,
      status: 'Pendiente',
      materialRequired: 0,
      materialUsed: 0,
      notes: '',
      date: new Date().toISOString()
    };
  }

  toggleMenu(id: string) {
    if (this.openMenuId() === id) {
      this.openMenuId.set(null);
    } else {
      this.openMenuId.set(id);
    }
  }

  changeStatus(id: string, status: any) {
    this.projectService.updateProjectStatus(id, status);
    this.openMenuId.set(null);
  }

  deleteProject(id: string) {
    if(confirm('¿Estás seguro de eliminar este proyecto?')) {
      this.projectService.deleteProject(id);
    }
  }

  manageProject(id: string) {
    this.projectService.selectProject(id);
    this.onManage.emit();
  }
}