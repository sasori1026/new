import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard.component';
import { ProjectListComponent } from './components/project-list.component';
import { CalculatorComponent } from './components/calculator.component';
import { AssistantComponent } from './components/assistant.component';
import { PathologyComponent } from './components/pathology.component';
import { MixGeneratorComponent } from './components/mix-generator.component';
import { ComparatorComponent } from './components/comparator.component';
import { ProjectDetailComponent } from './components/project-detail.component';
import { SurfacePrepComponent } from './components/surface-prep.component';
import { InventoryComponent } from './components/inventory.component';

type View = 'dashboard' | 'projects' | 'calculator' | 'assistant' | 'pathology' | 'mixes' | 'comparator' | 'project-detail' | 'surface-prep' | 'inventory';
type Lang = 'es' | 'en' | 'pt';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardComponent, 
    ProjectListComponent, 
    CalculatorComponent, 
    AssistantComponent,
    PathologyComponent,
    MixGeneratorComponent,
    ComparatorComponent,
    ProjectDetailComponent,
    SurfacePrepComponent,
    InventoryComponent
  ],
  template: `
<div class="flex h-screen bg-zinc-50">
  
  <!-- Mobile Sidebar Backdrop -->
  @if (isSidebarOpen()) {
    <div (click)="toggleSidebar()" class="fixed inset-0 bg-black/60 z-20 lg:hidden"></div>
  }

  <!-- Sidebar -->
  <aside 
    [class]="isSidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    class="fixed inset-y-0 left-0 z-30 w-64 bg-zinc-900 text-white transition-transform duration-300 ease-in-out lg:static lg:block shadow-2xl lg:shadow-none overflow-y-auto">
    
    <div class="flex items-center justify-center h-16 border-b border-zinc-800 shrink-0">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span class="font-bold text-white text-lg">C</span>
        </div>
        <h1 class="text-xl font-bold tracking-wide">Cristaline<span class="text-cyan-400">Pro</span></h1>
      </div>
    </div>

    <nav class="p-4 space-y-6 mt-2">
      
      <!-- Section: Management -->
      <div class="space-y-2">
        <p class="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">{{ t('sidebar.management') }}</p>
        
        <button 
          (click)="setView('dashboard')" 
          [class]="currentView() === 'dashboard' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span class="font-medium">Dashboard</span>
        </button>

        <button 
          (click)="setView('projects')"
          [class]="(currentView() === 'projects' || currentView() === 'project-detail') ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span class="font-medium">Proyectos</span>
        </button>

        <button 
          (click)="setView('inventory')"
          [class]="currentView() === 'inventory' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="font-medium">Inventario & Stock</span>
        </button>
      </div>

      <!-- Section: Engineering Workflow -->
      <div class="space-y-2">
        <p class="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">{{ t('sidebar.tech') }}</p>
        
        <!-- Step 1 -->
        <button 
          (click)="setView('pathology')"
          [class]="currentView() === 'pathology' ? 'bg-zinc-800 text-white border-l-4 border-purple-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'"
          class="w-full flex items-center space-x-3 px-4 py-2 rounded-r-xl transition-all duration-200">
          <span class="text-xs font-mono text-zinc-600">01</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="font-medium">Diagnóstico</span>
        </button>

        <!-- Step 2 -->
        <button 
          (click)="setView('surface-prep')"
          [class]="currentView() === 'surface-prep' ? 'bg-zinc-800 text-white border-l-4 border-amber-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'"
          class="w-full flex items-center space-x-3 px-4 py-2 rounded-r-xl transition-all duration-200">
          <span class="text-xs font-mono text-zinc-600">02</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span class="font-medium">Preparación</span>
        </button>

        <!-- Step 3 -->
        <button 
          (click)="setView('mixes')"
          [class]="currentView() === 'mixes' ? 'bg-zinc-800 text-white border-l-4 border-sky-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'"
          class="w-full flex items-center space-x-3 px-4 py-2 rounded-r-xl transition-all duration-200">
          <span class="text-xs font-mono text-zinc-600">03</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span class="font-medium">Mezclas</span>
        </button>

        <!-- Step 4 -->
        <button 
          (click)="setView('calculator')"
          [class]="currentView() === 'calculator' ? 'bg-zinc-800 text-white border-l-4 border-cyan-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'"
          class="w-full flex items-center space-x-3 px-4 py-2 rounded-r-xl transition-all duration-200">
          <span class="text-xs font-mono text-zinc-600">04</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span class="font-medium">Presupuesto</span>
        </button>

        <!-- Step 5 -->
        <button 
          (click)="setView('comparator')"
          [class]="currentView() === 'comparator' ? 'bg-zinc-800 text-white border-l-4 border-emerald-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'"
          class="w-full flex items-center space-x-3 px-4 py-2 rounded-r-xl transition-all duration-200">
          <span class="text-xs font-mono text-zinc-600">05</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-medium">Comparador $$</span>
        </button>
      </div>

      <!-- Support -->
      <div class="pt-4 mt-4 border-t border-zinc-800">
         <button 
          (click)="setView('assistant')"
          [class]="currentView() === 'assistant' ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span class="font-medium">Asistente IA</span>
        </button>
      </div>
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 flex flex-col h-screen overflow-hidden relative" (click)="closeUserMenu()">
    <!-- Top Header -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-zinc-100 h-16 flex items-center justify-between px-6 lg:px-8 z-10 shrink-0">
      <div class="flex items-center">
        <button (click)="toggleSidebar(); $event.stopPropagation()" class="lg:hidden text-zinc-500 hover:text-zinc-800 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 class="text-lg font-semibold text-zinc-800 capitalize">
           @if (currentView() === 'project-detail') {
              Gestión de Proyecto
           } @else if (currentView() === 'surface-prep') {
              Preparación de Superficies
           } @else if (currentView() === 'inventory') {
              Inventario & Bodega
           } @else {
              {{ currentView() }}
           }
        </h2>
      </div>
      
      <!-- Right Header Actions -->
      <div class="flex items-center gap-4">
        
        <!-- Language Switcher -->
        <div class="flex bg-zinc-100 rounded-lg p-1">
           <button (click)="setLang('es')" [class]="lang() === 'es' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'" class="px-2 py-1 text-xs font-bold rounded transition-all">ES</button>
           <button (click)="setLang('en')" [class]="lang() === 'en' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'" class="px-2 py-1 text-xs font-bold rounded transition-all">EN</button>
           <button (click)="setLang('pt')" [class]="lang() === 'pt' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'" class="px-2 py-1 text-xs font-bold rounded transition-all">PT</button>
        </div>

        <!-- User Menu -->
        <div class="relative">
          <button (click)="toggleUserMenu(); $event.stopPropagation()" class="flex items-center space-x-2 focus:outline-none hover:bg-zinc-100 rounded-full pr-3 pl-1 py-1 transition-colors">
            <div class="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold border-2 border-white ring-2 ring-zinc-300">
              A
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          @if (isUserMenuOpen()) {
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-zinc-100 py-1 z-50 animate-fade-in-up" (click)="$event.stopPropagation()">
              <div class="px-4 py-3 border-b border-zinc-100">
                <p class="text-sm font-bold text-zinc-800">Arq. Residente</p>
                <p class="text-xs text-zinc-500">Administrador</p>
              </div>
              <a href="#" class="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfil
              </a>
              <div class="border-t border-zinc-100 my-1"></div>
              <a href="#" class="block px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                Cerrar Sesión
              </a>
            </div>
          }
        </div>
      </div>
    </header>

    <!-- Content Scrollable Area -->
    <div class="flex-1 overflow-auto p-4 lg:p-8">
      @if (currentView() === 'dashboard') {
        <app-dashboard (onNavigate)="setView($event)"></app-dashboard>
      }
      @if (currentView() === 'projects') {
        <app-project-list (onManage)="setView('project-detail')"></app-project-list>
      }
      @if (currentView() === 'project-detail') {
        <app-project-detail></app-project-detail>
      }
      @if (currentView() === 'calculator') {
        <app-calculator></app-calculator>
      }
      @if (currentView() === 'assistant') {
        <app-assistant></app-assistant>
      }
      @if (currentView() === 'pathology') {
        <app-pathology (onCreateProject)="setView('projects')" (onGoToCalculator)="setView('calculator')" (onGoToPrep)="setView('surface-prep')"></app-pathology>
      }
      @if (currentView() === 'mixes') {
        <app-mix-generator></app-mix-generator>
      }
      @if (currentView() === 'comparator') {
        <app-comparator></app-comparator>
      }
      @if (currentView() === 'surface-prep') {
        <app-surface-prep (onGoToCalculator)="setView('calculator')" (onGoToMixes)="setView('mixes')"></app-surface-prep>
      }
      @if (currentView() === 'inventory') {
        <app-inventory></app-inventory>
      }
    </div>
  </main>
</div>
`
})
export class AppComponent {
  currentView = signal<View>('dashboard');
  lang = signal<Lang>('es');
  isSidebarOpen = signal(false);
  isUserMenuOpen = signal(false);

  setView(view: View) {
    this.currentView.set(view);
    this.isSidebarOpen.set(false);
  }

  setLang(l: Lang) {
    this.lang.set(l);
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }
  
  toggleUserMenu() {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  // Simple translation helper
  t(key: string): string {
    const dict: any = {
      es: { 'sidebar.management': 'Gestión de Obra', 'sidebar.tech': 'Departamento Técnico' },
      en: { 'sidebar.management': 'Site Management', 'sidebar.tech': 'Technical Dept' },
      pt: { 'sidebar.management': 'Gestão de Obras', 'sidebar.tech': 'Departamento Técnico' }
    };
    return dict[this.lang()][key] || key;
  }
}