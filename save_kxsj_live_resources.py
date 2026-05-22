from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


BASE_URL = "http://localhost:5173/api/kxsj/live/resources"
CENTER_NAME = "\u5730\u7406\u7a7a\u95f4\u667a\u80fd\u4e0e\u4eba\u5730\u7cfb\u7edf"
SORT = "approve_time"
DIRECTION = "desc"
LIMIT = 12
START_OFFSET = 0
MAX_OFFSET = 192


def build_url(offset: int, limit: int) -> str:
    query = urlencode(
        {
            "centerName": CENTER_NAME,
            "sort": SORT,
            "direction": DIRECTION,
            "limit": limit,
            "offset": offset,
        }
    )
    return f"{BASE_URL}?{query}"


def fetch_json(url: str) -> Any:
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "geo-spatial-center-json-export/1.0",
        },
        method="GET",
    )

    with urlopen(request, timeout=30) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        body = response.read().decode(charset)
        return json.loads(body)


def fetch_all_pages(start_offset: int, max_offset: int, limit: int) -> dict[str, Any]:
    pages = []
    all_items = []
    seen_resource_ids = set()
    total = None

    for offset in range(start_offset, max_offset + 1, limit):
        url = build_url(offset=offset, limit=limit)
        page = fetch_json(url)
        pages.append(
            {
                "offset": offset,
                "limit": limit,
                "url": url,
                "response": page,
            }
        )

        if isinstance(page, dict):
            if total is None:
                total = page.get("total")

            page_items = page.get("data")
            if isinstance(page_items, list):
                for item in page_items:
                    resource_id = None
                    if isinstance(item, dict):
                        resource_id = item.get("resources_id") or item.get("resourcesId")

                    if resource_id:
                        if resource_id in seen_resource_ids:
                            continue
                        seen_resource_ids.add(resource_id)

                    all_items.append(item)

    return {
        "data": all_items,
        "total": total,
        "fetched_count": len(all_items),
        "pagination": {
            "start_offset": start_offset,
            "max_offset": max_offset,
            "limit": limit,
            "offsets": list(range(start_offset, max_offset + 1, limit)),
        },
        "pages": pages,
    }


def save_json(data: Any, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    default_output = script_dir / "kxsj_live_resources.json"

    parser = argparse.ArgumentParser(
        description="Fetch the kxsj live resources API response and save it as JSON."
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=default_output,
        help=f"Output JSON file path. Default: {default_output}",
    )
    parser.add_argument(
        "--start-offset",
        type=int,
        default=START_OFFSET,
        help=f"First offset to fetch. Default: {START_OFFSET}",
    )
    parser.add_argument(
        "--max-offset",
        type=int,
        default=MAX_OFFSET,
        help=f"Last offset to fetch. Default: {MAX_OFFSET}",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=LIMIT,
        help=f"Page size. Default: {LIMIT}",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    try:
        data = fetch_all_pages(
            start_offset=args.start_offset,
            max_offset=args.max_offset,
            limit=args.limit,
        )
        save_json(data, args.output)
    except HTTPError as exc:
        print(f"HTTP error {exc.code}: {exc.reason}")
        return 1
    except URLError as exc:
        print(f"Network error: {exc.reason}")
        return 1
    except json.JSONDecodeError as exc:
        print(f"Response is not valid JSON: {exc}")
        return 1

    print(f"Saved JSON response to: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
