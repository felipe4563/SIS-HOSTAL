import sys, os, json, math
import cv2
import numpy as np
from PIL import Image

FOV_H_DEG = 70.0   # horizontal FOV - ligeramente mayor al real para garantizar solapamiento


def project_to_equirectangular(photos, output_w=4096):
    """
    Proyecta fotos con orientaciones conocidas sobre un canvas equirectangular.
    photos: lista de (img_bgr, alpha_deg, beta_deg)
      alpha: rumbo de la brújula (0-360°, 0=Norte, aumenta en sentido horario)
      beta:  ángulo de inclinación (negativo=mirando arriba, positivo=mirando abajo)
    """
    output_h = output_w // 2
    fov_h = math.radians(FOV_H_DEG)

    # Coordenadas esféricas para cada pixel equirectangular
    x_idx = np.arange(output_w, dtype=np.float32)
    y_idx = np.arange(output_h, dtype=np.float32)
    xx, yy = np.meshgrid(x_idx, y_idx)

    # lon: -pi (izq) a +pi (der)  |  lat: +pi/2 (arriba) a -pi/2 (abajo)
    lon = (xx / output_w) * 2 * math.pi - math.pi
    lat = math.pi / 2 - (yy / output_h) * math.pi

    # Vectores unitarios en espacio mundo (X=Este, Y=Arriba, Z=Norte)
    Px = np.cos(lat) * np.sin(lon)
    Py = np.sin(lat)
    Pz = np.cos(lat) * np.cos(lon)

    canvas = np.zeros((output_h, output_w, 3), dtype=np.float64)
    weight = np.zeros((output_h, output_w), dtype=np.float64)

    for img_bgr, alpha_deg, beta_deg in photos:
        h, w = img_bgr.shape[:2]
        fov_v = fov_h * h / w

        alpha_rad = math.radians(alpha_deg)
        beta_rad  = math.radians(beta_deg)  # negativo = mirando arriba

        # Vector adelante de la cámara en espacio mundo
        Cx = math.sin(alpha_rad) * math.cos(beta_rad)
        Cy = -math.sin(beta_rad)   # negativo porque beta negativo = Y mundo positivo
        Cz = math.cos(alpha_rad) * math.cos(beta_rad)
        fwd = np.array([Cx, Cy, Cz], dtype=np.float64)

        # Vector derecha de la cámara (perpendicular a adelante y Y-mundo)
        world_up = np.array([0.0, 1.0, 0.0])
        right = np.cross(fwd, world_up)
        rn = np.linalg.norm(right)
        right = right / rn if rn > 1e-6 else np.array([1.0, 0.0, 0.0])

        # Vector arriba de la cámara
        up = np.cross(right, fwd)
        up /= np.linalg.norm(up)

        # Proyectar puntos del mundo al espacio cámara
        dot_fwd   = Px * fwd[0]   + Py * fwd[1]   + Pz * fwd[2]
        dot_right = Px * right[0] + Py * right[1] + Pz * right[2]
        dot_up    = Px * up[0]    + Py * up[1]    + Pz * up[2]

        in_front = dot_fwd > 0.001

        safe_fwd = np.where(in_front, dot_fwd, 1.0)
        ang_r = np.where(in_front, np.arctan2(dot_right, safe_fwd), math.pi)
        ang_u = np.where(in_front, np.arctan2(dot_up,    safe_fwd), math.pi)

        # Máscara dentro del FOV
        in_fov = (
            in_front &
            (np.abs(ang_r) < fov_h / 2) &
            (np.abs(ang_u) < fov_v / 2)
        )

        # Coordenadas de pixel en la imagen fuente
        img_x = ((ang_r / (fov_h / 2)) * 0.5 + 0.5) * (w - 1)
        img_y = (1.0 - ((ang_u / (fov_v / 2)) * 0.5 + 0.5)) * (h - 1)

        # Peso coseno: píxeles del centro contribuyen más
        w_cos = np.where(in_fov, np.cos(ang_r) * np.cos(ang_u), 0.0)

        map_x = np.where(in_fov, img_x, -1).astype(np.float32)
        map_y = np.where(in_fov, img_y, -1).astype(np.float32)

        sampled = cv2.remap(
            img_bgr.astype(np.float32), map_x, map_y,
            cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=0
        )

        canvas += sampled * w_cos[:, :, np.newaxis]
        weight += w_cos

    # Normalizar y convertir a uint8
    valid = weight > 0.001
    result = np.zeros((output_h, output_w, 3), dtype=np.uint8)
    result[valid] = np.clip(
        canvas[valid] / weight[valid, np.newaxis], 0, 255
    ).astype(np.uint8)

    return result


def stitch_fallback(images, output_path):
    """Fallback: usa el stitcher de OpenCV cuando no hay datos de orientación."""
    stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
    status, panorama = stitcher.stitch(images)

    if status != cv2.Stitcher_OK:
        codes = {
            cv2.Stitcher_ERR_NEED_MORE_IMGS:            "pocas imágenes o poca superposición",
            cv2.Stitcher_ERR_HOMOGRAPHY_EST_FAIL:       "no se encontraron puntos comunes",
            cv2.Stitcher_ERR_CAMERA_PARAMS_ADJUST_FAIL: "error al ajustar parámetros",
        }
        msg = codes.get(status, f"código {status}")
        print(f"ERROR: No se pudo coser el panorama — {msg}", file=sys.stderr)
        sys.exit(2)

    rgb = cv2.cvtColor(panorama, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    w, _ = pil.size
    target_w = max(w, 4096)
    target_h = target_w // 2
    pil = pil.resize((target_w, target_h), Image.LANCZOS)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    pil.save(output_path, 'JPEG', quality=90)
    print(output_path)


def stitch(input_folder, output_path):
    exts = ('.jpg', '.jpeg', '.png')
    files = sorted([
        os.path.join(input_folder, f)
        for f in os.listdir(input_folder)
        if f.lower().endswith(exts) and f != 'orientaciones.json'
    ])

    if len(files) < 4:
        print("ERROR: Se necesitan al menos 4 imágenes", file=sys.stderr)
        sys.exit(1)

    images = [cv2.imread(f) for f in files]
    images = [img for img in images if img is not None]

    if len(images) < 4:
        print("ERROR: No se pudieron leer las imágenes", file=sys.stderr)
        sys.exit(1)

    # Intentar proyección esférica con orientaciones
    meta_path = os.path.join(input_folder, 'orientaciones.json')
    if os.path.exists(meta_path):
        try:
            with open(meta_path, encoding='utf-8') as f:
                orientaciones = json.load(f)

            if len(orientaciones) >= len(images):
                photos = [
                    (images[i], orientaciones[i]['alpha'], orientaciones[i]['beta'])
                    for i in range(len(images))
                ]
                print(f"INFO: Proyectando {len(photos)} fotos sobre canvas equirectangular", file=sys.stderr)
                result = project_to_equirectangular(photos, output_w=4096)
                rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
                pil = Image.fromarray(rgb)
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                pil.save(output_path, 'JPEG', quality=90)
                print(output_path)
                return
            else:
                print(
                    f"WARN: orientaciones ({len(orientaciones)}) < imágenes ({len(images)}), usando stitcher",
                    file=sys.stderr
                )
        except Exception as e:
            print(f"WARN: proyección falló ({e}), usando stitcher de OpenCV", file=sys.stderr)

    stitch_fallback(images, output_path)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python stitch360.py <carpeta_entrada> <ruta_salida>", file=sys.stderr)
        sys.exit(1)
    stitch(sys.argv[1], sys.argv[2])
