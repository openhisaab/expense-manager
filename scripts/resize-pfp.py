from PIL import Image

src = r"C:\Users\HP\.gemini\antigravity\scratch\expense-manager\assets\profile-pic.png"
img = Image.open(src)
img_500 = img.resize((500, 500), Image.Resampling.LANCZOS)
img_500.save(r"C:\Users\HP\.gemini\antigravity\scratch\expense-manager\assets\profile-pic-500.png", "PNG", optimize=True)
print("Saved 500x500 PNG successfully.")
