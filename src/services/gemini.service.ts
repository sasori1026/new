import { Injectable, inject } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { CatalogService } from './catalog.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private modelId = 'gemini-2.5-flash';
  private catalogService = inject(CatalogService);

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || 'dummy-key' });
  }

  private getBaseInstruction(): string {
    const products = this.catalogService.getCatalogContext();
    return `
    Eres un ARQUITECTO EXPERTO EN PATOLOGÍA CONSTRUCTIVA Y TECNOLOGÍA DEL CONCRETO.
    Tu audiencia son arquitectos constructores y contratistas. Tu tono debe ser técnico pero práctico, enfocado en la ejecución de obra y la durabilidad.
    
    TUS HERRAMIENTAS Y SOLUCIONES (CATÁLOGO CRISTALINE):
    ${products}
    
    METODOLOGÍA DE ANÁLISIS:
    1. **DIAGNÓSTICO CONSTRUCTIVO**:
       - Identifica la falla visual (ej. eflorescencia, junta fría mal vibrada, fisura por retracción).
       - Explica la causa desde el punto de vista constructivo (ej. "Falta de curado", "Mala dosificación").
    2. **VALIDACIÓN TÉCNICA**:
       - Cita normativas (ACI, ASTM, ICRI) para dar respaldo al reporte técnico ante el cliente.
    3. **ESTRATEGIA DE REPARACIÓN (PASO A PASO)**:
       - Enfócate en la preparación del sustrato (es la clave).
       - Define qué herramientas usar (Disco de corte, cincel, hidrolavadora).
    
    INTEGRACIÓN CON LA APP:
    - Genera JSON para configurar automáticamente los módulos de cálculo y preparación.
    `;
  }

  async analyzePathology(description: string, imageBase64?: string): Promise<{ text: string; structuredData: any; sources: { title: string; uri: string }[] }> {
    try {
      let contents: any[] = [];
      const textPart = { text: description || "Realiza un peritaje técnico de esta estructura." };

      if (imageBase64) {
        const mimeMatch = imageBase64.match(/^data:(image\/[a-z]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const base64Data = imageBase64.split(',')[1] || imageBase64;
        
        const imagePart = {
          inlineData: { mimeType: mimeType, data: base64Data }
        };
        contents = [imagePart, textPart];
      } else {
        contents = [textPart];
      }

      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: { parts: contents },
        config: {
          tools: [{ googleSearch: {} }], 
          systemInstruction: this.getBaseInstruction() + `
          FORMATO DE RESPUESTA:
          1. Genera un INFORME TÉCNICO en Markdown. Estructura: "Observación Visual", "Diagnóstico", "Normativa Aplicable", "Procedimiento de Reparación".
          
          2. AL FINAL, genera OBLIGATORIAMENTE un bloque JSON:
          
          \`\`\`json
          {
            "diagnosis": {
               "title": "Título Técnico (Ej: Falla en Junta de Hormigonado)",
               "root_cause": "Causa principal",
               "severity": "Crítica" | "Alta" | "Media" | "Baja",
               "scientific_backing": "Norma citada"
            },
            "action_plan_steps": [
               {
                 "step_number": 1,
                 "phase_name": "Ej: Apertura de caja en forma de U",
                 "product_id": null,
                 "generic_resources": ["Disco de corte", "Martillo"]
               },
               {
                 "step_number": 2,
                 "phase_name": "Ej: Obturación de vía de agua",
                 "product_id": "cristaline-plug",
                 "generic_resources": ["Guantes de goma"]
               }
            ],
            "modules_config": {
               "prep": {
                  "scenario": "wall" | "floor" | "ceiling",
                  "task": "scarify" | "cracks" | "geometry",
                  "age": "old" | "fresh"
               }
            }
          }
          \`\`\`
          `,
        }
      });

      const fullText = response.text || '';
      
      // Extract Structured Data using Regex
      let structuredData = null;
      const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          structuredData = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.warn('Failed to parse embedded JSON from AI response', e);
        }
      }

      // Remove JSON form display text
      const displayText = fullText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();

      // Extract Sources (Grounding)
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .map((c: any) => c.web)
        .filter((w: any) => w)
        .map((w: any) => ({ title: w.title, uri: w.uri }));
      
      const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

      return { 
        text: displayText || 'No se pudo generar el análisis detallado.', 
        structuredData: structuredData,
        sources: uniqueSources 
      };

    } catch (error) {
       console.warn('Gemini API Error (Using Mock Fallback):', error);
       return this.getMockPathologyAnalysis(description);
    }
  }

  async generateEmergencyAdditive(materials: string, context: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: `
        **TAREA CRÍTICA DE CIENCIA DE MATERIALES:**
        Un Arquitecto en obra necesita crear un **aditivo impermeabilizante por cristalización** de emergencia porque no tiene acceso a productos comerciales como "Cristaline".

        **1. MATERIALES DISPONIBLES EN OBRA:**
        ${materials}

        **2. PROBLEMA A RESOLVER (CONTEXTO):**
        ${context}

        **INSTRUCCIONES PARA LA IA:**
        Actúa como un Químico experto en tecnología del concreto. Tu misión es formular una receta para un **ADITIVO EN POLVO** usando los materiales disponibles. Este aditivo luego será mezclado con cemento y arena para hacer un mortero.

        **FORMATO DE RESPUESTA OBLIGATORIO (en Markdown):**
        - **Título:** "Fórmula de Aditivo Cristalino de Emergencia"
        - **Principio Químico:** Explica brevemente cómo funcionará la mezcla (ej. "reacción puzolánica para densificar la matriz de cemento y sales para promover crecimiento cristalino higroscópico...").
        - **Receta del Aditivo (proporciones en peso):**
          - Material 1: X partes
          - Material 2: Y partes
          - ...
        - **Instrucciones de Mezclado (para el aditivo):** Describe cómo mezclar los componentes del aditivo en seco.
        - **Dosificación Recomendada:** Especifica cómo dosificar este nuevo aditivo en el mortero final (ej. "Usar al 1.5% del peso del cemento").
        - **⚠️ ADVERTENCIA DE SEGURIDAD Y EFICACIA:** Incluye un párrafo MUY CLARO indicando que esta es una solución experimental, no garantizada, que puede tener resultados impredecibles y que debe ser probada en un área pequeña primero.
        `,
        config: {
          systemInstruction: `Eres un Químico experto en la ciencia de materiales para construcción, especializado en aditivos para concreto. Tu lenguaje es técnico, preciso y priorizas la seguridad.`,
        }
      });
      return response.text || 'No se pudo generar la receta de emergencia.';
    } catch (error) {
      console.error("Gemini Error in generateEmergencyAdditive:", error);
      return `### ⚠️ Fórmula de Emergencia (Modo Offline)
      
      **Principio Químico:** Reacción puzolánica simple.
      
      **Receta del Aditivo:**
      - Cemento Portland: 3 partes
      - Sílice o ceniza fina: 1 parte
      
      **Dosificación:**
      - Usar al 2% del peso del cemento en la mezcla de mortero.
      
      **⚠️ ADVERTENCIA:** Esta es una fórmula no probada y sin garantías. Úsese bajo su propio riesgo.`;
    }
  }

  async analyzeProjectRequirements(description: string): Promise<string> {
    return 'Análisis mock no implementado.';
  }

  async generatePrepProtocol(scenario: string, age: string, task: string): Promise<string> {
     try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: `Genera una especificación técnica de PREPARACIÓN DE SUPERFICIE (CSP - Concrete Surface Profile) según ICRI 310.2.
        Contexto: Ubicación ${scenario}, Edad ${age}, Tarea ${task}.
        Define: Equipos necesarios y Nivel CSP objetivo.`,
        config: {
           systemInstruction: "Eres un Arquitecto Residente experto en acabados y sustratos."
        }
      });
      return response.text || 'No se pudo generar el protocolo.';
    } catch (error) {
      return `### Protocolo Estándar ICRI (Modo Offline)\nConsulte guía técnica local.`;
    }
  }

  async getTechnicalAdvice(query: string): Promise<string> {
    try {
        const response = await this.ai.models.generateContent({
            model: this.modelId,
            contents: query,
            config: { systemInstruction: this.getBaseInstruction() }
        });
        return response.text || 'Sin respuesta.';
    } catch (e) { return 'Error de conexión IA.'; }
  }

  private getMockPathologyAnalysis(description: string): { text: string; structuredData: any; sources: { title: string; uri: string }[] } {
    return {
      text: `### Análisis Preliminar (Offline)
      Se detecta una posible falla de impermeabilización.
      
      **Diagnóstico:** Porosidad excesiva o fisuración por contracción.
      **Solución:** Sistema Cristaline 1.`,
      structuredData: {
        diagnosis: {
            title: "Falla General (Modo Offline)",
            root_cause: "Sin conexión a IA",
            severity: "Media",
            scientific_backing: "N/A"
        },
        action_plan_steps: [
           { step_number: 1, phase_name: "Limpieza", product_id: null, generic_resources: ["Hidrolavadora"] },
           { step_number: 2, phase_name: "Impermeabilización", product_id: "cristaline-1", generic_resources: ["Brocha"] }
        ],
        modules_config: {
            prep: { scenario: "wall", task: "scarify", age: "old" }
        }
      },
      sources: []
    };
  }
}