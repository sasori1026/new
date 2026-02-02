import { Injectable, signal } from '@angular/core';

export type ApplicationMethod = 'slurry' | 'admix' | 'plug' | 'mortar' | 'repellent';

export interface ProductSpec {
  id: string;
  name: string;
  category: ApplicationMethod;
  description: string;
  
  // Dosage Specs
  dosageUnit: 'kg/m2' | '% cement weight' | 'kg/m linear' | 'kg/m2/mm thickness' | 'L/m2';
  minDosage: number;
  maxDosage: number;
  defaultDosage: number;
  
  // Mixing Specs
  waterRatio: number; // Liters of water per kg of product
  mixingRatioVol: string; // Text representation e.g. "5:2"
  potLifeMinutes: number;
  
  // Physical Props
  density: number; // kg/L (bulk density)
  packSize: number; // kg or Liters per bucket/bag
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  
  private products: ProductSpec[] = [
    {
      id: 'cristaline-1',
      name: 'Cristaline 1 (Regular)',
      category: 'slurry',
      description: 'Impermeabilizante por cristalización superficial para concretos existentes.',
      dosageUnit: 'kg/m2',
      minDosage: 0.8,
      maxDosage: 1.0, // Per coat
      defaultDosage: 0.8,
      waterRatio: 0.4, // 5 parts powder : 2 parts water approx
      mixingRatioVol: '5 Partes Polvo : 2 Partes Agua',
      potLifeMinutes: 20,
      density: 1.25,
      packSize: 25
    },
    {
      id: 'cristaline-admix',
      name: 'Cristaline Admix C-1000',
      category: 'admix',
      description: 'Aditivo integral para impermeabilización de concreto fresco.',
      dosageUnit: '% cement weight',
      minDosage: 0.01, // 1%
      maxDosage: 0.02, // 2%
      defaultDosage: 0.015, // 1.5% usually
      waterRatio: 0.6, // Often mixed as thin slurry before adding to truck
      mixingRatioVol: 'Dosificación por peso de cemento',
      potLifeMinutes: 0, // Depends on concrete
      density: 1.3,
      packSize: 20
    },
    {
      id: 'cristaline-plug',
      name: 'Cristaline Plug',
      category: 'plug',
      description: 'Cemento hidráulico de fraguado ultrarrápido para detener fugas activas.',
      dosageUnit: 'kg/m linear',
      minDosage: 1.2,
      maxDosage: 1.8,
      defaultDosage: 1.5, // For a 2.5x2.5cm chase
      waterRatio: 0.22, // 1 part water : 3.5 parts powder
      mixingRatioVol: '3.5 Partes Polvo : 1 Parte Agua',
      potLifeMinutes: 1, // 60 seconds
      density: 1.35,
      packSize: 25
    },
    {
      id: 'cristaline-mortar',
      name: 'Cristaline Repair Mortar',
      category: 'mortar',
      description: 'Mortero de reparación impermeabilizante para oquedades y medias cañas.',
      dosageUnit: 'kg/m2/mm thickness',
      minDosage: 1.9,
      maxDosage: 2.2,
      defaultDosage: 2.1, // ~2.1 kg per liter of void
      waterRatio: 0.18, // Stiff consistency
      mixingRatioVol: '4 Partes Polvo : 1 Parte Agua',
      potLifeMinutes: 30,
      density: 2.1, // Cured density
      packSize: 25
    },
    {
      id: 'cristaline-silane',
      name: 'Cristaline Silane-100',
      category: 'repellent',
      description: 'Hidrofugante invisible base Silano/Siloxano. Permite respirar al sustrato (Fachadas).',
      dosageUnit: 'L/m2',
      minDosage: 0.2,
      maxDosage: 0.4,
      defaultDosage: 0.3, // Saturation point
      waterRatio: 0, // Ready to use
      mixingRatioVol: 'Listo para usar (No diluir)',
      potLifeMinutes: 999, // N/A
      density: 0.9,
      packSize: 19 // 19 Liter Bucket
    }
  ];

  readonly catalog = signal<ProductSpec[]>(this.products);

  getProductByCategory(category: ApplicationMethod): ProductSpec | undefined {
    return this.products.find(p => p.category === category);
  }

  getAllProducts(): ProductSpec[] {
    return this.products;
  }

  // Helper for AI Context
  getCatalogContext(): string {
    return this.products.map(p => 
      `- ${p.name} (${p.category}): Dosis ${p.defaultDosage} ${p.dosageUnit}. Desc: ${p.description}`
    ).join('\n');
  }
}