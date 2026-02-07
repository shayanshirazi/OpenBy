import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | OpenBy",
  description: "OpenBy Cookie Policy - How we use cookies and similar technologies on our platform.",
};

export default function CookiePolicyPage() {
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
          Cookie Policy
        </h1>
        <p className="mt-2 text-zinc-600">Last updated: February 7, 2026</p>

        <div className="mt-12 space-y-10 text-zinc-700 [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_table]:mt-4 [&_table]:w-full [&_th]:border-b [&_th]:border-zinc-200 [&_th]:pb-2 [&_th]:text-left [&_td]:border-b [&_td]:border-zinc-100 [&_td]:py-3">
          <section>
            <h2>1. Introduction</h2>
            <p>
              This Cookie Policy explains how OpenBy (&quot;we,&quot;
              &quot;our,&quot; or &quot;us&quot;) uses cookies and similar
              technologies when you access our website and services. This policy
              should be read together with our{" "}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>
              .
            </p>
            <p>
              By continuing to use OpenBy, you consent to our use of cookies in
              accordance with this policy. You can manage your cookie preferences
              at any time through the methods described in Section 6 below.
            </p>
          </section>

          <section>
            <h2>2. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or
              mobile device when you visit a website. They are widely used to
              make websites work more efficiently, provide information to website
              owners, and enhance user experience. Cookies can be &quot;first-party&quot;
              (set by us) or &quot;third-party&quot; (set by other organizations
              whose services we use).
            </p>
            <p>
              We also use similar technologies such as web beacons (also known as
              pixels or clear GIFs), local storage, and session storage. These
              technologies serve similar purposes to cookies and are collectively
              referred to in this policy as &quot;cookies&quot; unless otherwise
              specified.
            </p>
          </section>

          <section>
            <h2>3. Types of Cookies We Use</h2>
            <p>
              We use the following categories of cookies on our platform:
            </p>

            <h3>3.1 Strictly Necessary Cookies</h3>
            <p>
              These cookies are essential for the operation of our website. They
              enable core functionality such as security, network management, and
              accessibility. You cannot opt out of these cookies as the website
              would not function properly without them.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>session_id</td>
                  <td>Maintains your session while navigating the site</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>csrf_token</td>
                  <td>Protects against cross-site request forgery</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>consent_preferences</td>
                  <td>Stores your cookie consent choices</td>
                  <td>1 year</td>
                </tr>
              </tbody>
            </table>

            <h3>3.2 Functional Cookies</h3>
            <p>
              These cookies enable enhanced functionality and personalization,
              such as remembering your search preferences, recently viewed
              categories, and display settings. They may be set by us or by
              third-party providers whose services we have added to our pages.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>search_history</td>
                  <td>Stores recent search queries for convenience</td>
                  <td>30 days</td>
                </tr>
                <tr>
                  <td>view_preferences</td>
                  <td>Remembers your preferred sort order and filters</td>
                  <td>90 days</td>
                </tr>
                <tr>
                  <td>category_views</td>
                  <td>Tracks which categories you browse for personalization</td>
                  <td>30 days</td>
                </tr>
              </tbody>
            </table>

            <h3>3.3 Analytics and Performance Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our
              website by collecting and reporting information anonymously. This
              helps us improve our Services, including our search functionality,
              product recommendations, and user interface.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>_ga</td>
                  <td>Distinguishes unique users for analytics</td>
                  <td>2 years</td>
                </tr>
                <tr>
                  <td>_gid</td>
                  <td>Distinguishes users for analytics</td>
                  <td>24 hours</td>
                </tr>
                <tr>
                  <td>_gat</td>
                  <td>Throttles request rate for analytics</td>
                  <td>1 minute</td>
                </tr>
              </tbody>
            </table>

            <h3>3.4 Targeting and Advertising Cookies</h3>
            <p>
              These cookies may be set through our site by our advertising
              partners. They may be used to build a profile of your interests and
              show you relevant advertisements on other sites. They do not store
              directly personal information but are based on uniquely identifying
              your browser and internet device.
            </p>
            <p>
              We may use such cookies to display relevant product recommendations
              and deals based on your browsing behavior. You can opt out of these
              cookies through the methods described in Section 6.
            </p>
          </section>

          <section>
            <h2>4. How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul>
              <li>
                <strong>Service Delivery:</strong> To enable and optimize the
                core features of our platform, including product search, price
                tracking, and AI-powered buy recommendations
              </li>
              <li>
                <strong>Personalization:</strong> To remember your preferences,
                such as your favorite categories, and to tailor our
                recommendations to your interests
              </li>
              <li>
                <strong>Analytics:</strong> To analyze how our Services are used,
                which features are most popular, and how we can improve the user
                experience
              </li>
              <li>
                <strong>Security:</strong> To protect against fraud, abuse, and
                unauthorized access, and to ensure the integrity of our platform
              </li>
              <li>
                <strong>Performance:</strong> To monitor and improve the
                performance of our website, including load times and error rates
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Third-Party Cookies</h2>
            <p>
              In addition to our own cookies, we may use various third-party
              cookies to report usage statistics, deliver content, or provide
              additional functionality. These third parties have their own
              privacy and cookie policies. We encourage you to review their
              policies to understand how they collect and use your information.
            </p>
            <p>
              Examples of third-party services that may set cookies on our
              platform include:
            </p>
            <ul>
              <li>
                <strong>Analytics Providers:</strong> To help us understand
                how visitors use our site and which products and categories
                generate the most interest
              </li>
              <li>
                <strong>Hosting and Infrastructure:</strong> To ensure reliable
                delivery of our Services across different regions
              </li>
              <li>
                <strong>Content Delivery Networks:</strong> To improve load times
                and performance
              </li>
            </ul>
          </section>

          <section>
            <h2>6. Managing Your Cookie Preferences</h2>
            <p>
              You have several options for managing or deleting cookies:
            </p>
            <ul>
              <li>
                <strong>Browser Settings:</strong> Most web browsers allow you to
                control cookies through their settings. You can typically find
                these options in the &quot;Options,&quot; &quot;Preferences,&quot;
                or &quot;Settings&quot; menu of your browser. You may be able to
                block all cookies, block only third-party cookies, or delete
                cookies when you close your browser.
              </li>
              <li>
                <strong>Opt-Out Links:</strong> For certain analytics and
                advertising cookies, you can opt out through industry programs
                such as the Digital Advertising Alliance&apos;s opt-out page
                (aboutads.info) or the Network Advertising Initiative
                (networkadvertising.org).
              </li>
              <li>
                <strong>Cookie Banner:</strong> When you first visit our website,
                you may be presented with a cookie consent banner that allows
                you to accept or reject non-essential cookies. You can change
                your preferences at any time by clearing your cookies and
                revisiting our site, or by contacting us.
              </li>
            </ul>
            <p>
              Please note that blocking or deleting certain cookies may impact
              your experience on our website. For example, we may not be able to
              remember your search preferences or provide personalized
              recommendations. Strictly necessary cookies cannot be disabled if
              you wish to use our Services.
            </p>
          </section>

          <section>
            <h2>7. Do Not Track</h2>
            <p>
              Some browsers offer a &quot;Do Not Track&quot; (DNT) signal that
              indicates your preference not to be tracked. There is no
              universally accepted standard for how websites should respond to
              DNT signals. Currently, we do not specifically respond to DNT
              signals, but you can manage your preferences through the cookie
              controls described above.
            </p>
          </section>

          <section>
            <h2>8. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect
              changes in our practices, technology, legal requirements, or other
              factors. We will notify you of any material changes by posting the
              updated policy on this page and updating the &quot;Last
              updated&quot; date. We encourage you to review this policy
              periodically.
            </p>
            <p>
              Your continued use of OpenBy after any changes indicates your
              acceptance of the updated Cookie Policy. If you do not agree with
              the changes, you should discontinue use of our Services and manage
              your cookie preferences accordingly.
            </p>
          </section>

          <section>
            <h2>9. Contact Us</h2>
            <p>
              If you have questions about our use of cookies or this Cookie
              Policy, please contact us:
            </p>
            <ul>
              <li>Email: privacy@openby.com</li>
              <li>Website: openby.com</li>
            </ul>
            <p>
              For more information about our data practices, please review our{" "}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                Terms of Service
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
            href="/terms-of-service"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Terms of Service
          </Link>
          <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
