import { ButtonLink } from "@/components/ui/button";
import { Page } from "@/components/ui/page";

export default function NotFound() {
  return (
    <Page className="flex flex-col items-center justify-center text-center">
      <p className="font-display text-6xl font-extrabold tracking-tight">🤷</p>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance">
        That page has wandered off
      </h1>
      <p className="mt-3 text-ink-muted text-pretty">
        Probably went to the staffroom. Let&rsquo;s get you an activity instead.
      </p>
      <ButtonLink href="/" size="lg" className="mt-7">
        Back to shaking
      </ButtonLink>
    </Page>
  );
}
