import { Panel } from "@/components/ui/panel";

export function QuotePanel({ quote }: { quote: string }) {
  return (
    <Panel className="boot-in delay-4 rounded-[30px]">
      <blockquote className="text-center text-lg leading-8 text-white/90 sm:text-xl">{quote}</blockquote>
    </Panel>
  );
}
