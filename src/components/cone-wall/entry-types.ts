import type { installSource } from './source';

export interface ConeEntry {
  show(): void;
  hide(): void;
  install(source: ReturnType<typeof installSource>): void;
  arrivalScripts(): string[];
}

declare global {
  interface Window {
    urukConePixels?: { width: number; pixels: number };
    urukConeEntry?: ConeEntry;
    urukConeName?: string;
    urukConeParts?: string[];
    urukConeIntent?: string;
  }
}
