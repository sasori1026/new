import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Asistente Técnico IA</h2>
          <p class="text-xs text-slate-500">Experto en impermeabilización cristalina</p>
        </div>
        <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        @for (msg of messages(); track $index) {
          <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div [class]="msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]' 
              : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm'">
              <p class="whitespace-pre-wrap text-sm leading-relaxed">{{ msg.content }}</p>
            </div>
          </div>
        }
        @if (loading()) {
          <div class="flex justify-start">
            <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex space-x-2 items-center">
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-slate-100">
        <form (submit)="sendMessage()" class="flex space-x-2">
          <input 
            type="text" 
            [(ngModel)]="currentMessage" 
            name="message"
            placeholder="Pregunta sobre aplicación, fugas, juntas frías..." 
            class="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            [disabled]="loading()">
          <button 
            type="submit" 
            [disabled]="!currentMessage() || loading()"
            class="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  `
})
export class AssistantComponent {
  private geminiService = inject(GeminiService);
  
  messages = signal<Message[]>([
    { role: 'assistant', content: 'Hola. Soy tu especialista en impermeabilización por cristalización. ¿En qué puedo ayudarte hoy? Puedo asesorarte sobre preparación de superficie, dosificación o solución de problemas en obra.' }
  ]);
  
  currentMessage = signal('');
  loading = signal(false);

  async sendMessage() {
    const text = this.currentMessage().trim();
    if (!text) return;

    // Add User Message
    this.messages.update(msgs => [...msgs, { role: 'user', content: text }]);
    this.currentMessage.set('');
    this.loading.set(true);

    // Call API
    const response = await this.geminiService.getTechnicalAdvice(text);

    // Add AI Response
    this.messages.update(msgs => [...msgs, { role: 'assistant', content: response }]);
    this.loading.set(false);
  }
}