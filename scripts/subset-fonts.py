#!/usr/bin/env python3
"""Regenerate the embedded font cores from the unchanged public/fonts originals.

Optional maintenance tool: Python 3, libharfbuzz-subset, woff2_decompress and
woff2_compress must already be installed. Run from any directory. HarfBuzz's
default glyph, layout and hinting closure is retained; temporary TTFs are removed.
Font licenses remain in public/fonts alongside the original fonts.
"""

import ctypes as c
from ctypes.util import find_library
from pathlib import Path
import shutil
import subprocess
from tempfile import TemporaryDirectory


TEXT_RANGES = ((0x20, 0x3FF), (0x1D00, 0x1EFF), (0x2000, 0x25FF))
MATH_RANGES = ((0x20, 0x3FF), (0x2000, 0x25FF), (0x27C0, 0x2AFF), (0x1D400, 0x1D7FF), (0xFE00, 0xFE0F))
FONTS = (
    ("alegreya-regular", TEXT_RANGES),
    ("alegreya-italic", TEXT_RANGES),
    ("special-elite-regular", TEXT_RANGES),
    ("garamond-math", MATH_RANGES),
)
HB_SUBSET_SETS_NAME_ID = 4


def bind(library, name, result, *arguments):
    function = getattr(library, name)
    function.restype = result
    function.argtypes = arguments
    return function


def main():
    hb_path = find_library("harfbuzz")
    subset_path = find_library("harfbuzz-subset")

    if not hb_path or not subset_path:
        raise SystemExit("Install the optional HarfBuzz subset tools before regenerating fonts.")

    hb = c.CDLL(hb_path)
    subset = c.CDLL(subset_path)
    blob_create = bind(hb, "hb_blob_create_from_file_or_fail", c.c_void_p, c.c_char_p)
    blob_destroy = bind(hb, "hb_blob_destroy", None, c.c_void_p)
    blob_data = bind(hb, "hb_blob_get_data", c.c_void_p, c.c_void_p, c.POINTER(c.c_uint))
    face_create = bind(hb, "hb_face_create", c.c_void_p, c.c_void_p, c.c_uint)
    face_destroy = bind(hb, "hb_face_destroy", None, c.c_void_p)
    face_blob = bind(hb, "hb_face_reference_blob", c.c_void_p, c.c_void_p)
    input_create = bind(subset, "hb_subset_input_create_or_fail", c.c_void_p)
    input_destroy = bind(subset, "hb_subset_input_destroy", None, c.c_void_p)
    input_unicode = bind(subset, "hb_subset_input_unicode_set", c.c_void_p, c.c_void_p)
    input_set = bind(subset, "hb_subset_input_set", c.c_void_p, c.c_void_p, c.c_uint)
    add_range = bind(hb, "hb_set_add_range", None, c.c_void_p, c.c_uint32, c.c_uint32)
    subset_face = bind(subset, "hb_subset_or_fail", c.c_void_p, c.c_void_p, c.c_void_p)
    version = bind(hb, "hb_version_string", c.c_char_p)
    root = Path(__file__).resolve().parents[1]
    output = root / "src/assets/fonts"
    generated = []

    with TemporaryDirectory(prefix="uruk-fonts-") as temporary:
        work = Path(temporary)

        for name, ranges in FONTS:
            original = root / "public/fonts" / f"{name}.woff2"
            compressed = work / original.name
            shutil.copyfile(original, compressed)
            subprocess.run(["woff2_decompress", str(compressed)], check=True)
            blob = blob_create(str(compressed.with_suffix(".ttf")).encode())
            face = face_create(blob, 0) if blob else None
            options = input_create()
            result = None
            result_blob = None

            try:
                if not face or not options:
                    raise RuntimeError(f"Cannot open {original.name} for subsetting.")

                characters = input_unicode(options)
                # Keep embedded license text and its URL alongside the default names.
                add_range(input_set(options, HB_SUBSET_SETS_NAME_ID), 13, 14)

                for first, last in ranges:
                    add_range(characters, first, last)

                result = subset_face(face, options)

                if not result:
                    raise RuntimeError(f"HarfBuzz could not subset {original.name}.")

                result_blob = face_blob(result)
                length = c.c_uint()
                data = blob_data(result_blob, c.byref(length))

                if not data or length.value == 0:
                    raise RuntimeError(f"HarfBuzz returned no font data for {original.name}.")

                target = work / f"{name}-core.ttf"
                target.write_bytes(c.string_at(data, length.value))
                subprocess.run(["woff2_compress", str(target)], check=True)
                generated.append((target.with_suffix(".woff2"), original.stat().st_size))
            finally:
                if result_blob:
                    blob_destroy(result_blob)
                if result:
                    face_destroy(result)
                if options:
                    input_destroy(options)
                if face:
                    face_destroy(face)
                if blob:
                    blob_destroy(blob)

        output.mkdir(parents=True, exist_ok=True)
        print(f"HarfBuzz {version().decode()}")

        for font, original_size in generated:
            shutil.copyfile(font, output / font.name)
            print(f"{font.name}: {font.stat().st_size:,} bytes, original {original_size:,}")


if __name__ == "__main__":
    main()
