// Compile with clang --target=wasm32 -mbulk-memory -O3 -nostdlib -Wl,--no-entry
// -Wl,--import-memory -Wl,-z,stack-size=0 -Wl,--strip-all. Embed the module in head.js.
// Decode one LZ4 block. All lengths are bounded by the input and output spans.
typedef unsigned char byte;
static int length(const byte **in, const byte *end, unsigned base) {
  if (base < 15) return base;
  unsigned b;
  do {
    if (*in == end || base > 0x70000000) return -1;
    b = *(*in)++; base += b;
  } while (b == 255);
  return base;
}
__attribute__((export_name("decode")))
int decode(const byte *in, unsigned size, byte *out, unsigned count) {
  const byte *end = in + size;
  byte *start=out, *limit = out + count;
  while (in < end) {
    unsigned token = *in++;
    int literal = length(&in, end, token >> 4);
    if (literal < 0 || literal > end-in || literal > limit-out) return 0;
    __builtin_memcpy(out, in, literal); out+=literal; in+=literal;
    if (in==end) return out==limit;
    if (end-in < 2) return 0;
    unsigned back=in[0] | (in[1]<<8); in+=2;
    if (!back || back>out-start) return 0;
    int n=length(&in,end,token & 15); if(n<0 || limit-out<n+4) return 0; n+=4;
    if ((unsigned)n<=back) { __builtin_memcpy(out,out-back,n);out+=n;continue; }
    byte *source=out-back;
    while ((unsigned)n>back) { __builtin_memcpy(out,source,back);out+=back;n-=back;back*=2; }
    __builtin_memcpy(out,source,n);out+=n;
  }
  return 0;
}
