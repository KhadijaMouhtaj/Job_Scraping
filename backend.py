from flask import Flask, request, jsonify
from flask_cors import CORS
from indeed_scraper import scrape_indeed

from linkedin_scraper import scrape_linkedin
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route("/api/scrape", methods=["GET"])
def scrape_jobs():
    query = request.args.get("query", "data")
    location = request.args.get("location", "maroc")

    print(f"🔍 [API] Requête reçue : {query} à {location}")

    # --- Scraping Indeed ---
    print("🚀 Lancement du scraping Indeed...")
    df_indeed = scrape_indeed(query, location)
    df_indeed["Source"] = "Indeed"

    # --- Scraping LinkedIn ---
    print("🚀 Lancement du scraping LinkedIn...")
    df_linkedin = scrape_linkedin(query, location)
    df_linkedin["Source"] = "LinkedIn"

    # --- Fusion des résultats ---
    df_all = pd.concat([df_indeed, df_linkedin], ignore_index=True)
    total_offres = len(df_all)

    if total_offres == 0:
        print("⚠️ Aucune offre trouvée sur les deux plateformes.")
        return jsonify({
            "status": "error",
            "message": "Aucune offre trouvée sur Indeed ni LinkedIn."
        }), 404

    # --- Sauvegarde fusionnée ---
    df_all.to_csv("data/all_jobs.csv", index=False, encoding="utf-8-sig")

    print(f"✅ {total_offres} offres extraites au total.")
    print("📦 Répartition :", 
          f"{len(df_indeed)} Indeed | {len(df_linkedin)} LinkedIn")
    print("📊 Aperçu des données envoyées au frontend :")
    print(df_all.head())
    # --- Envoi au frontend ---
    jobs = df_all.to_dict(orient="records")
    return jsonify({
        "status": "success",
        "message": f"{total_offres} offres extraites (Indeed + LinkedIn).",
        "jobs": jobs
    })


if __name__ == "__main__":
    print("🚀 Serveur Flask lancé sur http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
