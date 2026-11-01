"""Prepare the real portrait and local typefaces for the demo."""
from pathlib import Path
from PIL import Image
from bs4 import BeautifulSoup
import urllib.request, shutil, sys

sys.stdout.reconfigure(encoding='utf-8')
root = Path(__file__).resolve().parent.parent
assets = root / 'assets'
stage = root / '.work'
assets.mkdir(exist_ok=True)
stage.mkdir(exist_ok=True)
request = urllib.request.Request('https://gestalt.ru/author/belimovama-gmail-com/', headers={'User-Agent': 'Mozilla/5.0'})
raw = urllib.request.urlopen(request, timeout=25).read()
(stage / 'profile.html').write_bytes(raw)
soup = BeautifulSoup(raw, 'html.parser')
portrait = next(image for image in soup.select('img') if 'Белимова' in image.get('alt', ''))
url = portrait.get('data-src', portrait.get('src'))
path = stage / 'portrait-original.jpg'
path.write_bytes(urllib.request.urlopen(url, timeout=25).read())
image = Image.open(path).convert('RGB')
image.thumbnail((1200, 1200))
image.save(assets / 'marina.webp', 'WEBP', quality=91, method=6)
reference = root.parent / 'Испанский' / 'public' / 'assets'
for index, name in [(11,'manrope-cyrillic'),(15,'manrope-latin'),(1,'cormorant-italic-cyrillic'),(4,'cormorant-italic-latin'),(6,'cormorant-cyrillic'),(9,'cormorant-latin')]:
    shutil.copyfile(reference / f'webfont-{index}.woff2', assets / (name + '.woff2'))
for name in ['manrope-LICENSE.txt', 'cormorantgaramond-LICENSE.txt']:
    shutil.copyfile(reference / name, assets / name)
print('Portrait source:', url)
print('Portrait:', image.size)
