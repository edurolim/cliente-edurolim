#!/usr/bin/env python3
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PROMPTS_PATH = ROOT / "image-prompts.md"
IMG_DIR = ROOT / "img"
API_URL = "https://api.openai.com/v1/images/generations"


def load_prompts():
    text = PROMPTS_PATH.read_text(encoding="utf-8")
    matches = re.findall(
        r"^## Slide\s+(\d{2})(?:[^\n]*)\n(.+?)(?=\n## Slide|\Z)",
        text,
        flags=re.M | re.S,
    )
    prompts = [(int(num), prompt.strip()) for num, prompt in matches]
    if len(prompts) != 9:
        raise RuntimeError(f"Expected 9 prompts, found {len(prompts)}")
    return prompts


def request_image(api_key, prompt, with_format=True):
    payload = {
        "model": "gpt-image-1",
        "prompt": prompt,
        "size": "1024x1536",
        "quality": "high",
        "n": 1,
    }
    if with_format:
        payload["output_format"] = "jpeg"
        payload["output_compression"] = 92

    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=300) as response:
            return payload, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        if with_format and "output_format" in details:
            return request_image(api_key, prompt, with_format=False)
        raise RuntimeError(f"OpenAI image request failed: HTTP {exc.code}: {details}") from exc


def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    IMG_DIR.mkdir(parents=True, exist_ok=True)
    prompts = load_prompts()

    for index, prompt in prompts:
        out_path = IMG_DIR / f"slide_{index:02d}.jpg"
        if out_path.exists() and out_path.stat().st_size > 10_000:
            print(f"slide {index:02d}: exists, skipping", flush=True)
            continue

        print(f"slide {index:02d}: requesting image", flush=True)
        request_payload, result = request_image(api_key, prompt)
        b64 = result.get("data", [{}])[0].get("b64_json")
        if not b64:
            raise RuntimeError(f"slide {index:02d}: response did not include b64_json")

        out_path.write_bytes(base64.b64decode(b64))
        (IMG_DIR / f"request_{index:02d}.json").write_text(
            json.dumps(request_payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"slide {index:02d}: saved {out_path} ({out_path.stat().st_size} bytes)", flush=True)
        time.sleep(1)

    print("image generation complete", flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(str(exc), file=sys.stderr, flush=True)
        sys.exit(1)
