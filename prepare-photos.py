"""Turn a folder of downloaded pictures into the site's photo set.

Save whatever you find - Pinterest, a phone, a stock site - into _incoming/
named by the number from the list below. Extension does not matter, and the
size does not matter as long as it is big enough. Then:

    python prepare-photos.py

Each one is centre-cropped to the shape that slot needs, resized, saved as an
optimised .jpg under the name build.js looks for, and reported on. Anything you
have not supplied yet is listed at the end - the site shows a placeholder for
those, so a half-finished set is fine to publish.

Run `node build.js` afterwards.
"""

import os
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip install Pillow")

IN = "_incoming"
OUT = os.path.join("assets", "img")

# number -> (output filename, width, height, what it is)
SLOTS = {
    1:  ("hero.jpg",   2000, 1200, "Home page headline background"),
    2:  ("about.jpg",  1200,  800, "Beside 'We're Committed To Provide'"),
    3:  ("band.jpg",   1200,  400, "Behind the blue 'Need Any Roofing Help?' strip"),

    4:  ("work-1.jpg", 1200, 900, "Recent work gallery 1"),
    5:  ("work-2.jpg", 1200, 900, "Recent work gallery 2"),
    6:  ("work-3.jpg", 1200, 900, "Recent work gallery 3"),
    7:  ("work-4.jpg", 1200, 900, "Recent work gallery 4"),
    8:  ("work-5.jpg", 1200, 900, "Recent work gallery 5"),
    9:  ("work-6.jpg", 1200, 900, "Recent work gallery 6"),

    10: ("service-architectural-design.jpg",  1200, 900, "Architectural Design"),
    11: ("service-3d-visualization.jpg",      1200, 900, "3D Visualization"),
    12: ("service-interior-planning.jpg",     1200, 900, "Interior Planning"),
    13: ("service-roof-inspection.jpg",       1200, 900, "Roof Inspection"),
    14: ("service-roof-repair.jpg",           1200, 900, "Roof Repair"),
    15: ("service-roof-replacement.jpg",      1200, 900, "Roof Replacement"),
    16: ("service-roof-restoration.jpg",      1200, 900, "Roof Restoration"),
    17: ("service-roof-leak-repair.jpg",      1200, 900, "Roof Leak Repair"),
    18: ("service-flat-roof-coating.jpg",     1200, 900, "Flat Roof & Coating"),
    19: ("service-metal-roofing.jpg",         1200, 900, "Metal Roofing"),
    20: ("service-gutter-fascia.jpg",         1200, 900, "Gutter & Fascia"),
    21: ("service-stucco-parapet-repair.jpg", 1200, 900, "Stucco & Parapet Repair"),
    22: ("service-pergola.jpg",               1200, 900, "Pergola & Patio Covers"),
}

OK_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif", ".tif", ".tiff", ".avif"}


def listing():
    print("Save your pictures into %s/ named 1, 2, 3 ... like 7.jpg\n" % IN)
    for n in sorted(SLOTS):
        name, w, h, what = SLOTS[n]
        print("  %2d  %-34s %4dx%-5d %s" % (n, name, w, h, what))


def main():
    if "--list" in sys.argv:
        listing()
        return

    if not os.path.isdir(IN):
        os.makedirs(IN)
        print("Created %s/ - it is empty.\n" % IN)
        listing()
        return

    found = {}
    ignored = []
    for f in sorted(os.listdir(IN)):
        stem, ext = os.path.splitext(f)
        if ext.lower() not in OK_EXT:
            continue
        # "7", "7 (1)", "07-roof" all count as slot 7.
        digits = ""
        for ch in stem.strip():
            if ch.isdigit():
                digits += ch
            else:
                break
        if not digits or int(digits) not in SLOTS:
            ignored.append(f)
            continue
        found.setdefault(int(digits), os.path.join(IN, f))

    if not found:
        print("Nothing numbered found in %s/.\n" % IN)
        if ignored:
            print("These were skipped because they do not start with a number:")
            for f in ignored:
                print("   ", f)
            print()
        listing()
        return

    os.makedirs(OUT, exist_ok=True)
    done, small = 0, []

    for n in sorted(found):
        name, w, h, what = SLOTS[n]
        src = found[n]
        im = Image.open(src)
        im = ImageOps.exif_transpose(im)      # honour phone rotation
        if im.width < w * 0.6 or im.height < h * 0.6:
            small.append("%s (%dx%d, wanted %dx%d)" % (name, im.width, im.height, w, h))
        im = im.convert("RGB")
        # Centre-crop to the slot's shape, then resize. ImageOps.fit does both.
        im = ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, 0.5))
        dst = os.path.join(OUT, name)
        im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
        print("  %-34s <- %s  (%d KB)" % (name, os.path.basename(src),
                                          round(os.path.getsize(dst) / 1024)))
        done += 1

    print("\n%d of %d done." % (done, len(SLOTS)))

    if small:
        print("\nThese sources were small, so they will look soft. Find bigger ones if you can:")
        for s in small:
            print("   ", s)

    if ignored:
        print("\nSkipped (name does not start with a number):")
        for f in ignored:
            print("   ", f)

    missing = [n for n in sorted(SLOTS) if n not in found]
    if missing:
        print("\nStill to come - these show a placeholder until you add them:")
        for n in missing:
            name, w, h, what = SLOTS[n]
            print("  %2d  %-34s %4dx%-5d %s" % (n, name, w, h, what))
    else:
        print("\nFull set. Nothing left.")

    print("\nNow run:  node build.js")


if __name__ == "__main__":
    main()
