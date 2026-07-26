/** Auto-split legacy LootForge profile — keep drop tables stable. */

export const wolfProfile = {
  "id": "wolf",
  "matchNames": [
    "wolf"
  ],
  "excludeNames": [
    "spider"
  ],
  "matchWholeWords": true,
  "matchTypes": [
    "beast"
  ],
  "matchSubtypes": [
    "wolf"
  ],
  "maxCR": 1,
  "nat20BonusDefinitionId": "wolf-fang",
  "drops": [
    {
      "definitionId": "wolf-pelt",
      "quantityByQuality": {
        "poor": [
          0,
          1
        ],
        "standard": [
          0,
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
        "poor": 0.55,
        "standard": 0.75,
        "good": 0.9,
        "excellent": 1,
        "exceptional": 1
      },
      "guaranteedFallback": true
    },
    {
      "definitionId": "wolf-fang",
      "quantityByQuality": {
        "poor": [
          1,
          2
        ],
        "standard": [
          1,
          3
        ],
        "good": [
          2,
          4
        ],
        "excellent": [
          2,
          4
        ],
        "exceptional": [
          3,
          4
        ]
      },
      "chanceByQuality": {
        "poor": 0.85,
        "standard": 1,
        "good": 1,
        "excellent": 1,
        "exceptional": 1
      },
      "guaranteedFallback": true
    },
    {
      "definitionId": "wolf-meat",
      "quantityByQuality": {
        "poor": [
          0,
          1
        ],
        "standard": [
          1,
          2
        ],
        "good": [
          1,
          3
        ],
        "excellent": [
          2,
          3
        ],
        "exceptional": [
          2,
          3
        ]
      },
      "chanceByQuality": {
        "poor": 0.6,
        "standard": 0.85,
        "good": 0.95,
        "excellent": 1,
        "exceptional": 1
      }
    },
    {
      "definitionId": "wolf-claw",
      "quantityByQuality": {
        "poor": [
          0,
          2
        ],
        "standard": [
          1,
          3
        ],
        "good": [
          1,
          4
        ],
        "excellent": [
          2,
          4
        ],
        "exceptional": [
          3,
          4
        ]
      },
      "chanceByQuality": {
        "poor": 0.5,
        "standard": 0.7,
        "good": 0.85,
        "excellent": 0.95,
        "exceptional": 1
      }
    },
    {
      "definitionId": "alpha-wolf-fang",
      "rare": true,
      "quantityByQuality": {
        "poor": [
          0,
          0
        ],
        "standard": [
          0,
          1
        ],
        "good": [
          0,
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
        "poor": 0,
        "standard": 0.05,
        "good": 0.12,
        "excellent": 0.28,
        "exceptional": 0.45
      }
    }
  ]
};
