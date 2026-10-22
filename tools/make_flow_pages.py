"""Build the customer flow pages (/start, /changes, /approve) that wrap the Tally forms.

Usage: python3 tools/make_flow_pages.py
Edit PAGES below to change copy or form IDs, then rerun.
"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BODY='M14 4H34A10 10 0 0 1 44 14V30A10 10 0 0 1 34 40H21L10.6 46.6A1 1 0 0 1 9 45.8V39.3A10 10 0 0 1 4 30V14A10 10 0 0 1 14 4Z'
MARK=f'<svg class="brand-mark" viewBox="0 0 48 48" width="38" height="38" aria-hidden="true"><path class="bm-tile" d="{BODY}"/><g class="bm-arrow" fill="none" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 31V13"/><path d="M16 21l8-8 8 8"/></g></svg>'
CHECK='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
PAGES={
 'start': dict(form='Ar7yBl', title='Start my website', eyebrow='Start my website',
   h1='Let\'s build your <span class="lift">new site.<svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path d="M4 16 C 70 11, 170 10, 250 12 C 268 12, 282 9, 296 3"/></svg></span>',
   lead='Ten minutes, no call, nothing to pay. We build your whole website from this form. You pay the flat $1,000 only once you\'ve seen it and approved it.',
   steps=[('Fill in this form','Hours, services, a few photos if you have them. Skip anything you\'re not sure about.'),('We build your full site','Every page, plus a refreshed logo and colors. About two weeks.'),('Review and request changes','A private preview link, and two rounds of changes by form.'),('Approve, pay, go live','Love it? Pay the flat $1,000 and it goes live on your domain. If not, you owe nothing.')],
   promise='Nothing to pay until you approve your finished site.', done_h='We\'re on it.', done_p='Your private preview link arrives by email in about two weeks. Keep an eye out for it from jake@bringsup.com.',
   desc='Start your new BringsUp website. Ten minutes, no call, nothing to pay until you approve it.'),
 'changes': dict(form='EqkMlA', title='Request changes', eyebrow='Request changes',
   h1='Tell us what to <span class="lift">change.<svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path d="M4 16 C 70 11, 170 10, 250 12 C 268 12, 282 9, 296 3"/></svg></span>',
   lead='Look over your preview, then list what you\'d like different. Big or small, it all counts. Your project includes two rounds of changes.',
   steps=[('List your changes','One per line, with the page it\'s on. Screenshots help.'),('We update your preview','You\'ll get an email with the new version as soon as it\'s ready.'),('Approve when you love it','Then you pay the flat $1,000 and it goes live.')],
   promise='Still nothing to pay until you approve.', done_h='Got your changes.', done_p='We\'ll email your updated preview as soon as it\'s ready.',
   desc='Request changes to your BringsUp website preview.'),
 'approve': dict(form='VpLDP6', title='Approve and launch', eyebrow='Approve and launch',
   h1='Ready to go <span class="lift">live?<svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path d="M4 16 C 70 11, 170 10, 250 12 C 268 12, 282 9, 296 3"/></svg></span>',
   lead='Approve your preview and pay the flat $1,000. Then we put your new site live on the domain you already have.',
   steps=[('Approve and pay','One flat $1,000, by card through Stripe. Your receipt comes by email.'),('Connect your domain','We email simple steps for your provider. About 10 minutes, or we send them to your web person.'),('You\'re live','Your email keeps working exactly like it does today. You own the site and every file.')],
   promise='Secure card payment through Stripe. You own everything.', done_h='You\'re approved.', done_p='Your receipt is on its way. Next, we\'ll email the steps to connect your domain.',
   desc='Approve your BringsUp website and go live.'),
}
TPL='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — BringsUp</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#16181D">
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
body{{margin:0;background:var(--paper);color:var(--ink);font-family:'DM Sans',system-ui,sans-serif;font-size:18px;line-height:1.55;-webkit-font-smoothing:antialiased}}
::selection{{background:var(--tint)}}
a{{color:var(--ember-deep)}}a:hover{{color:var(--ink)}}
h1,h2,h3,p,ol{{margin:0}}
:focus-visible{{outline:3px solid var(--glow);outline-offset:3px}}
.wrap{{max-width:1180px;margin:0 auto;padding:0 24px}}
header .wrap{{display:flex;justify-content:space-between;align-items:center;gap:16px;padding-top:18px;padding-bottom:18px}}
.brand{{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-family:var(--display);font-weight:800;font-size:24px;letter-spacing:-.02em}}
.brand:hover{{color:var(--ink)}}
.brand-mark{{width:38px;height:38px;flex:none}}
.bm-tile{{fill:var(--ink)}}.bm-arrow{{stroke:var(--glow);transition:transform .3s var(--ease)}}.brand:hover .bm-arrow{{transform:translateY(-2.5px)}}
header .help{{font-size:16px;color:var(--subtle)}}
main .wrap{{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:56px;align-items:start;padding-top:40px;padding-bottom:96px}}
@media (max-width:960px){{main .wrap{{grid-template-columns:minmax(0,1fr);gap:36px;padding-top:16px}}}}
.side{{position:sticky;top:24px}}
@media (max-width:960px){{.side{{position:static}}}}
.eyebrow{{color:var(--ember-deep);font-weight:700;font-size:15px;letter-spacing:.06em;text-transform:uppercase}}
h1{{font-family:var(--display);font-weight:800;letter-spacing:-.035em;font-size:clamp(40px,5vw,64px);line-height:1;margin-top:12px;text-wrap:balance}}
.lift{{position:relative;white-space:nowrap;display:inline-block;color:var(--ember)}}
.lift svg{{position:absolute;left:-2%;bottom:-.12em;width:106%;height:.32em;overflow:visible}}
.lift path{{fill:none;stroke:var(--ember);stroke-width:6;stroke-linecap:round;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1;animation:draw .9s .3s var(--ease) forwards}}
@keyframes draw{{to{{stroke-dashoffset:0}}}}
.lead{{font-size:19px;color:var(--muted);margin-top:20px;text-wrap:pretty}}
.steps{{list-style:none;padding:0;margin-top:32px;display:grid;gap:18px;counter-reset:n}}
.steps li{{display:grid;grid-template-columns:34px 1fr;gap:14px;counter-increment:n}}
.steps li::before{{content:counter(n);width:34px;height:34px;border-radius:50%;background:var(--ink);color:var(--glow);font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center}}
.steps b{{display:block;font-size:18px}}
.steps span{{display:block;font-size:16px;color:var(--muted);line-height:1.5}}
.promise{{margin-top:30px;display:flex;gap:10px;align-items:center;background:var(--tint);color:var(--ember-deep);font-weight:700;font-size:16px;padding:12px 16px;border-radius:12px}}
.card{{background:#fff;border:1px solid var(--line);border-radius:20px;padding:24px 24px 16px;box-shadow:0 1px 2px rgba(22,24,29,.06),0 18px 48px rgba(22,24,29,.10)}}
#tally{{display:block;width:100%;min-height:520px;border:0}}
.card .foot{{font-size:14px;color:var(--subtle);text-align:center;margin:6px 0 4px}}
.done{{display:none;text-align:center;padding:28px 8px}}
.card.sent #tally,.card.sent .foot{{display:none}}
.card.sent .done{{display:block;animation:pop .45s var(--ease)}}
@keyframes pop{{from{{opacity:0;transform:translateY(8px)}}to{{opacity:1;transform:none}}}}
.done .tick{{width:64px;height:64px;border-radius:50%;background:var(--tint);color:var(--ember);display:flex;align-items:center;justify-content:center;margin:0 auto}}
.done h2{{font-family:var(--display);font-weight:800;letter-spacing:-.02em;font-size:30px;margin-top:18px}}
.done p{{color:var(--muted);margin-top:8px}}
.done a.btn{{display:inline-flex;margin-top:22px;min-height:52px;align-items:center;padding:14px 24px;border-radius:999px;background:var(--ink);color:#fff;font-weight:700;text-decoration:none}}
footer{{border-top:1px solid var(--line)}}
footer .wrap{{padding-top:24px;padding-bottom:32px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px 24px;font-size:14px;color:var(--subtle)}}
footer a{{color:var(--subtle)}}
@media (prefers-reduced-motion:reduce){{*,*::before,*::after{{animation:none!important;transition:none!important}}.lift path{{stroke-dashoffset:0}}}}
</style>
</head>
<body>
<header><div class="wrap"><a class="brand" href="/" aria-label="BringsUp home">{mark}<span>BringsUp</span></a><span class="help">Questions? <a href="mailto:hello@bringsup.com">hello@bringsup.com</a></span></div></header>
<main>
  <div class="wrap">
    <div class="side">
      <p class="eyebrow">{eyebrow}</p>
      <h1>{h1}</h1>
      <p class="lead">{lead}</p>
      <ol class="steps">
{steps}
      </ol>
      <p class="promise">{check}{promise}</p>
    </div>
    <div class="card" id="card">
      <iframe id="tally" data-tally-src="https://tally.so/embed/{form}?alignLeft=1&amp;hideTitle=1&amp;transparentBackground=1&amp;dynamicHeight=1" loading="eager" width="100%" height="560" frameborder="0" marginheight="0" marginwidth="0" title="{title}"></iframe>
      <noscript><p class="foot"><a href="https://tally.so/r/{form}">Open the form</a></p></noscript>
      <div class="done" role="status" aria-live="polite" tabindex="-1">
        <div class="tick">{check_big}</div>
        <h2>{done_h}</h2>
        <p>{done_p}</p>
        <a class="btn" href="/">Back to BringsUp</a>
      </div>
    </div>
  </div>
</main>
<footer><div class="wrap"><span>© <span id="yr">2026</span> BringsUp · Websites as good as your reviews.</span><span>Secure forms by Tally. Payments by Stripe. <a href="/terms/">Terms</a> · <a href="/privacy/">Privacy</a></span></div></footer>
<script>
(function () {{
  document.getElementById('yr').textContent = new Date().getFullYear();
  var card = document.getElementById('card'), tally = document.getElementById('tally');
  var load = function () {{ if (window.Tally) {{ window.Tally.loadEmbeds(); }} else {{ tally.src = tally.dataset.tallySrc; }} }};
  var s = document.createElement('script'); s.src = 'https://tally.so/widgets/embed.js'; s.async = true; s.onload = load; s.onerror = load; document.body.appendChild(s);
  window.addEventListener('message', function (e) {{
    if (typeof e.data !== 'string' || e.data.indexOf('Tally.FormSubmitted') === -1) return;
    card.classList.add('sent'); card.querySelector('.done').focus({{ preventScroll: true }});
    card.scrollIntoView({{ block: 'center' }});
  }});
}})();
</script>
</body>
</html>
'''
for slug,p in PAGES.items():
    steps='\n'.join(f'        <li><div><b>{a}</b><span>{b}</span></div></li>' for a,b in p['steps'])
    q={k:v for k,v in p.items() if k!='steps'}
    html=TPL.format(mark=MARK, steps=steps, check=CHECK, check_big=CHECK.replace('width="20" height="20"','width="32" height="32"'), **q)
    os.makedirs(os.path.join(ROOT, slug), exist_ok=True)
    open(os.path.join(ROOT, slug, 'index.html'), 'w').write(html)
print('ok')
