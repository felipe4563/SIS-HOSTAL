import sys
import os
import cv2
import numpy as np
from PIL import Image

def stitch(input_folder, output_path):
    exts = ('.jpg', '.jpeg', '.png')
    files = sorted([
        os.path.join(input_folder, f)
        for f in os.listdir(input_folder)
        if f.lower().endswith(exts)
    ])

    if len(files) < 4:
        print("ERROR: Se necesitan al menos 4 imágenes", file=sys.stderr)
        sys.exit(1)

    images = [cv2.imread(f) for f in files]
    images = [img for img in images if img is not None]

    if len(images) < 4:
        print("ERROR: No se pudieron leer las imágenes", file=sys.stderr)
        sys.exit(1)

    stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
    status, panorama = stitcher.stitch(images)

    if status != cv2.Stitcher_OK:
        codes = {
            cv2.Stitcher_ERR_NEED_MORE_IMGS: "pocas imágenes o poca superposición",
            cv2.Stitcher_ERR_HOMOGRAPHY_EST_FAIL: "no se encontraron puntos comunes",
            cv2.Stitcher_ERR_CAMERA_PARAMS_ADJUST_FAIL: "error al ajustar parámetros",
        }
        msg = codes.get(status, f"código {status}")
        print(f"ERROR: No se pudo coser el panorama — {msg}", file=sys.stderr)
        sys.exit(2)

    rgb = cv2.cvtColor(panorama, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    w, h = pil.size
    target_w = max(w, 4096)
    target_h = target_w // 2
    pil = pil.resize((target_w, target_h), Image.LANCZOS)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    pil.save(output_path, 'JPEG', quality=90)
    print(output_path)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python stitch360.py <carpeta_entrada> <ruta_salida>", file=sys.stderr)
        sys.exit(1)
    stitch(sys.argv[1], sys.argv[2])
