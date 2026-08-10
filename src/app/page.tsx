import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Proposition } from "@/components/landing/Proposition";
import { Difference } from "@/components/landing/Difference";
import { Bet } from "@/components/landing/Bet";
import { Process } from "@/components/landing/Process";
import { DiagnosticCta } from "@/components/landing/DiagnosticCta";
import { DiagnosticPreview } from "@/components/landing/DiagnosticPreview";
import { AiSection } from "@/components/landing/AiSection";
import { WhoFor } from "@/components/landing/WhoFor";
import { WhoNotFor } from "@/components/landing/WhoNotFor";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <div className="bg-crost-black">
        <Nav />
        <Hero />
      </div>
      <Proposition />
      <Difference />
      <Bet />
      <Process />
      <DiagnosticCta />
      <DiagnosticPreview />
      <AiSection />
      <WhoFor />
      <WhoNotFor />
      <FinalCta />
      <Footer />
    </div>
  );
}
