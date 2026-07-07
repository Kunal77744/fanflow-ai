import { StadiumTicker } from "@/components/StadiumTicker";
import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 pt-6 pb-4 text-center">
        <p className="text-xs tracking-[0.3em] text-turf font-semibold uppercase">
          FIFA World Cup 2026
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-1">
          FanFlow AI
        </h1>
        <p className="text-foreground/60 text-sm mt-1">
          Your on-site companion — navigation, crowd status, and more, in any language.
        </p>
      </header>

      <StadiumTicker />

      <main className="flex flex-col flex-1">
        <ChatWindow />
      </main>

      <footer className="px-4 py-3 text-center text-[11px] text-foreground/40">
        Demo venue &amp; live data are simulated for this hackathon submission.
      </footer>
    </div>
  );
}
