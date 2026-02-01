import signatureUrl from "./assets/signature.png";

type ExpandedHeaderProps = {
  open: boolean;
  onClose: () => void;
  id?: string;
  className?: string;
};

export function ExpandedHeader({
  open,
  onClose,
  id = "header-menu",
  className,
}: ExpandedHeaderProps) {
  return (
    <div
      id={id}
      className={[
        // A standalone "clean black box" panel (not a background layer).
        "fixed inset-x-0 top-0 z-50 bg-black text-white overflow-hidden",
        // "full screen header in black, minus some 1/3 bottom padding"
        // Interpreted as: cover ~2/3 of the viewport height.
        "h-[67vh]",
        "transform-gpu",
        open ? "translate-y-0 transition-transform duration-500 ease-out" : "-translate-y-full duration-0",
        open ? "pointer-events-auto" : "pointer-events-none",
        className ?? "",
      ].join(" ")}
    >
      <div className="h-full flex flex-col bg-black min-h-0">
        <div className="p-4 md:p-6 flex justify-between rounded-b-xl">
          <div>ADNAN KHAYYAT</div>

          <div className="flex items-start gap-2 flex-col">
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-2 text-sm md:text-base font-bold hover:underline decoration-2 underline-offset-4 hover:cursor-pointer"
            >
              <span>CLOSE MENU</span>
              <span className="inline-block transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                ↗
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.assign("/");
              }}
              className="group flex items-center gap-2 text-sm md:text-base font-bold hover:underline decoration-2 underline-offset-4 hover:cursor-pointer"
            >
              HOME
            </button>

            <button
              type="button"
              className="group flex items-center gap-2 text-sm md:text-base font-bold hover:underline decoration-2 underline-offset-4 hover:cursor-pointer"
            >
              RESUME
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                window.location.assign("/blog");
              }}
              className="group flex items-center gap-2 text-sm md:text-base font-bold hover:underline decoration-2 underline-offset-4 hover:cursor-pointer"
            >
              BLOG
            </button>
          </div>
        </div>

        {/* Signature */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 pb-4">
          <img
            src={signatureUrl}
            alt="Signature"
            className="invert object-contain max-h-[32vh] md:max-h-[36vh]"
            draggable={false}
          />
          <div className="mt-4 text-xs md:text-sm text-white font-bold flex flex-col items-center justify-center uppercase text-center leading-tight">
            <div>3D Model by Lionsharp Studios</div>
            <div>Vehicle Design by Porsche AG</div>
            <div>1975 Porsche 930 Turbo</div>
            <div>Pirelli P7 Cinturato Tires</div>
            <div>16" Fuchs Cloverleaf Rims</div>
          </div>
        </div>
      </div>
    </div>
  );
}

