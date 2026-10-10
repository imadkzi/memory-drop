import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONTACT, LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description:
    "The terms for using Memory Drop to collect event photos and videos from guests.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms and conditions · Memory Drop",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      description="These terms cover use of Memory Drop by people who create an account, people they add as admins, and guests who upload through an event link."
    >
      <section>
        <h2>1. The service</h2>
        <p>
          Memory Drop lets an event owner open a private collection, connect
          their own Google Drive, and share one upload link or QR code. Guests
          can send photos and videos. They cannot browse the collection. Owners
          and admins can preview, download, and delete files.
        </p>
        <p>
          The service is operated as Memory Drop. Contact{" "}
          <a href={`mailto:${LEGAL_CONTACT}`}>{LEGAL_CONTACT}</a>. Creating an
          account, or uploading through a guest link, means you accept these
          terms and the <Link href="/privacy">privacy policy</Link>.
        </p>
      </section>

      <section>
        <h2>2. Who may use it</h2>
        <p>
          You must be able to enter a contract where you live. Accounts are for
          adults organising or helping with an event collection. We do not
          knowingly open accounts for children, and the form does not check a
          date of birth.
        </p>
        <p>
          A guest does not need an account. Using an upload link means you
          accept the guest parts of these terms. You must have the right to
          send the files you choose.
        </p>
      </section>

      <section>
        <h2>3. Accounts</h2>
        <p>
          Registration asks for your name, email, and a password of at least 8
          characters. You are responsible for that login and for what happens
          under it. Tell us at {LEGAL_CONTACT} if you believe someone else is
          using it.
        </p>
        <p>
          We do not verify email addresses and we do not offer two-factor
          sign-in. There is no in-product button to delete an account. You can
          ask us by email and we will delete the account record. See the
          privacy policy for what that deletion covers.
        </p>
        <p>
          The event owner can invite an admin by email. That creates a private
          invite link the owner copies and sends. The invite expires after 7
          days. If the person does not have an account yet, they set a password
          on the link. If they already have an account, they sign in and accept.
          Admins can view, download, and delete media and see event settings.
          Only the owner can invite or remove admins and regenerate the upload
          link. Removing an admin removes their access to that event. It does
          not delete their Memory Drop account.
        </p>
      </section>

      <section>
        <h2>4. Event collections</h2>
        <p>If you create an event, you are responsible for:</p>
        <ul>
          <li>
            Having a lawful reason to collect guest photos and videos, and
            telling guests what will happen to them in a way that matches this
            product.
          </li>
          <li>
            Treating the upload link as a secret. Anyone who has it can upload
            while uploads are switched on. Regenerating the link turns the old
            one off immediately.
          </li>
          <li>
            The Google account you connect, including Google&apos;s terms and
            whatever happens to files stored in that Drive.
          </li>
          <li>
            Who you add as an admin, and for deleting files you no longer have
            a reason to keep.
          </li>
        </ul>
        <p>
          You can set the event name, an event date, whether uploads are
          open, and size limits. Defaults are 25 MB for a photo and 1 GB for a
          video, unless the deployment uses different defaults. Settings allow
          up to 100 MB for a photo and 5 GB for a video.
        </p>
        <p>
          There is no button yet to delete a whole event or to disconnect
          Google Drive. Email us if you need either. Files already written to
          Drive remain in that Google account until they are deleted there.
        </p>
      </section>

      <section>
        <h2>5. Guest uploads</h2>
        <p>
          The upload page accepts JPEG, PNG, WebP, HEIC, HEIF, MP4, and
          QuickTime MOV files, within the event&apos;s size limits. Other
          types are rejected. We do not remove hidden metadata from files.
        </p>
        <p>
          After a file uploads, the guest cannot view it again, download it, or
          delete it through Memory Drop. Deletion is done by the owner or an
          admin. A guest who wants a file removed should ask the couple or
          email {LEGAL_CONTACT}.
        </p>
        <p>
          We may refuse or rate-limit uploads that look abusive. The default
          limit is 30 requests per IP address and 60 per event link in a
          10-minute window. That limit is enforced in server memory.
        </p>
      </section>

      <section>
        <h2>6. Google Drive</h2>
        <p>
          Connecting Drive is optional until you want to receive files. The
          connection uses Google OAuth with the drive.file scope, so Memory
          Drop can create and manage the folders and files it creates, and
          cannot read the rest of your Drive. We store the resulting tokens
          encrypted, and we use them to create a Memory Drop folder, a
          folder for the event, and to upload, preview, download, and delete
          files the app put there.
        </p>
        <p>
          If Google withdraws the connection, or the token cannot be refreshed,
          uploads and deletes can fail. A failed Drive delete can leave our
          record marked deleted while the file is still in Drive. Memory Drop
          is not Google and does not control Google&apos;s availability or
          policies.
        </p>
      </section>

      <section>
        <h2>7. Acceptable use</h2>
        <p>You must not:</p>
        <ul>
          <li>
            Upload anything you do not have the right to share, including other
            people&apos;s private images.
          </li>
          <li>
            Use the service to harass, to distribute illegal content, or to
            break into accounts, links, or Drive folders.
          </li>
          <li>
            Attempt to turn an upload link into a way to browse the collection.
            The product does not provide that, and trying to bypass it is a
            breach of these terms.
          </li>
          <li>
            Overload the service, probe it, or resell it as your own storage
            product.
          </li>
        </ul>
        <p>
          We may suspend an account, turn uploads off, or invalidate a link if
          we reasonably believe these terms are being broken or the service is
          at risk. Where we can, we will tell the event owner.
        </p>
      </section>

      <section>
        <h2>8. Your content</h2>
        <p>
          Guests and owners keep their rights in the photos and videos. You
          give Memory Drop a limited permission to receive, transmit, store in
          the connected Google Drive, and show those files to the owner and
          admins of that event, only so we can run the service. We do not
          claim ownership and we do not use event files for advertising or to
          train models.
        </p>
        <p>
          You are responsible for the content you upload. Memory Drop does not
          review files before they are stored.
        </p>
      </section>

      <section>
        <h2>9. Availability, changes, and fees</h2>
        <p>
          The service is provided as it is available. There is no uptime
          promise. We may change features, and the privacy policy describes how
          data is handled when we do. The product does not charge a fee today.
          If we introduce a fee, it will apply only after we tell account
          holders, and it will not be taken from a card we do not have. We do
          not store payment details because there is no checkout.
        </p>
      </section>

      <section>
        <h2>10. Liability</h2>
        <p>
          Memory Drop is not liable for Google Drive outages, for a guest
          uploading a file they had no right to upload, for loss of a file that
          remains only in an owner&apos;s Google account, or for indirect or
          consequential loss, to the extent the law allows that limit.
        </p>
        <p>
          Nothing in these terms limits liability for death or personal injury
          caused by negligence, for fraud, or for any other liability that
          cannot legally be limited. If you are a consumer in the UK or the
          EEA, you keep the mandatory rights of that place.
        </p>
        <p>
          We have not chosen a court or a national law inside the product,
          because the operator&apos;s place of establishment is not published
          here. Mandatory consumer protections still apply. Write to{" "}
          {LEGAL_CONTACT} about a dispute and we will respond.
        </p>
      </section>

      <section>
        <h2>11. Ending use</h2>
        <p>
          You may stop using the service at any time. Signing out ends the
          current session. Closing the account, deleting an event, or
          disconnecting Drive requires an email request until those controls
          exist in the product. Guest links stop accepting files when the owner
          turns uploads off or regenerates the link.
        </p>
        <p>
          Sections that by their nature should continue, including the content
          licence for files still stored, acceptable use, and liability, keep
          effect after you stop using the service.
        </p>
      </section>
    </LegalPage>
  );
}
