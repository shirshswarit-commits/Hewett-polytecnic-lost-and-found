import "./Home.css";

const Home = () => (
  <>
    <section className="hero-section" id="home">
      <span className="eyebrow">HEWETT POLYTECHNIC</span>
      <h1>Lost something on campus?</h1>
      <p>
        Browse reported items or let the campus community know what you have
        found.
      </p>
      <div className="hero-actions">
        <a className="button button-primary" href="#lost-items">
          Browse lost items
        </a>
        <a className="button button-secondary" href="#report-item">
          Report an item
        </a>
      </div>
    </section>

    <section className="item-sections" aria-label="Lost and found">
      <article className="item-card" id="lost-items">
        <span className="card-icon card-icon-lost">?</span>
        <h2>Lost something?</h2>
        <p>Check the lost-items area for belongings reported by others.</p>
        <a href="#report-item">See what to do next</a>
      </article>
      <article className="item-card" id="found-items">
        <span className="card-icon card-icon-found">✓</span>
        <h2>Found something?</h2>
        <p>Help reunite a campus community member with their item.</p>
        <a href="#report-item">Tell us about it</a>
      </article>
    </section>

    <section className="report-banner" id="report-item">
      <div>
        <span className="eyebrow">HELP THE COMMUNITY</span>
        <h2>Every report can make a difference.</h2>
        <p>Visit the campus help desk to report a lost or found item.</p>
      </div>
      <a className="button button-light" href="#contact">
        Contact the help desk
      </a>
    </section>
  </>
);

export default Home;
