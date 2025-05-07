from flask import Flask, request, jsonify
from brochure_utils import Website, get_links
import openai
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

@app.route("/api/brochure", methods=["POST"])
def generate_brochure():
    try:
        data = request.get_json()
        company = data.get("company")
        url = data.get("url")
        persona = data.get("persona", "customers")

        homepage = Website(url)

        prompt = f"""
Write a brochure for {company}. Assume the audience is {persona}.
Include details from the website:
{homepage.text[:1500]}
"""

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You write brochures for tech companies."},
                {"role": "user", "content": prompt}
            ]
        )

        content = response.choices[0].message.content

        # ניסיון בטוח להוציא קישורים
        links = get_links(url)
        competitor_urls = [link["url"] for link in links.get("links", []) if "url" in link]

        return jsonify({
            "brochure": content,
            "competitors": competitor_urls
        })

    except Exception as e:
        print("❌ Error in /api/brochure:", str(e))
        return jsonify({"error": "Failed to generate brochure"}), 500

if __name__ == '__main__':
    app.run(port=5000)
