"""
Indeed Job Scraper Program – Version Maroc + Excel Export
Optimisé pour intégration avec Flask (appel direct par fonction)
"""

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.common.exceptions import NoSuchDriverException
import pandas as pd
import time
import os


def scrape_indeed(query: str, location: str, days: int = 7):
    """Scrape les offres Indeed Maroc et retourne un DataFrame."""

    indeed_url = "https://ma.indeed.com"
    chromedriver_exe = ".\\chromedriver.exe"

    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    )

    service = ChromeService(executable_path=chromedriver_exe)
    df = pd.DataFrame(columns=["Job_Title", "Company", "Location", "Link", "Source"])

    try:
        driver = webdriver.Chrome(service=service, options=options)
        url = f"{indeed_url}/emplois?q={query}&l={location}&fromage={days}&sort=date"
        print(f"🌍 Ouverture de la page Indeed : {url}")
        driver.get(url)
        time.sleep(10)

        soup = BeautifulSoup(driver.page_source, "lxml")
        boxes = soup.find_all("div", class_="job_seen_beacon")

        job_count = 0
        for box in boxes:
            title_elem = box.find("h2", class_="jobTitle")
            company_elem = box.find("span", {"data-testid": "company-name"})
            location_elem = box.find("div", {"data-testid": "text-location"})
            link_elem = box.find("a", class_=lambda x: x and "JobTitle" in x)

            # 🔒 Toujours initialiser les valeurs (même vides)
            title = title_elem.text.strip() if title_elem else ""
            company = company_elem.text.strip() if company_elem else ""
            location_txt = location_elem.text.strip() if location_elem else ""
            link = indeed_url + link_elem.get("href") if link_elem else ""

            # ⚠️ Ne pas ajouter si le lien est vide
            if not link:
                continue

            df.loc[len(df)] = [title, company, location_txt, link, "Indeed"]
            job_count += 1

        print(f"✅ {job_count} offres extraites depuis Indeed Maroc.")

        # 💾 Sauvegarde
        os.makedirs("data", exist_ok=True)
        csv_path = "data/indeed_jobs.csv"
        df.to_csv(csv_path, index=False, encoding="utf-8-sig")
        print(f"💾 Données enregistrées dans {csv_path}")

        driver.quit()
        return df

    except NoSuchDriverException:
        print("❌ ChromeDriver introuvable. Télécharge-le depuis : https://developer.chrome.com/docs/chromedriver/downloads/")
        return pd.DataFrame()

    except Exception as e:
        print(f"❌ Erreur pendant le scraping : {e}")
        return pd.DataFrame()
