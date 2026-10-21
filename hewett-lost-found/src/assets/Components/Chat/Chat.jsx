import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchChatMessages,
  fetchChatThreads,
  sendChatMessage,
} from "../../../api";
import "./Chat.css";

const Chat = ({ token, userId, initialThreadId, onBack, onThreadChange }) => {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const [sharedLocation, setSharedLocation] = useState(null);
  const [error, setError] = useState("");
  const [isThreadsLoading, setIsThreadsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(initialThreadId || "");
  const messageListRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    const loadThreads = async () => {
      try {
        const { threads: loadedThreads } = await fetchChatThreads(token);
        if (!isActive) return;
        setThreads(loadedThreads);
      } catch (loadError) {
        if (isActive) setError(`Could not load chats: ${loadError.message}`);
      } finally {
        if (isActive) setIsThreadsLoading(false);
      }
    };

    loadThreads();
    const intervalId = window.setInterval(loadThreads, 10000);
    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  useEffect(() => {
    if (!activeThreadId) {
      return undefined;
    }
    let isActive = true;
    const loadMessages = async () => {
      try {
        const { messages: loadedMessages } = await fetchChatMessages(activeThreadId, token);
        if (isActive) {
          setMessages((current) => {
            const newerLocal = current.filter((message) => !loadedMessages.some(({ id }) => id === message.id));
            return [...loadedMessages, ...newerLocal].sort(
              (first, second) => new Date(first.created_at) - new Date(second.created_at),
            ).filter((message, index, all) => all.findIndex(({ id }) => id === message.id) === index);
          });
          setError("");
        }
      } catch (loadError) {
        if (isActive) setError(`Could not update messages: ${loadError.message}`);
      }
    };

    loadMessages().finally(() => {
      if (isActive) setIsMessagesLoading(false);
    });
    const intervalId = window.setInterval(loadMessages, 3000);
    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [activeThreadId, token]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, activeThreadId]);

  const activeThread = useMemo(
    () => threads.find(({ id }) => id === activeThreadId) || null,
    [threads, activeThreadId],
  );
  const visibleThreads = useMemo(
    () => threads.filter((thread) => filter === "all" || thread.item?.type === filter),
    [threads, filter],
  );

  const selectThread = (threadId) => {
    setError("");
    setMessages([]);
    setIsMessagesLoading(true);
    setActiveThreadId(threadId);
    onThreadChange(threadId);
  };

  const goToInbox = () => {
    setMessages([]);
    setIsMessagesLoading(true);
    setActiveThreadId("");
    setSharedLocation(null);
    onThreadChange("");
  };

  const attachLocation = () => {
    if (!navigator.geolocation) {
      setError("This browser does not support location sharing.");
      return;
    }

    setIsGettingLocation(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setSharedLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          label: "Shared current location",
        });
        setIsGettingLocation(false);
      },
      (locationError) => {
        setError(locationError.code === locationError.PERMISSION_DENIED
          ? "Location permission was denied. Allow it in your browser to share your location."
          : "Could not get your location. Please try again.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!activeThreadId || (!draft.trim() && !sharedLocation) || isSending) return;

    setIsSending(true);
    setError("");
    try {
      const payload = {
        body: draft.trim(),
        ...(sharedLocation ? { location: sharedLocation } : {}),
      };
      const { message } = await sendChatMessage(activeThreadId, payload, token);
      setMessages((current) => [...current.filter(({ id }) => id !== message.id), message]);
      setDraft("");
      setSharedLocation(null);
      const { threads: latestThreads } = await fetchChatThreads(token);
      setThreads(latestThreads);
    } catch (sendError) {
      setError(`Message could not be sent: ${sendError.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!activeThreadId) {
    return (
      <section className="chat-page" aria-labelledby="chat-title">
        <div className="chat-page-heading">
          <div>
            <span className="eyebrow">CAMPUS COMMUNITY</span>
            <h1 id="chat-title">Your chats</h1>
            <p>Message item posters and coordinate a safe return.</p>
          </div>
          <button className="chat-back-button" type="button" onClick={onBack}>Back to items</button>
        </div>
        <div className="chat-filter-tabs" aria-label="Filter chats by item type">
          {["all", "lost", "found"].map((value) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "is-active" : ""}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "All chats" : `${value === "lost" ? "Lost" : "Found"} items`}
            </button>
          ))}
        </div>
        {error && <p className="chat-error" role="alert">{error}</p>}
        {isThreadsLoading ? (
          <p className="chat-empty">Loading your chats…</p>
        ) : visibleThreads.length === 0 ? (
          <div className="chat-empty">
            <span aria-hidden="true">◌</span>
            <strong>No chats here yet</strong>
            <span>Open an item and choose “Message poster” to start a conversation.</span>
          </div>
        ) : (
          <div className="chat-thread-list">
            {visibleThreads.map((thread) => (
              <button
                className="chat-thread-card"
                type="button"
                key={thread.id}
                onClick={() => selectThread(thread.id)}
              >
                <span className="chat-thread-image">
                  {thread.item?.image_urls?.[0]
                    ? <img src={thread.item.image_urls[0]} alt="" />
                    : <span aria-hidden="true">{thread.item?.type === "found" ? "✓" : "?"}</span>}
                </span>
                <span className="chat-thread-summary">
                  <span className="chat-thread-title">
                    <strong>{thread.item?.title || "Item report"}</strong>
                    <span className={`chat-type-tag status-${thread.item?.type || "lost"}`}>
                      {thread.item?.type || "item"}
                    </span>
                  </span>
                  <span className="chat-thread-person">{thread.other_user?.full_name || "Campus member"}</span>
                  <span className="chat-thread-preview">
                    {thread.last_message?.body || (thread.last_message?.location ? "📍 Shared a location" : "Start this conversation")}
                  </span>
                </span>
                <span className="chat-thread-arrow" aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="chat-page chat-conversation-page" aria-labelledby="conversation-title">
      <header className="chat-conversation-header">
        <button className="chat-back-button" type="button" onClick={goToInbox}>← Chats</button>
        <div className="chat-conversation-item">
          {activeThread?.item?.image_urls?.[0] && <img src={activeThread.item.image_urls[0]} alt="" />}
          <span>
            <strong id="conversation-title">{activeThread?.item?.title || "Item conversation"}</strong>
            <small>{activeThread?.other_user?.full_name || "Campus member"} · {activeThread?.item?.type || "item"}</small>
          </span>
        </div>
        <span className="chat-live-indicator"><i aria-hidden="true" /> Live updates</span>
      </header>

      {error && <p className="chat-error" role="alert">{error}</p>}

      <div className="chat-messages" ref={messageListRef} aria-live="polite">
        {isMessagesLoading && messages.length === 0 ? (
          <p className="chat-empty">Loading messages…</p>
        ) : messages.length === 0 ? (
          <div className="chat-first-message">
            <span>👋</span>
            <strong>Start the conversation</strong>
            <p>Ask about this item or arrange a convenient handover.</p>
          </div>
        ) : messages.map((message) => {
          const isMine = message.sender_id === userId;
          const mapLink = message.location
            ? `https://maps.google.com/?q=${message.location.latitude},${message.location.longitude}`
            : "";
          return (
            <article className={`chat-message ${isMine ? "is-mine" : ""}`} key={message.id}>
              {message.body && <p>{message.body}</p>}
              {message.location && (
                <a className="chat-location-link" href={mapLink} target="_blank" rel="noreferrer">
                  <span aria-hidden="true">📍</span>
                  <span>
                    <strong>{message.location.label || "Shared location"}</strong>
                    <small>Open map</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </a>
              )}
              <time dateTime={message.created_at}>
                {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </time>
            </article>
          );
        })}
      </div>

      {sharedLocation && (
        <div className="chat-location-pending">
          <span>📍 Location attached</span>
          <button type="button" onClick={() => setSharedLocation(null)} aria-label="Remove attached location">×</button>
        </div>
      )}
      <form className="chat-compose" onSubmit={handleSend}>
        <button
          className="chat-location-button"
          type="button"
          onClick={attachLocation}
          disabled={isGettingLocation || isSending}
          aria-label="Attach current location"
          title="Attach your current location"
        >
          {isGettingLocation ? "…" : "⌖"}
        </button>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message…"
          aria-label="Message"
          maxLength={2000}
          rows={1}
        />
        <button
          className="chat-send-button"
          type="submit"
          disabled={isSending || (!draft.trim() && !sharedLocation)}
        >
          {isSending ? "…" : "Send"}
        </button>
      </form>
      <p className="chat-safety-note">Messages update automatically. Share your location only when you’re comfortable.</p>
    </section>
  );
};

export default Chat;
