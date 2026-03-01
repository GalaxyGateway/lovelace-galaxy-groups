// lovelace-galaxy-groups-editor.js
// Loaded automatically via dynamic import() in lovelace-galaxy-groups.js.
// Do not register as a separate Lovelace resource.

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

const LitElement = customElements.get("hui-masonry-view")
  ? Object.getPrototypeOf(customElements.get("hui-masonry-view"))
  : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css  = LitElement.prototype.css;

export class CustomAlarmGroupsEditor extends LitElement {

  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = { title: "Group State", groups: [], ...config };
  }

  // ── Top-level getters ─────────────────────────────────────────────────────

  get _title() {
    return this._config.title || "";
  }

  // ── Per-group getter helper ───────────────────────────────────────────────

  _groupVal(idx, key, defaultVal = true) {
    const g = (this._config.groups || [])[idx] || {};
    return g[key] !== undefined ? g[key] : defaultVal;
  }

  // ── Change handlers ───────────────────────────────────────────────────────

  _titleChanged(ev) {
    if (!this._config || !this.hass) return;
    if (this._title === ev.target.value) return;
    this._config = { ...this._config, title: ev.target.value };
    fireEvent(this, "config-changed", { config: this._config });
  }

  _groupChanged(idx, key, value) {
    const groups = (this._config.groups || []).map((g, i) =>
      i === idx ? { ...g, [key]: value } : g
    );
    this._config = { ...this._config, groups };
    fireEvent(this, "config-changed", { config: this._config });
  }

  _groupInputChanged(idx, ev) {
    if (!this._config || !this.hass) return;
    const target = ev.target;
    const value  = target.checked !== undefined ? target.checked : target.value;
    this._groupChanged(idx, target.configValue, value);
  }

  _entityChanged(idx, ev) {
    this._groupChanged(idx, "entity", ev.detail.value);
  }

  _addGroup() {
    const groups = [...(this._config.groups || []), {
      entity:      "",
      name:        "New Group",
      allow_unset: true,
      allow_set:   true,
      allow_part:  true,
      allow_night: false,
      allow_reset: true,
      allow_abort: true,
      allow_force: true,
      icons:       false,
    }];
    this._config = { ...this._config, groups };
    fireEvent(this, "config-changed", { config: this._config });
  }

  _removeGroup(idx) {
    const groups = (this._config.groups || []).filter((_, i) => i !== idx);
    this._config = { ...this._config, groups };
    fireEvent(this, "config-changed", { config: this._config });
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  _renderSwitch(idx, key, label, defaultVal = true) {
    return html`
      <div class="switch">
        <ha-switch
          .checked=${this._groupVal(idx, key, defaultVal)}
          .configValue=${key}
          @change=${(ev) => this._groupInputChanged(idx, ev)}
        ></ha-switch>
        <span>${label}</span>
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const groups = this._config.groups || [];

    return html`
      <div class="card-config">

        <ha-textfield
          label="Card Title"
          .value=${this._title}
          @input=${this._titleChanged}
        ></ha-textfield>

        <div class="section-title">Groups</div>

        ${groups.map((group, idx) => {
          const parsed = window.GalaxyGroups && window.GalaxyGroups.parseEntityId
            ? window.GalaxyGroups.parseEntityId(group.entity)
            : null;

          return html`
            <div class="group-row">
              <div class="group-row-header">
                <span class="group-label">${group.name || `Group ${idx + 1}`}</span>
                <ha-icon-button
                  .label=${"Remove"}
                  @click=${() => this._removeGroup(idx)}
                >
                  <ha-icon icon="mdi:delete"></ha-icon>
                </ha-icon-button>
              </div>

              <ha-textfield
                label="Name"
                .value=${group.name || ""}
                .configValue=${"name"}
                @input=${(ev) => this._groupInputChanged(idx, ev)}
              ></ha-textfield>

              <ha-entity-picker
                .hass=${this.hass}
                .value=${group.entity || ""}
                label="Group State Entity"
                allow-custom-entity
                @value-changed=${(ev) => this._entityChanged(idx, ev)}
              ></ha-entity-picker>

              <div class="derived-info">
                ${parsed ? html`
                  <span>🔑 Unique ID: <b>${parsed.uniqueId}</b></span>
                  <span>📡 Group: <b>${parsed.group}</b></span>
                  <span>🚨 Alarm entity: <b>${parsed.alarmEntity}</b></span>
                  <span>📤 MQTT command topic: <b>${parsed.mqttTopic}</b></span>
                ` : html`
                  <span class="warn">⚠ Select a state entity above — all other fields are derived automatically.</span>
                `}
              </div>

              <div class="section-title">Allowed Actions</div>
              <div class="switches">
                ${this._renderSwitch(idx, "allow_unset", "Unset")}
                ${this._renderSwitch(idx, "allow_set",   "Set")}
                ${this._renderSwitch(idx, "allow_part",  "Part")}
                ${this._renderSwitch(idx, "allow_night", "Night", false)}
                ${this._renderSwitch(idx, "allow_reset", "Reset")}
                ${this._renderSwitch(idx, "allow_abort", "Abort")}
                ${this._renderSwitch(idx, "allow_force", "Force")}
                ${this._renderSwitch(idx, "icons",       "Icons")}
              </div>
            </div>
          `;
        })}

        <ha-button class="add-btn" @click=${this._addGroup}>
          <ha-icon icon="mdi:plus" slot="icon"></ha-icon> Add Group
        </ha-button>

      </div>
    `;
  }

  static get styles() {
    return css`
      ha-textfield {
        display: block;
        width: 100%;
        margin-bottom: 6px;
      }
      .section-title {
        font-weight: bold;
        font-size: 13px;
        color: var(--secondary-text-color);
        padding: 8px 0 4px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .group-row {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 10px;
        background: var(--secondary-background-color);
      }
      .group-row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      .group-label { font-weight: 500; font-size: 14px; }
      .derived-info {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-family: monospace;
        background: var(--primary-background-color);
        border-radius: 4px;
        padding: 4px 8px;
        margin: 4px 0 8px;
      }
      .derived-info span { display: block; }
      .derived-info .warn { color: var(--error-color); font-family: sans-serif; }
      .switches {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 8px 0;
      }
      .switch {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .switch span { font-size: 13px; }
      .add-btn { width: 100%; margin-top: 8px; }
    `;
  }
}

customElements.define("lovelace-galaxy-groups-editor", CustomAlarmGroupsEditor);
