import PhotoSwipe from "photoswipe";

import { isVideoContent } from "./PsVideo";
import { isLiveContent } from "./PsLivePhoto";
import { fetchImage } from "../frame/XImgCache";
import { PsContent, PsEvent, PsSlide } from "./types";

export default class ImageContentSetup {
  private loading = 0;

  constructor(private lightbox: PhotoSwipe) {
    lightbox.on("contentLoad", this.onContentLoad.bind(this));
    lightbox.on("contentLoadImage", this.onContentLoadImage.bind(this));
    lightbox.on("zoomPanUpdate", this.zoomPanUpdate.bind(this));
    lightbox.on("slideActivate", this.slideActivate.bind(this));
    lightbox.addFilter("isContentLoading", this.isContentLoading.bind(this));
    lightbox.addFilter("placeholderSrc", this.placeholderSrc.bind(this));
  }

  isContentLoading(isLoading: boolean, content: PsContent) {
    return isLoading || this.loading > 0;
  }

  onContentLoad(e: PsEvent) {
    if (isVideoContent(e.content) || isLiveContent(e.content)) return;

    // Insert image throgh XImgCache
    e.preventDefault();
    e.content.element = this.getXImgElem(e.content, () => e.content.onLoaded());
  }

  onContentLoadImage(e: PsEvent) {
    if (isVideoContent(e.content) || isLiveContent(e.content)) return;
    e.preventDefault();
  }

  placeholderSrc(placeholderSrc: string, content: PsContent) {
    return content.data.msrc || placeholderSrc;
  }

  getXImgElem(content: PsContent, onLoad: () => void): HTMLImageElement {
    const img = document.createElement("img");
    img.classList.add("pswp__img", "ximg");
    img.style.visibility = "hidden";

    // Fetch with Axios
    fetchImage(content.data.src).then((blob) => {
      // Check if destroyed already
      if (!content.element) return;

      // Insert image
      const blobUrl = URL.createObjectURL(blob);
      img.src = blobUrl;
      img.onerror = img.onload = () => {
        img.style.visibility = "visible";
        onLoad();
        URL.revokeObjectURL(blobUrl);
        img.onerror = img.onload = null;
        this.slideActivate();
      };
    });

    return img;
  }

  zoomPanUpdate({ slide }: { slide: PsSlide }) {
    if (!slide.data.highSrc || slide.data.highSrcCond !== "zoom") return;

    if (slide.currZoomLevel >= slide.zoomLevels.secondary) {
      this.loadFullImage(slide);
    }
  }

  slideActivate() {
    const slide = this.lightbox.currSlide;
    if (slide.data.highSrcCond === "always") {
      this.loadFullImage(slide);
    }
  }

  loadFullImage(slide: PsSlide) {
    if (!slide.data.highSrc) return;

    // Get ximg element
    const img = slide.holderElement?.querySelector(
      ".ximg:not(.ximg--full)"
    ) as HTMLImageElement;
    if (!img) return;

    // Load full image at secondary zoom level
    img.classList.add("ximg--full");

    this.loading++;
    this.lightbox.ui.updatePreloaderVisibility();

    fetchImage(slide.data.highSrc)
      .then((blob) => {
        // Check if destroyed already
        if (!slide.content.element) return;

        // Insert image
        const blobUrl = URL.createObjectURL(blob);
        img.onerror = img.onload = () => {
          URL.revokeObjectURL(blobUrl);
          img.onerror = img.onload = null;
        };
        img.src = blobUrl;

        // Don't load again
        slide.data.highSrcCond = "never";
      })
      .finally(() => {
        this.loading--;
        this.lightbox.ui.updatePreloaderVisibility();
      });
  }
}
