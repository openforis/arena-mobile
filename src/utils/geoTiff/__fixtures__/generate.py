"""Generates the GeoTIFF test fixtures and the values expected by the tests (computed by GDAL).

Requires rasterio (it bundles GDAL): python -m pip install rasterio
Run from this folder: python generate.py
"""

import json
import os

import numpy as np
import rasterio
from rasterio.crs import CRS
from rasterio.enums import Resampling
from rasterio.transform import Affine, from_origin
from rasterio.warp import transform

W, H = 40, 30
HERE = os.environ.get("FIXTURES_OUT_DIR") or os.path.dirname(os.path.abspath(__file__))

y, x = np.mgrid[0:H, 0:W]
RGB = np.stack([(x * 6) % 256, (y * 8) % 256, ((x + y) * 3) % 256]).astype(np.uint8)
UTM = from_origin(500000, 4650000, 10, 10)
UTM_33N = "EPSG:32633"
LCC = "+proj=lcc +lat_1=43 +lat_2=62 +lat_0=30 +lon_0=10 +x_0=0 +y_0=0 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs"

FIXTURES = {
    "rgb_lzw_strips.tif": {"data": RGB, "crs": UTM_33N, "transform": UTM, "compress": "lzw", "blockysize": 4},
    "rgb_deflate_tiled.tif": {"data": RGB, "crs": UTM_33N, "transform": UTM, "compress": "deflate", "predictor": 2, "tiled": True, "blockxsize": 16, "blockysize": 16},
    "rgb_packbits.tif": {"data": RGB, "crs": UTM_33N, "transform": UTM, "compress": "packbits"},
    "rgb_jpeg_ycbcr.tif": {"data": RGB, "crs": UTM_33N, "transform": UTM, "compress": "jpeg", "photometric": "ycbcr", "tiled": True, "blockxsize": 16, "blockysize": 16, "jpeg_quality": 95, "overviews": [2]},
    "rgba.tif": {"data": np.concatenate([RGB, np.where(x > 20, 255, 0)[None].astype(np.uint8)]), "crs": UTM_33N, "transform": UTM, "photometric": "rgb", "alpha": "yes"},
    "gray_nodata_4326.tif": {"data": RGB[:1], "crs": "EPSG:4326", "transform": from_origin(12.0, 42.0, 0.001, 0.001), "nodata": 0, "compress": "deflate"},
    "palette.tif": {"data": (RGB[:1] // 64), "crs": UTM_33N, "transform": UTM, "photometric": "palette", "colormap": {i: (i * 60, 255 - i * 60, 100, 255) for i in range(4)}},
    "rotated.tif": {"data": RGB, "crs": UTM_33N, "transform": Affine.translation(500000, 4650000) * Affine.rotation(20) * Affine.scale(10, -10)},
    "ed50_utm.tif": {"data": RGB, "crs": "EPSG:23033", "transform": UTM},
    "user_defined_lcc.tif": {"data": RGB, "crs": CRS.from_proj4(LCC), "transform": from_origin(150000, 1400000, 10, 10)},
    "osgb36_27700.tif": {"data": RGB, "crs": "EPSG:27700", "transform": from_origin(400000, 300000, 10, 10)},
    "uint16.tif": {"data": RGB.astype(np.uint16) * 100, "crs": UTM_33N, "transform": UTM},
    "no_georeference.tif": {"data": RGB},
}

PIXELS = [(0, 0), (17, 3), (39, 29), (25, 16)]


def write(name, data, overviews=None, colormap=None, **options):
    profile = dict(driver="GTiff", width=W, height=H, count=data.shape[0], dtype=data.dtype, **options)
    path = os.path.join(HERE, name)
    with rasterio.open(path, "w", **profile) as dataset:
        dataset.write(data)
        if colormap:
            dataset.write_colormap(1, colormap)
    if overviews:
        with rasterio.open(path, "r+") as dataset:
            dataset.build_overviews(overviews, Resampling.average)
    return path


def expected_values(path):
    with rasterio.open(path) as dataset:
        corners = None
        if dataset.crs:
            points = [(0, 0), (W, 0), (W, H), (0, H)]
            xs, ys = zip(*[dataset.transform * point for point in points])
            lons, lats = transform(dataset.crs, "EPSG:4326", xs, ys)
            corners = [[round(lat, 9), round(lon, 9)] for lon, lat in zip(lons, lats)]
        if dataset.dtypes[0] != "uint8":
            return {"corners": corners}
        data = dataset.read()
        mask = dataset.dataset_mask()
        colormap = dataset.colormap(1) if dataset.colorinterp[0].name == "palette" else None
        pixels = []
        for px, py in PIXELS:
            values = [int(v) for v in data[:, py, px]]
            if colormap:
                values = list(colormap[values[0]][:3])
            elif len(values) == 1:
                values = values * 3
            pixels.append({"x": px, "y": py, "rgba": values[:3] + [int(mask[py, px])]})
        return {"corners": corners, "pixels": pixels}


expected = {}
for name, options in FIXTURES.items():
    options = dict(options)
    data = options.pop("data")
    expected[name] = expected_values(write(name, data, **options))
with open(os.path.join(HERE, "expected.json"), "w") as file:
    json.dump(expected, file, indent=1)
