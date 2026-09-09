import os
import re
import urllib.request
import json

dirs = [
    os.path.join(os.path.dirname(__file__), 'kqDJT8D'),
    os.path.join(os.path.dirname(__file__), 'yoTDTIS')
]

files_to_process = []
for d in dirs:
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.html') or f.endswith('.js'):
                files_to_process.append(os.path.join(root, f))

unique_icons = set()
file_icons = {}

# Match <i ... data-lucide="icon-name" ...></i>
icon_re = re.compile(r'<i\s+[^>]*data-lucide=["\']([^"\']+)["\'][^>]*></i>', re.IGNORECASE)

for file in files_to_process:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        continue

    matches = icon_re.finditer(content)
    file_icons[file] = []
    for match in matches:
        icon_name = match.group(1)
        unique_icons.add(icon_name)
        file_icons[file].append(icon_name)

print(f"Unique icons to fetch: {unique_icons}")

svg_map = {}
for icon in unique_icons:
    url = f"https://unpkg.com/lucide-static@0.344.0/icons/{icon}.svg"
    print(f"Fetching {icon}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                svg_map[icon] = response.read().decode('utf-8')
            else:
                print(f"Failed to fetch {icon}")
    except Exception as e:
        print(f"Error fetching {icon}: {e}")

def main():
    for file in files_to_process:
        if not file_icons.get(file):
            continue

        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception:
            continue

        changed = False

        def replace_func(match):
            nonlocal changed
            full_match = match.group(0)
            icon_name = match.group(2)
            
            svg = svg_map.get(icon_name)
            if not svg:
                return full_match

            cls_match = re.search(r'class=["\']([^"\']+)["\']', full_match, re.IGNORECASE)
            cls = cls_match.group(1) if cls_match else ""

            new_svg = re.sub(r'class="[^"]*"', '', svg)
            new_svg = new_svg.replace('<svg ', f'<svg class="{cls}" ')
            
            changed = True
            return new_svg

        replace_re = re.compile(r'<i\s+(.*?)(?:data-lucide=["\']([^"\']+)["\'])(.*?)></i>', re.IGNORECASE)
        new_content = replace_re.sub(replace_func, content)

        if changed:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file}")

main()

print("Done.")
