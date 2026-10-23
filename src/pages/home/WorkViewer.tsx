import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { FadeImg } from "../../components/FadeImg.tsx";
import { CloseIcon } from "./icons.tsx";

export type WorkViewerHandle = { open: (src: string, name: string, height: number) => void };

/** Full-page concept viewer: a modal dialog that returns focus to whatever opened it. */
export function WorkViewer({ ref }: { ref?: Ref<WorkViewerHandle> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [shot, setShot] = useState<{ src: string; name: string; height: number } | null>(null);

  useImperativeHandle(ref, () => ({
    open(src, name, height) {
      const d = dialog.current;
      if (!d) return;
      lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setShot({ src, name, height });
      if (typeof d.showModal === "function") {
        d.showModal();
        if (body.current) body.current.scrollTop = 0;
      } else {
        window.open(src, "_blank");
      }
    },
  }), []);

  return (
    <dialog
      ref={dialog}
      className="viewer"
      id="viewer"
      aria-labelledby="v-title"
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      onClose={() => lastFocus.current?.focus()}
    >
      <div className="v-head">
        <div><b id="v-title">{shot?.name ?? "Concept"}</b><small>Sample homepage · made-up business · stock photos</small></div>
        <button className="v-close" type="button" aria-label="Close" onClick={() => dialog.current?.close()}><CloseIcon /></button>
      </div>
      <div className="v-body" ref={body}>
        {/* Keyed by the shot, so a different homepage never flashes the last one while it loads. Its width and height
            reserve the space up front, so nothing jumps when it arrives. */}
        <FadeImg key={shot?.src ?? "none"} id="v-img" src={shot?.src} width={1200} height={shot?.height} alt={shot ? `Full homepage concept for ${shot.name}` : ""} />
      </div>
    </dialog>
  );
}
