export function GuestCard() {
  return (
    <div className="relative border border-white/10 bg-[#1c1514] p-2.5 shadow-2xl shadow-black/40">
      <div className="bg-[#f7efe9] px-6 py-8 pr-10 text-center text-ink sm:px-8 sm:py-10 sm:pr-14">
        <p className="font-serif text-3xl tracking-tight sm:text-4xl">
          Sarah &amp; Ahmed
        </p>
        <p className="mt-4 text-[15px]">Share your memories</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/55">
          Help us collect the moments from our wedding day.
        </p>
        <div className="mx-auto mt-7 flex h-11 max-w-[13.5rem] items-center justify-center bg-bloom text-sm font-medium text-white">
          Choose Photos &amp; Videos
        </div>
      </div>
    </div>
  );
}
