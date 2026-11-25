/** Let input, rendering and cancellation run between batches of native-resolution artwork. */
export function preparation(signal: AbortSignal) {
  let deadline = performance.now() + 6;

  async function yieldTask() {
    signal.throwIfAborted();
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    signal.throwIfAborted();
    deadline = performance.now() + 6;
  }

  return { due: () => performance.now() >= deadline, yieldTask };
}

export type Preparation = ReturnType<typeof preparation>;
