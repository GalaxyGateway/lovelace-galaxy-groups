console.info("%c  lovelace-galaxy-groups  \n%c Version 0.0.3 ", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");

window.customCards = window.customCards || [];
window.customCards.push({
  type: "lovelace-galaxy-groups",
  name: "Galaxy Group control",
  description: "A group control card for Honeywell Galaxy.",
  preview: true,
  documentationURL: "https://github.com/GalaxyGateway/lovelace-galaxy-groups",
});

const LitElement = customElements.get("ha-panel-lovelace") ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace")) : Object.getPrototypeOf(customElements.get("hc-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class AlarmGroups extends LitElement {
	constructor() {
		super();
	}

	static get styles() {
		return css`
            :host {
                line-height: inherit;
            }
            .mode {
                margin-left: 2px;
                margin-right: 2px;
                background-color:'var(--dark-accent-color)';
                border: 1px var(--dark-theme-disabled-color);
                border-radius: 4px;
                font-size: 10px !important;
                color: inherit;
                text-align: center;
                float: left !important;
                padding: 1px;
            }
		`
	}

	render() {
		return html`
			<hui-generic-entity-row .hass="${this.hass}" .config="${this._config}">
				<div id='button-container' class='horizontal justified layout'>

					${(this._canUnset && this._allowUnset) ? html`
					<button
                        title='Unset'
                        class='mode'
						style='cursor: pointer;'
						toggles state="0"
						@click="${this.setState}">
                        <ha-icon icon="mdi:home-alert"></ha-icon></button>
						` : html ``}

					${(this._canSet && this._allowSet) ? html`
					<button
                        title='Full set'
						class='mode'
						style='cursor: pointer;'
						toggles state="1"
						@click="${this.setState}">
                        <ha-icon icon="mdi:shield-lock"></ha-icon></button>
						` : html ``}

					${(this._canPart && this._allowPart) ? html`
					<button
                        title='Part set'
						class='mode'
						style='cursor: pointer;'
						toggles state="2"
						@click="${this.setState}">
                        <ha-icon icon="mdi:shield-home"></ha-icon></button>
						` : html ``}

					${(this._canNight && this._allowNight) ? html`
					<button
                        title='Night set'
						class='mode'
						style='cursor: pointer;'
						toggles state="6"
						@click="${this.setState}">
                        <ha-icon icon="mdi:shield-moon"></ha-icon></button>
						` : html ``}

                    ${(this._canAbort && this._allowAbort) ? html`
                    <button
                        title='Abort set'
                        class='mode'
                        style='cursor: pointer;'
                        toggles state="4"
                        @click="${this.setState}">
                        <ha-icon icon="mdi:shield-moon"></ha-icon></button>
                        ` : html ``}

                    ${(this._canForce && this._allowForce) ? html`
                    <button
                        title='Force set'
                        class='mode'
                        style='cursor: pointer;'
                        toggles state="5"
                        @click="${this.setState}">
                        <ha-icon icon="mdi:shield-moon"></ha-icon></button>
                        ` : html ``}

                    ${(this._canReset && this._allowReset) ? html`
                    <button
                        title='Reset'
                        class='mode'
                        style='cursor: pointer;'
                        toggles state="3"
                        @click="${this.setState}">
                        <ha-icon icon="mdi:shield-moon"></ha-icon></button>
                        ` : html ``}



                        ${(this._isNormal) ? html`
                        <button
                            title='Normal'
                            class='mode'
                            style='${this._isNormalColor}'
                            disabled='true'>
                            <ha-icon icon="mdi:alarm-light-outline"></ha-icon>
                        </button>
                        ` : html ``}
    
                        ${(this._isAlarm) ? html`
                        <button
                            title='Alarm'
                            class='mode'
                            style='${this._isAlarmColor}'
                            disabled='true'>
                            <ha-icon icon="mdi:alarm-light"></ha-icon>
                        </button>
                        ` : html ``}
    
                        ${(this._isReset) ? html`
                        <button
                            title='Reset required'
                            class='mode'
                            style='${this._isResetColor}'
                            disabled='true'>
                            <ha-icon icon="mdi:shield-alert"></ha-icon>
                        </button>
                        ` : html ``}
    


                        
                        ${(this._isUnset) ? html`
                        <button
                            title='Fail to set'
                            class='mode'
                            style='${this._isUnsetColor}'
                            disabled='true'>
                            <ha-icon icon="mdi:home-alert"></ha-icon>
                        </button>
                        ` : html ``}
    
                        ${(this._isSet) ? html`
                        <button
                            title='Full set'
                            class='mode'
                            style='${this._isSetColor}'
                            disabled='true'>
                            <ha-icon icon="mdi:shield-lock"></ha-icon>
                        </button>
                        ` : html ``}
    
                        ${(this._isPart) ? html`
                        <button
                            title='Part set'
                            class='mode'
                            style='${this._isPartColor}'
                            disabled='true'>
                            <ha-icon icon="mdi:shield-home"></ha-icon>
                        </button>
                        ` : html ``}
    
                        ${(this._isNight) ? html`
                        <button
                            title='Night set'
                            class='mode'
                            style='${this._isNightColor}'
                            disabled='true'>
                            <ha-icon icon="mdi:shield-moon"></ha-icon>
                        </button>
                        ` : html ``}
    
                        ${(this._isReady) ? html`
                        <button
                            title='Ready to set'
                            class='mode'
                            style='${this._isReadyColor}'
                            disabled='true'>
                            <ha-icon icon="mdi:shield-check"></ha-icon>
                        </button>
                        ` : html ``}
    
                        ${(this._isLocked) ? html`
                        <button
                            title='Time locked'
                            class='mode'
                            style='${this._isLockedColor}'
                            disabled='true'>
                            <ha-icon icon="mdi:clock-alert-outline"></ha-icon>
                        </button>
                        ` : html ``}

                </div>
			</hui-generic-entity-row>
		`;
    }

    static get properties() {
        return {
            hass: Object,
            _config: Object,

            _stateObjS: Object,
            _isUnset: Boolean,
            _isSet: Boolean,
            _isPart: Boolean,
            _isReady: Boolean,
            _isLocked: Boolean,
            _isNight: Boolean,

            _isUnsetColor: String,
            _isSetColor: String,
            _isPartColor: String,
            _isReadyColor: String,
            _isLockedColor: String,
            _isNightColor: String,

            _stateObjA: Object,
            _isNormal: Boolean,
            _isAlarm: Boolean,
            _isReset: Boolean,
			_isNormalColor: String,
			_isAlarmColor: String,
            _isResetColor: String,

            _canUnset: Boolean,
            _canSet: Boolean,
            _canPart: Boolean,
            _canReset: Boolean,
            _canAbort: Boolean,
            _canForce: Boolean,
            _canNight: Boolean,

            _allowUnset: Boolean,
            _allowSet: Boolean,
            _allowPart: Boolean,
            _allowNight: Boolean,
            _allowReset: Boolean,
            _allowAbort: Boolean,
            _allowForce: Boolean
        }
    }

	setConfig(config) {
		if (!config.entity || !config.entity_alarm) {
			throw new Error("You need to define a group state entity");
		}
		this._config = { ...this._config, ...config };
	}

	firstUpdated() {
		super.firstUpdated();
		this.shadowRoot.getElementById('button-container').addEventListener('click', (ev) => ev.stopPropagation());
	}
	
	updated(changedProperties) {
		if (changedProperties.has("hass")) {
			this.hassChanged();
		}
	}

    hassChanged() {

        const config = this._config;

        const stateObjS = this.hass.states[config.entity];

        let isUnsetColor;
		let isSetColor;
		let isPartColor;
		let isReadyColor;
        let isLockedColor;
        let isNightColor;

		isUnsetColor = (stateObjS.state === '0') ? 'color:yellow;' : '';
		isSetColor = (stateObjS.state === '1') ? 'color:red;' : '';
		isPartColor = (stateObjS.state === '2') ? 'color:orange;' : '';
		isReadyColor = (stateObjS.state === '3' || stateObjS.state === 'unknown') ? 'color:green;' : '';
        isLockedColor = (stateObjS.state === '4') ? 'color:red;' : '';
		isNightColor = (stateObjS.state === '5') ? 'color:orange;' : '';

        const stateObjA = this.hass.states[config.entity_alarm];

        let isNormalColor;
		let isAlarmColor;
		let isResetColor;

		isNormalColor = (stateObjA.state === '0' || stateObjA.state === 'unknown') ? 'color:green;' : '';
        isAlarmColor = (stateObjA.state === '1') ? 'color:red;' : '';
		isResetColor = (stateObjA.state === '2') ? 'color:yellow;' : '';

        let allow_unset;
        let allow_set;
        let allow_part;
        let allow_reset;
        let allow_abort;
        let allow_force;
        let allow_night;

        allow_unset = (config.allow_unset != null) ? config.allow_unset : true;
        allow_set = (config.allow_set != null) ? config.allow_set : true;
        allow_part = (config.allow_part != null) ? config.allow_part : true;
        allow_reset = (config.allow_reset != null) ? config.allow_reset : true;
        allow_abort = (config.allow_abort != null) ? config.allow_abort : true;
        allow_force = (config.allow_force != null) ? config.allow_force : true;
        allow_night = (config.allow_night != null) ? config.allow_night : true;

        this._stateObjS = stateObjS;
        this._allowUnset = allow_unset;
        this._allowSet = allow_set;
        this._allowPart = allow_part;
        this._allowReset = allow_reset;
        this._allowAbort = allow_abort;
        this._allowForce = allow_force;
        this._allowNight = allow_night;

        this._isUnset = stateObjS.state === '0';
        this._isSet = stateObjS.state === '1';
        this._isPart = stateObjS.state === '2';
        this._isReady = stateObjS.state === '3' || stateObjS.state === 'unknown';
        this._isLocked = stateObjS.state === '4';
        this._isNight = stateObjS.state === '5';
        this._isUnsetColor = isUnsetColor;
        this._isSetColor = isSetColor;
        this._isPartColor = isPartColor;
        this._isReadyColor = isReadyColor;
        this._isLockedColor = isLockedColor;
        this._isNightColor = isNightColor;

        this._stateObjA = stateObjA;
        this._isNormal = stateObjA.state === '0' || stateObjA.state === 'unknown';
        this._isAlarm = stateObjA.state === '1';
        this._isReset = stateObjA.state === '2';
        this._isNormalColor = isNormalColor;
        this._isAlarmColor = isAlarmColor;
        this._isResetColor = isResetColor;

        this._canUnset = stateObjS.state === '1' || stateObjS.state === '2' || stateObjS.state === '5';
        this._canSet = (stateObjS.state === '3' || stateObjS.state === 'unknown') && (stateObjA.state === '0' || stateObjA.state === 'unknown' || stateObjA.state === '2');
        this._canPart = (stateObjS.state === '3' || stateObjS.state === 'unknown') && (stateObjA.state === '0' || stateObjA.state === 'unknown' || stateObjA.state === '2');
        this._canNight = (stateObjS.state === '3' || stateObjS.state === 'unknown') && (stateObjA.state === '0' || stateObjA.state === 'unknown' || stateObjA.state === '2');
        this._canReset = stateObjA.state === '2' || stateObjA.state === '1';
        this._canAbort = false;
        this._canForce = stateObjS.state === '0';
    }
	
	setState(e) {
        const newState = e.currentTarget.getAttribute('state');

        this.hass.callService('mqtt', 'publish', {
            topic: "galaxy/" + this._config.unique_id + "/group/" + this._config.group + "/cmd/set",
            payload: newState
        });
    }

	getCardSize() {
        return 1;
    }
}
	
customElements.define('lovelace-galaxy-groups', AlarmGroups);
