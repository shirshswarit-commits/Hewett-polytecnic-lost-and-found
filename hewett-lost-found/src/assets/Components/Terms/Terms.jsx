import "./Terms.css";

const Terms = () => (
  <article className="terms-page" aria-labelledby="terms-title">
    <span className="eyebrow">CAMPUS COMMUNITY GUIDELINES</span>
    <h1 id="terms-title">Terms &amp; Conditions</h1>
    <p className="terms-updated">Please review these guidelines before using the service.</p>
    <p>
      Losyt$found helps campus community members report and recover lost
      belongings. By using this service, you agree to follow these terms and
      the rules of your campus.
    </p>

    <section>
      <h2>Use the service responsibly</h2>
      <p>
        Submit truthful, relevant information about lost or found property.
        Do not post content that is unlawful, threatening, abusive, harassing,
        discriminatory, or unrelated to recovering an item.
      </p>
    </section>
    <section>
      <h2>Protect personal information</h2>
      <p>
        Share only the contact details needed to coordinate a safe return.
        Do not post passwords, financial information, private identification
        numbers, or another person’s personal information without permission.
        Location sharing is optional and is sent only when you choose to attach it.
      </p>
    </section>
    <section>
      <h2>Communicate and arrange returns safely</h2>
      <p>
        Messages are for coordinating item recovery. Be respectful, do not
        misuse chat, and arrange handovers in a public, appropriate campus
        location. The service does not verify ownership or guarantee a return.
      </p>
    </section>
    <section>
      <h2>Your reports and account</h2>
      <p>
        You are responsible for the content you submit and for keeping your
        account credentials secure. You may update your profile and manage your
        own reports. Administrators may remove content that violates these
        terms or campus policy.
      </p>
    </section>
    <section>
      <h2>Availability and changes</h2>
      <p>
        The service is provided to support campus lost-and-found efforts and
        may be updated or temporarily unavailable. These terms may change as
        the service evolves; continued use after changes means you accept the
        updated terms.
      </p>
    </section>
  </article>
);

export default Terms;
