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
    this._config = {
      title:      "Group State",
      base_topic: "galaxy",
      groups:     [],
      ...config,
    };
  }

  // ── Top-level getters ─────────────────────────────────────────────────────

  get _title()      { return this._config.title      || "";       }
  get _base_topic() { return this._config.base_topic || "galaxy"; }

  // ── Per-group getter helper ───────────────────────────────────────────────

  _groupVal(idx, key, defaultVal = true) {
    const g = (this._config.groups || [])[idx] || {};
    return g[key] !== undefined ? g[key] : defaultVal;
  }

  // ── Entity options for a <select> ─────────────────────────────────────────

  _entityOptions(currentEntity) {
    if (!this.hass) return html`<option value="">-- select entity --</option>`;
    const entities = Object.keys(this.hass.states)
      .filter(k => k.startsWith('sensor.') && k.endsWith('_state'))
      .sort();
    return html`
      <option value="">-- select entity --</option>
      ${entities.map(k => html`
        <option value="${k}" ?selected=${k === currentEntity}>${k}</option>
      `)}
    `;
  }

  // ── Change handlers ───────────────────────────────────────────────────────

  _titleChanged(ev) {
    if (!this._config || !this.hass) return;
    this._config = { ...this._config, title: ev.target.value };
    fireEvent(this, "config-changed", { config: this._config });
  }

  _baseTopicChanged(ev) {
    if (!this._config || !this.hass) return;
    this._config = { ...this._config, base_topic: ev.target.value || "galaxy" };
    fireEvent(this, "config-changed", { config: this._config });
  }

  _groupChanged(idx, key, value) {
    const groups = (this._config.groups || []).map((g, i) =>
      i === idx ? { ...g, [key]: value } : g
    );
    this._config = { ...this._config, groups };
    fireEvent(this, "config-changed", { config: this._config });
  }

  _groupNameChanged(idx, ev) {
    this._groupChanged(idx, "name", ev.target.value);
  }

  _groupEntityChanged(idx, ev) {
    this._groupChanged(idx, "entity", ev.target.value);
  }

  _groupSwitchChanged(idx, key, ev) {
    this._groupChanged(idx, key, ev.target.checked);
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
      icons:       true,
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
      <div class="sw-row">
        <ha-switch
          .checked=${this._groupVal(idx, key, defaultVal)}
          @change=${(ev) => this._groupSwitchChanged(idx, key, ev)}
        ></ha-switch>
        <span>${label}</span>
      </div>
    `;
  }

  _derivedInfo(group, base_topic) {
    const entity = group.entity || "";
    if (!entity) return null;
    const name = entity.replace(/^[^.]+\./, '');
    let uniqueId, grp;

    const mNew = name.match(/^galaxy_gateway_([^_]+(?:_[^_]+)*)_group_([^_]+(?:_[^_]+)*)_([^_]+)_state$/);
    if (mNew) { uniqueId = mNew[2]; grp = mNew[3].toUpperCase(); }

    if (!uniqueId) {
      const mLeg = name.match(/^group_([^_]+(?:_[^_]+)*)_([^_]+)_state$/);
      if (mLeg) { uniqueId = mLeg[1]; grp = mLeg[2].toUpperCase(); }
    }

    if (!uniqueId || !grp) return null;
    const base = (base_topic || "galaxy").replace(/\/+$/, "");
    return {
      uniqueId,
      group:       grp,
      alarmEntity: entity.replace(/_state$/, "_alarm"),
      mqttTopic:   `${base}/${uniqueId}/group/${grp}/cmd/set`,
    };
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const groups     = this._config.groups || [];
    const base_topic = this._base_topic;

    return html`
      <div class="card-config">

        <div class="row">
          <span class="field-label">Card Title</span>
          <input type="text"
            .value=${this._title}
            @change=${this._titleChanged}
          >
        </div>

        <div class="row">
          <span class="field-label">MQTT Base Topic</span>
          <input type="text"
            .value=${this._base_topic}
            placeholder="galaxy"
            @change=${this._baseTopicChanged}
          >
        </div>

        <div class="sect">Groups</div>

        ${groups.map((group, idx) => {
          const parsed = this._derivedInfo(group, base_topic);

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

              <div class="row">
                <span class="field-label">Name</span>
                <input type="text"
                  .value=${group.name || ""}
                  @change=${(ev) => this._groupNameChanged(idx, ev)}
                >
              </div>

              <div class="row">
                <span class="field-label">Group State Entity</span>
                <select @change=${(ev) => this._groupEntityChanged(idx, ev)}>
                  ${this._entityOptions(group.entity)}
                </select>
              </div>

              <div class="derived">
                ${parsed ? html`
                  <span>🔑 Unique ID: <b>${parsed.uniqueId}</b></span>
                  <span>📡 Group: <b>${parsed.group}</b></span>
                  <span>🚨 Alarm entity: <b>${parsed.alarmEntity}</b></span>
                  <span>📤 MQTT topic: <b>${parsed.mqttTopic}</b></span>
                ` : html`
                  <span class="warn">⚠ Select a valid Galaxy state entity above.</span>
                `}
              </div>

              <div class="sect">Allowed Actions</div>
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
      :host {
        display: block;
        font-size: 14px;
        color-scheme: light dark;
      }

      /* ── Field rows ── */
      .row {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 12px;
      }
      .field-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: block;
      }

      /* ── Native inputs & selects — matches compact editor exactly ── */
      input[type=text],
      input[type=password],
      select {
        width: 100%;
        height: 36px;
        padding: 0 10px;
        background: var(--secondary-background-color, #f5f5f5);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 13px;
        box-sizing: border-box;
      }

      /* ── Section dividers ── */
      .sect {
        font-size: 11px;
        font-weight: 600;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 14px 0 8px;
        padding-bottom: 5px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }

      /* ── Group card ── */
      .group-row {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 10px;
        background: var(--secondary-background-color, #f5f5f5);
      }
      .group-row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .group-label {
        font-weight: 500;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      /* ── Derived info box ── */
      .derived {
        font-size: 11px;
        font-family: monospace;
        background: var(--primary-background-color);
        border-radius: 4px;
        padding: 4px 8px;
        margin: 4px 0 8px;
        color: var(--secondary-text-color);
      }
      .derived span { display: block; }
      .warn { color: var(--error-color, red); font-family: sans-serif; }

      /* ── Switches ── */
      .switches {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 6px 0;
      }
      .sw-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        color: var(--primary-text-color);
      }
      .sw-row span { flex: 1; }

      /* ── Add button ── */
      .add-btn { width: 100%; margin-top: 8px; }
    `;
  }
}

customElements.define("lovelace-galaxy-groups-editor", CustomAlarmGroupsEditor);
