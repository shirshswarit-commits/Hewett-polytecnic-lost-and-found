import { useState } from "react";
import "./ItemDetail.css";

const ItemDetail = ({ item, currentUserId, onBack, onStartChat, error }) => {
  const images = item.image_urls?.length
    ? item.image_urls
    : item.image_url
      ? [item.image_url]
      : [];
  const [activeImage, setActiveImage] = useState(images[0] || "");
  const isOwner = Boolean(currentUserId && item.user_id === currentUserId);

  return (
    <section className="item-detail-page" aria-label={`Details for ${item.title}`}>
      <button className="item-detail-back" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to items
      </button>
      {error && <p className="items-error" role="alert">{error}</p>}
      <div className="item-detail-layout">
        <section className="item-detail-gallery" aria-label="Item photos">
          <div className="item-detail-main-image">
            {activeImage ? (
              <img src={activeImage} alt={item.title} />
            ) : (
              <div className="item-detail-no-image" aria-label="No photo available">
                <span aria-hidden="true">{item.type === "found" ? "✓" : "?"}</span>
                <span>No item photo</span>
              </div>
            )}
            <span className={`reported-item-status status-${item.type}`}>
              {item.type === "found" ? "Found" : "Lost"}
            </span>
          </div>
          {images.length > 1 && (
            <div className="item-detail-thumbnails" aria-label="Choose a photo">
              {images.map((image, index) => (
                <button
                  type="button"
                  className={image === activeImage ? "is-active" : ""}
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(image)}
                  aria-label={`View photo ${index + 1}`}
                  aria-pressed={image === activeImage}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="item-detail-info">
          <span className="item-detail-category">{item.category || "Other"}</span>
          <h1>{item.title}</h1>
          <p className="item-detail-subtitle">
            {item.type === "found" ? "Found item" : "Lost item"}
            {item.date_lost_found && ` · ${item.date_lost_found}`}
          </p>

          <div className="item-detail-location">
            <span aria-hidden="true">⌖</span>
            <div>
              <strong>{item.location || "Campus location not provided"}</strong>
              <span>Reported location</span>
            </div>
          </div>

          <section className="item-detail-description">
            <h2>Description</h2>
            <p>{item.description || "The poster did not add a description."}</p>
          </section>

          <div className="item-detail-owner">
            <span className="item-detail-avatar" aria-hidden="true">
              {(item.profiles?.full_name || "C").trim().charAt(0).toUpperCase()}
            </span>
            <div>
              <span>Posted by</span>
              <strong>{item.profiles?.full_name || "Campus member"}</strong>
            </div>
          </div>

          {isOwner ? (
            <p className="item-detail-owner-note">This is your report. Other campus members can message you about it.</p>
          ) : (
            <button className="item-detail-chat-button" type="button" onClick={() => onStartChat(item)}>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.5-.8L4 20l1.8-4.1A7.5 7.5 0 1 1 20 11.5Z" />
                <path d="M8.5 11.5h7" />
              </svg>
              Message poster
            </button>
          )}
        </section>
      </div>
    </section>
  );
};

export default ItemDetail;
