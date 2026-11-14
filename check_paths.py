import re
import urllib.parse
import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

print("=== HTML Cert Images ===")
img_matches = re.findall(r'src="(Certifications%20Thumbnails/[^"]+)"', html)
print(f"Total images found: {len(img_matches)}")
all_ok = True
for m in img_matches:
    decoded = urllib.parse.unquote(m)
    exists = os.path.exists(decoded)
    print(f"  [{'OK' if exists else 'FAIL'}] {decoded}")
    if not exists:
        all_ok = False

print("\n=== JS Certificates Data PDFs ===")
pdf_matches = re.findall(r'pdf:\s*"([^"]+)"', js)
print(f"Total PDFs found: {len(pdf_matches)}")
for p in pdf_matches:
    exists = os.path.exists(p)
    print(f"  [{'OK' if exists else 'FAIL'}] {p}")
    if not exists:
        all_ok = False

print("\n=== JS Certificates Data Images ===")
thumb_matches = re.findall(r'image:\s*"([^"]+)"', js)
print(f"Total images found: {len(thumb_matches)}")
for t in thumb_matches:
    exists = os.path.exists(t)
    print(f"  [{'OK' if exists else 'FAIL'}] {t}")
    if not exists:
        all_ok = False

print("\nALL PATHS EXIST:", all_ok)

