import { useRef, useState } from "react";
import "./Home.css";

const campusLocations = [
  {
    id: "hewett-polytechnic",
    name: "Hewett Polytechnic",
    city: "Lucknow",
    description: "Browse lost and found reports from the Hewett Polytechnic community.",
    imageUrl: "",
  },
];

const LocationCard = ({ location }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className={`location-card ${isExpanded ? "is-expanded" : ""}`}>
      <div className="location-card-image">
        {location.imageUrl ? (
          <img src={location.imageUrl} alt={`${location.name} campus`} loading="lazy" />
        ) : (
          <svg className="location-placeholder-art" viewBox="0 0 360 190" aria-hidden="true">
            <path d="M0 150 360 105v85H0Z" fill="var(--theme-primary)" opacity=".12" />
            <path d="m69 83 111-51 111 51v10H69Z" fill="var(--theme-panel)" />
            <path d="M88 92h184v76H88z" fill="var(--theme-surface)" stroke="var(--theme-primary)" strokeOpacity=".4" />
            <path d="M75 168h210M103 101v63m38-63v63m38-63v63m38-63v63m38-63v63" stroke="var(--theme-primary)" strokeOpacity=".62" strokeWidth="5" />
            <path d="M162 126h36v42h-36z" fill="var(--theme-primary)" opacity=".75" />
            <circle cx="300" cy="47" r="16" fill="var(--theme-primary)" opacity=".2" />
          </svg>
        )}
        <span className="location-city">{location.city}</span>
      </div>
      <div className="location-card-content">
        <span className="location-card-label">CAMPUS LOCATION</span>
        <h3>{location.name}</h3>
        <p>{location.description}</p>
        {isExpanded && (
          <div className="location-card-expanded">
            <span>Lost &amp; found reports</span>
            <span>Photos and campus details can be added by an administrator.</span>
          </div>
        )}
        <button
          type="button"
          className="location-expand-button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded ? "Show less" : "View campus"} <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
        </button>
      </div>
    </article>
  );
};

const CampusLocations = () => {
  const trackRef = useRef(null);
  const scrollLocations = (direction) => {
    trackRef.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  };

  return (
    <section className="campus-locations" aria-labelledby="campus-locations-title">
      <div className="campus-locations-heading">
        <div>
          <span className="eyebrow">FIND IT NEAR YOU</span>
          <h2 id="campus-locations-title">Campus locations</h2>
          <p>Choose an institute to explore its lost and found community.</p>
        </div>
        {campusLocations.length > 1 && (
          <div className="location-slider-controls" aria-label="Scroll campus locations">
            <button type="button" onClick={() => scrollLocations(-1)} aria-label="Previous locations">←</button>
            <button type="button" onClick={() => scrollLocations(1)} aria-label="Next locations">→</button>
          </div>
        )}
      </div>
      <div className="location-cards-track" ref={trackRef}>
        {campusLocations.map((location) => (
          <LocationCard location={location} key={location.id} />
        ))}
      </div>
    </section>
  );
};

const ReportedItems = ({ items, itemsReady, storageError, onReport }) => {
  const duplicatedItems = [...items, ...items];

  return (
    <section className="reported-items" id="lost-items" aria-labelledby="reported-items-title">
      <div className="reported-items-heading">
        <div>
          <span className="eyebrow">CAMPUS LOST &amp; FOUND</span>
          <h2 id="reported-items-title">Recently reported items</h2>
          <p>{items.length} {items.length === 1 ? "item" : "items"} shared by the community</p>
        </div>
        <button className="button button-primary reported-add-button" type="button" onClick={onReport}>
          <span aria-hidden="true">+</span> Report item
        </button>
      </div>

      {storageError && <p className="items-error" role="alert">{storageError}</p>}
      {!itemsReady ? (
        <p className="items-empty">Loading reported items…</p>
      ) : items.length === 0 ? (
        <div className="items-empty">
          <span className="items-empty-icon" aria-hidden="true">✦</span>
          <span>No reports yet. Be the first to share a lost or found item.</span>
        </div>
      ) : (
        <div className="items-marquee" aria-label={`${items.length} reported items, scrolling horizontally`}>
          <div className="items-marquee-track">
            {[0, 1].map((copy) => (
              <div
                className="items-marquee-group"
                key={copy}
                aria-hidden={copy === 1 ? "true" : undefined}
                inert={copy === 1}
              >
                {duplicatedItems.slice(copy * items.length, (copy + 1) * items.length).map((item) => (
                  <article className="reported-item-card" key={`${copy}-${item.id}`}>
                    <div className={`reported-item-image ${item.image_url ? "has-image" : ""}`}>
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt=""
                          loading="lazy"
                          onError={(event) => { event.currentTarget.hidden = true; }}
                        />
                      )}
                      <span className="reported-item-fallback" aria-hidden="true">
                        {item.type === "found" ? "✓" : "?"}
                      </span>
                      <span className={`reported-item-status status-${item.type}`}>
                        {item.type === "found" ? "Found" : "Lost"}
                      </span>
                    </div>
                    <div className="reported-item-details">
                      <span className="reported-item-category">{item.category || "Other"}</span>
                      <h3>{item.title}</h3>
                      <p>{item.location || "Lucknow campus"}</p>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

const Home = ({ items, itemsReady, storageError, onReport }) => (
  <>
    <section className="hero-section" id="home">
      <div className="hero-copy">
        <span className="eyebrow">ALL CAMPUSES OF LUCKNOW</span>
        <h1>
          Lost something on campus?
          <span> Let’s help you find it.</span>
        </h1>
        <p>
          Browse reported items or let the campus community know what you have
          found.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#lost-items">
            Browse lost items
          </a>
          <button className="button button-secondary" type="button" onClick={onReport}>
            Report an item
          </button>
        </div>
      </div>
    </section>

    <ReportedItems
      items={items}
      itemsReady={itemsReady}
      storageError={storageError}
      onReport={onReport}
    />

    <CampusLocations />

    <section className="item-sections" aria-label="Lost and found">
      <article className="item-card">
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
