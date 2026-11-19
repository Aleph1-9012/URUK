import { defineFilm } from '../../plate/controller';
import { runNumerics } from '../../plate/numerics';
import { FastestRoutesFilm } from './film';
import { createRouteModel } from './math';
import type { RouteRequest, RouteResponse } from './protocol';
import { TIMELINE } from './story';

defineFilm('uruk-fastest-routes', TIMELINE, (film) => {
  const model = createRouteModel();
  const drawing = new FastestRoutesFilm(film.root, film.context, model);
  const worker = runNumerics<RouteResponse>(film, {
    start: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    onMessage(result, numerics) {
      if (result.kind === 'failed') {
        numerics.fail(result.reason);

        return;
      }

      const routes = result.result;
      const count = model.N * model.N;

      if (routes.centre.source !== model.source || routes.centre.distances.length !== count || routes.centre.predecessors.length !== count || routes.targets.length === 0 || routes.tree.offsets.length < 2) {
        numerics.fail('The transferred routes do not match this grid.');

        return;
      }

      model.computation = { kind: 'ready', result: routes };
      numerics.ready();
      worker?.terminate();
      film.redraw();
    },
    cannotStart: 'The full-grid fastest-route calculation could not start.',
    cannotFinish: 'The full-grid fastest-route calculation could not finish.',
    cannotTransfer: 'The computed routes could not be transferred.',
  });
  const request: RouteRequest = { kind: 'compute' };
  worker?.postMessage(request);

  return drawing;
});
