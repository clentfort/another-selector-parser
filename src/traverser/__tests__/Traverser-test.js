jest.disableAutomock();

import Traverser from '../';
import * as nodes from '../../util/nodes';
import { NotExpressionArgument } from '../../plugins/NotExpressionParser';
import { 
  NthChildExpressionArgument,
  NthChildExpressionWithOfSelectorArgument 
} from '../../plugins/NthChildExpressionParser';

describe('Traverser', () => {
  // An AST that includes every node type I could think of!
  const AST = new nodes.SelectorList([
    new nodes.Selector([
      new nodes.SimpleSelectorList([
        new nodes.UniversalSelector(),
        new nodes.HashSelector(new nodes.Identifier("someId")),
        new nodes.ClassSelector(new nodes.Identifier('someClass')),
        new nodes.AttributeSelector(
          new nodes.AttributeSelectorAttribute(new nodes.Identifier('someAttribute')),
        ),
        new nodes.AttributeSelectorWithMatcher(
          new nodes.AttributeSelectorAttribute(new nodes.Identifier('someAttributeWithMatcher')),
          new nodes.AttributeSelectorMatcher("=",),
          new nodes.AttributeSelectorValue(new nodes.StringLiteral("someAttributeValue")),
          true,
        ),
        new nodes.PseudoClassSelector(new nodes.Identifier('somePseudoClass')),
        new nodes.PseudoElementSelector(new nodes.Identifier('somePseudoElement')),
      ]),
    ]),
    new nodes.Selector([
      new nodes.SimpleSelectorList([
        new nodes.TypeSelector(
          new nodes.Identifier('someType'),
          new nodes.NamespacePrefix(new nodes.Identifier('someNamespace')),
        ),
        new nodes.PseudoClassSelector(
          new nodes.CallExpression(
            new nodes.Identifier('not'),
            [
              new NotExpressionArgument(
                new nodes.PseudoClassSelector(
                  new nodes.CallExpression(
                    new nodes.Identifier('nth-child'),
                    [
                      new NthChildExpressionWithOfSelectorArgument(
                        new nodes.NumberLiteral(2),
                        new nodes.NumberLiteral(3),
                        new nodes.SelectorList([
                          new nodes.Selector([
                            new nodes.UniversalSelector(),
                          ]),
                        ]),
                      )
                    ],
                  ),
                ),
              )
            ],
          ),
        )
      ]),
      new nodes.Combinator("sibling-next"),
      new nodes.SimpleSelectorList([
        new nodes.TypeSelector(new nodes.Identifier('someOtherType'))
      ])
    ])
  ]);

  const selectorList1 = AST;
  const selector1 = selectorList1.body[0];
  const simpleSelectorList1 = selector1.body[0];
  const universalSelector1 = simpleSelectorList1.body[0];
  const hashSelector1 = simpleSelectorList1.body[1];
  const classSelector1 = simpleSelectorList1.body[2];
  const attributeSelector1 = simpleSelectorList1.body[3];
  const attributeSelectorWithMatcher1 = simpleSelectorList1.body[4];
  const pseudoClassSelector1 = simpleSelectorList1.body[5];
  const pseudoElementSelector1 = simpleSelectorList1.body[6];
  const selector2 = AST.body[1];
  const simpleSelectorList2 = selector2.body[0];
  const typeSelector1 = simpleSelectorList2.body[0];
  const namespacePrefix1 = typeSelector1.namespacePrefix;
  const pseudoClassSelector2 = simpleSelectorList2.body[1];
  const callExpression1 = pseudoClassSelector2.value;
  const notExpressionArgument1 = callExpression1.params[0];
  const pseudoClassSelector3 = notExpressionArgument1.value;
  const callExpression2 = pseudoClassSelector3.value;
  const nthChildExpression1 = callExpression2.params[0];
  const selectorList2 = nthChildExpression1.of;
  const selector3 = selectorList2.body[0];
  const universalSelector2 = selector3.body[0];
  const combinator1 = selector2.body[1];
  const simpleSelectorList3 = selector2.body[2];
  const typeSelector2 = simpleSelectorList3.body[0];

  it('calls Node for each AST-Node', () => {
    const nodeVisitor = jest.fn();
    const traverser = new Traverser({ Node: nodeVisitor });
    traverser.visit(AST); 
    const { calls } = nodeVisitor.mock;
    expect(calls.length).toBe(44);

    expect(calls[0][0]).toBe(selectorList1);
    /**
     * new nodes.Selector([
     *   new nodes.SimpleSelectorList([
     *     new nodes.UniversalSelector(),
     *     new nodes.HashSelector(new nodes.Identifier("someId")),
     *     new nodes.ClassSelector(new nodes.Identifier('someClass')),
     *     new nodes.AttributeSelector(
     *       new nodes.AttributeSelectorAttribute(new nodes.Identifier('someAttribute')),
     *     ),
     *     new nodes.AttributeSelectorWithMatcher(
     *       new nodes.AttributeSelectorAttribute(new nodes.Identifier('someAttributeWithMatcher')),
     *       new nodes.AttributeSelectorMatcher("=",),
     *       new nodes.AttributeSelectorValue(new nodes.StringLiteral("someAttributeValue")),
     *       true,
     *     ),
     *     new nodes.PseudoClassSelector(new nodes.Identifier('somePseudoClass')),
     *     new nodes.PseudoElementSelector(new nodes.Identifier('somePseudoElement')),
     *   ]),
     * ]),
     */
    expect(calls[1][0]).toBe(selector1);
    expect(calls[2][0]).toBe(simpleSelectorList1);
    expect(calls[3][0]).toBe(universalSelector1);
    expect(calls[4][0]).toBe(hashSelector1);
    expect(calls[5][0]).toBe(hashSelector1.value);
    expect(calls[6][0]).toBe(classSelector1);
    expect(calls[7][0]).toBe(classSelector1.value);
    expect(calls[8][0]).toBe(attributeSelector1);
    expect(calls[9][0]).toBe(attributeSelector1.attribute);
    expect(calls[10][0]).toBe(attributeSelector1.attribute.value);
    expect(calls[11][0]).toBe(attributeSelectorWithMatcher1);
    expect(calls[12][0]).toBe(attributeSelectorWithMatcher1.attribute);
    expect(calls[13][0]).toBe(attributeSelectorWithMatcher1.attribute.value);
    expect(calls[14][0]).toBe(attributeSelectorWithMatcher1.matcher);
    expect(calls[15][0]).toBe(attributeSelectorWithMatcher1.value);
    expect(calls[16][0]).toBe(attributeSelectorWithMatcher1.value.value);
    expect(calls[17][0]).toBe(pseudoClassSelector1);
    expect(calls[18][0]).toBe(pseudoClassSelector1.value);
    expect(calls[19][0]).toBe(pseudoElementSelector1);
    expect(calls[20][0]).toBe(pseudoElementSelector1.value);

    /**
     * new nodes.Selector([
     *   new nodes.SimpleSelectorList([
     *     new nodes.TypeSelector(
     *       new nodes.Identifier('someType'),
     *       new nodes.NamespacePrefix(new nodes.Identifier('someNamespace')),
     *     ),
     *     new nodes.PseudoClassSelector(
     *       new nodes.CallExpression(
     *         new nodes.Identifier('not'),
     *         [
     *           new NotExpressionArgument(
     *             new nodes.PseudoClassSelector(
     *               new nodes.CallExpression(
     *                 new nodes.Identifier('nth-child'),
     *                 [
     *                   new NthChildExpressionWithOfSelectorArgument(
     *                     new nodes.NumberLiteral(2),
     *                     new nodes.NumberLiteral(3),
     *                     new nodes.SelectorList([
     *                       new nodes.Selector([
     *                         new nodes.UniversalSelector(),
     *                       ]),
     *                     ]),
     *                   )
     *                 ],
     *               ),
     *             ),
     *           )
     *         ],
     *       ),
     *     )
     *   ]),
     *   new nodes.Combinator("sibling-next"),
     *   new nodes.SimpleSelectorList([
     *     new nodes.TypeSelector(new nodes.Identifier('someOtherType'))
     *   ])
     * ])
     */
    expect(calls[21][0]).toBe(selector2);
    expect(calls[22][0]).toBe(simpleSelectorList2);
    expect(calls[23][0]).toBe(typeSelector1);
    expect(calls[24][0]).toBe(typeSelector1.value);
    expect(calls[25][0]).toBe(namespacePrefix1);
    expect(calls[26][0]).toBe(namespacePrefix1.value);
    expect(calls[27][0]).toBe(pseudoClassSelector2);
    expect(calls[28][0]).toBe(callExpression1);
    expect(calls[29][0]).toBe(callExpression1.callee);
    expect(calls[30][0]).toBe(notExpressionArgument1);
    expect(calls[31][0]).toBe(pseudoClassSelector3);
    expect(calls[32][0]).toBe(callExpression2);
    expect(calls[33][0]).toBe(callExpression2.callee);
    expect(calls[34][0]).toBe(nthChildExpression1);
    expect(calls[35][0]).toBe(nthChildExpression1.step);
    expect(calls[36][0]).toBe(nthChildExpression1.offset);
    expect(calls[37][0]).toBe(selectorList2);
    expect(calls[38][0]).toBe(selector3);
    expect(calls[39][0]).toBe(universalSelector2);
    expect(calls[40][0]).toBe(combinator1);
    expect(calls[41][0]).toBe(simpleSelectorList3);
    expect(calls[42][0]).toBe(typeSelector2);
    expect(calls[43][0]).toBe(typeSelector2.value);
  });
});
