import type { ReactNode } from "react";

export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        className="absolute top-[18%] -left-[3px] z-20 h-[8%] w-[3px] rounded-l-sm bg-[#2a2220]"
        aria-hidden
      />
      <div
        className="absolute top-[28%] -left-[3px] z-20 h-[6%] w-[3px] rounded-l-sm bg-[#2a2220]"
        aria-hidden
      />
      <div
        className="absolute top-[36%] -left-[3px] z-20 h-[6%] w-[3px] rounded-l-sm bg-[#2a2220]"
        aria-hidden
      />
      <div
        className="absolute top-[30%] -right-[3px] z-20 h-[10%] w-[3px] rounded-r-sm bg-[#2a2220]"
        aria-hidden
      />

      <div className="relative aspect-[9/19.2] overflow-hidden rounded-[2.15rem] bg-gradient-to-b from-[#3a3230] via-[#1c1615] to-[#121010] p-[7px] shadow-[0_22px_50px_-18px_rgba(30,15,15,0.55),inset_0_1px_0_rgba(255,255,255,0.18)]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[1.7rem] bg-[#f7efe9]">
          <div className="pointer-events-none absolute top-2.5 left-1/2 z-20 h-[1.15rem] w-[28%] -translate-x-1/2 rounded-full bg-black shadow-sm" />
          <div className="h-9 shrink-0" aria-hidden />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <div className="flex shrink-0 justify-center pb-2 pt-1.5" aria-hidden>
            <div className="h-[3px] w-[34%] rounded-full bg-ink/25" />
          </div>
        </div>
      </div>
    </div>
  );
}
