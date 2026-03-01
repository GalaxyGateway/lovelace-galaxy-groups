# HACS Lovelace group card
This card can be added through HACS.

In HACS add a custom repository:
```
  Set repository to: https://github.com/GalaxyGateway/lovelace-galaxy-groups
  Set category to: lovelace
```

Through the dashboard editor manually add a card and set the below example config:
```
type: custom:lovelace-galaxy-groups
title: Group State
groups:
  - entity: sensor.galaxy_gateway_ABCDEF_group_ABCDEF_a1_state
    name: GROUP A1
  - entity: sensor.galaxy_gateway_ABCDEF_group_ABCDEF_a2_state
    name: GROUP A2
  - entity: sensor.galaxy_gateway_ABCDEF_group_ABCDEF_a3_state
    name: GROUP A3
```
Optional:
```
    icons: true / false
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

<img width="454" height="220" alt="Groups card" src="https://github.com/user-attachments/assets/083582ed-fa69-4b64-81d1-ffabeda6c504" />

