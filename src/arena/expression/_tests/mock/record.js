const RECORD = {
  uuid: 'RECORD_UUID',
  ownerUuid: '945b5470-f934-44cf-bb0c-435595053187',
  step: '1',
  cycle: '0',
  dateCreated: '2022-05-07T22:36:07.195Z',
  preview: false,
  surveyUuid: 'SURVEY_UUID',
  surveyId: '2',
  validation: {
    valid: false,
    counts: {
      errors: 3,
      warnings: 0,
    },
    errors: [],
    fields: {
      PLOT_NAME_NODE_UUID_1: {
        valid: false,
        errors: [],
        fields: {
          value: {
            valid: false,
            errors: [
              {
                key: 'custom',
                messages: {
                  en: 'plot_key == 50',
                },
              },
            ],
            fields: {},
            warnings: [],
          },
        },
        warnings: [],
      },
      CLUSTER_NAME_2_NODE_UUID: {
        valid: false,
        errors: [],
        fields: {
          value: {
            valid: false,
            errors: [
              {
                key: 'custom',
                messages: {
                  en: 'cluster_name == "aaa"',
                },
              },
            ],
            fields: {},
            warnings: [],
          },
        },
        warnings: [],
      },
      PLOT_NAME_NODE_UUID_0: {
        valid: false,
        errors: [],
        fields: {
          value: {
            valid: false,
            errors: [
              {
                key: 'custom',
                messages: {
                  en: 'plot_key == 50',
                },
              },
            ],
            fields: {},
            warnings: [],
          },
        },
        warnings: [],
      },
    },
    warnings: [],
  },
  nodes: {
    CLUSTER_NAME_NODE_UUID: {
      id: 33,
      uuid: 'CLUSTER_NAME_NODE_UUID',
      dateCreated: '2022-05-07T20:36:09.383Z',
      dateModified: '2022-05-07T20:47:24.411Z',
      parentUuid: 'CLUSTER_NODE_UUID',
      nodeDefUuid: 'CLUSTER_NAME_DEF_UUID',
      value: 'bbbcdegf',
      meta: {
        h: ['CLUSTER_NODE_UUID'],
        defaultValue: false,
        childApplicability: {},
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    CLUSTER_KEY_NODE_UUID: {
      id: 32,
      uuid: 'CLUSTER_KEY_NODE_UUID',
      dateCreated: '2022-05-07T20:36:09.383Z',
      dateModified: '2022-05-07T20:36:12.165Z',
      parentUuid: 'CLUSTER_NODE_UUID',
      nodeDefUuid: 'CLUSTER_KEY_DEF_UUID',
      value: '10',
      meta: {
        h: ['CLUSTER_NODE_UUID'],
        defaultValue: false,
        childApplicability: {},
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    CLUSTER_NODE_UUID: {
      id: 31,
      uuid: 'CLUSTER_NODE_UUID',
      dateCreated: '2022-05-07T20:36:09.383Z',
      dateModified: '2022-05-07T20:36:09.383Z',
      parentUuid: null,
      nodeDefUuid: 'CLUSTER_DEF_UUID',
      value: null,
      meta: {
        h: [],
        childApplicability: {},
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    CLUSTER_NAME_2_NODE_UUID: {
      id: 34,
      uuid: 'CLUSTER_NAME_2_NODE_UUID',
      dateCreated: '2022-05-07T20:36:09.383Z',
      dateModified: '2022-05-07T20:36:56.931Z',
      parentUuid: 'CLUSTER_NODE_UUID',
      nodeDefUuid: 'CLUSTER_NAME_2_DEF_UUID',
      value: 'aaa',
      meta: {
        h: ['CLUSTER_NODE_UUID'],
        defaultValue: false,
        childApplicability: {},
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    PLOT_NODE_UUID_0: {
      id: 35,
      uuid: 'PLOT_NODE_UUID_0',
      dateCreated: '2022-05-08T12:15:32.539Z',
      dateModified: '2022-05-08T16:15:32.539Z',
      parentUuid: 'CLUSTER_NODE_UUID',
      nodeDefUuid: 'PLOT_DEF_UUID',
      value: null,
      meta: {
        h: ['CLUSTER_NODE_UUID'],
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    PLOT_KEY_NODE_UUID_0: {
      id: 36,
      uuid: 'PLOT_KEY_NODE_UUID_0',
      dateCreated: '2022-05-08T12:15:32.539Z',
      dateModified: '2022-05-08T12:15:33.594Z',
      parentUuid: 'PLOT_NODE_UUID_0',
      nodeDefUuid: 'PLOT_KEY_DEF_UUID',
      value: '1',
      meta: {
        h: ['CLUSTER_NODE_UUID', 'PLOT_NODE_UUID_0'],
        defaultValue: false,
        childApplicability: {},
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    PLOT_NAME_NODE_UUID_0: {
      id: 37,
      uuid: 'PLOT_NAME_NODE_UUID_0',
      dateCreated: '2022-05-08T12:15:32.539Z',
      dateModified: '2022-05-08T12:15:35.413Z',
      parentUuid: 'PLOT_NODE_UUID_0',
      nodeDefUuid: 'PLOT_NAME_DEF_UUID',
      value: 'aa',
      meta: {
        h: ['CLUSTER_NODE_UUID', 'PLOT_NODE_UUID_0'],
        defaultValue: false,
        childApplicability: {},
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    PLOT_KEY_NODE_UUID_1: {
      id: 39,
      uuid: 'PLOT_KEY_NODE_UUID_1',
      dateCreated: '2022-05-08T12:15:36.737Z',
      dateModified: '2022-05-08T12:15:38.164Z',
      parentUuid: 'PLOT_NODE_UUID_1',
      nodeDefUuid: 'PLOT_KEY_DEF_UUID',
      value: '10',
      meta: {
        h: ['CLUSTER_NODE_UUID', 'PLOT_NODE_UUID_1'],
        defaultValue: false,
        childApplicability: {},
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    PLOT_NAME_NODE_UUID_1: {
      id: 40,
      uuid: 'PLOT_NAME_NODE_UUID_1',
      dateCreated: '2022-05-08T12:15:36.737Z',
      dateModified: '2022-05-08T12:15:42.317Z',
      parentUuid: 'PLOT_NODE_UUID_1',
      nodeDefUuid: 'PLOT_NAME_DEF_UUID',
      value: 'aaa',
      meta: {
        h: ['CLUSTER_NODE_UUID', 'PLOT_NODE_UUID_1'],
        defaultValue: false,
        childApplicability: {},
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    PLOT_NODE_UUID_1: {
      id: 38,
      uuid: 'PLOT_NODE_UUID_1',
      dateCreated: '2022-05-08T12:15:36.737Z',
      dateModified: '2022-05-08T16:15:36.737Z',
      parentUuid: 'CLUSTER_NODE_UUID',
      nodeDefUuid: 'PLOT_DEF_UUID',
      value: null,
      meta: {
        h: ['CLUSTER_NODE_UUID'],
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    PLOT_KEY_NODE_UUID_2: {
      id: 42,
      uuid: 'PLOT_KEY_NODE_UUID_2',
      dateCreated: '2022-05-08T12:16:21.192Z',
      dateModified: '2022-05-08T12:16:23.556Z',
      parentUuid: 'PLOT_NODE_UUID_2',
      nodeDefUuid: 'PLOT_KEY_DEF_UUID',
      value: '50',
      meta: {
        h: ['CLUSTER_NODE_UUID', 'PLOT_NODE_UUID_2'],
        defaultValue: false,
        childApplicability: {},
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    PLOT_NODE_UUID_2: {
      id: 41,
      uuid: 'PLOT_NODE_UUID_2',
      dateCreated: '2022-05-08T12:16:21.192Z',
      dateModified: '2022-05-08T16:16:21.192Z',
      parentUuid: 'CLUSTER_NODE_UUID',
      nodeDefUuid: 'PLOT_DEF_UUID',
      value: null,
      meta: {
        h: ['CLUSTER_NODE_UUID'],
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
    PLOT_NAME_NODE_UUID_2: {
      id: 43,
      uuid: 'PLOT_NAME_NODE_UUID_2',
      dateCreated: '2022-05-08T12:16:21.192Z',
      dateModified: '2022-05-08T12:16:25.485Z',
      parentUuid: 'PLOT_NODE_UUID_2',
      nodeDefUuid: 'PLOT_NAME_DEF_UUID',
      value: 'aaa',
      meta: {
        h: ['CLUSTER_NODE_UUID', 'PLOT_NODE_UUID_2'],
        defaultValue: false,
        childApplicability: {},
      },
      refData: null,
      recordUuid: 'RECORD_UUID',
    },
  },
  _nodesByParentAndDef: {
    CLUSTER_NODE_UUID: {
      CLUSTER_NAME_DEF_UUID: ['CLUSTER_NAME_NODE_UUID'],
      CLUSTER_KEY_DEF_UUID: ['CLUSTER_KEY_NODE_UUID'],
      CLUSTER_NAME_2_DEF_UUID: ['CLUSTER_NAME_2_NODE_UUID'],
      PLOT_DEF_UUID: [
        'PLOT_NODE_UUID_0',
        'PLOT_NODE_UUID_1',
        'PLOT_NODE_UUID_2',
      ],
    },
    null: {
      CLUSTER_DEF_UUID: ['CLUSTER_NODE_UUID'],
    },
    PLOT_NODE_UUID_0: {
      PLOT_KEY_DEF_UUID: ['PLOT_KEY_NODE_UUID_0'],
      PLOT_NAME_DEF_UUID: ['PLOT_NAME_NODE_UUID_0'],
    },
    PLOT_NODE_UUID_1: {
      PLOT_KEY_DEF_UUID: ['PLOT_KEY_NODE_UUID_1'],
      PLOT_NAME_DEF_UUID: ['PLOT_NAME_NODE_UUID_1'],
    },
    PLOT_NODE_UUID_2: {
      PLOT_KEY_DEF_UUID: ['PLOT_KEY_NODE_UUID_2'],
      PLOT_NAME_DEF_UUID: ['PLOT_NAME_NODE_UUID_2'],
    },
  },
  _nodesByDef: {
    CLUSTER_NAME_DEF_UUID: ['CLUSTER_NAME_NODE_UUID'],
    CLUSTER_KEY_DEF_UUID: ['CLUSTER_KEY_NODE_UUID'],
    CLUSTER_DEF_UUID: ['CLUSTER_NODE_UUID'],
    CLUSTER_NAME_2_DEF_UUID: ['CLUSTER_NAME_2_NODE_UUID'],
    PLOT_DEF_UUID: ['PLOT_NODE_UUID_0', 'PLOT_NODE_UUID_1', 'PLOT_NODE_UUID_2'],
    PLOT_KEY_DEF_UUID: [
      'PLOT_KEY_NODE_UUID_0',
      'PLOT_KEY_NODE_UUID_1',
      'PLOT_KEY_NODE_UUID_2',
    ],
    PLOT_NAME_DEF_UUID: [
      'PLOT_NAME_NODE_UUID_0',
      'PLOT_NAME_NODE_UUID_1',
      'PLOT_NAME_NODE_UUID_2',
    ],
  },
  _nodeRootUuid: 'CLUSTER_NODE_UUID',
};

module.exports = RECORD;