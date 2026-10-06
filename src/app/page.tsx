import { BetterWay } from "@/components/home/better-way";
import { Flow } from "@/components/home/flow";
import { GetStarted } from "@/components/home/get-started";
import { Hero } from "@/components/home/hero";
import { Privacy } from "@/components/home/privacy";
import { SiteFooter } from "@/components/home/site-footer";
import { Story } from "@/components/home/story";

export default function HomePage() {
  return (
    <main className="overflow-x-clip bg-background text-foreground">
      <Hero />
      <Story />
      <Flow />
      <BetterWay />
      <Privacy />
      <GetStarted />
      <SiteFooter />
    </main>
  );
}
