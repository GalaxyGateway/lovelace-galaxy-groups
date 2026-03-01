console.info("%c  lovelace-galaxy-groups  \n%c Version 0.3.0", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");

window.customCards = window.customCards || [];
window.customCards.push({
  type: "lovelace-galaxy-groups",
  name: "Galaxy Group control",
  description: "A group control card for Honeywell Galaxy.",
  preview: true,
  documentationURL: "https://github.com/GalaxyGateway/lovelace-galaxy-groups",
});

const LitElement = customElements.get("ha-panel-lovelace")
  ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace"))
  : Object.getPrototypeOf(customElements.get("hc-lovelace"));
const html = LitElement.prototype.html;
const css  = LitElement.prototype.css;

// Shared namespace for helpers and editor state
window.GalaxyGroups = window.GalaxyGroups || {};

// ─── parseEntityId ────────────────────────────────────────────────────────────
window.GalaxyGroups.parseEntityId = function parseEntityId(entityId) {
  if (!entityId) return null;
  const name = entityId.replace(/^[^.]+\./, "");
  const match = name.match(/^galaxy_gateway_([^_]+(?:_[^_]+)*)_group_([^_]+(?:_[^_]+)*)_([^_]+)_state$/);
  if (!match) return null;
  const uniqueId    = match[2];
  const group       = match[3].toUpperCase();
  const alarmEntity = entityId.replace(/_state$/, "_alarm");
  const mqttTopic   = `galaxy/${uniqueId}/group/${group}/cmd/set`;
  return { uniqueId, group, alarmEntity, mqttTopic };
};

// The editor is lazy-loaded via dynamic import() inside getConfigElement()
// and does not need to be registered as a separate Lovelace resource.

// ─── Row element ──────────────────────────────────────────────────────────────

class CustomAlarmGroupRow extends LitElement {
  static get styles() {
    return css`
      :host {
        line-height: inherit;
        --entities-divider-color: transparent;
      }
      .mode {
        margin-left: 2px;
        margin-right: 2px;
        border: 1px var(--dark-theme-disabled-color);
        border-radius: 4px;
        font-size: 10px !important;
        text-align: center;
        float: left !important;
        padding: 1px;
        width: 30px;
        height: 30px;
      }
      .action { background-color: #03a9f4; color: #fff; }
      .box { display: flex; flex-direction: row; }
    `;
  }

  static get properties() {
    return {
      hass: Object,
      _config: Object,
      _stateObjS: Object,
      _isUnset: Boolean, _isSet: Boolean, _isPart: Boolean,
      _isReady: Boolean, _isLocked: Boolean, _isNight: Boolean,
      _isUnsetColor: String, _isSetColor: String, _isPartColor: String,
      _isReadyColor: String, _isLockedColor: String, _isNightColor: String,
      _icons: Boolean,
      _stateObjA: Object,
      _isNormal: Boolean, _isAlarm: Boolean, _isReset: Boolean,
      _isNormalColor: String, _isAlarmColor: String, _isResetColor: String,
      _canUnset: Boolean, _canSet: Boolean, _canPart: Boolean,
      _canReset: Boolean, _canAbort: Boolean, _canForce: Boolean, _canNight: Boolean,
      _allowUnset: Boolean, _allowSet: Boolean, _allowPart: Boolean,
      _allowNight: Boolean, _allowReset: Boolean, _allowAbort: Boolean, _allowForce: Boolean,
    };
  }

  setConfig(config) {
    if (!config.entity) throw new Error("You need to define a group state entity");

    const parsed = window.GalaxyGroups.parseEntityId(config.entity);
    if (!parsed) throw new Error(`Cannot parse Galaxy entity id: "${config.entity}". Expected pattern: sensor.galaxy_gateway_<uid>_group_<uid>_<grp>_state`);

    this._parsed = parsed;
    this._config = { entity_alarm: parsed.alarmEntity, ...config };
  }

  // Called by LitElement when the .config property binding updates from the parent card
  set config(config) {
    this.setConfig(config);
  }

  get config() {
    return this._config;
  }

  firstUpdated() {
    super.firstUpdated();
    this.shadowRoot.getElementById("button-container")
      .addEventListener("click", (ev) => ev.stopPropagation());
  }

  updated(changedProperties) {
    if (changedProperties.has("hass") || changedProperties.has("_config")) {
      this.hassChanged();
    }
  }

  hassChanged() {
    const config    = this._config;
    const stateObjS = this.hass.states[config.entity];
    const stateObjA = this.hass.states[config.entity_alarm];
    if (!stateObjS || !stateObjA) return;

    this._isUnsetColor  = stateObjS.state === "0" ? "color:yellow;" : "";
    this._isSetColor    = stateObjS.state === "1" ? "color:red;"    : "";
    this._isPartColor   = stateObjS.state === "2" ? "color:orange;" : "";
    this._isReadyColor  = (stateObjS.state === "3" || stateObjS.state === "unknown") ? "color:green;" : "";
    this._isLockedColor = stateObjS.state === "4" ? "color:red;"    : "";
    this._isNightColor  = stateObjS.state === "5" ? "color:orange;" : "";

    this._isNormalColor = (stateObjA.state === "0" || stateObjA.state === "unknown") ? "color:green;" : "";
    this._isAlarmColor  = stateObjA.state === "1" ? "color:red;"    : "";
    this._isResetColor  = stateObjA.state === "2" ? "color:yellow;" : "";

    this._icons      = config.icons       != null ? config.icons       : true;
    this._allowUnset = config.allow_unset != null ? config.allow_unset : true;
    this._allowSet   = config.allow_set   != null ? config.allow_set   : true;
    this._allowPart  = config.allow_part  != null ? config.allow_part  : true;
    this._allowReset = config.allow_reset != null ? config.allow_reset : true;
    this._allowAbort = config.allow_abort != null ? config.allow_abort : true;
    this._allowForce = config.allow_force != null ? config.allow_force : true;
    this._allowNight = config.allow_night != null ? config.allow_night : true;

    this._stateObjS = stateObjS;
    this._isUnset  = stateObjS.state === "0";
    this._isSet    = stateObjS.state === "1";
    this._isPart   = stateObjS.state === "2";
    this._isReady  = stateObjS.state === "3" || stateObjS.state === "unknown";
    this._isLocked = stateObjS.state === "4";
    this._isNight  = stateObjS.state === "5";

    this._stateObjA = stateObjA;
    this._isNormal = stateObjA.state === "0" || stateObjA.state === "unknown";
    this._isAlarm  = stateObjA.state === "1";
    this._isReset  = stateObjA.state === "2";

    this._canUnset = stateObjS.state === "1" || stateObjS.state === "2" || stateObjS.state === "5";
    this._canSet   = (stateObjS.state === "3" || stateObjS.state === "unknown") &&
                     (stateObjA.state === "0" || stateObjA.state === "unknown" || stateObjA.state === "2");
    this._canPart  = (stateObjS.state === "3" || stateObjS.state === "unknown") &&
                     (stateObjA.state === "0" || stateObjA.state === "unknown" || stateObjA.state === "2");
    this._canNight = (stateObjS.state === "3" || stateObjS.state === "unknown") &&
                     (stateObjA.state === "0" || stateObjA.state === "unknown" || stateObjA.state === "2");
    this._canReset = stateObjA.state === "2" || stateObjA.state === "1";
    this._canAbort = false;
    this._canForce = stateObjS.state === "0";
  }

  setState(e) {
    const newState = e.currentTarget.getAttribute("state");
    this.hass.callService("mqtt", "publish", {
      topic: this._parsed.mqttTopic,
      payload: newState,
    });
  }

  render() {
    return html`
      <hui-generic-entity-row .hass="${this.hass}" .config="${this._config}">
        <div id="button-container" class="box">
          ${this._canUnset && this._allowUnset ? html`
            <button title="Unset" class="mode action" style="cursor:pointer;" toggles state="0" @click=${this.setState}>
              ${this._icons ? html`<ha-icon icon="mdi:home-alert"></ha-icon>` : html`UnSet`}
            </button>` : html``}

          ${this._canSet && this._allowSet ? html`
            <button title="Full set" class="mode action" style="cursor:pointer;" toggles state="1" @click=${this.setState}>
              ${this._icons ? html`<ha-icon icon="mdi:shield-lock"></ha-icon>` : html`Set`}
            </button>` : html``}

          ${this._canPart && this._allowPart ? html`
            <button title="Part set" class="mode action" style="cursor:pointer;" toggles state="2" @click=${this.setState}>
              ${this._icons ? html`<ha-icon icon="mdi:shield-home"></ha-icon>` : html`Part`}
            </button>` : html``}

          ${this._canNight && this._allowNight ? html`
            <button title="Night set" class="mode action" style="cursor:pointer;" toggles state="6" @click=${this.setState}>
              ${this._icons ? html`<ha-icon icon="mdi:shield-moon"></ha-icon>` : html`Night`}
            </button>` : html``}

          ${this._canAbort && this._allowAbort ? html`
            <button title="Abort set" class="mode action" style="cursor:pointer;" toggles state="4" @click=${this.setState}>
              ${this._icons ? html`<ha-icon icon="mdi:shield-alert"></ha-icon>` : html`Abort`}
            </button>` : html``}

          ${this._canForce && this._allowForce ? html`
            <button title="Force set" class="mode action" style="cursor:pointer;" toggles state="5" @click=${this.setState}>
              ${this._icons ? html`<ha-icon icon="mdi:debug-step-over"></ha-icon>` : html`Force`}
            </button>` : html``}

          ${this._canReset && this._allowReset ? html`
            <button title="Reset" class="mode action" style="cursor:pointer;" toggles state="3" @click=${this.setState}>
              ${this._icons ? html`<ha-icon icon="mdi:lock-reset"></ha-icon>` : html`Reset`}
            </button>` : html``}

          ${this._isNormal ? html`<button title="Normal"         class="mode" style="${this._isNormalColor}" disabled="true"><ha-icon icon="mdi:alarm-light-outline"></ha-icon></button>` : html``}
          ${this._isAlarm  ? html`<button title="Alarm"          class="mode" style="${this._isAlarmColor}"  disabled="true"><ha-icon icon="mdi:alarm-light"></ha-icon></button>`         : html``}
          ${this._isReset  ? html`<button title="Reset required" class="mode" style="${this._isResetColor}"  disabled="true"><ha-icon icon="mdi:shield-alert"></ha-icon></button>`        : html``}
          ${this._isUnset  ? html`<button title="Fail to set"    class="mode" style="${this._isUnsetColor}"  disabled="true"><ha-icon icon="mdi:home-alert"></ha-icon></button>`          : html``}
          ${this._isSet    ? html`<button title="Full set"       class="mode" style="${this._isSetColor}"    disabled="true"><ha-icon icon="mdi:shield-lock"></ha-icon></button>`          : html``}
          ${this._isPart   ? html`<button title="Part set"       class="mode" style="${this._isPartColor}"   disabled="true"><ha-icon icon="mdi:shield-home"></ha-icon></button>`          : html``}
          ${this._isNight  ? html`<button title="Night set"      class="mode" style="${this._isNightColor}"  disabled="true"><ha-icon icon="mdi:shield-moon"></ha-icon></button>`          : html``}
          ${this._isReady  ? html`<button title="Ready to set"   class="mode" style="${this._isReadyColor}"  disabled="true"><ha-icon icon="mdi:shield-check"></ha-icon></button>`         : html``}
          ${this._isLocked ? html`<button title="Time locked"    class="mode" style="${this._isLockedColor}" disabled="true"><ha-icon icon="mdi:clock-alert-outline"></ha-icon></button>`  : html``}
        </div>
      </hui-generic-entity-row>
    `;
  }

  getCardSize() { return 1; }
}
customElements.define("lovelace-galaxy-groups-row", CustomAlarmGroupRow);

// ─── Main Card ────────────────────────────────────────────────────────────────

class CustomAlarmGroups extends LitElement {
  static get properties() {
    return { hass: Object, _config: Object };
  }

  static get styles() {
    return css`
      :host { display: block; }
      ha-card { overflow: hidden; }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px 8px;
        font-size: 1.1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .entities { padding: 0 0 8px; }
      lovelace-galaxy-groups-row {
        display: block;
        padding: 4px 16px;
      }
      lovelace-galaxy-groups-row + lovelace-galaxy-groups-row {
        border-top: 1px solid var(--divider-color);
      }
    `;
  }

  setConfig(config) {
    if (!config.groups || !Array.isArray(config.groups)) {
      if (config.entity) {
        const { title, ...groupConfig } = config;
        this._config = { title: title || "Group State", groups: [groupConfig] };
        return;
      }
      throw new Error("You need to define a 'groups' list.");
    }
    this._config = { title: "Group State", ...config };
  }

  static async getConfigElement() {
    await import("./lovelace-galaxy-groups-editor.js");
    return document.createElement("lovelace-galaxy-groups-editor");
  }

  static getStubConfig() {
    return {
      title: "Group State",
      groups: [
        {
          entity: "",
          name: "Alarm",
          allow_unset: true,
          allow_set: true,
          allow_part: true,
          allow_night: false,
          allow_reset: true,
          allow_abort: true,
          allow_force: true,
          icons: false,
        },
      ],
    };
  }

  render() {
    if (!this._config || !this.hass) return html``;
    const groups = this._config.groups || [];

    return html`
      <ha-card>
        ${this._config.title
          ? html`<div class="card-header">${this._config.title}</div>`
          : html``}
        <div class="entities">
          ${groups.map((group) => html`
            <lovelace-galaxy-groups-row
              .hass=${this.hass}
              .config=${group}
            ></lovelace-galaxy-groups-row>
          `)}
        </div>
      </ha-card>
    `;
  }

  getCardSize() { return 1 + (this._config?.groups?.length || 1); }
}

customElements.define("lovelace-galaxy-groups", CustomAlarmGroups);
