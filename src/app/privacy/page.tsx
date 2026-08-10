import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/ui/page";
import { LegalNotice, Prose } from "@/components/ui/prose";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Instant Classroom stores, which is almost nothing.",
};

export default function PrivacyPage() {
  return (
    <Page>
      <PageHeader title="Privacy" subtitle="The short version: everything stays on your device." />

      <Prose>
        <h2>What we store</h2>
        <p>
          Instant Classroom keeps a small amount of information in your browser&rsquo;s local
          storage, on the device you&rsquo;re using:
        </p>
        <ul>
          <li>Which activities you&rsquo;ve favourited</li>
          <li>The last twenty activities you were shown, so you don&rsquo;t get repeats</li>
          <li>Whether you marked an activity as having worked or not</li>
          <li>Your settings — sound, vibration and shake preferences</li>
          <li>A local count of app events, used to understand which features get used</li>
        </ul>
        <p>
          None of this is sent to a server. There is no account, no login, and no analytics
          provider receiving your data. You can delete all of it at any time from Settings.
        </p>

        <h2>What we never collect</h2>
        <p>This is a tool for classrooms, so this list matters more than the one above.</p>
        <ul>
          <li>No student names, emails or any other student information</li>
          <li>No behavioural records or profiles of any student</li>
          <li>No location data</li>
          <li>No access to your camera, microphone or contacts</li>
          <li>No advertising identifiers, and no third-party tracking cookies</li>
        </ul>

        <h2>Motion access</h2>
        <p>
          If you turn on shake-to-generate, the app reads your device&rsquo;s accelerometer to
          notice a shake. That data is used in the moment and never stored or transmitted. On
          iPhone your browser will ask permission first, and you can decline — the button does
          exactly the same job.
        </p>

        <h2>Children</h2>
        <p>
          Instant Classroom is designed for teachers, not students. It is not intended to be used
          by children, and it collects nothing that would identify anyone.
        </p>

        <h2>Changes</h2>
        <p>
          If this ever changes — for example if optional accounts are added so favourites can sync
          between devices — this page will be updated before that ships.
        </p>
      </Prose>

      <LegalNotice />
    </Page>
  );
}
