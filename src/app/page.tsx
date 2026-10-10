import dynamic from "next/dynamic";
import { Hero } from "@/components/home/hero";
import { SiteFooter } from "@/components/home/site-footer";
import { MotionProvider } from "@/components/motion/lazy-provider";
import { HomeJsonLd } from "@/components/seo/json-ld";

const Story = dynamic(() =>
  import("@/components/home/story").then((m) => m.Story),
);
const Flow = dynamic(() =>
  import("@/components/home/flow").then((m) => m.Flow),
);
const BetterWay = dynamic(() =>
  import("@/components/home/better-way").then((m) => m.BetterWay),
);
const Privacy = dynamic(() =>
  import("@/components/home/privacy").then((m) => m.Privacy),
);
const GetStarted = dynamic(() =>
  import("@/components/home/get-started").then((m) => m.GetStarted),
);

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <MotionProvider>
        <main className="bg-background text-foreground">
          <a
            href="#story"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-ink focus:shadow"
          >
            Skip to content
          </a>
          <Hero />
          <Story />
          <Flow />
          <BetterWay />
          <Privacy />
          <GetStarted />
          <SiteFooter />
        </main>
      </MotionProvider>
    </>
  );
}
