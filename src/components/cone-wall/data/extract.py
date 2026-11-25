"""Rebuild the cone atlas with Pillow, NumPy and OpenCV. The UI draws at Dig's 1:3 scale."""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

DATA = Path(__file__).resolve().parent
SOURCES = DATA.parents[2] / "assets/home"


def plate(name):
    image = Image.open(SOURCES / (name + ".webp")).convert("RGBA")
    if name != "lozenge":
        left, width, height = (41, 168, 315) if name == "zigzag" else (81, 84, 384)
        return np.asarray(image.crop((left, height, left + width, 2 * height)))

    # The two ends of this original do not meet. The seam selects whole ink heads
    # from overlapping upright strips, winding through the paper between diamonds.
    join = json.loads((DATA / "lozenge-join.json").read_text())
    seam = np.asarray(join["columns"])
    width, height = join["pitch"], len(seam)
    top = join["offsetY"]
    source = np.tile(np.asarray(image)[top:top + height], (3, 1, 1))
    count, ids, stats, centres = cv2.connectedComponentsWithStats((source[:, :, 3] > 0).astype("uint8"), 8)
    tile = np.zeros((height, width, 4), "uint8")

    for label in range(1, count):
        if not height <= centres[label, 1] < 2 * height:
            continue

        x, y, w, h, _ = stats[label]
        yy, xx = np.where(ids[y:y+h, x:x+w] == label)
        xx += x
        yy += y
        alpha = source[yy, xx, 3]
        inside = (xx >= seam[yy % height]) & (xx < width + seam[yy % height])
        if alpha[inside].sum() < 0.5 * alpha.sum():
            continue

        assert x > 0 and x + w < source.shape[1]
        assert not tile[yy % height, xx % width, 3].any()
        tile[yy % height, xx % width] = source[yy, xx]

    return np.roll(tile, -join["origin"], axis=1)


def separate_heads(patch, ink):
    # Cutting can join neighbouring heads at a narrow neck. Find their solid cores,
    # then give each original fringe pixel to its nearest core without changing its alpha.
    solid = np.uint8((patch[:, :, 3] > 75) & ink)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    cores = cv2.erode(solid, kernel, borderType=cv2.BORDER_CONSTANT, borderValue=0)
    count, ids, stats, _ = cv2.connectedComponentsWithStats(cores, 8)
    seeds = [label for label in range(1, count) if stats[label, 4] >= 9]
    if len(seeds) <= 1:
        return [ink]

    empty = np.uint8(~np.isin(ids, seeds))
    _, nearest = cv2.distanceTransformWithLabels(empty, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_CCOMP)
    return [ink & (nearest == label) for label in np.unique(nearest[ink])]


def extract(tile, sprites):
    height, width = tile.shape[:2]
    # The periodic neighbourhood preserves heads that straddle either repeat edge.
    field = np.tile(tile, (3, 3, 1))
    count, labels, stats, centres = cv2.connectedComponentsWithStats(np.uint8(field[:, :, 3] > 0), 8)
    heads = []
    for label in range(1, count):
        cx, cy = centres[label]
        if not (width <= cx < 2 * width and height <= cy < 2 * height):
            continue

        x, y, w, h, _ = stats[label]
        patch = field[y:y+h, x:x+w].copy()
        ink = labels[y:y+h, x:x+w] == label
        patch[~ink] = 0
        for head in separate_heads(patch, ink):
            yy, xx = np.where(head)
            x0, x1 = xx.min(), xx.max() + 1
            y0, y1 = yy.min(), yy.max() + 1
            pixels = patch[y0:y1, x0:x1].copy()
            pixels[~head[y0:y1, x0:x1]] = 0
            heads.append([int(x + x0 - width), int(y + y0 - height), len(sprites)])
            sprites.append(pixels)

    return {"width": width, "height": height, "heads": heads}


def pack(sprites):
    boxes = [None] * len(sprites)
    x = y = 2
    row = 0
    for index in sorted(range(len(sprites)), key=lambda i: -sprites[i].shape[0]):
        height, width = sprites[index].shape[:2]
        if x + width + 2 > 768:
            x = 2
            y += row + 4
            row = 0
        boxes[index] = [x, y, width, height]
        row = max(row, height)
        x += width + 4

    # Transparent gutters prevent neighbouring woodcuts from bleeding into a sample.
    atlas = np.zeros((y + row + 2, 768, 4), np.uint8)
    for sprite, (x, y, w, h) in zip(sprites, boxes):
        atlas[y:y+h, x:x+w] = sprite
    Image.fromarray(atlas).save(DATA / "heads.webp", lossless=True, quality=100, method=6)
    return boxes


sprites = []
tiles = {name: extract(plate(name), sprites) for name in ["zigzag", "lozenge", "slant"]}
boxes = pack(sprites)
for name, tile in tiles.items():
    reconstructed = np.zeros((tile["height"], tile["width"]), np.uint8)
    for head in tile["heads"]:
        x, y, index = head
        head[:] = [x, y, *boxes[index]]
        alpha = sprites[index][:, :, 3]
        yy, xx = np.where(alpha > 0)
        reconstructed[(y + yy) % tile["height"], (x + xx) % tile["width"]] = alpha[yy, xx]

    assert np.array_equal(reconstructed, plate(name)[:, :, 3]), name

(DATA / "heads.json").write_text(json.dumps(tiles, separators=(",", ":")) + "\n")
