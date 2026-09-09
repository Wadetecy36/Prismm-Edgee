import os
import re

dirs = ['kqDJT8D', 'yoTDTIS']

for d in dirs:
    for root, _, files in os.walk(d):
        for f in files:
            if not (f.endswith('.html') or f.endswith('.js')):
                continue
            
            curr_path = os.path.join(root, f)
            rel_path = os.path.relpath(curr_path, d)
            backup_path = os.path.join('temp_backup', d, d, rel_path)
            
            if not os.path.exists(backup_path):
                continue
                
            with open(backup_path, 'r', encoding='utf-8') as file:
                backup_content = file.read()
                
            with open(curr_path, 'r', encoding='utf-8') as file:
                curr_content = file.read()
                
            # Find all original classes for the icons
            # <i ... data-lucide="icon" class="cls" ...></i>
            icon_re = re.compile(r'<i\s+[^>]*data-lucide=["\']([^"\']+)["\'][^>]*></i>', re.IGNORECASE)
            backup_matches = list(icon_re.finditer(backup_content))
            
            if not backup_matches:
                continue
                
            classes = []
            for m in backup_matches:
                cls_match = re.search(r'class=["\']([^"\']+)["\']', m.group(0), re.IGNORECASE)
                classes.append(cls_match.group(1) if cls_match else "")
                
            # Now find all SVGs in the current content that were injected
            # They start with <!-- @license lucide-static ... -->\n<svg
            # or just <svg
            
            svg_re = re.compile(r'<svg[\s\S]*?xmlns="http://www.w3.org/2000/svg"[^>]*>', re.IGNORECASE)
            
            curr_matches = list(svg_re.finditer(curr_content))
            
            print(f"{curr_path}: {len(classes)} classes from backup, {len(curr_matches)} SVGs in current")
            
            if len(curr_matches) != len(classes):
                print(f"Warning: SVG count mismatch in {curr_path}. Expected {len(classes)}, found {len(curr_matches)}.")
                
            new_content = curr_content
            offset = 0
            
            for i in range(min(len(classes), len(curr_matches))):
                m = curr_matches[i]
                orig_svg_tag = m.group(0)
                cls = classes[i]
                
                if f'class="{cls}"' in orig_svg_tag:
                    continue
                    
                new_svg_tag = re.sub(r'<svg', f'<svg class="{cls}"', orig_svg_tag, count=1, flags=re.IGNORECASE)
                
                # Replace in string
                start = m.start() + offset
                end = m.end() + offset
                
                new_content = new_content[:start] + new_svg_tag + new_content[end:]
                offset += len(new_svg_tag) - len(orig_svg_tag)
                
            if offset != 0:
                with open(curr_path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Restored classes in {curr_path}")

print("Done restoring classes.")
