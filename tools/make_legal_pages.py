"""Build /terms and /privacy. Plain-English, matched to how BringsUp actually works.

Usage: python3 tools/make_legal_pages.py
Edit the sections below, bump UPDATED, then rerun.
"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPDATED = 'October 22, 2026'
BODY = 'M14 4H34A10 10 0 0 1 44 14V30A10 10 0 0 1 34 40H21L10.6 46.6A1 1 0 0 1 9 45.8V39.3A10 10 0 0 1 4 30V14A10 10 0 0 1 14 4Z'
MARK = f'<svg class="brand-mark" viewBox="0 0 48 48" width="38" height="38" aria-hidden="true"><path class="bm-tile" d="{BODY}"/><g class="bm-arrow" fill="none" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 31V13"/><path d="M16 21l8-8 8 8"/></g></svg>'

TERMS = dict(
  title='Terms of Service', slug='terms',
  desc='The terms for BringsUp websites: free concepts, nothing to pay until you approve, a flat $1,000, and you own everything.',
  summary=[
    'The homepage concept we send you is free. You never owe anything for it.',
    'We build your full site for free. You pay the flat $1,000 only if you approve it.',
    'Once you pay, the site, its files and its design are yours.',
    'The Care Plan is optional, month to month, and you can cancel anytime.',
  ],
  sections=[
    ('Who we are', '<p>BringsUp ("we", "us") designs and builds websites for local businesses. These terms cover bringsup.com, the free concepts we send, and any website we build for you. By submitting one of our forms, signing, or paying, you agree to them.</p>'),
    ('Free concepts', '<p>We sometimes design a sample homepage for a business before being asked, using information that is already public, like your current website and reviews. Concepts are ideas, not live websites. They aren\'t published anywhere except a private link we send you, and they don\'t mean you\'re affiliated with us or have agreed to anything.</p><p>Don\'t want one? Reply to our email or write to <a href="mailto:hello@bringsup.com">hello@bringsup.com</a> and we\'ll delete it and won\'t contact you again.</p>'),
    ('Building your website', '<p>When you fill in our start form and sign, you\'re asking us to build your full website. We aim to send a private preview within about two weeks. Your project includes two rounds of changes, requested by form or email. Extra rounds beyond that, or brand-new pages that weren\'t in scope, may be quoted separately, and we\'ll always tell you the price before doing the work.</p>'),
    ('Approval and payment', '<p>You pay nothing up front. If you approve your finished site, you pay a flat fee of $1,000 (US dollars) by card through Stripe when you approve it. If you decide not to approve it, you can walk away and you owe nothing. We don\'t publish an unapproved site.</p><p>Because you see and approve the finished work before paying, payments are generally non-refundable. If something we built doesn\'t work as shown in the approved preview, tell us within 30 days of launch and we\'ll fix it at no charge.</p>'),
    ('Who owns what', '<p>Once you\'ve paid, you own the finished website, its design and its files, and we\'ll hand over everything if you ask. Your domain always stays in your name. We may show your site in our portfolio unless you ask us not to.</p><p>You keep ownership of everything you send us, like your logo, photos and text. You give us permission to use it to build and run your site, and you confirm you have the right to share it. Stock photos we add are licensed for use on your website.</p>'),
    ('The Care Plan', '<p>The Care Plan is optional. It covers hosting, security updates and small edits (things like new hours, specials, photos or text changes) for a monthly fee shown on our pricing section, billed by Stripe. It renews monthly until you cancel. You can cancel anytime by emailing us, and it stops at the end of that month. If you leave, we help move your site wherever you\'d like.</p><p>Without the Care Plan, you\'re responsible for hosting your site, and we\'ll send you the files and setup steps.</p>'),
    ('Your domain and email', '<p>Connecting your domain to your new site may mean changing settings at your domain provider. We send step-by-step instructions and take care to leave your email settings alone, but you\'re responsible for your domain account, and we aren\'t liable for issues caused by your provider or by changes we didn\'t make.</p>'),
    ('Electronic signatures', '<p>You agree that signing our forms electronically, by drawing your signature or ticking a box to agree, is legally binding, the same as signing on paper, and that we can send agreements, receipts and notices to you by email.</p>'),
    ('What we\'re not responsible for', '<p>We work hard to build sites that bring in customers, but we can\'t promise specific results, rankings or sales. Our sites are provided as approved, and to the fullest extent the law allows, our total responsibility for any claim related to our work is limited to the amount you paid us in the 12 months before the claim. We\'re not liable for indirect losses like lost profits.</p>'),
    ('Ending things', '<p>Either of us can stop a project before you approve it, for any reason, and nobody owes anything. We may decline or stop work that is unlawful, harmful or infringes someone else\'s rights.</p>'),
    ('Changes to these terms', f'<p>If we update these terms, we\'ll change the date at the top of this page. The version in place when you approved your site applies to that project.</p>'),
    ('Contact', '<p>Questions about these terms? Email <a href="mailto:hello@bringsup.com">hello@bringsup.com</a>.</p>'),
  ])

PRIVACY = dict(
  title='Privacy Policy', slug='privacy',
  desc='What BringsUp collects, why, who helps us, and how to have your information deleted.',
  summary=[
    'We collect only what we need to design and build your website.',
    'We never sell your information or share it for advertising.',
    'Card payments go straight to Stripe. We never see your card number.',
    'Ask us anytime to see or delete your information.',
  ],
  sections=[
    ('What we collect', '<ul><li><b>What you send us.</b> Your name, business name, email, phone, website, hours, services, photos, logo, signature and anything else you enter in our forms.</li><li><b>Public business information.</b> To design free concepts, we look at public information about local businesses, like their website, address, hours and reviews.</li><li><b>The website redesign tool.</b> When you use it, we save the web address and email you enter, the redesign we create, and a scrambled (one-way hashed) version of your IP address that we use only to prevent abuse. We never store your IP address itself.</li><li><b>Payments.</b> Stripe collects and processes your card details. We only see that a payment happened, the amount and your receipt email.</li></ul>'),
    ('How we use it', '<p>To design, build, launch and look after your website; to send you previews, receipts and project emails; to answer your questions; and to keep our site and tools safe from abuse. We may send a business a short email about a free concept. Every one of those emails says how to opt out, and we honor it right away.</p>'),
    ('Who helps us', '<p>We use a small set of trusted services to run BringsUp, and they only get what they need to do their job:</p><ul><li><b>Tally</b>, for our forms and file uploads</li><li><b>Stripe</b>, for payments</li><li><b>Supabase</b>, for storing redesign requests</li><li><b>Anthropic (Claude)</b>, the AI that helps us draft designs and copy from your website\'s content</li><li><b>GitHub Pages</b>, which hosts bringsup.com</li><li>Our email provider, for sending and receiving email</li></ul><p>We don\'t sell your information, and we don\'t share it with advertisers. We\'d only share it otherwise if the law requires us to.</p>'),
    ('Cookies', '<p>bringsup.com doesn\'t use advertising or tracking cookies. Our form and payment providers may set the cookies they need to work securely.</p>'),
    ('How long we keep it', '<p>Project information stays for as long as we\'re working together, plus the time we need for taxes and records. Free concepts and redesign requests that don\'t become projects are deleted within 12 months, or sooner if you ask.</p>'),
    ('Your choices', '<p>You can ask to see, correct or delete your information, or to stop hearing from us, at any time. Email <a href="mailto:hello@bringsup.com">hello@bringsup.com</a> and we\'ll take care of it within 30 days. Depending on where you live, you may have extra rights under laws like the CCPA or GDPR, and we\'ll honor those too.</p>'),
    ('Children', '<p>Our services are for businesses and aren\'t meant for anyone under 18.</p>'),
    ('Security', '<p>We use reputable providers, encrypted connections and limited access to protect your information. No system is perfect, and if something ever went wrong that affected you, we\'d tell you promptly.</p>'),
    ('Changes', '<p>If we update this policy, we\'ll change the date at the top of this page. Big changes will be emailed to current customers.</p>'),
    ('Contact', '<p>Questions about privacy? Email <a href="mailto:hello@bringsup.com">hello@bringsup.com</a>.</p>'),
  ])

TPL = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — BringsUp</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#16181D">
<link rel="canonical" href="https://bringsup.com/{slug}/">
<meta property="og:title" content="{title} — BringsUp">
<meta property="og:image" content="https://bringsup.com/assets/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet">
<style>
/* BringsUp brand tokens — see brand.md */
:root{{--ink:#16181D;--muted:#3D414B;--subtle:#5A5F6B;--paper:#FBFAF7;--sand:#F1EEE6;--line:#E4E1D9;--ember:#C2410C;--ember-deep:#9A3412;--glow:#FFB37A;--tint:#FFE8DC;--display:'Bricolage Grotesque',system-ui,sans-serif;--ease:cubic-bezier(.2,.7,.2,1)}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--paper);color:var(--ink);font-family:'DM Sans',system-ui,sans-serif;font-size:18px;line-height:1.65;-webkit-font-smoothing:antialiased}}
::selection{{background:var(--tint)}}
a{{color:var(--ember-deep)}}a:hover{{color:var(--ink)}}
h1,h2,p,ul{{margin:0}}
:focus-visible{{outline:3px solid var(--glow);outline-offset:3px}}
.wrap{{max-width:1180px;margin:0 auto;padding:0 24px}}
header .wrap{{display:flex;justify-content:space-between;align-items:center;gap:16px;padding-top:18px;padding-bottom:18px}}
.brand{{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-family:var(--display);font-weight:800;font-size:24px;letter-spacing:-.02em}}
.brand:hover{{color:var(--ink)}}
.brand-mark{{width:38px;height:38px;flex:none}}
.bm-tile{{fill:var(--ink)}}.bm-arrow{{stroke:var(--glow);transition:transform .3s var(--ease)}}.brand:hover .bm-arrow{{transform:translateY(-2.5px)}}
header nav{{display:flex;gap:20px;font-size:16px}}
header nav a{{color:var(--subtle);text-decoration:none}}header nav a:hover,header nav a[aria-current]{{color:var(--ink)}}
header nav a[aria-current]{{font-weight:700}}
main .wrap{{display:grid;grid-template-columns:240px minmax(0,720px);gap:64px;padding-top:48px;padding-bottom:96px}}
.toc{{position:sticky;top:24px;align-self:start;font-size:15px;display:grid;gap:8px;padding-top:120px}}
.toc a{{color:var(--subtle);text-decoration:none}}
@media (max-width:900px){{main .wrap{{grid-template-columns:minmax(0,1fr);gap:28px;padding-top:20px}}.toc{{display:none}}}}.toc a:hover{{color:var(--ember-deep)}}
.eyebrow{{color:var(--ember-deep);font-weight:700;font-size:15px;letter-spacing:.06em;text-transform:uppercase}}
h1{{font-family:var(--display);font-weight:800;letter-spacing:-.035em;font-size:clamp(40px,5vw,60px);line-height:1;margin-top:12px}}
.updated{{color:var(--subtle);font-size:15px;margin-top:14px}}
.short{{background:var(--sand);border-radius:20px;padding:24px 26px;margin-top:32px}}
.short b{{font-family:var(--display);font-size:20px;letter-spacing:-.01em}}
.short ul{{list-style:none;padding:0;margin-top:12px;display:grid;gap:8px}}
.short li{{display:flex;gap:10px;align-items:flex-start;color:var(--muted)}}
.short svg{{color:var(--ember);flex:none;margin-top:4px}}
section{{margin-top:44px;scroll-margin-top:24px}}
h2{{font-family:var(--display);font-weight:800;letter-spacing:-.02em;font-size:26px;line-height:1.2}}
section p,section ul{{margin-top:12px;color:var(--muted)}}
section ul{{padding-left:20px;display:grid;gap:8px}}
section b{{color:var(--ink)}}
footer{{border-top:1px solid var(--line)}}
footer .wrap{{padding-top:24px;padding-bottom:32px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px 24px;font-size:14px;color:var(--subtle)}}
footer a{{color:var(--subtle)}}
</style>
</head>
<body>
<header><div class="wrap"><a class="brand" href="/" aria-label="BringsUp home">{mark}<span>BringsUp</span></a><nav aria-label="Legal"><a href="/terms/"{cur_terms}>Terms</a><a href="/privacy/"{cur_privacy}>Privacy</a></nav></div></header>
<main>
  <div class="wrap">
    <nav class="toc" aria-label="On this page">
{toc}
    </nav>
    <article>
      <p class="eyebrow">The fine print, in plain English</p>
      <h1>{title}</h1>
      <p class="updated">Last updated {updated}</p>
      <div class="short"><b>The short version</b><ul>
{summary}
      </ul></div>
{sections}
    </article>
  </div>
</main>
<footer><div class="wrap"><span>© 2026 BringsUp · Websites as good as your reviews.</span><span><a href="/terms/">Terms</a> · <a href="/privacy/">Privacy</a> · <a href="mailto:hello@bringsup.com">hello@bringsup.com</a></span></div></footer>
</body>
</html>
'''
CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'

def anchor(h):
    return ''.join(c if c.isalnum() else '-' for c in h.lower().replace("'", '')).strip('-').replace('--', '-')

for p in (TERMS, PRIVACY):
    toc = '\n'.join(f'      <a href="#{anchor(h)}">{h}</a>' for h, _ in p['sections'])
    summary = '\n'.join(f'        <li>{CHECK}<span>{s}</span></li>' for s in p['summary'])
    sections = '\n'.join(f'      <section id="{anchor(h)}"><h2>{h}</h2>{body}</section>' for h, body in p['sections'])
    html = TPL.format(mark=MARK, toc=toc, summary=summary, sections=sections, updated=UPDATED,
                      cur_terms=' aria-current="page"' if p['slug'] == 'terms' else '',
                      cur_privacy=' aria-current="page"' if p['slug'] == 'privacy' else '',
                      title=p['title'], desc=p['desc'], slug=p['slug'])
    os.makedirs(os.path.join(ROOT, p['slug']), exist_ok=True)
    open(os.path.join(ROOT, p['slug'], 'index.html'), 'w').write(html)
print('ok')
