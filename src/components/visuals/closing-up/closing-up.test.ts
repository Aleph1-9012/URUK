import { expect, test } from 'bun:test';
import { buildClosingUpModel, integrateGeodesic, pointAtArcLength, type Vec3 } from './math';

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

test('345: RK4 agrees with exact round-sphere motion and the generic finite trace converges under step refinement', () => {
  const inclination = .4;
  const round = integrateGeodesic([1, 1, 1], [1, 0, 0], [0, Math.cos(inclination), Math.sin(inclination)], 4 * Math.PI, 2000);

  for (let index = 0; index < round.positions.length; index += 37) {
    const t = index * round.step;
    const point = round.positions[index];
    const velocity = round.velocities[index];

    if (!point || !velocity) throw new Error('The round-sphere comparison needs both numerical states.');

    expect(distance(point, [Math.cos(t), Math.cos(inclination) * Math.sin(t), Math.sin(inclination) * Math.sin(t)])).toBeLessThan(2e-8);
    expect(distance(velocity, [-Math.sin(t), Math.cos(inclination) * Math.cos(t), Math.sin(inclination) * Math.cos(t)])).toBeLessThan(2e-8);
  }

  const model = buildClosingUpModel();
  const refined = integrateGeodesic(model.axes, model.generic.start, model.generic.tangent, model.generic.path.length, 40000);

  for (let index = 0; index < model.generic.path.positions.length; index += 139) {
    const point = model.generic.path.positions[index];
    const reference = refined.positions[index * 2];

    if (!point || !reference) throw new Error('Step refinement must compare the same arc-length samples.');

    expect(distance(point, reference)).toBeLessThan(1e-7);
    expect(Math.abs((point[0] / model.axes[0]) ** 2 + (point[1] / model.axes[1]) ** 2 + (point[2] / model.axes[2]) ** 2 - 1)).toBeLessThan(1e-7);
  }

  expect(model.generic.maxSurfaceError).toBeLessThan(1e-7);
  expect(model.generic.maxSpeedError).toBeLessThan(1e-12);
});

test('345: principal curves close in position and direction while repeated traversals keep the same ellipse image', () => {
  const model = buildClosingUpModel();
  const normals = model.roundCircles.map((path): Vec3 => {
    const position = path.positions[0];
    const velocity = path.velocities[0];

    if (!position || !velocity) throw new Error('Each great circle needs its plane-defining position and tangent.');

    return [
      position[1] * velocity[2] - position[2] * velocity[1],
      position[2] * velocity[0] - position[0] * velocity[2],
      position[0] * velocity[1] - position[1] * velocity[0],
    ];
  });

  for (let first = 0; first < normals.length; first++) {
    for (let second = first + 1; second < normals.length; second++) {
      const a = normals[first];
      const b = normals[second];

      if (!a || !b) throw new Error('Every great-circle image comparison needs both plane normals.');

      const cosine = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(...a) * Math.hypot(...b));
      expect(Math.abs(cosine)).toBeLessThan(1 - 1e-12);
    }
  }

  for (const principal of model.principal) {
    expect(principal.closurePosition).toBeLessThan(1e-6);
    expect(principal.closureDirection).toBeLessThan(1e-6);
    const missing = principal.name === 'xy' ? 2 : principal.name === 'xz' ? 1 : 0;

    for (let index = 0; index < principal.path.positions.length; index += 43) {
      const point = principal.path.positions[index];

      if (!point) throw new Error('A principal ellipse needs each sampled plane point.');

      expect(Math.abs(point[missing])).toBeLessThan(1e-12);
    }
  }

  for (const error of [model.sameImage.oneLapClosure, model.sameImage.twoLapClosure]) {
    expect(error.position).toBeLessThan(1e-6);
    expect(error.direction).toBeLessThan(1e-6);
  }

  for (const point of model.sameImage.path.positions) {
    expect(Math.abs((point[0] / model.axes[0]) ** 2 + (point[1] / model.axes[1]) ** 2 - 1)).toBeLessThan(1e-7);
    expect(Math.abs(point[2])).toBeLessThan(1e-12);
  }

  const xy = model.principal[0];

  if (!xy) throw new Error('The same-image interpolation needs its original ellipse.');

  for (const fraction of [.1, .37, .74]) {
    expect(distance(pointAtArcLength(xy.path, fraction * xy.perimeter), pointAtArcLength(model.sameImage.path, fraction * xy.perimeter))).toBeLessThan(1e-12);
  }
});
