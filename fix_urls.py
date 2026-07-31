import os
import glob

src_dir = r"c:\Users\USER\skillbarter-frontend\src\pages"
files = glob.glob(os.path.join(src_dir, "*.jsx"))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if "http://localhost:8000" in content:
        new_content = content.replace("http://localhost:8000", "https://skillswap-app-wj2a.onrender.com")
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
