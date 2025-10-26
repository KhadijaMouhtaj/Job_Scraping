"""
LinkedIn Job Scraper – Version Maroc + Internationale
Compatible avec Flask (fonction `scrape_linkedin`)
"""

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.common.exceptions import NoSuchDriverException
import pandas as pd
import time
import os


def scrape_linkedin(query: str, location: str, limit: int = 15):
    """Scrape les offres LinkedIn (non connecté) et retourne un DataFrame."""

    base_url = "https://www.linkedin.com/jobs/search"
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    options.add_argument(
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    )

    chromedriver_exe = ".\\chromedriver.exe"
    service = ChromeService(executable_path=chromedriver_exe)

    # ✅ Crée le DataFrame avec la colonne Source
    df = pd.DataFrame(columns=["Job_Title", "Company", "Location", "Link", "Source"])

    try:
        driver = webdriver.Chrome(service=service, options=options)
        url = f"{base_url}/?keywords={query}&location={location}&trk=public_jobs_jobs-search-bar_search-submit"
        print(f"🌍 Ouverture de la page LinkedIn : {url}")
        driver.get(url)
        time.sleep(8)

        # 🔄 Scroll pour charger plus d’offres
        for _ in range(2):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)

        soup = BeautifulSoup(driver.page_source, "lxml")
        cards = soup.find_all("div", class_="base-card")[:limit]

        job_count = 0
        for card in cards:
            title_elem = card.find("h3", class_="base-search-card__title")
            company_elem = card.find("h4", class_="base-search-card__subtitle")
            location_elem = card.find("span", class_="job-search-card__location")
            link_elem = card.find("a", class_="base-card__full-link")

            # 🔒 Toujours initialiser les valeurs
            title = title_elem.text.strip() if title_elem else ""
            company = company_elem.text.strip() if company_elem else ""
            location_txt = location_elem.text.strip() if location_elem else ""
            link = link_elem.get("href") if link_elem else ""

            # ⚠️ Ignorer les lignes vides
            if not link:
                continue

            df.loc[len(df)] = [title, company, location_txt, link, "LinkedIn"]
            job_count += 1

        print(f"✅ {job_count} offres extraites depuis LinkedIn.")

        # 💾 Sauvegarde
        os.makedirs("data", exist_ok=True)
        csv_path = "data/linkedin_jobs.csv"
        df.to_csv(csv_path, index=False, encoding="utf-8-sig")
        print(f"💾 Données enregistrées dans {csv_path}")

        driver.quit()
        return df

    except NoSuchDriverException:
        print("❌ ChromeDriver introuvable.")
        return pd.DataFrame()

    except Exception as e:
        print(f"❌ Erreur scraping LinkedIn : {e}")
        return pd.DataFrame()
