import os
from PIL import Image

src_jpg = r"C:\Users\HP\.gemini\antigravity\scratch\expense-manager\assets\profile-pic.jpg"
dst_png = r"C:\Users\HP\.gemini\antigravity\scratch\expense-manager\assets\profile-pic.png"

img = Image.open(src_jpg)
# Ensure RGBA
img_rgba = img.convert("RGBA")
img_rgba.save(dst_png, "PNG", optimize=True)
print(f"Generated PNG successfully: {dst_png} ({img_rgba.size[0]}x{img_rgba.size[1]})")
