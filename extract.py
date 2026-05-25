import fitz  # PyMuPDF
import os
import io
from PIL import Image

BASE_DIR = r"d:\mundial2026\figuritas"
OUTPUT_DIR = r"d:\mundial2026\public\figuritas_extraidas"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def extract_images_from_pdf(pdf_path, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        
    pdf_document = fitz.open(pdf_path)
    count = 1
    
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        image_list = page.get_images(full=True)
        
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = pdf_document.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Avoid extracting very small images (like icons or logos)
            if len(image_bytes) < 10000:
                continue
                
            try:
                image = Image.open(io.BytesIO(image_bytes))
                
                # Check dimensions to ensure it's not a tiny icon or background artifact
                if image.width < 100 or image.height < 100:
                    continue
                    
                # Save as PNG
                image_path = os.path.join(output_folder, f"figura_{count}.png")
                image.save(image_path, "PNG")
                print(f"Saved: {image_path}")
                count += 1
            except Exception as e:
                print(f"Error extracting image: {e}")

print("Iniciando extracción...")
for team_folder in os.listdir(BASE_DIR):
    team_path = os.path.join(BASE_DIR, team_folder)
    if os.path.isdir(team_path):
        out_team_path = os.path.join(OUTPUT_DIR, team_folder)
        for file in os.listdir(team_path):
            if file.lower().endswith('.pdf'):
                pdf_path = os.path.join(team_path, file)
                print(f"Procesando: {pdf_path}")
                extract_images_from_pdf(pdf_path, out_team_path)
print("¡Extracción finalizada!")
