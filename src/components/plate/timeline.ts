export type TimedCue = { readonly at: number };

export type FilmTimeline = {
  readonly cues: readonly TimedCue[];
  readonly duration: number;
  cueAt: (time: number) => number;
  cueEnd: (index: number) => number;
  stillTime: (index: number) => number;
  formatTime: (time: number) => string;
};

export function createTimeline(cues: readonly TimedCue[], duration: number, settleBeforeEnd: number): FilmTimeline {
  function cueAt(time: number): number {
    let index = 0;

    for (const [position, cue] of cues.entries()) {
      if (time >= cue.at) index = position;
    }

    return index;
  }

  function cueEnd(index: number): number {
    return cues[index + 1]?.at ?? duration;
  }

  return {
    cues,
    duration,
    cueAt,
    cueEnd,
    stillTime(index) {
      return index === cues.length - 1 ? duration : cueEnd(index) - settleBeforeEnd;
    },
    formatTime(time) {
      const seconds = Math.floor(Math.max(0, Math.min(duration, time)) / 1000);

      return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    },
  };
}
