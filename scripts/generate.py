import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from openai import OpenAI

REPO_ROOT = Path(__file__).resolve().parent.parent
PROGRESS_FILE = REPO_ROOT / "progress.json"
FALLBACK_FILE = REPO_ROOT / "scripts" / "fallback_projects.json"

LONGCAT_KEY = os.environ.get("LONGCAT_API_KEY", "")
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
PROJECTS_PER_RUN = int(os.environ.get("PROJECTS_PER_RUN", "2"))

PROJECTS_PER_MONTH = [62, 56, 62, 60, 62, 60, 62, 62, 60, 62, 60, 62]
TOTAL_PROJECTS = sum(PROJECTS_PER_MONTH)

PROMPT_TEMPLATE = """You are generating project #<<number>> for month <<month>> (<<month_name>>) of a 365-day web development challenge.

Previous project names (DO NOT DUPLICATE any of these):
<<history>>

Requirements:
- Generate a UNIQUE, creative web project idea focused on AI, ML, Data, or modern web tech
- Must NOT duplicate any previous project name or concept
- Progressive difficulty: early months = vanilla HTML/CSS/JS, later months = React/Node/APIs
- Fun, practical, and visually appealing

Return ONLY valid JSON (no markdown fences, no extra text):
{"name": "Project Name Here", "concepts": "comma, separated, key, concepts", "description": "2-3 sentence description of what the project does"}
"""

FILE_GEN_TEMPLATE = """Create a complete web project. Return ONLY valid JSON with keys: index.html, style.css, script.js.

Project: <<name>>
Description: <<description>>
Key Concepts: <<concepts>>

Keep code concise but functional. Use modern CSS (flexbox/grid). Vanilla JS only. Must work by opening index.html in browser.
"""

README_TEMPLATE = """Write a professional README.md for this web project.

Project #<<number>>: <<name>>
Description: <<description>>
Key Concepts: <<concepts>>

Sections in order:
# <<name>> 🚀
> <<description>>

## Description
[2-3 sentences]

## Features
[5-7 bullet points]

## Tech Stack
[List technologies]

## Key Concepts Demonstrated
[Bullets mapping to: <<concepts>>]

## Getting Started
- Open index.html in your browser
- No build step or dependencies required

## Screenshots
[Note: Add screenshots here]

## Author
- HarisAhmed83 - https://github.com/Haris-Ahmed83

Part of the [Ai Projects Bundle](https://github.com/Haris-Ahmed83/Ai-Projects-Bundle) series (730 projects / 365 days).

Return ONLY markdown content. No backticks wrapping.
"""


def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def get_month_folder(global_number: int):
    cumulative = 0
    for idx, count in enumerate(PROJECTS_PER_MONTH, 1):
        cumulative += count
        if global_number <= cumulative:
            return idx
    return None


def month_name(month_num: int):
    names = ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"]
    return names[month_num - 1]


def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    return {"global_number": 1, "completed": [], "history": [], "last_run": None, "fallback_count": 0}


def save_progress(progress: dict):
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2) + "\n", encoding="utf-8")


def get_history_summary(history: list, last_n: int = 30) -> str:
    recent = history[-last_n:] if len(history) > last_n else history
    return ", ".join([f"#{p['number']}: {p['name']}" for p in recent])


def call_longcat(client, prompt: str, max_tokens: int, retries: int = 5) -> str:
    for attempt in range(retries):
        try:
            resp = client.chat.completions.create(
                model="LongCat-2.0",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.8,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "rate" in err_str.lower():
                wait = 30 * (2 ** attempt)
                print(f"    LongCat rate limited. Retry in {wait}s...")
                time.sleep(wait)
            elif attempt >= 2:
                raise
            else:
                time.sleep(5)
    raise RuntimeError("LongCat call failed after retries")


def call_gemini(client, prompt: str, max_tokens: int, retries: int = 5) -> str:
    from google.genai import types
    for attempt in range(retries):
        try:
            resp = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.8,
                ),
            )
            return resp.text or ""
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "503" in err_str:
                wait = 30 * (2 ** attempt)
                print(f"    Gemini rate limited. Retry in {wait}s...")
                time.sleep(wait)
            elif attempt >= 2:
                raise
            else:
                time.sleep(5)
    raise RuntimeError("Gemini call failed after retries")


def get_ai_client():
    if LONGCAT_KEY:
        try:
            client = OpenAI(api_key=LONGCAT_KEY, base_url="https://api.longcat.chat/openai", timeout=15)
            client.chat.completions.create(
                model="LongCat-2.0",
                messages=[{"role": "user", "content": "hi"}],
                max_tokens=10
            )
            print("  Using LongCat 2.0")
            return client, "longcat"
        except Exception as e:
            err_str = str(e).encode('ascii', errors='replace').decode()
            print(f"  LongCat unavailable: {err_str[:100]}")

    if GEMINI_KEY:
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=GEMINI_KEY)
            client.models.generate_content(
                model="gemini-2.5-flash",
                contents="hi",
                config=types.GenerateContentConfig(max_output_tokens=10),
            )
            print("  Using Gemini 2.5 Flash")
            return client, "gemini"
        except Exception as e:
            err_str = str(e).encode('ascii', errors='replace').decode()
            print(f"  Gemini unavailable: {err_str[:100]}")

    print("  WARNING: No AI available, will use fallback projects")
    return None, None


def extract_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
    text = re.sub(r"\n?```$", "", text.strip())
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    start = text.find('{')
    if start == -1:
        raise ValueError(f"No JSON object found in response: {text[:200]}...")

    depth = 0
    for i in range(start, len(text)):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i+1])
                except json.JSONDecodeError:
                    break

    end = text.rfind('}')
    if end > start:
        candidate = text[start:end+1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            if not candidate.rstrip().endswith('}'):
                try:
                    return json.loads(candidate + '"}')
                except json.JSONDecodeError:
                    pass
            if not candidate.rstrip().endswith('}'):
                try:
                    return json.loads(candidate + '}')
                except json.JSONDecodeError:
                    pass

    if '"' in text[start:]:
        try:
            extended = text[start:] + '"}'
            return json.loads(extended)
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract JSON from response: {text[:200]}...")


def generate_project_idea(client, engine: str, number: int, month: int, history: list) -> dict:
    prompt = PROMPT_TEMPLATE
    prompt = prompt.replace("<<number>>", str(number))
    prompt = prompt.replace("<<month>>", str(month))
    prompt = prompt.replace("<<month_name>>", month_name(month))
    prompt = prompt.replace("<<history>>", get_history_summary(history))

    if engine == "longcat":
        raw = call_longcat(client, prompt, 1500)
    else:
        raw = call_gemini(client, prompt, 1500)

    data = extract_json(raw)
    return {
        "name": data["name"],
        "concepts": data.get("concepts", ""),
        "description": data.get("description", ""),
    }


def generate_project_files(client, engine: str, project_info: dict, number: int) -> dict:
    prompt = FILE_GEN_TEMPLATE
    prompt = prompt.replace("<<name>>", project_info["name"])
    prompt = prompt.replace("<<description>>", project_info["description"])
    prompt = prompt.replace("<<concepts>>", project_info["concepts"])
    prompt = prompt.replace("<<number>>", str(number))

    if engine == "longcat":
        raw = call_longcat(client, prompt, 16000)
    else:
        raw = call_gemini(client, prompt, 16000)

    files = extract_json(raw)
    if "index.html" in files and "style.css" in files and "script.js" in files:
        return files

    raise ValueError(f"Missing required files in response. Got: {list(files.keys())}")


def generate_readme(client, engine: str, project_info: dict, number: int) -> str:
    prompt = README_TEMPLATE
    prompt = prompt.replace("<<number>>", str(number))
    prompt = prompt.replace("<<name>>", project_info["name"])
    prompt = prompt.replace("<<description>>", project_info["description"])
    prompt = prompt.replace("<<concepts>>", project_info["concepts"])

    if engine == "longcat":
        raw = call_longcat(client, prompt, 2000)
    else:
        raw = call_gemini(client, prompt, 2000)

    raw = raw.strip()
    raw = re.sub(r"^```[a-zA-Z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw.strip())
    return raw


def use_fallback_project(number: int, month: int) -> dict:
    if not FALLBACK_FILE.exists():
        print("    ERROR: No fallback projects file found!")
        sys.exit(1)

    fallbacks = json.loads(FALLBACK_FILE.read_text(encoding="utf-8-sig"))
    fallback = fallbacks[(number - 1) % len(fallbacks)]

    slug = slugify(fallback["name"])
    folder_name = f"{number:03d}-{slug}"
    month_folder = f"month-{month:02d}"
    project_dir = REPO_ROOT / month_folder / folder_name

    project_dir.mkdir(parents=True, exist_ok=True)

    name = fallback["name"]
    desc = fallback.get("description", "A web project.")
    concepts = fallback.get("concepts", "")

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>{name}</h1>
    <p class="desc">{desc}</p>
    <div class="content" id="content">
      <p>Project #{number} - Part of Ai Projects Bundle</p>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>'''

    css = '''* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: "Segoe UI", sans-serif; background: linear-gradient(135deg, #1a1a2e, #16213e); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.container { max-width: 600px; text-align: center; }
h1 { color: #fff; margin-bottom: 16px; font-size: 28px; }
.desc { color: rgba(255,255,255,0.7); font-size: 16px; margin-bottom: 24px; }
.content { padding: 30px; background: rgba(255,255,255,0.05); border-radius: 16px; color: #e0e0e0; }'''

    js = f'''// {name} - Fallback Project #{number}
console.log("{name} loaded");
document.addEventListener("DOMContentLoaded", () => {{
  const content = document.getElementById("content");
  if (content) {{
    content.innerHTML += "<p style='margin-top:12px;color:#667eea'>Ready to customize!</p>";
  }}
}});'''

    (project_dir / "index.html").write_text(html + "\n", encoding="utf-8")
    (project_dir / "style.css").write_text(css + "\n", encoding="utf-8")
    (project_dir / "script.js").write_text(js + "\n", encoding="utf-8")

    readme = f"""# {name}

> {desc}

## Description
{desc} This project is part of the Ai Projects Bundle series featuring 730 web projects.

## Features
- Clean, modern design
- Responsive layout
- Easy to customize

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript

## Key Concepts
{concepts}

## Getting Started
Open `index.html` in your browser. No build step required.

## Author
- HarisAhmed83 - https://github.com/Haris-Ahmed83

Part of the [Ai Projects Bundle](https://github.com/Haris-Ahmed83/Ai-Projects-Bundle) series.
"""
    (project_dir / "README.md").write_text(readme + "\n", encoding="utf-8")

    print(f"  -> Used FALLBACK project for #{number:03d}")
    return {"name": name, "concepts": concepts, "description": desc, "fallback": True}


def generate_single_project(client, engine: str, number: int, month: int, history: list) -> dict:
    print(f"\n--- Generating #{number:03d} [{month_name(month)}] ---")

    print("  Getting project idea...")
    project_info = generate_project_idea(client, engine, number, month, history)

    print(f"  Project: {project_info['name']}")
    print(f"  Concepts: {project_info['concepts']}")

    print("  Generating files...")
    files = generate_project_files(client, engine, project_info, number)

    print("  Generating README...")
    readme = generate_readme(client, engine, project_info, number)

    slug = slugify(project_info["name"])
    folder_name = f"{number:03d}-{slug}"
    month_folder = f"month-{month:02d}"
    project_dir = REPO_ROOT / month_folder / folder_name
    project_dir.mkdir(parents=True, exist_ok=True)

    for fname, content in files.items():
        (project_dir / fname).write_text(content.strip() + "\n", encoding="utf-8")
    (project_dir / "README.md").write_text(readme.strip() + "\n", encoding="utf-8")

    print(f"  -> {month_folder}/{folder_name} ({engine})")
    return {**project_info, "engine": engine}


def calculate_run_count(progress: dict) -> int:
    base = PROJECTS_PER_RUN

    if progress["last_run"]:
        last = datetime.fromisoformat(progress["last_run"].replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        days_missed = (now - last).days - 1
        if days_missed > 0:
            catch_up = min(days_missed * PROJECTS_PER_RUN, 6)
            total = base + catch_up
            print(f"  Caught up: {days_missed} day(s) missed, generating {total} projects")
            return total

    return base


def main():
    progress = load_progress()
    current = progress["global_number"]

    if current > TOTAL_PROJECTS:
        print(f"All {TOTAL_PROJECTS} projects completed!")
        return

    month = get_month_folder(current)
    if month is None:
        print("Invalid project number")
        return

    run_count = calculate_run_count(progress)
    client, engine = get_ai_client()

    generated = []
    fallback_used = 0

    for i in range(run_count):
        num = current + i
        if num > TOTAL_PROJECTS:
            break

        current_month = get_month_folder(num)
        try:
            if client and engine:
                result = generate_single_project(client, engine, num, current_month, progress["history"])
            else:
                result = use_fallback_project(num, current_month)
                fallback_used += 1
        except Exception as e:
            print(f"  ERROR generating #{num}: {e}")
            print("  Trying fallback...")
            try:
                result = use_fallback_project(num, current_month)
                fallback_used += 1
            except Exception as e2:
                print(f"  FATAL: Fallback also failed for #{num}: {e2}")
                break

        generated.append(num)
        progress["history"].append({
            "number": num,
            "name": result["name"],
            "concepts": result.get("concepts", ""),
            "month": current_month,
            "engine": result.get("engine", "fallback"),
            "fallback": result.get("fallback", False),
        })

        if i < run_count - 1 and client and engine:
            time.sleep(2)

    if not generated:
        print("No projects generated this run.")
        return

    progress["global_number"] = generated[-1] + 1
    progress["completed"] = sorted(set(progress.get("completed", []) + generated))
    progress["last_run"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    progress["fallback_count"] = progress.get("fallback_count", 0) + fallback_used
    save_progress(progress)

    print(f"\n=== Summary ===")
    print(f"Generated: {generated}")
    print(f"Engine: {engine or 'FALLBACK'}")
    print(f"Fallbacks used: {fallback_used}")
    print(f"Next: #{progress['global_number']} / {TOTAL_PROJECTS}")
    print(f"Progress: {len(progress['completed'])} / {TOTAL_PROJECTS} ({100*len(progress['completed'])//TOTAL_PROJECTS}%)")


if __name__ == "__main__":
    main()
