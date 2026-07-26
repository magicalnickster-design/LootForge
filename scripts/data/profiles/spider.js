/** Auto-split legacy LootForge profile — keep drop tables stable. */

export const spiderProfile = {
  "id": "spider",
  "matchNames": [
    "spider"
  ],
  "matchTypes": [
    "beast"
  ],
  "matchSubtypes": [
    "spider"
  ],
  "nat20BonusDefinitionId": "spider-fang",
  "drops": [
    {
      "definitionId": "spider-silk",
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
          4
        ]
      },
      "chanceByQuality": {
        "poor": 0.65,
        "standard": 0.85,
        "good": 0.95,
        "excellent": 1,
        "exceptional": 1
      },
      "guaranteedFallback": true
    },
    {
      "definitionId": "spider-fang",
      "quantityByQuality": {
        "poor": [
          1,
          2
        ],
        "standard": [
          1,
          2
        ],
        "good": [
          2,
          3
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
        "poor": 0.8,
        "standard": 1,
        "good": 1,
        "excellent": 1,
        "exceptional": 1
      },
      "guaranteedFallback": true
    },
    {
      "definitionId": "spider-venom-gland",
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
          2
        ],
        "exceptional": [
          1,
          2
        ]
      },
      "chanceByQuality": {
        "poor": 0.35,
        "standard": 0.55,
        "good": 0.75,
        "excellent": 0.9,
        "exceptional": 1
      }
    },
    {
      "definitionId": "spider-eye",
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
          2,
          4
        ],
        "excellent": [
          2,
          5
        ],
        "exceptional": [
          3,
          6
        ]
      },
      "chanceByQuality": {
        "poor": 0.45,
        "standard": 0.65,
        "good": 0.8,
        "excellent": 0.9,
        "exceptional": 1
      }
    }
  ]
};
