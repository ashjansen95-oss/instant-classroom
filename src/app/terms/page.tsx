import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/ui/page";
import { LegalNotice, Prose } from "@/components/ui/prose";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms of use for Instant Classroom.",
};

export default function TermsPage() {
  return (
    <Page>
      <PageHeader title="Terms" subtitle="Use your judgement, and we'll do the same." />

      <Prose>
        <h2>Using the app</h2>
        <p>
          Instant Classroom is free to use, with no account required. You&rsquo;re welcome to use
          it in your classroom, share it with colleagues, and run any activity in it.
        </p>

        <h2>Your professional judgement comes first</h2>
        <p>
          Every activity is written to be safe and appropriate for a normal classroom, but you know
          your students and we don&rsquo;t. You are the one deciding whether an activity suits your
          class, your room and the moment. Skip anything that doesn&rsquo;t, and adapt anything
          that nearly does.
        </p>

        <h2>No guarantees</h2>
        <p>
          The app is provided as-is. We don&rsquo;t promise it will always be available, that every
          activity will land, or that it&rsquo;s suited to any particular purpose. We make no
          claims about effects on learning, behaviour or outcomes — this is a tool for filling a
          gap in a lesson, not an intervention.
        </p>

        <h2>Availability</h2>
        <p>
          Activities are stored on your device, so the core of the app keeps working without a
          connection. The app itself may change or be taken offline at any time.
        </p>

        <h2>Content</h2>
        <p>
          The activity library is ours. Please don&rsquo;t republish it wholesale as your own, but
          using it, adapting it and running it with your classes is exactly the point.
        </p>

        <h2>Contact</h2>
        <p>
          Feedback goes through the thumbs up and thumbs down on each activity. That&rsquo;s
          currently how we learn what works.
        </p>
      </Prose>

      <LegalNotice />
    </Page>
  );
}
