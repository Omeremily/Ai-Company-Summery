import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
}

class Website:
    def __init__(self, url):
        self.url = url
        self.text = ""
        self.title = ""
        try:
            response = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, "html.parser")
            self.title = soup.title.string if soup.title else "No title"
            if soup.body:
                for tag in soup.body(["script", "style", "img", "input"]):
                    tag.decompose()
                self.text = soup.body.get_text(separator="\n", strip=True)
        except Exception as e:
            print(f"❌ Failed to fetch website: {url} → {e}")
            self.text = "Unable to fetch content from the website."

def get_links(url):
    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, "html.parser")
        links = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.startswith("http") and url.split("//")[1] in href:
                if "about" in href.lower():
                    link_type = "about page"
                elif "career" in href.lower() or "jobs" in href.lower():
                    link_type = "careers page"
                elif "pricing" in href.lower():
                    link_type = "pricing page"
                elif "blog" in href.lower():
                    link_type = "blog page"
                elif "docs" in href.lower():
                    link_type = "docs page"
                elif "enterprise" in href.lower():
                    link_type = "enterprise page"
                else:
                    link_type = "other page"
                links.append({"type": link_type, "url": href})
        return {"links": links}
    except Exception as e:
        print(f"❌ Failed to extract links from: {url} → {e}")
        return {"links": []}
