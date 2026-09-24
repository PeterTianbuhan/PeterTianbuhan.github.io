import { PaperRedirect } from "@/components/home-sketch/redirect";
import { defaultLocale } from "@/lib/i18n";

export default function RootPage() {
  return <PaperRedirect locale={defaultLocale} to={`/${defaultLocale}/`} />;
}
