import requests
from bs4 import BeautifulSoup
import json
import logging
import time
import random
import os

# --- SMAART Job Market Scraper v2.0 ---
# Upgraded to fetch live job counts from Indian job boards (Naukri.com)
# with a robust drafting system for Admin approval.

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

DRAFTS_FILE = os.path.join(os.path.dirname(__file__), 'data_drafts.json')

def fetch_naukri_count(role_title, location="India"):
    """
    Scrapes the live job count for a given role from Naukri.com
    to provide real-time demand intelligence.
    """
    # Create clean URL slug
    slug = role_title.lower().replace(' ', '-').replace('/', '-')
    url = f"https://www.naukri.com/{slug}-jobs-in-india"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        logger.info(f"🔍 Scraping Naukri for: {role_title}")
        res = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Naukri often hides count in class names like 'count' or 'job-count'
        count_tag = soup.find(class_=lambda c: c and ('count' in c.lower() or 'total-jobs' in c.lower()))
        
        if count_tag:
            return count_tag.get_text(strip=True)
        return "Not specified"
    except Exception as e:
        logger.warning(f"⚠️ Scraping failed for {role_title}: {str(e)}")
        return "Market Insight Pending"

def fetch_job_listings(query="Data Analyst", location="India", limit=3):
    """
    Combines live scraping with mock pipeline to populate Admin drafts.
    """
    # Rotating delay to prevent IP blocks
    delay = random.uniform(3, 7)
    time.sleep(delay)
    
    real_count = fetch_naukri_count(query, location)
    
    mock_results = []
    base_salary = 600000 if any(k in query.lower() for k in ['data', 'analyst', 'tech']) else 450000
    
    for i in range(limit):
        mock_results.append({
            "id": f"job_{int(time.time())}_{random.randint(1000,9999)}",
            "title": query,
            "market_demand": real_count,
            "company": f"Partner Corp {['A', 'B', 'C'][i%3]}",
            "location": ['Bangalore', 'Hyderabad', 'Pune', 'Noida'][i%4],
            "required_skills": [query.split()[0], "Analytical Mastery", "AI Tools"],
            "salary_est": f"₹{base_salary + (i * 75000)} - ₹{base_salary + (i * 150000)}",
            "status": "DRAFT_PENDING_REVIEW",
            "timestamp": time.time()
        })
    return mock_results

def run_pipeline():
    logger.info("🚀 Starting SMAART Daily Scraper Pipeline...")
    drafts = []
    
    # Load existing drafts to preserve historical data
    if os.path.exists(DRAFTS_FILE):
        with open(DRAFTS_FILE, 'r') as f:
            try:
                drafts = json.load(f)
            except:
                pass
                
    # Key roles for current Indian market pilot
    roles_to_scrape = ["Data Analyst", "Financial Analyst", "AI Engineer", "Business Intelligence"]
    
    for role in roles_to_scrape:
        jobs = fetch_job_listings(query=role, limit=2)
        drafts.extend(jobs)
        
    with open(DRAFTS_FILE, "w") as f:
        json.dump(drafts, f, indent=2)
        
    logger.info(f"✅ Pipeline Complete. {len(drafts)} drafts ready for Admin Approval at {DRAFTS_FILE}")

if __name__ == "__main__":
    run_pipeline()
