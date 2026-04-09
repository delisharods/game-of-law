import requests
import os
import fitz  # PyMuPDF

def scrape_pdf(url, topic):
    os.makedirs("output", exist_ok=True)
    pdf_file = f"output/{topic}.pdf"

    print(f"🔹 Downloading PDF from {url}...")
    try:
        r = requests.get(url, timeout=10)
        with open(pdf_file, "wb") as f:
            f.write(r.content)
        print("✅ PDF downloaded.")

        doc = fitz.open(pdf_file)
        full_text = ""
        for page in doc:
            full_text += page.get_text("text") + " "

        cleaned_text = " ".join(full_text.split())

        text_file = f"output/{topic}.txt"
        with open(text_file, "w", encoding="utf-8") as f:
            f.write(cleaned_text)

        print(f"✅ Topic saved → {text_file}")

    except Exception as e:
        print(f"❌ Error during scraping: {e}")

if __name__ == "__main__":
    url = input("Paste IndiaCode PDF URL: ").strip()
    topic = input("Enter topic name (example: constitution): ").strip().lower()
    scrape_pdf(url, topic)
