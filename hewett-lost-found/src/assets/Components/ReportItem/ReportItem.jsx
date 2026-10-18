import { useEffect, useRef, useState } from "react";
import { uploadItemImages } from "../../../api";
import "./ReportItem.css";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const ReportItem = ({ onSubmit, token }) => {
  const [submitError, setSubmitError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const previewUrlsRef = useRef([]);

  useEffect(() => {
    return () => previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const updateSelectedFiles = (files) => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const urls = files.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current = urls;
    setSelectedFiles(files);
    setPreviewUrls(urls);
  };

  const handleFilesChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 3) {
      setFileError("You can upload up to 3 photos.");
      updateSelectedFiles([]);
      event.target.value = "";
      return;
    }
    const invalidFile = files.find((file) => !allowedImageTypes.includes(file.type) || file.size > 10 * 1024 * 1024);
    if (invalidFile) {
      setFileError("Choose JPG, PNG, or WEBP photos that are each smaller than 10 MB.");
      updateSelectedFiles([]);
      event.target.value = "";
      return;
    }
    setFileError("");
    updateSelectedFiles(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const formData = new FormData(event.currentTarget);
    const report = {
      type: formData.get("type"),
      title: formData.get("title").trim(),
      category: formData.get("category"),
      location: formData.get("location").trim(),
      date_lost_found: formData.get("date"),
      description: formData.get("description").trim(),
    };

    setIsSubmitting(true);
    try {
      const image_urls = selectedFiles.length
        ? await uploadItemImages(selectedFiles, token)
        : [];
      await onSubmit({ ...report, image_urls }, token);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="report-page" id="report-item" aria-labelledby="report-title">
      <span className="report-eyebrow">HELP YOUR CAMPUS COMMUNITY</span>
      <h1 id="report-title">Report an item</h1>
      <p className="report-intro">
        Share a few details and your item will appear in the campus lost-and-found
        feed.
      </p>

      <form className="report-form" onSubmit={handleSubmit}>
        <div className="report-type-options">
          <label>
            <input type="radio" name="type" value="lost" defaultChecked />
            <span>I lost something</span>
          </label>
          <label>
            <input type="radio" name="type" value="found" />
            <span>I found something</span>
          </label>
        </div>

        <label className="report-field">
          <span>Item name <span aria-hidden="true">*</span></span>
          <input name="title" type="text" placeholder="e.g. Blue water bottle" maxLength="100" required />
        </label>

        <div className="report-fields-row">
          <label className="report-field">
            <span>Category</span>
            <select name="category" defaultValue="Other">
              <option>Other</option>
              <option>Electronics</option>
              <option>Books & stationery</option>
              <option>Clothing</option>
              <option>Keys & cards</option>
              <option>Bags</option>
            </select>
          </label>
          <label className="report-field">
            <span>Where was it lost or found?</span>
            <input name="location" type="text" placeholder="e.g. Library" maxLength="120" />
          </label>
        </div>

        <div className="report-fields-row">
          <label className="report-field">
            <span>Date</span>
            <input name="date" type="date" />
          </label>
          <div className="report-field">
            <span>Photos (up to 3)</span>
            <label className="report-upload">
              <input
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFilesChange}
              />
              <span aria-hidden="true">↑</span>
              <span>Choose photos</span>
            </label>
          </div>
        </div>

        {previewUrls.length > 0 && (
          <div className="report-photo-previews" aria-label="Selected photo previews">
            {previewUrls.map((url, index) => (
              <img src={url} alt={`Selected item ${index + 1}`} key={url} />
            ))}
          </div>
        )}
        {fileError && <p className="report-error" role="alert">{fileError}</p>}

        <label className="report-field">
          <span>Description</span>
          <textarea name="description" rows="4" placeholder="Add any details that could help identify the item." maxLength="1000" />
        </label>

        {submitError && <p className="report-error" role="alert">{submitError}</p>}
        <button className="report-submit" type="submit" disabled={isSubmitting || !token || Boolean(fileError)}>
          {isSubmitting ? "Uploading and saving…" : "Add to lost & found"}
        </button>
        <p className="report-storage-note">
          Sign in to post a report that can be seen by the whole campus community.
        </p>
      </form>
    </section>
  );
};

export default ReportItem;
