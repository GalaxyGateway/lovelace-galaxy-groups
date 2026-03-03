# HACS Lovelace group card
This card can be added through HACS.

In HACS add a custom repository:
```
  Set repository to: https://github.com/GalaxyGateway/lovelace-galaxy-groups
  Set category to: lovelace
```

Through the dashboard editor or manually add a card and set the below example config:
```
title: Group State
type: custom:lovelace-galaxy-groups
groups:
  - entity: sensor.galaxy_gateway_5b0438_group_5b0438_a1_state
    name: Alarm
```
Only the state topic is required, the alarm topic is auto discovered.

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

The cards are ment to be used with the Galaxy Gateway module available from https://seasoft.nl

Other card available:
- Virtual keypad

The cards provide a way to interface to a Honeywell Galaxy Dimension or Flex panel through the Galaxy Gateway module.

Other usefull cards:
- https://github.com/royto/logbook-card

<img width="1001" height="486" alt="image" src="https://github.com/user-attachments/assets/8e2e1b39-5d22-4411-8c16-c936798834fb" />

