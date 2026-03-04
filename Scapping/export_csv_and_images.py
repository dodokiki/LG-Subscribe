import csv
import json
import re
from pathlib import Path
from urllib.parse import urlparse

import requests


BASE_DIR = Path(__file__).resolve().parent
INPUT_JSON = BASE_DIR / "lg_subscribe_products_all_pages.json"
OUTPUT_CSV = BASE_DIR / "lg_subscribe_products_all_pages.csv"
IMAGES_DIR = BASE_DIR / "images_all_pages"


def safe_filename(text: str) -> str:
    cleaned = re.sub(r"[^\w\-\.]+", "_", text.strip(), flags=re.UNICODE)
    return cleaned.strip("_") or "item"


def guess_extension(image_url: str, response: requests.Response) -> str:
    parsed = urlparse(image_url)
    path = parsed.path.lower()
    if path.endswith(".png"):
        return ".png"
    if path.endswith(".webp"):
        return ".webp"
    if path.endswith(".jpeg") or path.endswith(".jpg"):
        return ".jpg"

    content_type = (response.headers.get("Content-Type") or "").lower()
    if "png" in content_type:
        return ".png"
    if "webp" in content_type:
        return ".webp"
    return ".jpg"


def main() -> None:
    if not INPUT_JSON.exists():
        raise FileNotFoundError(f"Missing input file: {INPUT_JSON}")

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    products = json.loads(INPUT_JSON.read_text(encoding="utf-8"))

    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        }
    )

    rows = []
    for index, product in enumerate(products, start=1):
        model_code = (product.get("model_code") or "").strip()
        product_name = (product.get("product_name") or "").strip()
        image_url = (product.get("image_url") or "").strip()

        image_local_path = ""
        if image_url:
            stem = safe_filename(model_code or product_name or f"item_{index}")
            try:
                resp = session.get(image_url, timeout=45)
                resp.raise_for_status()
                ext = guess_extension(image_url, resp)
                file_path = IMAGES_DIR / f"{stem}{ext}"
                file_path.write_bytes(resp.content)
                image_local_path = str(file_path.relative_to(BASE_DIR))
            except Exception:
                image_local_path = ""

        row = {
            "product_name": product_name,
            "model_code": model_code,
            "monthly_price_text": (product.get("monthly_price_text") or "").strip(),
            "original_price_text": (product.get("original_price_text") or "").strip(),
            "discount_text": (product.get("discount_text") or "").replace("\n", " ").strip(),
            "detail_url": (product.get("detail_url") or "").strip(),
            "image_url": image_url,
            "image_local_path": image_local_path,
            "page_number": product.get("page_number") or "",
        }
        rows.append(row)

    fieldnames = [
        "product_name",
        "model_code",
        "monthly_price_text",
        "original_price_text",
        "discount_text",
        "detail_url",
        "image_url",
        "image_local_path",
        "page_number",
    ]

    with OUTPUT_CSV.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"CSV saved: {OUTPUT_CSV}")
    print(f"Images saved in: {IMAGES_DIR}")
    print(f"Total products: {len(rows)}")


if __name__ == "__main__":
    main()
