"""Generates GeoTIFF test maps: a coordinate grid with labels at round coordinates, so that the
position and the orientation of an imported map can be checked on the map of the app.

Requires rasterio (it bundles GDAL) and Pillow: python -m pip install rasterio pillow
Usage (from this folder):
  python generate_geotiffs.py            # e2e test file: geotiff-test-map.tif
  python generate_geotiffs.py --samples DIR  # also the samples for manual tests, in DIR
"""

import argparse
import math
import os
import tempfile

import numpy as np
import rasterio
from PIL import Image, ImageDraw, ImageFont
from rasterio.enums import Resampling
from rasterio.shutil import copy as copy_dataset
from rasterio.transform import Affine
from rasterio.warp import transform as transform_points

HERE = os.path.dirname(os.path.abspath(__file__))
UTM_33N = "EPSG:32633"
# FAO headquarters, Rome
ROME = (12.4893, 41.8835)


def to_crs(crs, lon, lat):
    xs, ys = transform_points("EPSG:4326", crs, [lon], [lat])
    return xs[0], ys[0]


def draw_map(width, height, affine, title, background, grid_step, label_format):
    """RGB image: background, grid lines at multiples of grid_step (CRS units), labels, title"""
    image = Image.new("RGB", (width, height), background)
    draw = ImageDraw.Draw(image)
    inverse = ~affine
    corners = [affine * (x, y) for x, y in [(0, 0), (width, 0), (0, height), (width, height)]]
    xs, ys = zip(*corners)
    font = ImageFont.load_default(size=max(12, width // 60))
    title_font = ImageFont.load_default(size=max(16, width // 30))
    line_width = max(1, width // 500)
    x_start = math.floor(min(xs) / grid_step) * grid_step
    y_start = math.floor(min(ys) / grid_step) * grid_step
    x_values = np.arange(x_start, max(xs) + grid_step, grid_step)
    y_values = np.arange(y_start, max(ys) + grid_step, grid_step)
    for x in x_values:
        draw.line([inverse * (x, min(ys)), inverse * (x, max(ys))], fill=(60, 60, 60), width=line_width)
    for y in y_values:
        draw.line([inverse * (min(xs), y), inverse * (max(xs), y)], fill=(60, 60, 60), width=line_width)
    # labels at every other intersection
    for i, x in enumerate(x_values):
        for j, y in enumerate(y_values):
            if (i + j) % 2:
                continue
            px, py = inverse * (x, y)
            if 0 <= px < width and 0 <= py < height:
                draw.ellipse([px - 4, py - 4, px + 4, py + 4], fill=(200, 0, 0))
                draw.text((px + 6, py + 4), label_format(x, y), fill=(0, 0, 0), font=font)
    # north-up frame and title (in the image: rotated with it)
    draw.rectangle([0, 0, width - 1, height - 1], outline=(0, 0, 160), width=line_width * 4)
    draw.rectangle([10, 10, 10 + width // 2, 20 + title_font.size * 2], fill=(255, 255, 255))
    draw.text((20, 15), title, fill=(0, 0, 160), font=title_font)
    return np.moveaxis(np.asarray(image), -1, 0)


def utm_label(x, y):
    return f"E {x:.0f}\nN {y:.0f}"


def degrees_label(x, y):
    return f"{y:.4f}\n{x:.4f}"


def write(path, data, crs=None, transform=None, cog=False, overviews=None, colormap=None, **options):
    profile = dict(driver="GTiff", width=data.shape[2], height=data.shape[1], count=data.shape[0], dtype=data.dtype, **options)
    if crs:
        profile.update(crs=crs, transform=transform)
    target = path
    if cog:
        target = os.path.join(tempfile.mkdtemp(), "source.tif")
        profile.pop("compress", None)
    with rasterio.open(target, "w", **profile) as dataset:
        dataset.write(data)
        if colormap:
            dataset.write_colormap(1, colormap)
    if overviews:
        with rasterio.open(target, "r+") as dataset:
            dataset.build_overviews(overviews, Resampling.average)
    if cog:
        copy_dataset(target, path, driver="COG", compress="JPEG", quality=85, overview_resampling="average")
    print(f"{path}: {os.path.getsize(path) // 1024} KB")


def utm_map(width, height, pixel_size, title, background, rotation=0):
    x0, y0 = to_crs(UTM_33N, *ROME)
    x0, y0 = math.floor(x0 / 100) * 100, math.ceil(y0 / 100) * 100
    affine = Affine.translation(x0, y0) * Affine.rotation(rotation) * Affine.scale(pixel_size, -pixel_size)
    return draw_map(width, height, affine, title, background, 100, utm_label), affine


def e2e_map(out_dir):
    data, affine = utm_map(1024, 768, 1, "Arena Mobile e2e - UTM 33N", (230, 240, 210))
    write(os.path.join(out_dir, "geotiff-test-map.tif"), data, UTM_33N, affine, cog=True)


def samples(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    data, affine = utm_map(4000, 3000, 0.5, "JPEG COG - UTM 33N - 0.5 m", (225, 240, 205))
    write(os.path.join(out_dir, "rome-utm33n-jpeg-cog.tif"), data, UTM_33N, affine, cog=True)

    data, affine = utm_map(2000, 1500, 1, "LZW strips, no overviews - UTM 33N", (240, 225, 205))
    write(os.path.join(out_dir, "rome-utm33n-lzw-strips.tif"), data, UTM_33N, affine, compress="lzw")

    data, affine = utm_map(1500, 1000, 1, "Rotated 20 degrees - UTM 33N", (210, 225, 245), rotation=20)
    write(os.path.join(out_dir, "rome-utm33n-rotated.tif"), data, UTM_33N, affine, compress="deflate", tiled=True, predictor=2)

    # geographic coordinates, palette: 4 colors, index 0 = no data (transparent) outside a circle
    lon0, lat0 = math.floor(ROME[0] * 1000) / 1000, math.ceil(ROME[1] * 1000) / 1000
    affine = Affine.translation(lon0 + 0.01, lat0) * Affine.scale(0.00001, -0.00001)
    rgb = draw_map(1600, 1200, affine, "Palette - EPSG:4326", (250, 250, 250), 0.002, degrees_label)
    gray = rgb.mean(axis=0)
    palette = np.where(gray < 100, 1, np.where(gray < 200, 2, 3)).astype(np.uint8)
    yy, xx = np.mgrid[0:1200, 0:1600]
    palette[(xx - 800) ** 2 + (yy - 600) ** 2 > 580**2] = 0
    colormap = {0: (0, 0, 0, 0), 1: (20, 20, 120, 255), 2: (200, 60, 60, 255), 3: (255, 245, 200, 255)}
    write(os.path.join(out_dir, "rome-wgs84-palette-nodata.tif"), palette[None], "EPSG:4326", affine,
          photometric="palette", colormap=colormap, nodata=0, compress="deflate")

    # RGBA: transparent hole in the middle
    data, affine = utm_map(1200, 900, 1, "RGBA with transparency - UTM 33N", (245, 215, 235))
    yy, xx = np.mgrid[0:900, 0:1200]
    alpha = np.where((xx - 900) ** 2 + (yy - 600) ** 2 < 200**2, 0, 255).astype(np.uint8)
    write(os.path.join(out_dir, "rome-utm33n-rgba.tif"), np.concatenate([data, alpha[None]]), UTM_33N,
          Affine.translation(affine.c + 2000, affine.f) * Affine.scale(1, -1), photometric="rgb", alpha="yes", compress="deflate")

    # British National Grid (OSGB36): the app warns that the datum shift to WGS84 is unknown
    x0, y0 = to_crs("EPSG:27700", -0.1276, 51.5072)
    affine = Affine.translation(math.floor(x0 / 100) * 100, math.ceil(y0 / 100) * 100) * Affine.scale(1, -1)
    data = draw_map(1200, 900, affine, "British National Grid (datum warning)", (215, 235, 235), 100, utm_label)
    write(os.path.join(out_dir, "london-osgb36-datum-warning.tif"), data, "EPSG:27700", affine, compress="lzw")

    # rejected: elevation model (32 bit float), plain TIFF without georeference
    yy, xx = np.mgrid[0:300, 0:400]
    dem = (100 + 20 * np.sin(xx / 30) + 15 * np.cos(yy / 25)).astype(np.float32)[None]
    _, affine = utm_map(400, 300, 10, "", (0, 0, 0))
    write(os.path.join(out_dir, "rejected-dem-float32.tif"), dem, UTM_33N, affine)
    data, _ = utm_map(400, 300, 1, "Not georeferenced", (230, 230, 230))
    write(os.path.join(out_dir, "rejected-not-georeferenced.tif"), data)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--samples", help="folder where the samples for manual tests are written")
    args = parser.parse_args()
    e2e_map(HERE)
    if args.samples:
        samples(args.samples)
