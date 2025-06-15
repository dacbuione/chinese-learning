/**
 * 🌐 Web Speech API TypeScript Definitions
 * 
 * Định nghĩa types cho Web Speech API để TypeScript hiểu
 */

declare global {
  interface Window {
    speechSynthesis: SpeechSynthesis;
    SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance;
  }

  interface SpeechSynthesis extends EventTarget {
    readonly pending: boolean;
    readonly speaking: boolean;
    readonly paused: boolean;
    
    speak(utterance: SpeechSynthesisUtterance): void;
    cancel(): void;
    pause(): void;
    resume(): void;
    getVoices(): SpeechSynthesisVoice[];
    
    onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => any) | null;
  }

  interface SpeechSynthesisUtterance extends EventTarget {
    text: string;
    lang: string;
    voice: SpeechSynthesisVoice | null;
    volume: number;
    rate: number;
    pitch: number;
    
    onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any) | null;
    onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  }

  interface SpeechSynthesisVoice {
    readonly voiceURI: string;
    readonly name: string;
    readonly lang: string;
    readonly localService: boolean;
    readonly default: boolean;
  }

  interface SpeechSynthesisEvent extends Event {
    readonly utterance: SpeechSynthesisUtterance;
    readonly charIndex: number;
    readonly charLength: number;
    readonly elapsedTime: number;
    readonly name: string;
  }

  interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
    readonly error: 'audio-busy' | 'audio-hardware' | 'network' | 'synthesis-unavailable' | 'synthesis-failed' | 'language-unavailable' | 'voice-unavailable' | 'text-too-long' | 'invalid-argument' | 'not-allowed';
  }

  var speechSynthesis: SpeechSynthesis;
  var SpeechSynthesisUtterance: {
    prototype: SpeechSynthesisUtterance;
    new(text?: string): SpeechSynthesisUtterance;
  };
}

export {}; 