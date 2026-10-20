import "./Theme.css";

const presetColors = [
  { name: "Grape", value: "#56375f" },
  { name: "Ocean", value: "#256b78" },
  { name: "Forest", value: "#47734b" },
  { name: "Rose", value: "#a64f65" },
  { name: "Sunset", value: "#bd633a" },
  { name: "Indigo", value: "#4054a1" },
];

const Theme = ({ color, onColorChange }) => (
  <section className="theme-page" aria-labelledby="theme-title">
    <span className="theme-eyebrow">MAKE IT YOURS</span>
    <h1 id="theme-title">Choose your theme</h1>
    <p className="theme-intro">
      Pick a color for the site. Your choice updates the navigation, sidebar,
      buttons, cards, and page accents as you make it.
    </p>

    <div className="theme-card">
      <div className="theme-picker-row">
        <label className="theme-color-label" htmlFor="theme-color">
          <span className="theme-color-swatch" style={{ backgroundColor: color }} />
          <span>
            <strong>Custom color</strong>
            <small>Choose any color you like</small>
          </span>
        </label>
        <input
          id="theme-color"
          className="theme-color-input"
          type="color"
          value={color}
          onChange={(event) => onColorChange(event.target.value)}
          aria-label="Choose a custom site theme color"
        />
      </div>

      <fieldset className="theme-presets">
        <legend>Or start with a palette</legend>
        <div className="theme-preset-list">
          {presetColors.map((preset) => (
            <button
              className={`theme-preset ${color.toLowerCase() === preset.value ? "is-selected" : ""}`}
              key={preset.name}
              type="button"
              onClick={() => onColorChange(preset.value)}
              aria-label={`Use ${preset.name} theme`}
              aria-pressed={color.toLowerCase() === preset.value}
            >
              <span className="theme-preset-color" style={{ backgroundColor: preset.value }} />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="theme-preview" aria-label="Preview of selected theme">
        <div className="theme-preview-top">
          <span className="theme-preview-mark" />
          <span>Losyt$found</span>
          <span className="theme-preview-link">Home</span>
        </div>
        <div className="theme-preview-content">
          <div>
            <span className="theme-preview-eyebrow">ALL CAMPUSES OF LUCKNOW</span>
            <h2>Find your way back.</h2>
            <p>Your chosen color is applied throughout the site.</p>
            <button className="theme-preview-button" type="button">Preview button</button>
          </div>
          <div className="theme-preview-panel" />
        </div>
      </div>
    </div>
  </section>
);

export default Theme;
