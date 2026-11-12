import os
from PIL import Image

src = r"C:\Users\HP\.gemini\antigravity\scratch\expense-manager\assets\profile-pic.png"
assets_dir = r"C:\Users\HP\.gemini\antigravity\scratch\expense-manager\assets"

img = Image.open(src).convert("RGBA")

# Generate standard Android PWA icons
sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for s in sizes:
    resized = img.resize((s, s), Image.Resampling.LANCZOS)
    out_path = os.path.join(assets_dir, f"icon-{s}.png")
    resized.save(out_path, "PNG", optimize=True)
    print(f"Generated {out_path}")

print("All Android PWA icons generated successfully!")
