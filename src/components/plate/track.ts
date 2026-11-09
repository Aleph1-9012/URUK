// The wedge-line control under a plate: a slider for continuous values (61a) or a ruler of steps (62b).
// The track element is the ARIA slider; pointer, arrow keys, Page Up/Down, Home and End all move it.
export type TrackOptions = {
  min: number;
  max: number;
  step: number;
  page: number;
  value: number;
  describe: (value: number) => string;
  // `settled` is false while a pointer is still dragging, so a costly picture can draw roughly until it lets go.
  onInput: (value: number, settled: boolean) => void;
};

export type Track = {
  set: (value: number) => void;
  // For a playing film: the handle moves smoothly, while the value read out stays on a step.
  glide: (position: number) => void;
  destroy: () => void;
};

export function bindTrack(track: HTMLElement, options: TrackOptions): Track {
  const line = track.querySelector<HTMLElement>('[data-track-line]') ?? track;
  const stops = Array.from(track.querySelectorAll<HTMLElement>('[data-track-stop]'));
  let value = options.value;
  let pointer: number | undefined;

  function snap(next: number): number {
    const stepped = options.min + Math.round((next - options.min) / options.step) * options.step;

    return Math.min(options.max, Math.max(options.min, Number(stepped.toFixed(6))));
  }

  function render(position: number): void {
    track.style.setProperty('--value-at', String((position - options.min) / (options.max - options.min)));
    track.setAttribute('aria-valuenow', String(value));
    track.setAttribute('aria-valuetext', options.describe(value));

    // A step's sign stays pressed once the ruler has passed it.
    stops.forEach((stop, index) => {
      stop.toggleAttribute('data-passed', options.min + index * options.step < position);
    });
  }

  function change(next: number, settled: boolean): void {
    const snapped = snap(next);

    if (snapped === value && !settled) {
      return;
    }

    value = snapped;
    render(value);
    options.onInput(value, settled);
  }

  function fromPointer(event: PointerEvent): number {
    const bounds = line.getBoundingClientRect();
    const at = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));

    return options.min + at * (options.max - options.min);
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || pointer !== undefined) {
      return;
    }

    pointer = event.pointerId;
    track.setPointerCapture(event.pointerId);
    track.focus({ preventScroll: true });
    event.preventDefault();
    change(fromPointer(event), false);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId === pointer) {
      change(fromPointer(event), false);
    }
  };

  const onPointerEnd = (event: PointerEvent) => {
    if (event.pointerId !== pointer) {
      return;
    }

    pointer = undefined;
    change(value, true);
  };

  const keyMoves: Record<string, (current: number) => number> = {
    ArrowRight: (current) => current + options.step,
    ArrowUp: (current) => current + options.step,
    ArrowLeft: (current) => current - options.step,
    ArrowDown: (current) => current - options.step,
    PageUp: (current) => current + options.page,
    PageDown: (current) => current - options.page,
    Home: () => options.min,
    End: () => options.max,
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const move = keyMoves[event.key];

    if (!move) {
      return;
    }

    event.preventDefault();
    change(move(value), true);
  };

  track.addEventListener('pointerdown', onPointerDown);
  track.addEventListener('pointermove', onPointerMove);
  track.addEventListener('pointerup', onPointerEnd);
  track.addEventListener('pointercancel', onPointerEnd);
  track.addEventListener('keydown', onKeyDown);
  render(value);

  return {
    set(next: number) {
      value = snap(next);
      render(value);
    },
    glide(position: number) {
      const clamped = Math.min(options.max, Math.max(options.min, position));
      value = snap(clamped);
      render(clamped);
    },
    destroy() {
      track.removeEventListener('pointerdown', onPointerDown);
      track.removeEventListener('pointermove', onPointerMove);
      track.removeEventListener('pointerup', onPointerEnd);
      track.removeEventListener('pointercancel', onPointerEnd);
      track.removeEventListener('keydown', onKeyDown);
    },
  };
}

// Controls stay faded and inert in the HTML until their visual's script has taken them over.
export function wake(root: HTMLElement): void {
  for (const controls of root.querySelectorAll<HTMLElement>('[data-plate-controls]')) {
    controls.inert = false;
    controls.removeAttribute('data-waiting');
  }
}
