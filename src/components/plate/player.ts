export type PlayerOptions = {
  // The film's duration, in milliseconds.
  period: number;
  // Match the first picture already rendered in the HTML.
  start: number;
  loop?: boolean;
  onFrame: (time: number) => void;
};

export type Player = {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  destroy: () => void;
};

const LONGEST_STEP = 100;

export function createPlayer(root: HTMLElement, options: PlayerOptions): Player {
  const button = root.querySelector<HTMLButtonElement>('[data-play]');
  const label = button?.querySelector('[data-play-label]');
  const viewport = root.querySelector('[data-film-viewport]') ?? root;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loop = options.loop ?? true;
  let time = fitTime(options.start);
  let playing = !motion.matches && !finished();
  let visible = false;
  let frame: number | undefined;
  let last: number | undefined;

  function fitTime(next: number): number {
    if (loop) {
      return ((next % options.period) + options.period) % options.period;
    }

    return Math.min(options.period, Math.max(0, next));
  }

  function finished(): boolean {
    return !loop && time === options.period;
  }

  function canRun(): boolean {
    return playing && visible && !document.hidden;
  }

  function tick(now: number): void {
    frame = undefined;

    if (!canRun()) {
      last = undefined;

      return;
    }

    time = fitTime(time + Math.min(LONGEST_STEP, now - (last ?? now)));
    last = now;
    options.onFrame(time);

    if (finished()) {
      playing = false;
    }

    run();
  }

  function run(): void {
    if (canRun()) {
      if (frame === undefined) {
        frame = requestAnimationFrame(tick);
      }
    } else {
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
        frame = undefined;
      }

      last = undefined;
    }

    const text = finished() ? 'Replay' : playing ? 'Pause' : 'Play';

    if (label && label.textContent !== text) {
      label.textContent = text;
    }
  }

  function play(): void {
    if (finished()) {
      time = 0;
      options.onFrame(time);
    }

    playing = true;
    run();
  }

  function pause(): void {
    playing = false;
    run();
  }

  const onClick = () => {
    if (playing) {
      pause();
    } else {
      play();
    }
  };

  const onMotionChange = () => {
    if (motion.matches) {
      pause();
    }
  };

  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    run();
  });

  button?.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', run);
  motion.addEventListener('change', onMotionChange);
  observer.observe(viewport);
  run();

  return {
    play,
    pause,
    seek(next: number) {
      time = fitTime(next);
      last = undefined;

      if (finished()) {
        playing = false;
      }

      options.onFrame(time);
      run();
    },
    destroy() {
      pause();
      observer.disconnect();
      button?.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', run);
      motion.removeEventListener('change', onMotionChange);
    },
  };
}
