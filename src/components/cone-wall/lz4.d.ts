declare module 'lz4js' {
  export function decompressBlock(source: Uint8Array, target: Uint8Array, offset: number, length: number, targetOffset: number): number;
  export function compressBound(size: number): number;
  export function compressBlock(source: Uint8Array, target: Uint8Array, offset: number, length: number, table: Uint32Array): number;
}
