// /try/: paste a website, get the homepage rebuilt. Requests queue and are emailed within the hour;
// this page shows a blurred draft meanwhile and checks back every 30 seconds while it's open.
import { useCallback, useEffect, useRef, useState } from "react";
import { REDESIGN_API } from "../../lib/config.ts";
import { renderConcept } from "../../lib/concept-render.ts";
import {
  addressOf, checkImages, hostOf, isEmail, isUrl, renderDraft, request,
  type ApiError, type QueuedRedesign, type Redesign,
} from "./api.ts";
import {
  AskView, FailedView, Footer, Header, QueuedView, ResultView, Toast, WorkingView,
  type AskFields, type Failure, type FormError, type QueuedData, type ResultData, type View,
} from "./views.tsx";
import "./try.css";

const API: string = REDESIGN_API;
const POLL_MS = 30000;
const POLL_RETRY_MS = 60000;
const DEFAULT_FAIL = "We couldn't redesign that one automatically.";
const DEFAULT_FAIL_MSG = "Some websites block automatic visitors. We can still make your free concept by hand, within 48 hours.";

/** The body depends on the status: 200 a finished redesign, 202 a queued one, otherwise an error. */
type Answer = Redesign | QueuedRedesign | ApiError;

const setAddress = (path: string) => history.replaceState(null, "", path);

export function Try() {
  const [view, setView] = useState<View>("ask");
  const [soon, setSoon] = useState(!API);
  const [fields, setFields] = useState<AskFields>({ url: "", email: "", company_site: "" });
  const [formError, setFormError] = useState<FormError | null>(null);
  const [workingHost, setWorkingHost] = useState("your website");
  const [result, setResult] = useState<ResultData | null>(null);
  const [queued, setQueued] = useState<QueuedData | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [toast, setToast] = useState({ message: "", show: false });

  const urlRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** Bumped whenever the visitor starts over, so late answers for an older request are ignored. */
  const generation = useRef(0);
  const focusUrlNext = useRef(false);
  const started = useRef(false);

  const go = useCallback((next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // "Try another website" focuses the address field once the form is showing again
  useEffect(() => {
    if (view === "ask" && focusUrlNext.current) { focusUrlNext.current = false; urlRef.current?.focus(); }
  }, [view]);

  useEffect(() => () => { clearTimeout(pollTimer.current); clearTimeout(toastTimer.current); }, []);

  const say = (message: string) => {
    setToast({ message, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2400);
  };

  const copyLink = () => {
    const link = location.href;
    (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(() => say("Link copied"), () => say(link));
  };

  const fail = (message?: string, title?: string) => {
    setFailure({ title: title || DEFAULT_FAIL, message: message || DEFAULT_FAIL_MSG });
    go("failed");
  };

  const showResult = async (data: Redesign) => {
    const gen = generation.current;
    const images = data.images || [];
    const concept = await checkImages(data.concept, images);
    if (gen !== generation.current) return;
    setResult({
      id: data.id,
      name: concept.business_name || "your business",
      address: addressOf(data.url || ""),
      html: renderConcept(concept, images),
      improvements: concept.improvements || [],
      ref: (concept as { ref?: string }).ref,
    });
    if (data.id && data.id !== "demo") setAddress("/try/?id=" + encodeURIComponent(data.id));
    go("result");
  };

  const showQueued = (data: QueuedRedesign, email: string) => {
    setQueued({ host: hostOf(data.url || "") || "your website", email, draft: data.preview ? renderDraft(data.preview) : null });
    setAddress("/try/?id=" + encodeURIComponent(data.id));
    go("queued");
    clearTimeout(pollTimer.current);
    const gen = generation.current;
    const poll = () => {
      request<Redesign>(API + "?id=" + encodeURIComponent(data.id))
        .then((res) => {
          if (gen !== generation.current) return;
          if (res.status === 200) void showResult(res.body);
          else if (res.status === 202) pollTimer.current = setTimeout(poll, POLL_MS);
        })
        .catch(() => { if (gen === generation.current) pollTimer.current = setTimeout(poll, POLL_RETRY_MS); });
    };
    pollTimer.current = setTimeout(poll, POLL_MS);
  };

  const run = (url: string, email: string, honeypot: string) => {
    const gen = generation.current;
    setWorkingHost(hostOf(url) || "your website");
    go("working");
    request<Answer>(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, email, company_site: honeypot || "" }),
    })
      .then((res) => {
        if (gen !== generation.current) return;
        if (res.status === 202) return showQueued(res.body as QueuedRedesign, email);
        if (res.ok) return showResult(res.body as Redesign);
        const err = res.body as ApiError;
        if (res.status === 429) return fail(err.error, "Busy day for redesigns.");
        if (err.code === "not_a_business") return fail(err.error, "That doesn't look like a business website.");
        fail(err.error);
      })
      .catch(() => { if (gen === generation.current) fail("The connection dropped before we finished. Please try again."); });
  };

  const submit = (values: AskFields) => {
    const url = values.url.trim(), email = values.email.trim();
    setFormError(null);
    if (!isUrl(url)) { setFormError({ field: "url", message: "Add your website address, like rosasbakery.com." }); urlRef.current?.focus(); return; }
    if (!isEmail(email)) { setFormError({ field: "email", message: "Add your email so we can follow up about your redesign." }); emailRef.current?.focus(); return; }
    if (!API) { location.href = "/#concept"; return; }
    run(url, email, values.company_site);
  };

  const again = () => {
    generation.current++;
    clearTimeout(pollTimer.current);
    setAddress("/try/");
    focusUrlNext.current = true;
    go("ask");
  };

  const fullScreen = () => {
    const w = window.open(URL.createObjectURL(new Blob([result?.html || ""], { type: "text/html" })), "_blank");
    if (!w) say("Allow pop-ups to open full screen");
  };

  // Entry points: ?id= (saved redesign), ?demo (sample), a hand-off from the homepage form (sessionStorage), ?url= (prefill).
  // Read in the browser only, so the server-rendered page is always the ask view. The ref keeps it to one run under StrictMode.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(location.search);
    let handoff: { url?: string; email?: string } | null = null;
    try { handoff = JSON.parse(sessionStorage.getItem("bu-try") || "null"); sessionStorage.removeItem("bu-try"); } catch { /* storage blocked */ }
    const id = params.get("id");
    if (params.has("demo")) {
      setSoon(false);
      void request<Redesign>("/try/demo.json").then((res) => showResult(res.body));
    } else if (id && API) {
      go("working");
      request<Answer>(API + "?id=" + encodeURIComponent(id))
        .then((res) => {
          if (res.status === 202) return showQueued(res.body as QueuedRedesign, "");
          if (res.ok) return showResult(res.body as Redesign);
          fail((res.body as ApiError).error, "We couldn't find that redesign.");
        })
        .catch(() => fail("Please try again in a moment."));
    } else if (handoff || params.get("url")) {
      const values: AskFields = { url: handoff?.url || params.get("url") || "", email: handoff?.email || "", company_site: "" };
      setFields(values);
      setAddress("/try/");
      if (API && values.url && values.email) submit(values);
      else (values.url ? emailRef : urlRef).current?.focus();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- once, on load

  return (
    <>
      <Header />
      <main>
        <AskView
          hidden={view !== "ask"}
          soon={soon}
          fields={fields}
          onField={(name, value) => setFields((f) => ({ ...f, [name]: value }))}
          error={formError}
          onSubmit={() => submit(fields)}
          urlRef={urlRef}
          emailRef={emailRef}
        />
        <WorkingView hidden={view !== "working"} host={workingHost} />
        <ResultView hidden={view !== "result"} data={result} onCopy={copyLink} onFullScreen={fullScreen} onAgain={again} />
        <QueuedView hidden={view !== "queued"} data={queued} onCopy={copyLink} />
        <FailedView hidden={view !== "failed"} failure={failure} onRetry={again} />
      </main>
      <Toast message={toast.message} show={toast.show} />
      <Footer />
    </>
  );
}
