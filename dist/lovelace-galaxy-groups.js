console.info("%c  lovelace-galaxy-groups  \n%c Version 0.0.3 ", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");

const LitElement = customElements.get("ha-panel-lovelace") ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace")) : Object.getPrototypeOf(customElements.get("hc-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

window.customCards = window.customCards || [];
window.customCards.push({
  type: "lovelace-galaxy-groups",
  name: "Galaxy Group control",
  description: "A group control card for Honeywell Galaxy.",
  preview: true,
  documentationURL: "https://github.com/GalaxyGateway/lovelace-galaxy-groups",
});

class AlarmGroups extends LitElement {
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
                float: right !important;
                padding: 0px;
            }
		`
	}

	render() {
		this.hassChanged();
		return html`
			<hui-generic-entity-row .hass="${this.hass}" .config="${this._config}">
				<div id='button-container' class='horizontal justified layout'>
					<button
                        title='Unset'
                        class='mode'
						style='cursor: pointer;'
						toggles state="0"
						@click=${this.setState}
						.disabled=${!this._canUnset}>
                        <ha-icon icon="mdi:home-alert"></ha-icon></button>

                    <button
                        title='Full set'
						class='mode'
						style='cursor: pointer;'
						toggles state="1"
						@click=${this.setState}
						.disabled=${!this._canSet}>
                        <ha-icon icon="mdi:shield-lock"></ha-icon></button>

                    <button
                        title='Part set'
						class='mode'
						style='cursor: pointer;'
						toggles state="2"
						@click=${this.setState}
						.disabled=${!this._canPartSet}>
                        <ha-icon icon="mdi:shield-home"></ha-icon></button>

                    <button
                        title='Night set'
						class='mode'
						style='cursor: pointer;'
						toggles state="6"
						@click=${this.setState}
						.disabled=${!this._canNightSet}>
                        <ha-icon icon="mdi:shield-moon"></ha-icon></button>




                </div>
			</hui-generic-entity-row>
		`;
    }

    static get properties() {
        return {
            hass: {
                type: Object,
                observer: 'hassChanged'
            },
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
		if (!config.entity) {
			throw new Error("You need to define an entity");
		}
		this._config = { ...this._config, ...config };
	}

	firstUpdated() {
		super.firstUpdated();
		this.shadowRoot.getElementById('button-container').addEventListener('click', (ev) => ev.stopPropagation());
	}
	
    hassChanged(hass) {

        const config = this._config;

        const stateObjS = hass.states[config.entity];

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

        const stateObjA = hass.states[config.entity_alarm];

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

        this.setProperties({
            _stateObjS: stateObjS,
            _allowUnset: allow_unset,
            _allowSet: allow_set,
            _allowPart: allow_part,
            _allowReset: allow_reset,
            _allowAbort: allow_abort,
            _allowForce: allow_force,
            _allowNight: allow_night,
            _isUnset: stateObjS.state === '0',
            _isSet: stateObjS.state === '1',
            _isPart: stateObjS.state === '2',
            _isReady: stateObjS.state === '3' || stateObjS.state === 'unknown',
            _isLocked: stateObjS.state === '4',
            _isNight: stateObjS.state === '5',
            _isUnsetColor: isUnsetColor,
            _isSetColor: isSetColor,
            _isPartColor: isPartColor,
            _isReadyColor: isReadyColor,
            _isLockedColor: isLockedColor,
            _isNightColor: isNightColor,

            _stateObjA: stateObjA,
            _isNormal: stateObjA.state === '0' || stateObjA.state === 'unknown',
            _isAlarm: stateObjA.state === '1',
            _isReset: stateObjA.state === '2',
            _isNormalColor: isNormalColor,
            _isAlarmColor: isAlarmColor,
            _isResetColor: isResetColor,

            _canUnset: stateObjS.state === '1' || stateObjS.state === '2' || stateObjS.state === '5',
            _canSet: (stateObjS.state === '3' || stateObjS.state === 'unknown') && (stateObjA.state === '0' || stateObjA.state === 'unknown' || stateObjA.state === '2'),
            _canPart: (stateObjS.state === '3' || stateObjS.state === 'unknown') && (stateObjA.state === '0' || stateObjA.state === 'unknown' || stateObjA.state === '2'),
            _canNight: (stateObjS.state === '3' || stateObjS.state === 'unknown') && (stateObjA.state === '0' || stateObjA.state === 'unknown' || stateObjA.state === '2'),
            _canReset: stateObjA.state === '2' || stateObjA.state === '1',
            _canAbort: false,
            _canForce: stateObjS.state === '0'

        });
    }
	
	setState(e) {
		e.stopPropagation();
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

