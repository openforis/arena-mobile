import {prepareArenaExpressions} from '../parser';

const {evalExpr} = require('jse-eval');

const RECORD = require('./mock/record');
const SURVEY = require('./mock/survey');

const nodes = [
  {
    nUuid: 'CLUSTER_NAME_2_NODE_UUID',
    expressions: [
      {
        applyIf: {expression: '', result: undefined},
        expression: {expression: '"bbbcdegf" == "aaa"', result: false},
      },
    ],
  },
  {
    nUuid: 'CLUSTER_NAME_NODE_UUID',
    expressions: [
      {
        applyIf: {expression: '', result: undefined},
        expression: {expression: '"bbbcdegf" != "null"', result: true},
      },
    ],
  },
  {
    nUuid: 'CLUSTER_NAME_NODE_UUID',
    expressions: [
      {
        applyIf: {expression: '10 == 1', result: false},
        expression: {expression: '"aaa"', result: 'aaa'},
      },
    ],
    type: 'DEFAULT_VALUES',
  },
  {
    nUuid: 'CLUSTER_NAME_NODE_UUID',
    expressions: [],
    type: 'APPLICABLE',
  },

  {
    nUuid: 'PLOT_NAME_NODE_UUID_0',
    expressions: [
      {
        applyIf: {expression: '', result: undefined},
        expression: {expression: '1 == 50', result: false},
      },
    ],
  },
  {
    nUuid: 'PLOT_NAME_NODE_UUID_2',
    expressions: [
      {
        applyIf: {expression: '', result: undefined},
        expression: {expression: '50 == 50', result: true},
      },
    ],
  },
  {
    nUuid: 'PLOT_NAME_NODE_UUID_1',
    expressions: [
      {
        applyIf: {expression: '', result: undefined},
        expression: {expression: '10 == 50', result: false},
      },
    ],
  },
  {
    nUuid: 'PLOT_NAME_NODE_UUID_1',
    expressions: [
      {
        applyIf: {expression: '', result: undefined},
        expression: {expression: '10 > 0', result: true},
      },
    ],
    type: 'APPLICABLE',
  },
];

describe('Arena Expression Parser and Execute', () => {
  nodes.forEach(({nUuid, expressions, type}) => {
    describe(`${nUuid} - ${
      SURVEY.nodeDefs[RECORD.nodes[nUuid].nodeDefUuid].props.name
    } - ${type || 'VALIDATIONS'}`, () => {
      const _expressions = prepareArenaExpressions({
        node: RECORD.nodes[nUuid],
        survey: SURVEY,
        record: RECORD,
        type,
      });

      it(`Num expressions ${expressions.length}`, () => {
        expect(_expressions.length).toEqual(expressions.length);
      });

      (_expressions || []).forEach((_expression, index) => {
        it(`Expression: ${expressions[index].expression.expression} - ApplyIf: ${expressions[index].expression.applyIf}`, () => {
          expect(expressions[index].expression.expression).toEqual(
            _expression.jsExpression,
          );
          expect(expressions[index].expression.result).toEqual(
            evalExpr(_expression.jsExpression),
          );
          expect(expressions[index].applyIf.expression).toEqual(
            _expression.jsApplyIf,
          );
          expect(expressions[index].applyIf.result).toEqual(
            evalExpr(_expression.jsApplyIf),
          );
        });
      });
    });
  });
});
