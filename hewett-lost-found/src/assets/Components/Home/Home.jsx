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

const ItemCard = ({ item, onDelete, canDelete, onItemClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      className="reported-item-card"
      tabIndex={0}
      aria-label={`Open details for ${item.title}`}
      onClick={() => onItemClick?.(item)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onItemClick?.(item);
        }
      }}
    >
      <button
        className={`reported-item-image ${item.image_url ? "has-image" : ""}`}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onItemClick?.(item);
        }}
        aria-label={`View details for ${item.title}`}
      >
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
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
      </button>
      <div className="reported-item-details">
        <span className="reported-item-category">{item.category || "Other"}</span>
        <h3 title={item.title}>
          <button className="reported-item-title-button" type="button" onClick={(event) => {
            event.stopPropagation();
            onItemClick?.(item);
          }}>
            {item.title}
          </button>
        </h3>
        <p>{item.location || "Lucknow campus"}</p>
        {isExpanded && (
          <div className="reported-item-expanded">
            {item.description && <p>{item.description}</p>}
            <span>{item.date_lost_found ? `Reported date: ${item.date_lost_found}` : "Date not provided"}</span>
          </div>
        )}
        <div className="reported-item-actions">
          <button
            className="item-expand-button"
            type="button"
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Hide" : "Show"} details for ${item.title}`}
            onClick={(event) => {
              event.stopPropagation();
              setIsExpanded((expanded) => !expanded);
            }}
          >
            <span>{isExpanded ? "Hide details" : "Details"}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              {isExpanded
                ? <path d="m6 9 6 6 6-6" />
                : <path d="m9 6 6 6-6 6" />}
            </svg>
          </button>
          {canDelete && (
            <button className="item-delete-button" type="button" onClick={(event) => {
              event.stopPropagation();
              onDelete(item);
            }}>
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const ItemLane = ({ title, type, items, onDelete, canDelete, onItemClick }) => {
  const trackRef = useRef(null);
  const scroll = (direction) => trackRef.current?.scrollBy({
    left: direction * Math.max(trackRef.current.clientWidth * 0.8, 220),
    behavior: "smooth",
  });

  return (
    <section className="reported-items-lane" id={`${type}-items`} aria-labelledby={`${type}-items-title`}>
      <div className="reported-items-heading">
        <div>
          <span className="eyebrow">{type === "lost" ? "MISSING BELONGINGS" : "HELP SOMEONE RECLAIM IT"}</span>
          <h2 id={`${type}-items-title`}>{title}</h2>
          <p>{items.length} {items.length === 1 ? "report" : "reports"}</p>
        </div>
        <div className="item-lane-controls" aria-label={`Browse ${title.toLowerCase()}`}>
          <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${title.toLowerCase()} left`}>‹</button>
          <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${title.toLowerCase()} right`}>›</button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="items-empty">No {type} reports yet.</div>
      ) : (
        <div className="items-horizontal-track" ref={trackRef} tabIndex="0" aria-label={`${title} reports`}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={onDelete}
              canDelete={canDelete}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const ItemsPage = ({
  title,
  description,
  items,
  itemsReady,
  storageError,
  onDelete,
  canDelete,
  onItemClick,
}) => (
  <section className="items-page" aria-labelledby="items-page-title">
    <div className="items-page-heading">
      <span className="eyebrow">CAMPUS LOST &amp; FOUND</span>
      <h1 id="items-page-title">{title}</h1>
      <p>{description}</p>
    </div>
    {storageError && <p className="items-error" role="alert">{storageError}</p>}
    {!itemsReady ? (
      <p className="items-empty">Loading items…</p>
    ) : items.length === 0 ? (
      <div className="items-empty">No items to show yet.</div>
    ) : (
      <div className="items-grid">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onDelete={onDelete}
            canDelete={canDelete}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    )}
  </section>
);

const Home = ({
  items,
  itemsReady,
  storageError,
  onReport,
  page = "home",
  myItems = [],
  myItemsReady = false,
  canManageAllItems = false,
  isAuthenticated = false,
  onDeleteItem,
  onBrowseAll,
  onItemClick,
}) => {
  if (page === "browse") {
    return (
      <ItemsPage
        title="Browse reported items"
        description="Every item currently reported by the campus community."
        items={items}
        itemsReady={itemsReady}
        storageError={storageError}
        onItemClick={onItemClick}
      />
    );
  }
  if (page === "my-items") {
    return (
      <ItemsPage
        title="My reported items"
        description="Reports you have added to the campus lost-and-found."
        items={myItems}
        itemsReady={myItemsReady}
        storageError={storageError}
        onDelete={onDeleteItem}
        canDelete
        onItemClick={onItemClick}
      />
    );
  }
  if (page === "admin") {
    return (
      <ItemsPage
        title="Admin item management"
        description="Review community reports and remove inappropriate or outdated items."
        items={items}
        itemsReady={itemsReady}
        storageError={storageError}
        onDelete={onDeleteItem}
        canDelete={canManageAllItems}
        onItemClick={onItemClick}
      />
    );
  }

  const lostItems = items.filter((item) => item.type === "lost");
  const foundItems = items.filter((item) => item.type === "found");

  return (
    <>
      {!isAuthenticated && <section className="hero-section" id="home">
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
            <button className="button button-primary" type="button" onClick={onBrowseAll}>
              Browse all items
            </button>
            <button className="button button-secondary" type="button" onClick={onReport}>
              Report an item
            </button>
          </div>
        </div>
      </section>}

      {storageError && <p className="items-error" role="alert">{storageError}</p>}
      {!itemsReady ? (
        <p className="items-empty">Loading reported items…</p>
      ) : items.length === 0 ? (
        <div className="items-empty">
          <span className="items-empty-icon" aria-hidden="true">✦</span>
          <span>No reports yet. Be the first to share a lost or found item.</span>
        </div>
      ) : (
        <section className="reported-items" aria-label="Recently reported items">
          <div className="reported-overview-heading">
            <div>
              <span className="eyebrow">CAMPUS LOST &amp; FOUND</span>
              <h2>Recently reported items</h2>
              <p>{items.length} {items.length === 1 ? "item" : "items"} shared by the community</p>
            </div>
            <button className="browse-all-button" type="button" onClick={onBrowseAll}>
              Browse all <span aria-hidden="true">→</span>
            </button>
          </div>
          <ItemLane title="Lost items" type="lost" items={lostItems} onItemClick={onItemClick} />
          <ItemLane title="Found items" type="found" items={foundItems} onItemClick={onItemClick} />
        </section>
      )}

      {!isAuthenticated && <CampusLocations />}

      {!isAuthenticated && <section className="item-sections" aria-label="Lost and found">
        <article className="item-card">
          <span className="card-icon card-icon-lost">?</span>
          <h2>Lost something?</h2>
          <p>Check reports for belongings reported missing by others.</p>
          <a href="#lost-items">Browse lost reports</a>
        </article>
        <article className="item-card">
          <span className="card-icon card-icon-found">✓</span>
          <h2>Found something?</h2>
          <p>Help reunite a campus community member with their item.</p>
          <a href="#found-items">Browse found reports</a>
        </article>
      </section>}

      {!isAuthenticated && <section className="report-banner" id="report-item">
        <div>
          <span className="eyebrow">HELP THE COMMUNITY</span>
          <h2>Every report can make a difference.</h2>
          <p>Share lost and found reports with the campus community.</p>
        </div>
        <button className="button button-light" type="button" onClick={onReport}>Report an item</button>
      </section>}
    </>
  );
};

export default Home;
