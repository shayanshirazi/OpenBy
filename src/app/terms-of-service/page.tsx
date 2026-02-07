import Link from "next/link";

export const metadata = {
  title: "Terms of Service | OpenBy",
  description: "OpenBy Terms of Service - Legal terms governing your use of our price tracking platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="relative bg-gradient-to-b from-blue-50/30 via-white to-indigo-50/20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(59,130,246,0.04),transparent)]" />
      <div className="relative mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to OpenBy
        </Link>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          Terms of Service
        </h1>
        <p className="mt-2 text-zinc-600">Last updated: February 7, 2026</p>

        <div className="mt-12 space-y-10 text-zinc-700 [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally
              binding agreement between you (&quot;you,&quot; &quot;your,&quot;
              or &quot;User&quot;) and OpenBy (&quot;we,&quot; &quot;our,&quot;
              or &quot;us&quot;) governing your access to and use of our
              website, applications, and all related services, including our
              AI-powered price tracking platform, product search, buy
              recommendations, and category browsing (collectively, the
              &quot;Services&quot;).
            </p>
            <p>
              By accessing or using OpenBy, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and our{" "}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree to these Terms, you may not access or use our
              Services. We reserve the right to modify these Terms at any time;
              we will notify you of material changes by posting the updated
              Terms on this page and updating the &quot;Last updated&quot; date.
              Your continued use of the Services after such changes constitutes
              acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2>2. Description of Services</h2>
            <p>
              OpenBy provides an AI-powered price tracking and product
              recommendation platform. Our Services include:
            </p>
            <ul>
              <li>Product search and discovery across technology categories</li>
              <li>Historical price tracking and price trend visualization</li>
              <li>AI-generated buy scores and recommendations</li>
              <li>Category browsing and best deals identification</li>
              <li>Access to product information aggregated from third-party sources</li>
            </ul>
            <p>
              We strive to provide accurate and useful information, but we do
              not guarantee the accuracy, completeness, or timeliness of any
              data, including prices, availability, or AI recommendations. Price
              data and product information are subject to change without notice.
              You should verify all information before making purchasing
              decisions.
            </p>
          </section>

          <section>
            <h2>3. Eligibility and Account Registration</h2>
            <p>
              You must be at least 16 years of age and have the legal capacity
              to enter into a binding contract to use our Services. By using
              OpenBy, you represent and warrant that you meet these
              requirements.
            </p>
            <p>
              Certain features may require account registration. When you
              register, you agree to provide accurate, current, and complete
              information and to maintain and update such information. You are
              responsible for maintaining the confidentiality of your account
              credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2>4. Acceptable Use</h2>
            <p>You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul>
              <li>
                Use the Services in any way that violates applicable laws or
                regulations
              </li>
              <li>
                Attempt to gain unauthorized access to our systems, networks, or
                other users&apos; accounts
              </li>
              <li>
                Use automated systems (bots, scrapers, crawlers) to access the
                Services without our express permission
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Services or the data contained therein
              </li>
              <li>
                Transmit any viruses, malware, or other harmful code
              </li>
              <li>
                Use the Services to send spam, phishing, or other unsolicited
                communications
              </li>
              <li>
                Copy, reproduce, distribute, or create derivative works from our
                content, design, or technology without permission
              </li>
              <li>
                Use our AI recommendations or data for commercial resale or
                redistribution without a separate agreement
              </li>
            </ul>
            <p>
              We reserve the right to suspend or terminate your access to the
              Services if we believe you have violated these Terms or engaged in
              conduct that is harmful to us, other users, or third parties.
            </p>
          </section>

          <section>
            <h2>5. Intellectual Property Rights</h2>
            <p>
              The Services, including all content, features, functionality,
              design, software, algorithms, and AI models, are owned by OpenBy
              or our licensors and are protected by copyright, trademark, and
              other intellectual property laws. You are granted a limited,
              non-exclusive, non-transferable, revocable license to access and
              use the Services for your personal, non-commercial use in
              accordance with these Terms.
            </p>
            <p>
              You may not modify, reverse engineer, decompile, disassemble, or
              attempt to extract the source code of our Services. You may not
              remove or alter any proprietary notices. The OpenBy name, logo,
              and related marks are our trademarks; you may not use them without
              our prior written consent.
            </p>
          </section>

          <section>
            <h2>6. Third-Party Links and Content</h2>
            <p>
              Our Services may contain links to third-party websites, including
              e-commerce platforms and retailers. We do not control, endorse, or
              assume responsibility for the content, privacy policies, or
              practices of any third-party sites. When you leave our Services,
              you do so at your own risk. We encourage you to review the terms
              and privacy policies of any third-party sites you visit.
            </p>
            <p>
              Product information, including images and descriptions, may be
              sourced from third parties. We make reasonable efforts to display
              accurate information but do not warrant its accuracy. Purchase
              transactions occur on third-party platforms, and we are not a
              party to any such transactions.
            </p>
          </section>

          <section>
            <h2>7. Disclaimer of Warranties</h2>
            <p>
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
            </p>
            <p>
              We do not warrant that the Services will be uninterrupted,
              error-free, secure, or free of viruses or other harmful
              components. We do not warrant the accuracy, reliability, or
              completeness of any content, including price data, product
              information, or AI-generated recommendations. Our AI scores and
              buy recommendations are provided for informational purposes only
              and should not be construed as financial, investment, or
              professional advice.
            </p>
          </section>

          <section>
            <h2>8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
              SHALL OPENBY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR
              LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
              LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN
              CONNECTION WITH YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN
              ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATED TO
              THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE GREATER OF (A)
              ONE HUNDRED U.S. DOLLARS ($100) OR (B) THE AMOUNT YOU PAID US, IF
              ANY, IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of
              certain warranties or liabilities; in such cases, the above
              limitations may not apply to you to the extent prohibited by law.
            </p>
          </section>

          <section>
            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless OpenBy and its
              officers, directors, employees, agents, and licensors from and
              against any and all claims, damages, obligations, losses,
              liabilities, costs, and expenses (including reasonable attorneys&apos;
              fees) arising from: (a) your use of the Services; (b) your
              violation of these Terms; (c) your violation of any third-party
              right; or (d) any claim that your use of the Services caused
              damage to a third party.
            </p>
          </section>

          <section>
            <h2>10. Termination</h2>
            <p>
              We may suspend or terminate your access to the Services at any
              time, with or without cause or notice, including for violation of
              these Terms. Upon termination, your right to use the Services will
              immediately cease.
            </p>
            <p>
              Sections of these Terms that by their nature should survive
              termination shall survive, including but not limited to
              Intellectual Property Rights, Disclaimer of Warranties,
              Limitation of Liability, Indemnification, and Governing Law.
            </p>
          </section>

          <section>
            <h2>11. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Delaware, United States, without regard
              to its conflict of law provisions.
            </p>
            <p>
              Any dispute arising out of or relating to these Terms or the
              Services shall first be attempted to be resolved through informal
              negotiation. If the dispute cannot be resolved within thirty (30)
              days, either party may initiate binding arbitration in accordance
              with the rules of the American Arbitration Association. The
              arbitration shall be conducted in Wilmington, Delaware, and the
              decision of the arbitrator shall be final and binding.
            </p>
            <p>
              You agree that any legal action or proceeding shall be brought
              exclusively in the federal or state courts located in Delaware,
              and you consent to the personal jurisdiction of such courts.
            </p>
          </section>

          <section>
            <h2>12. General Provisions</h2>
            <p>
              These Terms, together with our Privacy Policy and Cookie Policy,
              constitute the entire agreement between you and OpenBy regarding
              the Services. If any provision of these Terms is held to be
              invalid or unenforceable, the remaining provisions shall continue
              in full force and effect. Our failure to enforce any right or
              provision shall not constitute a waiver of such right or provision.
            </p>
            <p>
              We may assign our rights and obligations under these Terms to any
              affiliate or in connection with a merger, acquisition, or sale of
              assets. You may not assign your rights or obligations without our
              prior written consent.
            </p>
          </section>

          <section>
            <h2>13. Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us:
            </p>
            <ul>
              <li>Email: legal@openby.com</li>
              <li>Website: openby.com</li>
            </ul>
            <p>
              For information about how we handle your data, please review our{" "}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/cookie-policy" className="text-blue-600 hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 flex flex-wrap gap-6 border-t border-zinc-200 pt-8">
          <Link
            href="/privacy-policy"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/cookie-policy"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Cookie Policy
          </Link>
          <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
