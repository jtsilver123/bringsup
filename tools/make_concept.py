#!/usr/bin/env python3
"""Build a BringsUp homepage concept for one prospect.

Usage: python3 make_concept.py prospect.json OUT_DIR
prospect.json holds one object with the fields from the research step:
name, industry, city_state, website, rating, review_count, rating_source_url,
email, owner_name_if_known, site_issues, what_customers_praise, menu_or_services,
hours_if_found, phone, year_founded_if_known.

Writes OUT_DIR/<slug>-concept.html, -desktop.png, -phone.png, -board.png and
-concept.pdf (the desktop homepage as one continuous, high-resolution page).
Photos are Unsplash stock (free for commercial use under the Unsplash License).
"""
import asyncio, json, os, re, sys
from urllib.parse import urlparse
from jinja2 import Environment, FileSystemLoader, select_autoescape

HERE = os.path.dirname(os.path.abspath(__file__))

def u(pid, w=1800):
    return f"https://images.unsplash.com/photo-{pid}?auto=format&fit=crop&w={w}&q=82"

BASE = dict(radius="999px", radius_lg="20px")

THEMES = {
    "bakery": dict(BASE, bg="#FBF6EE", ink="#2B1D14", muted="#6B5A4C", hero="#3B2416", hero_ink="#FBF1E4", accent="#F2A65A", accent_ink="#2B1D14", card="#FFFFFF", line="#EADFCF", star="#D9822B", eyebrow="#A4511F",
        display_font="Fraunces", display_font_q="Fraunces:opsz,wght@9..144,600;9..144,700", body_font="Work Sans", body_font_q="Work+Sans:wght@400;500;600;700;800",
        tagline="Family bakery", nav=["Menu", "Order", "Catering", "Visit"], primary_cta="Order for pickup", list_eyebrow="From our kitchen", list_heading="Made fresh, every single day",
        list_sub="Everything is baked in-house in small batches. Order ahead and we'll have it boxed and ready.", item_link="See the menu",
        blurbs=["A customer favorite, baked fresh every morning.", "Made from scratch the way we always have.", "Order ahead for holidays and celebrations."],
        steps_eyebrow="Order ahead", steps_heading="Skip the line in three steps",
        steps=[["Pick your favorites", "Browse the full menu online, with photos and prices."], ["Choose a pickup time", "Same-day or schedule ahead for parties and holidays."], ["Grab it and go", "Your order is boxed and waiting at the counter."]],
        final_heading="Come hungry. We'll have something warm.",
        photos=dict(hero=u("1509440159596-0249088772ff"), cards=[u("1608198093002-ad4e005484ec", 900), u("1555507036-ab1f4038808a", 900), u("1568254183919-78a4f43a2877", 900)], story=u("1568254183919-78a4f43a2877", 1200), cta=u("1555507036-ab1f4038808a"))),
    "deli": dict(BASE, bg="#FAF7F2", ink="#24201B", muted="#625A50", hero="#1F3A2B", hero_ink="#F6F1E7", accent="#E8B64C", accent_ink="#24201B", card="#FFFFFF", line="#E8E0D2", star="#C88A12", eyebrow="#8A4B12",
        display_font="Fraunces", display_font_q="Fraunces:opsz,wght@9..144,600;9..144,700", body_font="Work Sans", body_font_q="Work+Sans:wght@400;500;600;700;800",
        tagline="Family deli", nav=["Menu", "Catering", "About", "Visit"], primary_cta="Order for pickup", list_eyebrow="On the menu", list_heading="Piled high, made to order",
        list_sub="Fresh-baked rolls, imported meats and recipes the family has made for decades.", item_link="See the menu",
        blurbs=["The one regulars order every time.", "Made to order, never pre-wrapped.", "Feeds the whole office. Ask about trays."],
        steps_eyebrow="Order ahead", steps_heading="Lunch, without the wait",
        steps=[["Build your order", "Pick from the full menu online."], ["Choose a pickup time", "We'll have it ready when you walk in."], ["Planning an event?", "Catering trays for any size group."]],
        final_heading="Hungry? Your sub is waiting.",
        photos=dict(hero=u("1509722747041-616f39b57569"), cards=[u("1553909489-cd47e0907980", 900), u("1528735602780-2552fd46c7af", 900), u("1504674900247-0877df9cc836", 900)], story=u("1504674900247-0877df9cc836", 1200), cta=u("1509722747041-616f39b57569"))),
    "auto": dict(BASE, radius="10px", radius_lg="16px", bg="#F4F5F6", ink="#14181C", muted="#4D565F", hero="#14181C", hero_ink="#F4F5F6", accent="#F5B700", accent_ink="#14181C", card="#FFFFFF", line="#DDE1E5", star="#E0A300", eyebrow="#9A6B00",
        display_font="Archivo", display_font_q="Archivo:wght@600;700;800", body_font="Inter", body_font_q="Inter:wght@400;500;600;700;800",
        tagline="Auto repair", nav=["Services", "About", "Reviews", "Contact"], primary_cta="Book an appointment", list_eyebrow="What we fix", list_heading="Honest repairs on every make and model",
        list_sub="Straight answers, fair prices, and the work explained before we start.", item_link="Learn more",
        blurbs=["Done right, with the work explained first.", "Diagnosed fast so you're back on the road.", "Upfront pricing, no surprises."],
        steps_eyebrow="Book online", steps_heading="Get your car in, in under a minute",
        steps=[["Pick a service", "Choose what you need, or tell us what you're hearing."], ["Choose a time", "See open slots and book instantly."], ["Drop it off", "We'll text you an update and a quote before any work."]],
        final_heading="Your car's in good hands. Let's get you booked.",
        photos=dict(hero=u("1619642751034-765dfdf7c58e"), cards=[u("1487754180451-c456f719a1fc", 900), u("1625047509248-ec889cbff17f", 900), u("1486262715619-67b85e0b08d3", 900)], story=u("1530046339160-ce3e530c7d2f", 1200), cta=u("1625047509248-ec889cbff17f"))),
    "garden": dict(BASE, bg="#F6F7F1", ink="#1F2B24", muted="#56635B", hero="#23402F", hero_ink="#F4F6EE", accent="#E9C46A", accent_ink="#1F2B24", card="#FFFFFF", line="#DEE3D6", star="#C2902B", eyebrow="#4E7A3A",
        display_font="Fraunces", display_font_q="Fraunces:opsz,wght@9..144,600;9..144,700", body_font="Karla", body_font_q="Karla:wght@400;500;600;700;800",
        tagline="Greenhouse & garden", nav=["Plants", "Seasonal", "About", "Visit"], primary_cta="Shop plants", list_eyebrow="Grown here", list_heading="Grown on site, season after season",
        list_sub="Healthy, local plants and advice from people who grow them.", item_link="Shop now",
        blurbs=["Grown in our own greenhouses.", "Ready for your garden this season.", "Ask us what thrives in your yard."],
        steps_eyebrow="Shop online", steps_heading="Reserve plants before they sell out",
        steps=[["Browse what's in stock", "Updated every week through the season."], ["Reserve for pickup", "We'll set your order aside."], ["Get growing", "Free advice when you pick up."]],
        final_heading="Something's always blooming here.",
        photos=dict(hero=u("1523348837708-15d4a09cfac2"), cards=[u("1466692476868-aef1dfb1e735", 900), u("1490750967868-88aa4486c946", 900), u("1591857177580-dc82b9ac4e1e", 900)], story=u("1591857177580-dc82b9ac4e1e", 1200), cta=u("1490750967868-88aa4486c946"))),
    "trades": dict(BASE, radius="8px", radius_lg="14px", bg="#F5F7FA", ink="#102A43", muted="#486581", hero="#102A43", hero_ink="#F0F4F8", accent="#F0B429", accent_ink="#102A43", card="#FFFFFF", line="#D9E2EC", star="#DE911D", eyebrow="#8D2B0B",
        display_font="Barlow", display_font_q="Barlow:wght@600;700;800", body_font="Barlow", body_font_q="Barlow:wght@400;500;600;700",
        tagline="Licensed & insured", nav=["Services", "Service area", "Reviews", "Contact"], primary_cta="Get a free quote", list_eyebrow="Services", list_heading="Fast, fair, and done right the first time",
        list_sub="Local, licensed pros who show up when they say they will.", item_link="Details",
        blurbs=["Same-day help when it can't wait.", "Clean, careful work and a fair price.", "Installed right, and backed by us."],
        steps_eyebrow="How it works", steps_heading="Get it fixed without the runaround",
        steps=[["Tell us what's going on", "Send a quick request with a photo if you have one."], ["Get a clear quote", "Upfront pricing before any work starts."], ["We fix it", "On time, cleaned up, done."]],
        final_heading="Need it fixed? We'll be there.",
        photos=dict(hero=u("1607472586893-edb57bdc0e39"), cards=[u("1585704032915-c3400ca199e7", 900), u("1621905251189-08b45d6a269e", 900), u("1504148455328-c376907d081c", 900)], story=u("1581244277943-fe4a9c777189", 1200), cta=u("1607472586893-edb57bdc0e39"))),
}
THEMES["education"] = dict(BASE, radius="12px", radius_lg="18px", bg="#F6F7FB", ink="#15203A", muted="#4B5675", hero="#15203A", hero_ink="#F3F5FB", accent="#F5B546", accent_ink="#15203A", card="#FFFFFF", line="#DFE3EE", star="#E09B1A", eyebrow="#B4560C",
        display_font="Fraunces", display_font_q="Fraunces:opsz,wght@9..144,600;9..144,700", body_font="Inter", body_font_q="Inter:wght@400;500;600;700;800",
        tagline="Residency consulting", nav=["How it works", "Pricing", "Results", "FAQ"], primary_cta="Book a free call", list_eyebrow="What we do", list_heading="In-state tuition, without the guesswork",
        list_sub="A clear plan, the paperwork handled, and a fee you only pay when it works.", item_link="Learn more",
        blurbs=["Know your odds in 30 minutes, free.", "Every document and deadline, mapped out.", "We only get paid after you're reclassified."],
        steps_eyebrow="How it works", steps_heading="From out-of-state to in-state in three steps",
        steps=[["Free consultation", "A 30-minute call on your odds, school and timeline."], ["Your roadmap", "A step-by-step plan built on your state's actual rules."], ["Reclassification", "We guide every step. You pay only when it's granted."]],
        final_heading="Stop paying out-of-state tuition.",
        photos=dict(hero=u("1541339907198-e08756dedf3f"), cards=[u("1554224155-6726b3ff858f", 900), u("1450101499163-c8848c66ca85", 900), u("1531545514256-b1400bc00f31", 900)], story=u("1562774053-701939374585", 1200), cta=u("1517486808906-6ca8b3f04846")))
THEMES["home"] = dict(BASE, radius="6px", radius_lg="10px", bg="#F7F4EF", ink="#1E1B18", muted="#5E5750", hero="#2A2622", hero_ink="#F5F1EA", accent="#C9A46A", accent_ink="#1E1B18", card="#FFFFFF", line="#E6DFD4", star="#B8873A", eyebrow="#8A6A3A",
        display_font="Cormorant Garamond", display_font_q="Cormorant+Garamond:wght@600;700", body_font="Jost", body_font_q="Jost:wght@400;500;600;700",
        tagline="Craftsmanship for the home", nav=["Services", "Our work", "About", "Contact"], primary_cta="Request a consultation", list_eyebrow="What we do", list_heading="Made to last, made for your home",
        list_sub="Every project is handled by the same hands, start to finish.", item_link="View work",
        blurbs=["Done by hand, in our own workshop.", "Materials chosen with you, piece by piece.", "Built to last for generations."],
        steps_eyebrow="How it works", steps_heading="From first visit to finished piece",
        steps=[["Book a consultation", "Tell us about the project; we'll come see it or you bring it in."], ["Choose the details", "Fabrics, finishes and a clear quote up front."], ["We get to work", "Delivered or installed on schedule, finished right."]],
        final_heading="Let's start on your next project.",
        photos=dict(hero=u("1617806118233-18e1de247200"), cards=[u("1555041469-a586c61ea9bc", 900), u("1549187774-b4e9b0445b41", 900), u("1513519245088-0e12902e5a38", 900)], story=u("1586023492125-27b2c045efd7", 1200), cta=u("1600585154340-be6161a56a0c")))
THEMES["boutique"] = dict(BASE, radius="2px", radius_lg="4px", bg="#FAF8F5", ink="#1A1A1A", muted="#5C5A57", hero="#151515", hero_ink="#F6F3EE", accent="#D8B67A", accent_ink="#151515", card="#FFFFFF", line="#E7E2DA", star="#B8924A", eyebrow="#8C6A32",
        display_font="Cormorant Garamond", display_font_q="Cormorant+Garamond:wght@600;700", body_font="Jost", body_font_q="Jost:wght@400;500;600;700",
        tagline="Fine craftsmanship", nav=["Collections", "Services", "About", "Visit"], primary_cta="Book an appointment", list_eyebrow="Our craft", list_heading="Pieces made, cared for and kept for a lifetime",
        list_sub="Personal service from people who know the work.", item_link="Learn more",
        blurbs=["Done in-house, by hand.", "A personal consultation, never a rush.", "Cared for like it's our own."],
        steps_eyebrow="Visit us", steps_heading="Personal service, start to finish",
        steps=[["Book a time", "Pick a slot that works and tell us what you have in mind."], ["Meet with us", "We'll walk you through options, honestly."], ["Pick it up", "Finished with care, ready when we say it will be."]],
        final_heading="Come see us. We'd love to help.",
        photos=dict(hero=u("1611652022419-a9419f74343d"), cards=[u("1515562141207-7a88fb7ce338", 900), u("1594938298603-c8148c4dae35", 900), u("1611652022419-a9419f74343d", 900)], story=u("1515562141207-7a88fb7ce338", 1200), cta=u("1611652022419-a9419f74343d")))
THEMES["default"] = THEMES["trades"]

def theme_for(industry: str) -> dict:
    s = (industry or "").lower()
    if any(k in s for k in ("jewel", "watch", "tailor", "alteration", "bridal")): return THEMES["boutique"]
    if any(k in s for k in ("upholst", "furniture", "frame", "framing", "interior", "cabinet", "carpent", "remodel", "builder", "restoration", "woodwork")): return THEMES["home"]
    if any(k in s for k in ("landscap", "tree", "lawn")): return THEMES["garden"]
    if any(k in s for k in ("tuition", "residency", "education", "consult", "college")): return THEMES["education"]
    if any(k in s for k in ("deli", "sandwich", "sub", "pizza", "diner", "restaurant")): return THEMES["deli"]
    if any(k in s for k in ("bak", "cafe", "donut", "pastry", "dessert")): return THEMES["bakery"]
    if any(k in s for k in ("auto", "car", "mechanic", "tire", "transmission")): return THEMES["auto"]
    if any(k in s for k in ("flor", "flower", "nursery", "garden", "greenhouse")): return THEMES["garden"]
    return THEMES["trades"]

def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60]

def initials(name):
    words = [w for w in re.split(r"[^A-Za-z]+", re.sub(r"'s\b", "", name)) if w and w.lower() not in ("the", "and", "of", "inc", "llc", "co")]
    return "".join(w[0] for w in words[:2]).upper() or name[:1].upper()

def build_copy(p, t):
    city = (p.get("city_state") or "").split(",")[0].strip()
    yr = str(p.get("year_founded_if_known") or "").strip()
    yr = yr[:4] if yr[:4].isdigit() else ""
    key = t["tagline"]
    with_year = {"Family bakery": f"Baked fresh in {city} since {yr}.", "Family deli": f"{city}'s favorite subs since {yr}.", "Auto repair": f"Trusted car care since {yr}.",
                 "Greenhouse & garden": f"Growing in {city} since {yr}.", "Licensed & insured": f"{city}'s neighborhood pros since {yr}.", "Residency consulting": "Pay in-state tuition. Legally, and for good.", "Craftsmanship for the home": f"Crafted in {city} since {yr}.", "Fine craftsmanship": f"A {city} tradition since {yr}."}
    no_year = {"Family bakery": "Baked fresh every morning, the way it should be.", "Family deli": "Piled-high subs, made the old-fashioned way.", "Auto repair": "Honest car care from people who know your name.",
               "Greenhouse & garden": "Healthy plants, grown right here.", "Licensed & insured": "Done right the first time, by your neighbors.", "Residency consulting": "Pay in-state tuition. Legally, and for good.", "Craftsmanship for the home": "Craftsmanship you can see, and feel.", "Fine craftsmanship": "Fine work, personal service."}
    headline = (with_year if yr and city else no_year)[key]
    subs = {"Family bakery": "Order ahead online, browse the full menu, or stop by and say hi.", "Family deli": "Order ahead online and skip the line, or let us cater your next event.",
            "Auto repair": "Book online in a minute, get a clear quote, and get back on the road.", "Greenhouse & garden": "See what's in stock this week and reserve plants for pickup.",
            "Licensed & insured": "Request a free quote online and we'll call you back fast.",
            "Craftsmanship for the home": "Book a consultation online and see past work, materials and pricing up front.",
            "Fine craftsmanship": "Book a private appointment online, or stop in and see us.",
            "Residency consulting": "We guide out-of-state students and parents through residency, step by step, and only get paid when it's granted."}
    sub = p.get("sub") or (f"{p['name']} is a family-owned favorite in {p.get('city_state') or 'town'}. " + subs[key])
    owner = (p.get("owner_name_if_known") or "").split("(")[0].strip()
    story_heading = f"Family owned since {yr}." if yr else "Family owned and proud of it."
    story_lead = (f"Serving {city or 'our neighbors'} since {yr}. " if yr else f"A {city} favorite. ") + (f"Run today by {owner}, with the same care and standards. " if owner else "Same care, same standards. ") + "Now a little easier to find online."
    story_heading = p.get('story_heading') or story_heading
    story_lead = p.get('story_lead') or story_lead
    return city, headline, sub, story_heading, story_lead

def rating_site(url):
    host = urlparse(url or "").netloc.lower()
    for k, v in (("google", "Google"), ("yelp", "Yelp"), ("tripadvisor", "Tripadvisor"), ("bbb", "BBB")):
        if k in host: return v
    return ""

def stats_for(p):
    if p.get("stats"): return p["stats"][:4]
    out = []
    yr = str(p.get("year_founded_if_known") or "")[:4]
    if yr.isdigit(): out.append({"n": yr, "l": "Family owned since"})
    if p.get("rating"): out.append({"n": f"{p['rating']}★", "l": "Average rating"})
    rc = re.match(r"\d[\d,]*", str(p.get("review_count") or ""))
    if rc: out.append({"n": rc.group(0) + "+", "l": "Customer reviews"})
    out.append({"n": "Local", "l": "Independent, not a chain"})
    if len(out) < 4: out.append({"n": "Online", "l": "Order or book 24/7"})
    return out[:4]

async def render(html_path, out_desktop, out_phone):
    from playwright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, out, scale in ((1440, out_desktop, 1), (390, out_phone, 2)):
            pg = await b.new_page(viewport={"width": w, "height": 900}, device_scale_factor=scale)
            await pg.goto("file://" + html_path, wait_until="networkidle", timeout=90000)
            await pg.wait_for_timeout(800)
            await pg.screenshot(path=out, full_page=True)
            await pg.close()
        await b.close()

async def render_pdf(html_path, out):
    """Full desktop page at 2x resolution, saved as a single-page JPEG-based PDF (small enough to attach)."""
    from playwright.async_api import async_playwright
    from PIL import Image
    png = out.replace(".pdf", "-2x.png")
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        pg = await b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        await pg.goto("file://" + html_path, wait_until="networkidle", timeout=90000)
        await pg.wait_for_timeout(800)
        await pg.screenshot(path=png, full_page=True)
        await b.close()
    im = Image.open(png).convert("RGB")
    im.save(out, "PDF", resolution=144, quality=84, optimize=True)
    os.remove(png)

async def render_board(html_path, out):
    from playwright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        pg = await b.new_page(viewport={"width": 1600, "height": 1000}, device_scale_factor=2)
        await pg.goto("file://" + html_path, wait_until="networkidle", timeout=90000)
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=out)
        await b.close()

def main(src, out_dir):
    p = json.load(open(src))
    t = theme_for(p.get("industry", ""))
    city, headline, sub, story_heading, story_lead = build_copy(p, t)
    services = [s for s in (p.get("menu_or_services") or []) if s]
    feature_cards = [{"title": s, "blurb": t["blurbs"][i], "img": t["photos"]["cards"][i]} for i, s in enumerate(services[:3])]
    env = Environment(loader=FileSystemLoader(HERE), autoescape=select_autoescape(["html"]))
    html = env.get_template("concept_template.html").render(
        p=p, t=t, city=city or p.get("city_state", ""), headline=headline, sub=sub, story_heading=story_heading, story_lead=story_lead,
        feature_cards=feature_cards, more_services=services[3:8], photos=t["photos"], stats=stats_for(p), initials=initials(p["name"]),
        rating_site=rating_site(p.get("rating_source_url")))
    os.makedirs(out_dir, exist_ok=True)
    slug = slugify(p["name"])
    hp = os.path.abspath(os.path.join(out_dir, f"{slug}-concept.html"))
    open(hp, "w").write(html)
    d, ph = hp.replace("-concept.html", "-desktop.png"), hp.replace("-concept.html", "-phone.png")
    asyncio.run(render(hp, d, ph))
    domain = urlparse(p.get("website") or "").netloc.lower().removeprefix("www.") or slug + ".com"
    feature = {"Order for pickup": "Online ordering", "Book an appointment": "Online booking", "Shop plants": "Online plant shop", "Get a free quote": "Quote requests", "Request a consultation": "Consultation booking", "Book a free call": "Free-call booking"}.get(t["primary_cta"], "Contact form")
    board_html = env.get_template("board_template.html").render(name=p["name"], domain=domain, cta=feature, desktop="file://" + d, phone="file://" + ph)
    bh = hp.replace("-concept.html", "-board.html"); open(bh, "w").write(board_html)
    board = hp.replace("-concept.html", "-board.png")
    asyncio.run(render_board(bh, board))
    pdf = hp.replace(".html", ".pdf")
    asyncio.run(render_pdf(hp, pdf))
    print(json.dumps({"html": hp, "board": board, "desktop": d, "phone": ph, "pdf": pdf, "pdf_kb": os.path.getsize(pdf) // 1024}))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
