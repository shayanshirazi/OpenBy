import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | OpenBy",
  description: "OpenBy Privacy Policy - How we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-zinc-600">Last updated: February 7, 2026</p>

        <div className="mt-12 space-y-10 text-zinc-700 [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
          <section>
            <h2>1. Introduction</h2>
            <p>
              OpenBy (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
              committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when
              you use our AI-powered price tracking platform, including our
              website, search functionality, product recommendations, and related
              services (collectively, the &quot;Services&quot;). Please read this
              policy carefully to understand our views and practices regarding
              your personal data.
            </p>
            <p>
              By accessing or using OpenBy, you agree to this Privacy Policy. If
              you do not agree with our policies and practices, please do not
              use our Services. We may update this policy from time to time; we
              will notify you of any material changes by posting the new Privacy
              Policy on this page and updating the &quot;Last updated&quot;
              date.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <p>
              When you use our Services, you may voluntarily provide us with
              certain information, including:
            </p>
            <ul>
              <li>Search queries and product interests</li>
              <li>Email address (if you choose to subscribe to newsletters or alerts)</li>
              <li>Communications you send to us, including support requests</li>
              <li>Feedback, survey responses, and other voluntary submissions</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <p>
              When you access our Services, we automatically collect certain
              information, which may include:
            </p>
            <ul>
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, search
                terms, time spent on the platform, and navigation paths
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating
                system, device type, screen resolution, and language preferences
              </li>
              <li>
                <strong>Log Data:</strong> IP address, access times, and
                referring URLs
              </li>
              <li>
                <strong>Cookies and Similar Technologies:</strong> As described
                in our{" "}
                <Link href="/cookie-policy" className="text-blue-600 hover:underline">
                  Cookie Policy
                </Link>
              </li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <p>
              We may receive information about products, prices, and availability
              from third-party data providers and e-commerce platforms to
              power our price tracking and AI recommendation features. This
              data is used to provide you with accurate product information
              and buy recommendations.
            </p>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>
                <strong>Providing the Services:</strong> To deliver our price
                tracking, search, and AI-powered buy recommendations; to
                personalize your experience; and to improve our product
                suggestions
              </li>
              <li>
                <strong>Analytics and Improvement:</strong> To analyze usage
                patterns, understand how our Services are used, and develop new
                features and improvements
              </li>
              <li>
                <strong>Communication:</strong> To respond to your inquiries,
                send service-related notifications, and (with your consent)
                deliver marketing communications
              </li>
              <li>
                <strong>Security and Fraud Prevention:</strong> To detect,
                prevent, and address technical issues, abuse, and unauthorized
                access
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with applicable
                laws, regulations, and legal processes
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul>
              <li>
                <strong>Service Providers:</strong> With trusted third parties
                who assist us in operating our Services, such as hosting
                providers, analytics services, and data processors, subject to
                appropriate confidentiality obligations
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court
                order, or governmental authority, or when we believe disclosure
                is necessary to protect our rights, your safety, or the safety
                of others
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, sale of assets, or bankruptcy, where your
                information may be transferred as part of that transaction
              </li>
              <li>
                <strong>With Your Consent:</strong> When you have given us
                explicit permission to share your information
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Data Retention</h2>
            <p>
              We retain your information only for as long as necessary to fulfill
              the purposes outlined in this Privacy Policy, unless a longer
              retention period is required or permitted by law. Usage data and
              analytics are typically retained in aggregated or anonymized form
              for longer periods to improve our Services. When we no longer need
              your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section>
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. These measures include
              encryption in transit and at rest, secure access controls, regular
              security assessments, and employee training. However, no method of
              transmission over the Internet or electronic storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>7. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li>
                <strong>Access:</strong> Request access to the personal
                information we hold about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or
                incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information, subject to certain exceptions
              </li>
              <li>
                <strong>Portability:</strong> Request a copy of your data in a
                portable format
              </li>
              <li>
                <strong>Opt-Out:</strong> Opt out of marketing communications
                and certain data processing activities
              </li>
              <li>
                <strong>Cookie Preferences:</strong> Manage your cookie
                preferences as described in our{" "}
                <Link href="/cookie-policy" className="text-blue-600 hover:underline">
                  Cookie Policy
                </Link>
              </li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information
              provided in Section 10. We will respond to your request within the
              timeframe required by applicable law.
            </p>
            <p>
              Residents of the European Economic Area (EEA) and United Kingdom
              have additional rights under the GDPR, including the right to
              lodge a complaint with a supervisory authority. California
              residents have additional rights under the CCPA, as described in
              our California-specific disclosure.
            </p>
          </section>

          <section>
            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Our Services are not intended for individuals under the age of 16.
              We do not knowingly collect personal information from children
              under 16. If you become aware that a child has provided us with
              personal information, please contact us, and we will take steps to
              delete such information.
            </p>
          </section>

          <section>
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your country of residence, including the United States.
              These countries may have different data protection laws. When we
              transfer data internationally, we take appropriate safeguards,
              such as standard contractual clauses approved by the European
              Commission, to ensure your information receives an adequate level
              of protection.
            </p>
          </section>

          <section>
            <h2>10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us:
            </p>
            <ul>
              <li>Email: privacy@openby.com</li>
              <li>Website: openby.com</li>
            </ul>
            <p>
              For more information about our data practices, please also review
              our{" "}
              <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                Terms of Service
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
            href="/terms-of-service"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Terms of Service
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
