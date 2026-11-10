import type { ReciprocalModel } from './math';
import { completionFrame, stackProgress } from './story';
import { text, type Box, type Colors, type Place } from './drawing';

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: ReciprocalModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  const size = tall ? 11 : 14;
  const titleSize = tall ? 14 : 18;
  const width = box.w - 8;
  const at = (fraction: number) => box.y + box.h * fraction;
  const label = (words: string, fraction: number, fontSize = size) => text(pen, words, x, at(fraction), fontSize, width, colors);
  const heading = (words: string) => label(words, .10, titleSize);

  if (time < 6000) {
    heading('ONE RUN, A CONSTANT GAP');
    label('5, 8, 11, 14', .46, tall ? 18 : 23);
    label('THREE EQUAL STEPS OF +3', .84);

    return;
  }

  if (time < 22000) {
    heading("ERDŐS'S QUESTION · $5,000");
    label(tall ? 'A DIVERGENT RECIPROCAL SUM\nWOULD FORCE RUNS OF EVERY LENGTH' : 'WOULD A DIVERGENT RECIPROCAL SUM FORCE RUNS OF EVERY LENGTH?', .41);
    label('THE GAUGE SHOWS FINITE PARTIAL SUMS', .89);

    return;
  }

  if (time < 29000) {
    heading(tall ? 'PRIMES GET RARER,\nTHE SUM STILL DIVERGES' : 'PRIMES GET RARER, THE SUM STILL DIVERGES');
    label(`PRIMES UP TO ${model.gauges.limit.toLocaleString('en-US')}: ${model.gauges.primeSum.toFixed(3)}`, .40);
    label(`${tall ? 'ALL UP TO' : 'ALL INTEGERS UP TO'} ${model.gauges.limit.toLocaleString('en-US')}: ${model.gauges.harmonicSum.toFixed(3)}`, .65);
    label(tall ? 'FINITE READINGS\nEULER PROVED DIVERGENCE IN 1737' : 'FINITE READINGS · EULER PROVED DIVERGENCE IN 1737', .87);

    return;
  }

  if (time < 37000) {
    heading(tall ? 'INFINITE SET\nRECIPROCAL SUM LIMIT 2' : 'INFINITE SET · RECIPROCAL SUM LIMIT 2');
    label(tall ? `FIRST 20 POWERS: ${model.gauges.powerSum.toFixed(6)}` : `FIRST 20 POWERS: ${model.gauges.powerSum.toFixed(6)} · NEVER PAST 2`, .40);
    label('4 + 16 = 20 · 2 × 8 = 16', .65);
    label(tall ? 'NO NONTRIVIAL PROGRESSION\nOF LENGTH 3 OR MORE' : 'NO NONTRIVIAL PROGRESSION OF LENGTH 3 OR MORE', .87);

    return;
  }

  if (time < 46000) {
    heading(`MAXIMUM ${model.r14.size} OF 14`);
    place('r3-nine', box.x + box.w * .27, at(.45));
    place('r3-fourteen', box.x + box.w * .73, at(.45));
    label('FOUND BY TRYING EVERY SET · COMPUTED EXACTLY', .88);

    return;
  }

  if (time < 55000) {
    heading(tall ? 'SIX ADDITIONS SHOW\nTHIS SET IS MAXIMAL' : 'SIX ADDITIONS SHOW THIS SET IS MAXIMAL');
    const completion = model.completions[completionFrame(time).index];

    if (!completion) throw new Error('Each of the six missing numbers has its computed completing progression.');

    if (time >= 46500) label(`+${completion.added} MAKES ${completion.progression.join(', ')}`, .43);

    label(tall ? `ALL ${model.nineSetCheck.count.toLocaleString('en-US')} NINE-SETS CHECKED\nEVERY ONE CONTAINS A PROGRESSION` : `ALL ${model.nineSetCheck.count.toLocaleString('en-US')} NINE-SETS: ${model.nineSetCheck.withProgression.toLocaleString('en-US')} CONTAIN A PROGRESSION`, .65);
    label(tall ? 'SEPARATE CHECK:\nMAXIMUM 8 IS CERTIFIED' : 'THE SEPARATE EXHAUSTIVE CHECK CERTIFIES MAXIMUM 8', .89);

    return;
  }

  if (time < 64000) {
    heading('A AVOIDS k-TERM PROGRESSIONS');
    place('dyadic-block', x, at(.36));
    place('block-bound', x, at(.64));
    label(tall ? 'INDEPENDENT BLOCK CAPACITIES\nFOR MEMBERS a IN THE BLOCK' : 'INDEPENDENT BLOCK CAPACITIES · MEMBERS a IN THE BLOCK', .87);

    return;
  }

  if (time < 72250) {
    const settled = stackProgress(time) === 1;
    heading(settled ? `${model.partialBound.toFixed(2)} SO FAR` : 'STACKING THE UPPER CAPACITIES');
    label('1 + 1 + 0.75 + 0.5 + 0.5', .44, tall ? 15 : 20);
    label(tall ? 'FOUR INDEPENDENT BLOCK CAPS\nPLUS THE SINGLETON {1}' : 'FOUR INDEPENDENT BLOCK CAPS PLUS THE SINGLETON {1}', .70);
    label('A FINITE PARTIAL BOUND · NOT THE LIMIT', .94);

    return;
  }

  if (time < 78250) {
    heading('VANISHING IS NOT ENOUGH');
    label('NEED SUMMABLE DYADIC DECAY', .43, tall ? 13 : 18);
    label('FOUR BARS: EXACT THREE-TERM VALUES', .70);
    label('LATER TERMS ARE NOT COMPUTED', .94);

    return;
  }

  if (time < 90000) {
    heading('CLAIMED FOR EVERY FIXED k ≥ 3');
    place('claimed-bound', x, at(.37));
    place('claimed-decay', x, at(.62));
    label(tall ? 'POSITIVE CONSTANTS UNSPECIFIED\nCURVE SCHEMATIC' : 'POSITIVE CONSTANTS UNSPECIFIED · CURVE SCHEMATIC', .88);

    return;
  }

  heading('UNREVIEWED');
  label(tall ? 'LEAN PROVES THE COROLLARY\nBY A WEAKER BOUND' : 'LEAN PROVES THE COROLLARY, BY A WEAKER BOUND', .43);
  label(tall ? 'THE BLUE CURVE IS CLAIMED DECAY,\nDRAWN SCHEMATICALLY' : 'THE BLUE CURVE IS THE CLAIMED DECAY, DRAWN SCHEMATICALLY', .80);
}
