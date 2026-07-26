/** Auto-split legacy LootForge profile — keep drop tables stable. */

export const animatedArmorProfile = {
  "id": "animated-armor",
  "matchNames": [
    "animated armor",
    "animated armour"
  ],
  "matchTypes": [
    "construct"
  ],
  "drops": [
    {
      "definitionByQuality": {
        "poor": "salvaged-padded-armor",
        "standard": "salvaged-chain-shirt",
        "good": "salvaged-scale-mail",
        "excellent": "salvaged-breastplate",
        "exceptional": "salvaged-plate-armor"
      },
      "quantityByQuality": {
        "poor": [
          1,
          1
        ],
        "standard": [
          1,
          1
        ],
        "good": [
          1,
          1
        ],
        "excellent": [
          1,
          1
        ],
        "exceptional": [
          1,
          1
        ]
      },
      "chanceByQuality": {
        "poor": 1,
        "standard": 1,
        "good": 1,
        "excellent": 1,
        "exceptional": 1
      },
      "guaranteedFallback": true
    }
  ]
};
