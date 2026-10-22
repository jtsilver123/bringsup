#!/usr/bin/env python3
"""Build a BringsUp homepage concept for one prospect.

Usage: python3 make_concept.py prospect.json OUT_DIR
prospect.json holds one object with the fields from the research step:
name, industry, city_state, website, rating, review_count, rating_source_url,
email, site_issues, what_customers_praise, menu_or_services, hours_if_found,
phone, year_founded_if_known.

Writes OUT_DIR/<slug>-concept.html, -desktop.png, -phone.png and -concept.pdf
(desktop render on page 1, phone render on page 2).
"""
import asyncio, json, os, re, sys
from urllib.parse import urlparse
from jinja2 import Environment, FileSystemLoader, select_autoescape

HERE = os.path.dirname(os.path.abspath(__file__))

THEMES = {
    "bakery": dict(bg="#FBF6EE", ink="#2B1D14", muted="#6B5A4C", hero="#3B2416", hero_ink="#FBF1E4", accent="#F2A65A", accent_ink="#2B1D14", card="#FFFFFF", line="#EADFCF", star="#D9822B", eyebrow="#A4511F", display_font="Fraunces", display_font_q="Fraunces:opsz,wght@9..144,700", body_font="Work Sans", body_font_q="Work+Sans:wght@400;500;700", radius="999px", radius_lg="18px", nav=["Menu", "Order", "Catering", "Visit"], primary_cta="Order for pickup", list_eyebrow="From our kitchen", list_heading="Made fresh, every single day", item_link="See the menu", final_heading="Come hungry. We'll have something warm."),
    "auto": dict(bg="#F4F5F6", ink="#14181C", muted="#4D565F", hero="#14181C", hero_ink="#F4F5F6", accent="#F5B700", accent_ink="#14181C", card="#FFFFFF", line="#DDE1E5", star="#E0A300", eyebrow="#9A6B00", display_font="Archivo", display_font_q="Archivo:wght@700;800", body_font="Inter", body_font_q="Inter:wght@400;500;700", radius="10px", radius_lg="14px", nav=["Services", "About", "Reviews", "Contact"], primary_cta="Book an appointment", list_eyebrow="What we fix", list_heading="Honest repairs on every make and model", item_link="Learn more", final_heading="Your car's in good hands. Let's get you booked."),
    "florist": dict(bg="#FBF5F4", ink="#1F2B24", muted="#5A6660", hero="#23402F", hero_ink="#FBF5F4", accent="#F4B6C2", accent_ink="#1F2B24", card="#FFFFFF", line="#EEDFDD", star="#C2477A", eyebrow="#A3365F", display_font="Cormorant Garamond", display_font_q="Cormorant+Garamond:wght@600;700", body_font="Karla", body_font_q="Karla:wght@400;500;700", radius="999px", radius_lg="22px", nav=["Shop", "Weddings", "Sympathy", "Visit"], primary_cta="Order flowers", list_eyebrow="Arrangements", list_heading="Arranged by hand, delivered with care", item_link="Shop now", final_heading="Send something beautiful today."),
    "trades": dict(bg="#F5F7FA", ink="#102A43", muted="#486581", hero="#102A43", hero_ink="#F0F4F8", accent="#F0B429", accent_ink="#102A43", card="#FFFFFF", line="#D9E2EC", star="#DE911D", eyebrow="#8D2B0B", display_font="Barlow", display_font_q="Barlow:wght@700;800", body_font="Barlow", body_font_q="Barlow:wght@400;500;700", radius="8px", radius_lg="12px", nav=["Services", "Service area", "Reviews", "Contact"], primary_cta="Get a free quote", list_eyebrow="Services", list_heading="Fast, fair, and done right the first time", item_link="Details", final_heading="Need it fixed? We'll be there."),
    "default": dict(bg="#FAF9F6", ink="#1B1D22", muted="#53575F", hero="#1B1D22", hero_ink="#FAF9F6", accent="#FFB37A", accent_ink="#1B1D22", card="#FFFFFF", line="#E4E1D9", star="#C2410C", eyebrow="#9A3412", display_font="Bricolage Grotesque", display_font_q="Bricolage+Grotesque:opsz,wght@12..96,700", body_font="DM Sans", body_font_q="DM+Sans:wght@400;500;700", radius="999px", radius_lg="18px", nav=["Services", "About", "Reviews", "Visit"], primary_cta="Get in touch", list_eyebrow="What we do", list_heading="Everything you love about us, in one place", item_link="Learn more", final_heading="Stop by. We'd love to see you."),
}

def theme_for(industry: str) -> dict:
    s = (industry or "").lower()
    if any(k in s for k in ("bak", "deli", "diner", "cafe", "restaurant", "donut", "pastry", "food")): return THEMES["bakery"]
    if any(k in s for k in ("auto", "car", "mechanic", "tire", "transmission")): return THEMES["auto"]
    if any(k in s for k in ("flor", "flower", "nursery", "garden")): return THEMES["florist"]
    if any(k in s for k in ("plumb", "hvac", "heat", "electric", "roof", "lock", "hardware", "contract")): return THEMES["trades"]
    return THEMES["default"]

def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60]

def build_copy(p, t):
    city = (p.get("city_state") or "").strip()
    yr = str(p.get("year_founded_if_known") or "").strip()
    kicker = f"Family owned · {city}" if city else "Family owned"
    if yr:
        headline = {
            THEMES["bakery"]["primary_cta"]: f"Baked fresh in {city.split(',')[0] or 'town'} since {yr}.",
            THEMES["auto"]["primary_cta"]: f"Trusted car care since {yr}.",
            THEMES["florist"]["primary_cta"]: f"Flowers arranged by hand since {yr}.",
            THEMES["trades"]["primary_cta"]: f"Your neighborhood pros since {yr}.",
        }.get(t["primary_cta"], f"Serving {city.split(',')[0] or 'our neighbors'} since {yr}.")
    else:
        headline = {
            THEMES["bakery"]["primary_cta"]: "Baked fresh every morning, the way it should be.",
            THEMES["auto"]["primary_cta"]: "Honest car care from people who know your name.",
            THEMES["florist"]["primary_cta"]: "Flowers arranged by hand, for every moment.",
            THEMES["trades"]["primary_cta"]: "Done right the first time, by your neighbors.",
        }.get(t["primary_cta"], f"{p['name']}, right here in {city or 'town'}.")
    sub = f"{p['name']} is a family-owned favorite in {city}." if city else f"{p['name']} is a family-owned local favorite."
    sub += " " + {
        THEMES["bakery"]["primary_cta"]: "Order ahead, browse the menu, or stop by and say hi.",
        THEMES["auto"]["primary_cta"]: "Book online in a minute and get back on the road.",
        THEMES["florist"]["primary_cta"]: "Order online for local delivery or pick up in the shop.",
        THEMES["trades"]["primary_cta"]: "Request a quote online and we'll call you back fast.",
    }.get(t["primary_cta"], "Find everything you need below.")
    return kicker, headline, sub

def rating_site(url):
    if not url: return ""
    host = urlparse(url).netloc.lower()
    for k, v in (("google", "Google"), ("yelp", "Yelp"), ("tripadvisor", "Tripadvisor"), ("bbb", "BBB"), ("facebook", "Facebook")):
        if k in host: return v
    return ""

async def render(html_path, out_desktop, out_phone):
    from playwright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, out in ((1440, out_desktop), (390, out_phone)):
            pg = await b.new_page(viewport={"width": w, "height": 900}, device_scale_factor=2 if w < 500 else 1)
            await pg.goto("file://" + html_path)
            await pg.wait_for_timeout(1200)
            await pg.screenshot(path=out, full_page=True)
            await pg.close()
        await b.close()

def main(src, out_dir):
    p = json.load(open(src))
    t = theme_for(p.get("industry", ""))
    kicker, headline, sub = build_copy(p, t)
    services = [s for s in (p.get("menu_or_services") or []) if s][:6] or ["[Service 1]", "[Service 2]", "[Service 3]"]
    env = Environment(loader=FileSystemLoader(HERE), autoescape=select_autoescape(["html"]))
    html = env.get_template("concept_template.html").render(p=p, t=t, kicker=kicker, headline=headline, sub=sub, services=services, rating_site=rating_site(p.get("rating_source_url")))
    os.makedirs(out_dir, exist_ok=True)
    slug = slugify(p["name"])
    hp = os.path.abspath(os.path.join(out_dir, f"{slug}-concept.html"))
    open(hp, "w").write(html)
    d, ph = hp.replace("-concept.html", "-desktop.png"), hp.replace("-concept.html", "-phone.png")
    asyncio.run(render(hp, d, ph))
    # Presentation board: the concept shown in a browser window with their own domain, plus a phone.
    domain = urlparse(p.get("website") or "").netloc.lower().removeprefix("www.") or slug + ".com"
    board_html = env.get_template("board_template.html").render(
        name=p["name"], domain=domain, cta={"Order for pickup": "Online ordering", "Book an appointment": "Online booking", "Order flowers": "Online ordering", "Get a free quote": "Quote requests"}.get(t["primary_cta"], "Contact form"),
        desktop="file://" + d, phone="file://" + ph)
    bh = hp.replace("-concept.html", "-board.html"); open(bh, "w").write(board_html)
    board = hp.replace("-concept.html", "-board.png")
    asyncio.run(render_board(bh, board))
    from PIL import Image
    def page(path, max_w):
        im = Image.open(path).convert("RGB")
        if im.width > max_w:
            im = im.resize((max_w, round(im.height * max_w / im.width)))
        return im
    imgs = [page(board, 1600), page(d, 1200), page(ph, 600)]
    pdf = hp.replace(".html", ".pdf")
    imgs[0].save(pdf, save_all=True, append_images=imgs[1:], resolution=110, quality=82)
    print(json.dumps({"html": hp, "board": board, "desktop": d, "phone": ph, "pdf": pdf, "pdf_kb": os.path.getsize(pdf) // 1024}))

async def render_board(html_path, out):
    from playwright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        pg = await b.new_page(viewport={"width": 1600, "height": 1000})
        await pg.goto("file://" + html_path)
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path=out)
        await b.close()

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
