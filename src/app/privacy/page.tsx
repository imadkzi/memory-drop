import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONTACT, LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Memory Drop collects, stores, and shares personal data for event accounts, guest uploads, and Google Drive.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy policy · Memory Drop",
    url: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      description="This notice describes how Memory Drop handles personal data. It matches the product as it is built: guest photos are stored in the event owner's Google Drive, and Memory Drop keeps the account and file records needed to run the service."
    >
      <section>
        <h2>1. Who this notice is from</h2>
        <p>
          Memory Drop is a private event photo and video collection service.
          Guests send files through a secret link. The couple, and any admins
          they add, are the only people who can view the collection.
        </p>
        <p>
          The operator of Memory Drop is the controller for account, session,
          and service-security data. Contact{" "}
          <a href={`mailto:${LEGAL_CONTACT}`}>{LEGAL_CONTACT}</a>. We have not
          published a postal address or appointed a data protection officer or
          an EU/UK representative in the product. Use that email for privacy
          requests.
        </p>
        <p>
          For the photos and videos themselves, the event owner decides to
          open a collection and decides who may view or delete it. Those files
          are stored in a Google Drive folder on the owner&apos;s Google
          account. Memory Drop processes them only to receive the upload, place
          the file in that folder, and let authorised people preview, download,
          or delete it. The event owner is the controller of that collection.
          Memory Drop is their processor for the file contents, and remains the
          controller for the metadata and security logs described below.
        </p>
        <p>
          If you are organising an event, you may need your own short notice
          for guests, because you decide to collect their photos. This page
          explains what the product does. It does not replace that notice.
        </p>
      </section>

      <section>
        <h2>2. What we collect</h2>
        <p>We do not run analytics, advertising, or a mailing list.</p>
        <p>
          <strong className="font-semibold text-ink">Accounts.</strong> When
          you create an account we store your name, email address, and a
          one-way hash of your password. We do not store the password itself.
          Email verification is not turned on, so the account is created from
          the details you type. The database can hold a profile image, but the
          product does not ask for one.
        </p>
        <p>
          <strong className="font-semibold text-ink">Sessions.</strong> Signing
          in creates a session. The session token is kept in an HTTP-only
          cookie. The session record can include your IP address and browser
          user agent. It lasts until you sign out or it expires. This product
          does not set a custom lifetime, so Better Auth&apos;s default applies:
          seven days, refreshed while you keep using the app.
        </p>
        <p>
          <strong className="font-semibold text-ink">Events.</strong> The
          owner stores an event name, an optional event date, whether guest
          uploads are open, and the photo and video size limits. We also store
          which Google Drive folder belongs to that event, and which admins
          have access. Admins are added by email, and only if that person
          already has a Memory Drop account. Other admins of that event can
          see each admin&apos;s name and email.
        </p>
        <p>
          <strong className="font-semibold text-ink">Guest uploads.</strong>{" "}
          Guests do not create an account and are not asked for a name or email.
          When someone with the upload link sends a file, we receive the file
          name, the file type, the file size, and the file itself. We store a
          record of the file name, MIME type, size, whether it is a photo or
          video, upload status, time, and the Google Drive file id. The file
          bytes are streamed to the owner&apos;s Google Drive. We do not keep a
          separate copy as our own photo library.
        </p>
        <p>
          We do not strip metadata from files. A photo or video can still
          contain location, camera details, and the faces of people in the
          shot, including children. We do not run facial recognition or any
          other analysis on the files.
        </p>
        <p>
          <strong className="font-semibold text-ink">IP addresses.</strong> For
          guest uploads we read the IP address only to rate-limit abuse. The
          default limit is 30 upload requests per IP and 60 per event link,
          inside a 10-minute window. Those counters live in the server&apos;s
          memory and are dropped when the window passes or the server restarts.
          They are not saved as a guest profile. If a limit is hit, the IP
          address and event id are written to the server log.
        </p>
        <p>
          <strong className="font-semibold text-ink">Google Drive.</strong> If
          the owner connects Drive, Google sends us an access token and a
          refresh token. We encrypt both with AES-256-GCM before saving them.
          The scope is{" "}
          <span className="text-ink">drive.file</span>: Memory Drop can create
          and manage files it created for this app. It cannot browse the rest
          of that Google account. We create a &quot;Memory Drop&quot;
          folder and a folder named for the event, then put uploads there.
        </p>
        <p>
          The secret upload link is a random token. We store a SHA-256 hash of
          it so we can recognise the link, and an encrypted copy so the owner
          can copy or show the link and QR code again. Regenerating the link
          replaces both and the old link stops working immediately.
        </p>
      </section>

      <section>
        <h2>3. Why we use it, and the lawful basis</h2>
        <ul>
          <li>
            Account details, event settings, and Drive tokens: to provide the
            service you asked for. Basis: contract (UK/EU GDPR Article 6(1)(b)).
          </li>
          <li>
            Session IP address and user agent, upload rate limits, and security
            logs: to keep the service from being abused and to diagnose
            failures. Basis: legitimate interests (Article 6(1)(f)). We do not
            use these for advertising.
          </li>
          <li>
            Guest files and their file records: because the guest chose to
            upload them to that event, and because the owner asked us to
            receive them into their Drive. For Memory Drop, this is processing
            on the owner&apos;s instructions. The owner needs their own basis
            for collecting guest photos, which is usually the guest&apos;s
            decision to upload.
          </li>
        </ul>
        <p>
          We do not use personal data for automated decisions that produce
          legal or similarly significant effects. Rate limiting only slows
          repeated uploads.
        </p>
      </section>

      <section>
        <h2>4. Who can see it</h2>
        <ul>
          <li>
            Event owners and admins can preview, download, and delete files
            in that event. Guests cannot open a gallery, list other
            people&apos;s uploads, or receive Drive credentials.
          </li>
          <li>
            Google receives the files, file names, and types when we write them
            into the owner&apos;s Drive. Google&apos;s processing of that Drive
            account is covered by the owner&apos;s Google terms, not by a
            separate contract stored in this product.
          </li>
          <li>
            The host of the Memory Drop application and its PostgreSQL database
            can technically access the data needed to run the servers. The host
            and the country of the database are set when the service is
            deployed. They are not fixed in the application source.
          </li>
          <li>
            We do not sell personal data. We do not use an email-delivery
            service, a payment processor, or an analytics vendor. Inviting an
            admin does not send an email; the owner types an address of someone
            who already registered.
          </li>
        </ul>
        <p>
          File bytes pass through the Memory Drop server on the way to Drive.
          They are streamed, not saved as a second media library. Google may
          store Drive files outside the UK and the EEA, depending on that
          Google account. If our database or logs are hosted outside the UK or
          EEA, account and file records are transferred there as part of
          running the service. We do not add a separate transfer tool inside
          the product.
        </p>
      </section>

      <section>
        <h2>5. How long we keep it</h2>
        <ul>
          <li>
            Account, event, admin, and Drive-token records are kept until the
            account or event is deleted. There is no delete-account,
            delete-event, or disconnect-Drive control in the product yet.
            Email {LEGAL_CONTACT} and we will carry out a grounded request,
            including deleting the database rows. Deleting a user in the
            database also deletes their sessions, login records, events they
            own, admin memberships, and stored Drive tokens.
          </li>
          <li>
            Sessions end when you sign out or they expire.
          </li>
          <li>
            When an owner or admin deletes a photo or video, we try to delete
            the file in Google Drive and we mark our record as deleted. The
            record is not removed. If the Drive delete fails, the file can
            remain in the owner&apos;s Drive even though Memory Drop no longer
            shows it. There is no automatic deletion after the event date,
            and there is no trash you can restore from inside Memory Drop.
          </li>
          <li>
            Failed uploads are marked failed. They are not shown as part of the
            collection.
          </li>
          <li>
            Rate-limit counters last for the 10-minute window, in memory only.
            Server logs, including an IP address when a limit is hit, follow
            whatever retention the host applies. The product does not set a log
            expiry.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Cookies and similar storage</h2>
        <p>
          The only cookie the product sets for its own purposes is the sign-in
          session cookie. It is HTTP-only, so page scripts cannot read it, and
          it is limited to this site. We do not set advertising or analytics
          cookies. Guests who only open an upload link are not given an
          account cookie.
        </p>
        <p>
          Typefaces are served by Memory Drop. The browser is not sent to
          Google to download them. We do not load third-party tracking scripts.
        </p>
        <p>
          Pages send a strict referrer policy and refuse to be embedded in
          other sites, so the secret upload link is less likely to leak through
          the Referer header. The link is still a URL. Anyone the guest shares
          that URL with can upload while uploads are open.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          Drive tokens and the raw upload link are encrypted at rest. The link
          is looked up by its hash. Passwords are stored only as a hash.
          Admin actions require a session and a check that the person belongs
          to that event. Owners can regenerate the upload link, turn uploads
          off, and remove admins. Guests cannot list media. Logs are written so
          that passwords, session tokens, upload tokens, and Drive tokens are
          redacted.
        </p>
        <p>
          These measures reduce risk. They do not make storage or transmission
          impossible to compromise. Photos are only as private as the upload
          link, the owner&apos;s Google account, and the admin accounts.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>
          Accounts are for people organising a collection. We do not knowingly
          register children, and the sign-up form does not ask for a date of
          birth. Event photos and videos may show children because guests
          took them. We do not use those images to identify children. The
          event owner is responsible for whether collecting those images is
          appropriate.
        </p>
      </section>

      <section>
        <h2>9. Your rights</h2>
        <p>
          If UK or EU data protection law applies, you can ask to access your
          personal data, correct it, delete it, restrict it, or receive a copy
          in a portable form. You can object to processing based on legitimate
          interests. Where processing is based on consent, you can withdraw
          that consent. You can also complain to a supervisory authority. In
          the UK that is the Information Commissioner&apos;s Office
          (ico.org.uk). In the EEA it is the authority in your country.
        </p>
        <p>
          Email <a href={`mailto:${LEGAL_CONTACT}`}>{LEGAL_CONTACT}</a>. We
          will respond within one month, unless the request is complex, in
          which case the law allows an extension and we will tell you. We may
          ask for enough information to confirm it is you, or that you are the
          event owner.
        </p>
        <p>What you can do yourself today:</p>
        <ul>
          <li>Sign out, which ends that session.</li>
          <li>
            Owners and admins can delete individual files in the event
            gallery. That attempts a Drive delete and hides the file in Memory
            Drop.
          </li>
          <li>
            Owners can turn uploads off, change the event name and date,
            change size limits, regenerate the upload link, and remove an
            admin.
          </li>
        </ul>
        <p>
          Guests cannot pull a file back after it has uploaded. Ask the couple,
          or email us and we will pass the request to the event owner where
          we can identify the file. There is no guest name on the upload, so we
          may only be able to find a file from the file name, time, and event.
        </p>
        <p>
          Closing an account, deleting a whole event, or disconnecting Google
          Drive is not a button in the product. Ask by email and we will do it
          in the database. Files already in the owner&apos;s Google Drive stay
          under that Google account unless they are deleted there as well.
        </p>
      </section>

      <section>
        <h2>10. Changes</h2>
        <p>
          If we change how the product handles personal data, we will update
          this page and its date. The current version is also linked from the
          homepage footer, account creation, and the guest upload page.
        </p>
        <p>
          Related: <Link href="/terms">Terms and conditions</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
