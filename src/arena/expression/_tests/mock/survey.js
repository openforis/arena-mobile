const SURVEY = {
  info: {
    id: '2',
    uuid: 'SURVEY_UUID',
    published: true,
    draft: false,
    ownerUuid: '945b5470-f934-44cf-bb0c-435595053187',
    template: false,
    dateCreated: '2022-05-07T18:07:16.517Z',
    dateModified: '2022-05-08T12:16:44.560Z',
    props: {
      srs: [
        {
          code: '4326',
          name: 'GCS WGS 1984',
        },
      ],
      name: 'aa',
      cycles: {
        0: {
          dateStart: '2022-05-07',
        },
      },
      labels: {
        en: 'asdas',
      },
      languages: ['en'],
    },
    validation: {
      valid: true,
      fields: {},
      errors: [],
      warnings: [],
    },
  },
  nodeDefs: {
    CLUSTER_DEF_UUID: {
      id: '1',
      uuid: 'CLUSTER_DEF_UUID',
      parentUuid: null,
      type: 'entity',
      deleted: false,
      analysis: false,
      virtual: false,
      dateCreated: '2022-05-07T18:07:16.517Z',
      dateModified: '2022-05-07T19:45:00.941Z',
      propsAdvanced: {},
      propsAdvancedDraft: {},
      meta: {
        h: [],
      },
      published: true,
      draft: false,
      props: {
        name: 'cluster',
        cycles: ['0'],
        layout: {
          0: {
            pageUuid: '97487ce5-589d-466c-bdca-09c6f5243ce1',
            renderType: 'form',
            indexChildren: ['PLOT_DEF_UUID'],
            layoutChildren: [
              {
                h: 1,
                i: 'CLUSTER_KEY_DEF_UUID',
                w: 1,
                x: 0,
                y: 0,
                moved: false,
                static: false,
              },
              {
                h: 1,
                i: 'CLUSTER_NAME_DEF_UUID',
                w: 1,
                x: 0,
                y: 1,
                moved: false,
                static: false,
              },
              {
                h: 1,
                i: 'CLUSTER_NAME_2_DEF_UUID',
                w: 1,
                x: 0,
                y: 2,
              },
            ],
          },
        },
        multiple: false,
      },
    },
    CLUSTER_KEY_DEF_UUID: {
      id: '2',
      uuid: 'CLUSTER_KEY_DEF_UUID',
      parentUuid: 'CLUSTER_DEF_UUID',
      type: 'integer',
      deleted: false,
      analysis: false,
      virtual: false,
      dateCreated: '2022-05-07T18:09:15.249Z',
      dateModified: '2022-05-07T18:09:20.792Z',
      propsAdvanced: {},
      propsAdvancedDraft: {},
      meta: {
        h: ['CLUSTER_DEF_UUID'],
      },
      published: true,
      draft: false,
      props: {
        key: true,
        name: 'cluster_key',
        cycles: ['0'],
      },
    },
    CLUSTER_NAME_DEF_UUID: {
      id: '3',
      uuid: 'CLUSTER_NAME_DEF_UUID',
      parentUuid: 'CLUSTER_DEF_UUID',
      type: 'text',
      deleted: false,
      analysis: false,
      virtual: false,
      dateCreated: '2022-05-07T18:17:01.352Z',
      dateModified: '2022-05-07T20:34:49.534Z',
      propsAdvanced: {
        validations: {
          expressions: [
            {
              uuid: '1285f356-c0e2-4219-9c88-97c68f63fac7',
              applyIf: '',
              messages: {},
              severity: 'error',
              expression: 'cluster_name != "null"',
            },
          ],
        },
        defaultValues: [
          {
            uuid: '1536f442-1a1a-4bc7-8883-3392635d00e3',
            applyIf: 'cluster_key == 1',
            messages: {},
            severity: 'error',
            expression: '"aaa"',
          },
        ],
      },
      propsAdvancedDraft: {},
      meta: {
        h: ['CLUSTER_DEF_UUID'],
      },
      published: true,
      draft: false,
      props: {
        name: 'cluster_name',
        cycles: ['0'],
        labels: {
          en: 'name',
        },
      },
    },
    CLUSTER_NAME_2_DEF_UUID: {
      id: '4',
      uuid: 'CLUSTER_NAME_2_DEF_UUID',
      parentUuid: 'CLUSTER_DEF_UUID',
      type: 'text',
      deleted: false,
      analysis: false,
      virtual: false,
      dateCreated: '2022-05-07T19:24:22.548Z',
      dateModified: '2022-05-07T20:36:43.111Z',
      propsAdvanced: {
        validations: {
          expressions: [
            {
              uuid: 'ec49dc84-b36d-45ea-8604-e4f31c3d0ca9',
              applyIf: '',
              messages: {},
              severity: 'error',
              expression: 'cluster_name == "aaa"',
            },
          ],
        },
      },
      propsAdvancedDraft: {},
      meta: {
        h: ['CLUSTER_DEF_UUID'],
      },
      published: true,
      draft: false,
      props: {
        name: 'name_2',
        cycles: ['0'],
        labels: {
          en: 'Name 2',
        },
        textTransform: 'none',
      },
    },
    PLOT_DEF_UUID: {
      id: '5',
      uuid: 'PLOT_DEF_UUID',
      parentUuid: 'CLUSTER_DEF_UUID',
      type: 'entity',
      deleted: false,
      analysis: false,
      virtual: false,
      dateCreated: '2022-05-07T19:45:00.941Z',
      dateModified: '2022-05-07T19:45:34.313Z',
      propsAdvanced: {
        validations: {},
      },
      propsAdvancedDraft: {},
      meta: {
        h: ['CLUSTER_DEF_UUID'],
      },
      published: true,
      draft: false,
      props: {
        name: 'plot',
        cycles: ['0'],
        labels: {
          en: 'Plot',
        },
        layout: {
          0: {
            pageUuid: '742c93fa-0af5-4b82-82ed-d02291003873',
            renderType: 'form',
            layoutChildren: [
              {
                h: 1,
                i: 'PLOT_KEY_DEF_UUID',
                w: 1,
                x: 0,
                y: 0,
              },
              {
                h: 1,
                i: 'PLOT_NAME_DEF_UUID',
                w: 1,
                x: 0,
                y: 1,
              },
            ],
          },
        },
        multiple: true,
      },
    },
    PLOT_KEY_DEF_UUID: {
      id: '6',
      uuid: 'PLOT_KEY_DEF_UUID',
      parentUuid: 'PLOT_DEF_UUID',
      type: 'integer',
      deleted: false,
      analysis: false,
      virtual: false,
      dateCreated: '2022-05-07T19:45:08.119Z',
      dateModified: '2022-05-07T19:46:04.948Z',
      propsAdvanced: {},
      propsAdvancedDraft: {},
      meta: {
        h: ['CLUSTER_DEF_UUID', 'PLOT_DEF_UUID'],
      },
      published: true,
      draft: false,
      props: {
        key: true,
        name: 'plot_key',
        cycles: ['0'],
      },
    },
    PLOT_NAME_DEF_UUID: {
      id: '7',
      uuid: 'PLOT_NAME_DEF_UUID',
      parentUuid: 'PLOT_DEF_UUID',
      type: 'text',
      deleted: false,
      analysis: false,
      virtual: false,
      dateCreated: '2022-05-07T19:45:34.313Z',
      dateModified: '2022-05-08T12:16:44.560Z',
      propsAdvanced: {
        applicable: [
          {
            uuid: 'e57d19cd-577a-4430-ae7b-a04e45c6194e',
            applyIf: '',
            messages: {},
            severity: 'error',
            expression: 'plot_key > 0',
          },
        ],
        validations: {
          expressions: [
            {
              uuid: '1156b668-77b6-4c12-b2a3-1a24ca6c20ed',
              applyIf: '',
              messages: {},
              severity: 'error',
              expression: 'plot_key == 50',
            },
          ],
        },
      },
      propsAdvancedDraft: {},
      meta: {
        h: ['CLUSTER_DEF_UUID', 'PLOT_DEF_UUID'],
      },
      published: true,
      draft: false,
      props: {
        name: 'plot_name',
        cycles: ['0'],
        labels: {
          en: 'Plot Name',
        },
      },
    },
  },
  nodeDefsIndex: {
    childDefUuidsByParentUuid: {
      CLUSTER_DEF_UUID: [
        'CLUSTER_KEY_DEF_UUID',
        'CLUSTER_NAME_DEF_UUID',
        'CLUSTER_NAME_2_DEF_UUID',
        'PLOT_DEF_UUID',
      ],
      PLOT_DEF_UUID: ['PLOT_KEY_DEF_UUID', 'PLOT_NAME_DEF_UUID'],
    },
  },
  nodeDefsValidation: {
    valid: true,
    fields: {},
    errors: [],
    warnings: [],
  },
  status: {
    defsFetched: true,
    defsDraftFetched: true,
  },
};

module.exports = SURVEY;
