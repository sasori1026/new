import { Injectable, signal, computed, effect } from '@angular/core';

export interface ProjectLog {
  date: string;
  type: 'calculation' | 'pathology' | 'comparison' | 'mix';
  title: string;
  details: string;
  data?: any; // To store raw result object, images, structured AI data
}

export interface QuoteItem {
  id: string;
  name: string;
  type: 'cristaline' | 'commodity' | 'equipment' | 'labor'; // commodity = sand/cement
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
  phase?: string; // e.g., "Paso 1: Sellado", "Paso 2: Revoque"
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: 'Cimentación' | 'Tanque' | 'Techo' | 'Muro' | 'Reparación/Fugas' | 'Pisos/Revoques' | 'Otro';
  area: number; // m2
  status: 'Pendiente' | 'En Proceso' | 'Completado';
  materialRequired: number; // kg
  materialUsed: number; // kg
  notes: string;
  date: string;
  nextMaintenance?: string;
  history: ProjectLog[]; 
  boq?: QuoteItem[]; // Bill of Quantities (Presupuesto guardado)
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Persistence Key
  private readonly STORAGE_KEY = 'cristaline_pro_projects_v1';

  // Initial mock data (Only used if storage is empty)
  private initialProjects: Project[] = [
    {
      id: '1',
      name: 'Residencial Altos',
      client: 'Constructora Norte',
      type: 'Cimentación',
      area: 450,
      status: 'En Proceso',
      materialRequired: 720,
      materialUsed: 300,
      notes: 'Aplicación de dos capas en losa de cimentación.',
      date: '2023-10-15',
      history: [],
      boq: []
    }
  ];

  readonly projects = signal<Project[]>([]);
  readonly currentProject = signal<Project | null>(null); 
  
  // Shared State for Cross-Component Communication
  readonly draftProject = signal<Partial<Project> | null>(null);
  
  // NEW: Centralized "Shopping Cart" / BOQ for the Calculator Module
  readonly activeQuoteItems = signal<QuoteItem[]>([]);

  // NEW: Holds the rich pathology data (image, full analysis) to be attached to the new project
  readonly pendingPathologyLog = signal<ProjectLog | null>(null);

  readonly calculationContext = signal<{ category: string, suggestedValue?: number } | null>(null);
  
  // Context specifically for Surface Prep integration
  readonly surfacePrepContext = signal<{
    scenario: string; // 'wall' | 'floor' | 'ceiling'
    age: string;      // 'fresh' | 'old'
    task: string;     // 'scarify' | 'cracks' | 'geometry'
    diagnosisSummary?: string;
  } | null>(null);

  readonly totalProjects = computed(() => this.projects().length);
  readonly activeProjects = computed(() => this.projects().filter(p => p.status === 'En Proceso').length);
  readonly totalMaterialNeeded = computed(() => this.projects().reduce((acc, p) => acc + p.materialRequired, 0));

  constructor() {
    this.loadProjects();

    // Auto-save effect: Whenever 'projects' signal changes, save to localStorage
    effect(() => {
        const data = JSON.stringify(this.projects());
        localStorage.setItem(this.STORAGE_KEY, data);
    });
  }

  private loadProjects() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
        try {
            this.projects.set(JSON.parse(saved));
        } catch (e) {
            console.error('Error loading projects', e);
            this.projects.set(this.initialProjects);
        }
    } else {
        this.projects.set(this.initialProjects);
    }
  }

  selectProject(id: string) {
    const p = this.projects().find(p => p.id === id);
    this.currentProject.set(p || null);
    // Load saved BOQ into active calculator if exists
    if (p && p.boq) {
      this.activeQuoteItems.set([...p.boq]);
    } else {
      this.activeQuoteItems.set([]);
    }
  }

  addProject(project: Omit<Project, 'id' | 'history'>) {
    const initialHistory: ProjectLog[] = [];
    
    // Check if there is a pending pathology report to attach
    const pendingLog = this.pendingPathologyLog();
    if (pendingLog) {
      initialHistory.push(pendingLog);
      this.pendingPathologyLog.set(null); 
    }

    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      history: initialHistory,
      boq: []
    };
    
    this.projects.update(list => [newProject, ...list]);
  }

  updateProjectStatus(id: string, status: Project['status']) {
    this.projects.update(list =>
      list.map(p => {
        if (p.id !== id) return p;

        let updates: Partial<Project> = { status };
        
        if (status === 'Completado') {
          const completionDate = new Date();
          const maintenanceDate = new Date(completionDate);
          maintenanceDate.setFullYear(completionDate.getFullYear() + 1);
          updates.nextMaintenance = maintenanceDate.toISOString().split('T')[0];
        } else {
          updates.nextMaintenance = undefined;
        }

        return { ...p, ...updates };
      })
    );
    if (this.currentProject()?.id === id) {
      this.currentProject.set(this.projects().find(p => p.id === id) || null);
    }
  }

  deleteProject(id: string) {
    this.projects.update(list => list.filter(p => p.id !== id));
    if (this.currentProject()?.id === id) {
      this.currentProject.set(null);
    }
  }

  addToHistory(projectId: string, log: Omit<ProjectLog, 'date'>) {
    const newLog: ProjectLog = {
      ...log,
      date: new Date().toISOString()
    };

    this.projects.update(list => 
      list.map(p => {
        if (p.id !== projectId) return p;
        return { ...p, history: [newLog, ...p.history] };
      })
    );
    
    if (this.currentProject()?.id === projectId) {
      this.currentProject.set(this.projects().find(p => p.id === projectId) || null);
    }
  }

  // --- BOQ METHODS ---
  addQuoteItem(item: QuoteItem) {
    this.activeQuoteItems.update(items => [...items, item]);
    this.saveBoqToCurrentProject();
  }

  removeQuoteItem(itemId: string) {
    this.activeQuoteItems.update(items => items.filter(i => i.id !== itemId));
    this.saveBoqToCurrentProject();
  }

  clearQuote() {
    this.activeQuoteItems.set([]);
    this.saveBoqToCurrentProject();
  }

  private saveBoqToCurrentProject() {
    const current = this.currentProject();
    if (current) {
      const updatedBoq = this.activeQuoteItems();
      this.projects.update(list => list.map(p => p.id === current.id ? { ...p, boq: updatedBoq } : p));
    }
  }
}