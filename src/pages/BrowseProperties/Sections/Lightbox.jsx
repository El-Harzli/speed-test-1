import React, { useState, useCallback, useEffect, useRef } from "react";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { onImgError } from "./format";
import useBodyScrollLock from "../../../hooks/useBodyScrollLock";

function Lightbox({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartXRef = useRef(null);
  const touchDeltaRef = useRef(0);

  const rootRef = useRef(null);
  const imageAreaRef = useRef(null);
  const thumbStripRef = useRef(null);

  useBodyScrollLock(true);

  const goNext = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );
  const goPrev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goNext, goPrev]);

  // Everything below uses native addEventListener (not React's onTouch*
  // props) with `{ passive: false }` on purpose: React attaches touch
  // listeners as passive by default, which silently makes preventDefault()
  // a no-op inside JSX touch handlers — that's why the page behind this
  // modal could still scroll on mobile even though it looked like it
  // should have been blocked.
  useEffect(() => {
    const root = rootRef.current;
    const imageArea = imageAreaRef.current;
    const thumbStrip = thumbStripRef.current;
    if (!root || !imageArea || !thumbStrip) return undefined;

    // Anything that isn't the image area or the thumbnail strip (the
    // background, the header, the nav buttons) should never scroll
    // whatever's behind this modal — including a scrollable ancestor like
    // the mobile PropertyDetail overlay's own content area, which the
    // body-level scroll lock alone doesn't reach.
    function blockScroll(e) {
      e.preventDefault();
    }

    // Swipe-to-change-photo, scoped to only the image area — this is what
    // stops dragging across the thumbnail strip (to browse it) from also
    // being read as "swipe the main photo".
    function handleImageTouchStart(e) {
      touchStartXRef.current = e.touches[0].clientX;
      touchDeltaRef.current = 0;
      setIsDragging(true);
    }
    function handleImageTouchMove(e) {
      if (touchStartXRef.current === null) return;
      e.preventDefault();
      e.stopPropagation();
      const delta = e.touches[0].clientX - touchStartXRef.current;
      touchDeltaRef.current = delta;
      setTouchDelta(delta);
    }
    function handleImageTouchEnd() {
      // Read the decision from the ref, not from React state — calling
      // goNext/goPrev (which set a *different* piece of state) from inside
      // a setTouchDelta(prev => ...) updater looked reasonable but isn't:
      // React Strict Mode double-invokes updater functions in dev to catch
      // exactly this kind of impurity, so goNext/goPrev were firing twice
      // per swipe (index jumping by 2, not 1).
      const delta = touchDeltaRef.current;
      if (Math.abs(delta) > 50) {
        if (delta > 0) goPrev();
        else goNext();
      }
      touchStartXRef.current = null;
      touchDeltaRef.current = 0;
      setTouchDelta(0);
      setIsDragging(false);
    }

    // The thumbnail strip needs its own native horizontal scroll to keep
    // working — only stop it from bubbling up to the background's
    // blockScroll listener, don't preventDefault here.
    function stopBubble(e) {
      e.stopPropagation();
    }

    root.addEventListener("touchmove", blockScroll, { passive: false });
    imageArea.addEventListener("touchstart", handleImageTouchStart, { passive: true });
    imageArea.addEventListener("touchmove", handleImageTouchMove, { passive: false });
    imageArea.addEventListener("touchend", handleImageTouchEnd, { passive: true });
    thumbStrip.addEventListener("touchstart", stopBubble, { passive: true });
    thumbStrip.addEventListener("touchmove", stopBubble, { passive: true });
    thumbStrip.addEventListener("touchend", stopBubble, { passive: true });

    return () => {
      root.removeEventListener("touchmove", blockScroll);
      imageArea.removeEventListener("touchstart", handleImageTouchStart);
      imageArea.removeEventListener("touchmove", handleImageTouchMove);
      imageArea.removeEventListener("touchend", handleImageTouchEnd);
      thumbStrip.removeEventListener("touchstart", stopBubble);
      thumbStrip.removeEventListener("touchmove", stopBubble);
      thumbStrip.removeEventListener("touchend", stopBubble);
    };
  }, [goNext, goPrev]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
      style={{ backgroundColor: "rgba(26, 26, 26, 0.92)" }}
      onClick={onClose}
    >
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 py-4 z-10">
        <span className="text-white/90 text-sm font-medium">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close gallery"
          className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <IoClose className="w-5 h-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        aria-label="Previous photo"
        className="hidden sm:flex absolute left-4 w-12 h-12 rounded-full bg-white/10 text-white items-center justify-center hover:bg-white/20 transition-colors"
      >
        <IoChevronBack className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        aria-label="Next photo"
        className="hidden sm:flex absolute right-4 w-12 h-12 rounded-full bg-white/10 text-white items-center justify-center hover:bg-white/20 transition-colors"
      >
        <IoChevronForward className="w-6 h-6" />
      </button>

      <div
        ref={imageAreaRef}
        className="flex-1 flex items-center justify-center w-full overflow-hidden px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={index}
          src={images[index]}
          alt={`Photo ${index + 1}`}
          onError={onImgError}
          className="max-w-full max-h-[70vh] rounded-[16px] object-contain"
          style={{
            transform: `translateX(${touchDelta * 0.3}px)`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        />
      </div>

      <div
        ref={thumbStripRef}
        className="shrink-0 pb-5 pt-3 px-4 overflow-x-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 justify-center min-w-min">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              aria-label={`Go to photo ${i + 1}`}
              className={`shrink-0 w-14 h-14 rounded-[10px] overflow-hidden border-2 transition-all ${
                i === index
                  ? "border-gold-400 opacity-100 scale-105"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={src}
                alt={`Thumbnail ${i + 1}`}
                onError={onImgError}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Lightbox;
