import pytesseract
from PIL import Image
import os

try:
    print(f"Tesseract version: {pytesseract.get_tesseract_version()}")
except Exception as e:
    print(f"Error getting version: {e}")

# Check which tesseract
os.system("which tesseract")
