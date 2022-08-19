# HACS Lovelace group card
This card can be added through HACS.

In HACS add a custom repository:
```
  Set repository to: https://github.com/GalaxyGateway/lovelace-galaxy-groups
  Set category to: lovelace
```

Through the dashboard editor manually add a card and set the below example config:
```
type: entities
title: Group state
show_header_toggle: false
entities:
  - type: custom:lovelace-galaxy-groups
    entity: sensor.group_ABCDEF_a1_state
    entity_alarm: sensor.group_ABCDEF_a1_alarm
    unique_id: 'ABCDEF'
    name: Group A1
    group: A1
    allow_night: false
```
Optional:
```
    allow_unset: true / false
    allow_set: true / false
    allow_part: true / false
    allow_night: true / false
    allow_reset: true / false
    allow_abort: true / false
    allow_force: true / false
```
Set ABCDEF to the uniqueid of the module.

The cards are ment to be used with the Galaxy Gateway module available from https://seasoft.nl

Other card available:
- Virtual keypad

The cards provide a way to interface to a Honeywell Galaxy Dimension or Flex panel through the Galaxy Gateway module.

Other usefull cards:
- https://github.com/royto/logbook-card

![Image of HA interface](https://github.com/GalaxyGateway/HA-Cards/blob/main/screenshot/screenshot1.png)
