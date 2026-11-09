import { createPlayer, type Player } from '../../plate/player';
import { bindTrack, wake, type Track } from '../../plate/track';
import { BAND_COUNT, BAND_HEIGHT } from './maps';
import { FILM_PERIOD, START_STEP, describeStep, stepAt, timeOfStep } from './steps';

class UrukThompsonBands extends HTMLElement {
  private track: Track | undefined;
  private player: Player | undefined;
  private readout: HTMLElement | null = null;

  private readonly onClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('[data-reset]')) {
      this.player?.seek(timeOfStep(START_STEP));
    }
  };

  connectedCallback(): void {
    const track = this.querySelector<HTMLElement>('[data-track]');
    this.readout = this.querySelector<HTMLElement>('[data-readout]');

    if (!track) {
      return;
    }

    this.track = bindTrack(track, {
      min: 1,
      max: BAND_COUNT,
      step: 1,
      page: 1,
      value: START_STEP,
      describe: describeStep,
      // The reader has taken over: the film stops on the step they chose.
      onInput: (step) => {
        this.player?.pause();
        this.player?.seek(timeOfStep(step));
      },
    });
    this.player = createPlayer(this, {
      period: FILM_PERIOD,
      start: timeOfStep(START_STEP),
      onFrame: (time) => this.show(stepAt(time)),
    });
    this.addEventListener('click', this.onClick);
    wake(this);
  }

  disconnectedCallback(): void {
    this.track?.destroy();
    this.player?.destroy();
    this.removeEventListener('click', this.onClick);
  }

  // `step` runs from 1 to 8; between two whole steps the next band is drawn down from its top line.
  private show(step: number): void {
    for (const reveal of this.querySelectorAll<SVGRectElement>('[data-reveal]')) {
      const index = Number(reveal.dataset['reveal']);
      const share = Math.min(1, Math.max(0, step - index + 1));
      reveal.setAttribute('height', ((BAND_HEIGHT + 2) * share).toFixed(2));
      this.querySelector(`[data-band="${index}"]`)?.toggleAttribute('data-later', share === 0);
    }

    this.track?.glide(step);

    if (this.readout) {
      this.readout.textContent = `Step ${Math.round(step)} of ${BAND_COUNT}`;
    }
  }
}

if (!customElements.get('uruk-thompson-bands')) {
  customElements.define('uruk-thompson-bands', UrukThompsonBands);
}
