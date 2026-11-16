import type { FilmSetup } from './controller';

export type Numerics = {
  /** Marks the film's calculation as finished. Checks and capture tools wait for this. */
  ready: () => void;
  /** Records a failure, stops the worker and redraws. */
  fail: (reason: string) => void;
};

type NumericsOptions<Message> = {
  /** Constructs the worker. The `new Worker(new URL(...))` expression must stay in the film so the bundler finds it. */
  start: () => Worker;
  onMessage: (message: Message, numerics: Numerics) => void;
  /** Lets the film show the failure in its drawing. */
  onFailure?: (reason: string) => void;
  /** Failure texts for a worker that cannot start, cannot finish, or returns data that cannot be transferred. */
  cannotStart?: string;
  cannotFinish?: string;
  cannotTransfer?: string;
};

/**
 * Runs a film's worker for the lifetime of the film element.
 * Pending, ready and error attributes report the calculation's state; all are cleared on disconnect.
 */
export function runNumerics<Message>({ root, signal, redraw }: Pick<FilmSetup, 'root' | 'signal' | 'redraw'>, options: NumericsOptions<Message>): Worker | undefined {
  let worker: Worker | undefined;

  function clear(): void {
    root.removeAttribute('data-numerics-pending');
    root.removeAttribute('data-numerics-ready');
    root.removeAttribute('data-numerics-error');
  }

  function report(reason: string): void {
    options.onFailure?.(reason);
    root.removeAttribute('data-numerics-pending');
    root.removeAttribute('data-numerics-ready');
    root.setAttribute('data-numerics-error', reason);
    worker?.terminate();
  }

  const numerics: Numerics = {
    ready() {
      root.removeAttribute('data-numerics-pending');
      root.removeAttribute('data-numerics-error');
      root.setAttribute('data-numerics-ready', '');
    },
    fail(reason) {
      report(reason);
      redraw();
    },
  };

  clear();
  root.setAttribute('data-numerics-pending', '');
  signal.addEventListener('abort', () => {
    worker?.terminate();
    clear();
  }, { once: true });

  try {
    worker = options.start();
  } catch (cause) {
    report(options.cannotStart ?? (cause instanceof Error ? cause.message : String(cause)));

    return undefined;
  }

  worker.addEventListener('message', (event: MessageEvent<Message>) => options.onMessage(event.data, numerics), { signal });
  worker.addEventListener('error', (event) => {
    numerics.fail(event.message || (options.cannotFinish ?? 'The numerical calculation could not finish.'));
  }, { signal });
  worker.addEventListener('messageerror', () => {
    numerics.fail(options.cannotTransfer ?? 'The computed data could not be transferred.');
  }, { signal });

  return worker;
}
