import Image from "next/image";
import { FIGMA_PRODUCT_CARD_IMG } from "@/components/figma/figmaProductCardAssets";

const IMG = FIGMA_PRODUCT_CARD_IMG;

const CARD_CORNER_W = 33;
const CARD_CORNER_H = 46;
const HOVER1_IMG_W = 36;
const HOVER1_IMG_H = 23;
const HOVER2_IMG_W = 77;
const HOVER2_IMG_H = 11;
const SIDE_HOVER2_GAP_FROM_CORNER = 37;
const HOVER2_TOP_INSET = 11;
const HOVER2_RIGHT_INSET = 5;
const SIDE_HOVER2_LEFT_BOTTOM = CARD_CORNER_H + SIDE_HOVER2_GAP_FROM_CORNER;
const SIDE_HOVER2_RIGHT_TOP = CARD_CORNER_H + SIDE_HOVER2_GAP_FROM_CORNER;

/** Кутові deco завжди видимі; hover1/hover2 — з’являються при наведенні на `.mg-product-card`. */
export function FigmaProductCardDecor() {
  const hoverImgClass = "block h-auto w-auto max-w-none object-contain";
  const edgeHover2Slot = { width: HOVER2_IMG_H, height: HOVER2_IMG_W } as const;

  return (
    <>
      <div className="mg-product-card-deco-corner pointer-events-none absolute right-0 top-0 z-[4]">
        <Image
          src={IMG.cardDecoR}
          alt=""
          width={CARD_CORNER_W}
          height={CARD_CORNER_H}
          className="h-[46px] w-[33px] object-contain"
        />
      </div>
      <div className="mg-product-card-deco-corner pointer-events-none absolute bottom-0 left-0 z-[4]">
        <Image
          src={IMG.cardDecoL}
          alt=""
          width={CARD_CORNER_W}
          height={CARD_CORNER_H}
          className="h-[46px] w-[33px] object-contain"
        />
      </div>
      <div
        className="mg-product-card-deco-on-hover pointer-events-none absolute bottom-0 z-[3]"
        style={{ left: CARD_CORNER_W }}
        aria-hidden
      >
        <Image
          src={IMG.cardDecoHover1}
          alt=""
          width={HOVER1_IMG_W}
          height={HOVER1_IMG_H}
          unoptimized
          className={hoverImgClass}
        />
      </div>
      <div
        className="mg-product-card-deco-on-hover pointer-events-none absolute top-0 z-[3]"
        style={{ right: CARD_CORNER_W }}
        aria-hidden
      >
        <Image
          src={IMG.cardDecoHover1}
          alt=""
          width={HOVER1_IMG_W}
          height={HOVER1_IMG_H}
          unoptimized
          className={`${hoverImgClass} ml-auto -scale-x-100 -scale-y-100`}
        />
      </div>
      <div
        className="mg-product-card-deco-on-hover pointer-events-none absolute bottom-0 left-1/2 z-[1] -translate-x-1/2"
        aria-hidden
      >
        <Image
          src={IMG.cardDecoHover2}
          alt=""
          width={HOVER2_IMG_W}
          height={HOVER2_IMG_H}
          unoptimized
          className={hoverImgClass}
        />
      </div>
      <div
        className="mg-product-card-deco-on-hover pointer-events-none absolute left-1/2 z-[1] -translate-x-1/2"
        style={{ top: HOVER2_TOP_INSET }}
        aria-hidden
      >
        <Image
          src={IMG.cardDecoHover2}
          alt=""
          width={HOVER2_IMG_W}
          height={HOVER2_IMG_H}
          unoptimized
          className={hoverImgClass}
          style={{
            transform: "scaleY(-1)",
            transformOrigin: "center top",
          }}
        />
      </div>
      <div
        className="mg-product-card-deco-on-hover pointer-events-none absolute left-0 z-[1] overflow-visible"
        style={{ bottom: SIDE_HOVER2_LEFT_BOTTOM, width: edgeHover2Slot.width }}
        aria-hidden
      >
        <div
          className="absolute items-end justify-center overflow-visible"
          style={{ height: edgeHover2Slot.height, left: -38, top: -10 }}
        >
          <Image
            src={IMG.cardDecoHover2}
            alt=""
            width={HOVER2_IMG_W}
            height={HOVER2_IMG_H}
            unoptimized
            className={`${hoverImgClass} shrink-0`}
            style={{
              transform: "rotate(-90deg) scaleY(-1)",
              transformOrigin: "center bottom",
            }}
          />
        </div>
      </div>
      <div
        className="mg-product-card-deco-on-hover pointer-events-none absolute z-[1] overflow-visible"
        style={{
          top: SIDE_HOVER2_RIGHT_TOP,
          right: HOVER2_RIGHT_INSET,
          width: edgeHover2Slot.width,
        }}
        aria-hidden
      >
        <div className="flex items-start justify-center overflow-visible" style={{ height: edgeHover2Slot.height }}>
          <Image
            src={IMG.cardDecoHover2}
            alt=""
            width={HOVER2_IMG_W}
            height={HOVER2_IMG_H}
            unoptimized
            className={`${hoverImgClass} shrink-0`}
            style={{
              transform: "rotate(90deg) scaleY(-1)",
              transformOrigin: "center top",
            }}
          />
        </div>
      </div>
    </>
  );
}
