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

  it('calls SelectorList for each SelectorList-Node', () => {
    const selectorListVisitor = jest.fn();
    const traverser = new Traverser({ SelectorList: selectorListVisitor });
    traverser.visit(AST); 
    const { calls } = selectorListVisitor.mock;
    expect(calls.length).toBe(2);
    expect(calls[0][0]).toBe(selectorList1);
    expect(calls[1][0]).toBe(selectorList2);
  });

  it('calls Selector for each Selector-Node', () => {
    const selectorVisitor = jest.fn();
    const traverser = new Traverser({ Selector: selectorVisitor });
    traverser.visit(AST); 
    const { calls } = selectorVisitor.mock;
    expect(calls.length).toBe(3);
    expect(calls[0][0]).toBe(selector1);
    expect(calls[1][0]).toBe(selector2);
    expect(calls[2][0]).toBe(selector3);
  });

  it('calls `AttributeSelector` for each `AttributeSelector`-node', () => {
    const attributeSelectorVisitor = jest.fn();
    const traverser = new Traverser({ AttributeSelector: attributeSelectorVisitor });
    traverser.visit(AST); 
    const { calls } = attributeSelectorVisitor.mock;
    expect(calls.length).toBe(2);
    expect(calls[0][0]).toBe(attributeSelector1);
    expect(calls[1][0]).toBe(attributeSelectorWithMatcher1);
  });

  it('calls `AttributeSelectorAttribute` for each `AttributeSelectorAttribute`-node', () => {
    const attributeSelectorAttributeVisitor = jest.fn();
    const traverser = new Traverser({ AttributeSelectorAttribute: attributeSelectorAttributeVisitor });
    traverser.visit(AST); 
    const { calls } = attributeSelectorAttributeVisitor.mock;
    expect(calls.length).toBe(2);
    expect(calls[0][0]).toBe(attributeSelector1.attribute);
    expect(calls[1][0]).toBe(attributeSelectorWithMatcher1.attribute);
  });

  it('calls `AttributeSelectorMatcher` for each `AttributeSelectorMatcher`-node', () => {
    const attributeSelectorMatcherVisitor = jest.fn();
    const traverser = new Traverser({ AttributeSelectorMatcher: attributeSelectorMatcherVisitor });
    traverser.visit(AST); 
    const { calls } = attributeSelectorMatcherVisitor.mock;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(attributeSelectorWithMatcher1.matcher);
  });

  it('calls `AttributeSelectorValue` for each `AttributeSelectorValue`-node', () => {
    const attributeSelectorValueVisitor = jest.fn();
    const traverser = new Traverser({ AttributeSelectorValue: attributeSelectorValueVisitor });
    traverser.visit(AST); 
    const { calls } = attributeSelectorValueVisitor.mock;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(attributeSelectorWithMatcher1.value);
  });

  it('calls `AttributeSelectorWithMatcher` for each `AttributeSelectorWithMatcher`-node', () => {
    const attributeSelectorWithMatcherVisitor = jest.fn();
    const traverser = new Traverser({ AttributeSelectorWithMatcher: attributeSelectorWithMatcherVisitor });
    traverser.visit(AST); 
    const { calls } = attributeSelectorWithMatcherVisitor.mock;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(attributeSelectorWithMatcher1);
  });

  it('calls `ClassSelector` for each `ClassSelector`-node', () => {
    const classSelectorVisitor = jest.fn();
    const traverser = new Traverser({ ClassSelector: classSelectorVisitor });
    traverser.visit(AST); 
    const { calls } = classSelectorVisitor.mock;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(classSelector1);
  });

  it('calls `Combinator` for each `Combinator`-node', () => {
    const combinatorVisitor = jest.fn();
    const traverser = new Traverser({ Combinator: combinatorVisitor });
    traverser.visit(AST); 
    const { calls } = combinatorVisitor.mock;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(combinator1);
  });

  it('calls `HashSelector` for each `HashSelector`-node', () => {
    const hashSelectorVisitor = jest.fn();
    const traverser = new Traverser({ HashSelector: hashSelectorVisitor });
    traverser.visit(AST); 
    const { calls } = hashSelectorVisitor.mock;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(hashSelector1);
  });

  it('calls `Identifier` for each `Identifier`-node', () => {
    const identifierVisitor = jest.fn();
    const traverser = new Traverser({ Identifier: identifierVisitor });
    traverser.visit(AST); 
    const { calls } = identifierVisitor.mock;
    expect(calls.length).toBe(11);
    expect(calls[0][0]).toBe(hashSelector1.value);
    expect(calls[1][0]).toBe(classSelector1.value);
    expect(calls[2][0]).toBe(attributeSelector1.attribute.value);
    expect(calls[3][0]).toBe(attributeSelectorWithMatcher1.attribute.value);
    expect(calls[4][0]).toBe(pseudoClassSelector1.value);
    expect(calls[5][0]).toBe(pseudoElementSelector1.value);
    expect(calls[6][0]).toBe(typeSelector1.value);
    expect(calls[7][0]).toBe(namespacePrefix1.value);
    expect(calls[8][0]).toBe(callExpression1.callee);
    expect(calls[9][0]).toBe(callExpression2.callee);
    expect(calls[10][0]).toBe(typeSelector2.value);
  });

  it('calls `Literal` for each `Literal`-node', () => {
    const literalVisitor = jest.fn();
    const traverser = new Traverser({ Literal: literalVisitor });
    traverser.visit(AST); 
    const { calls } = literalVisitor.mock;
    expect(calls.length).toBe(3);
    expect(calls[0][0]).toBe(attributeSelectorWithMatcher1.value.value);
    expect(calls[1][0]).toBe(nthChildExpression1.step);
    expect(calls[2][0]).toBe(nthChildExpression1.offset);
  });

  it('calls `NamespacePrefix` for each `NamespacePrefix`-node', () => {
    const namespacePrefixVisitor = jest.fn();
    const traverser = new Traverser({ NamespacePrefix: namespacePrefixVisitor });
    traverser.visit(AST); 
    const { calls } = namespacePrefixVisitor.mock;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(namespacePrefix1);
  });

  it('calls `NumberLiteral` for each `NumberLiteral`-node', () => {
    const numberLiteralVisitor = jest.fn();
    const traverser = new Traverser({ NumberLiteral: numberLiteralVisitor });
    traverser.visit(AST); 
    const { calls } = numberLiteralVisitor.mock;
    expect(calls.length).toBe(2);
    expect(calls[0][0]).toBe(nthChildExpression1.step);
    expect(calls[1][0]).toBe(nthChildExpression1.offset);
  });

  it('calls `PseudoSelector` for each `PseudoSelector`-node', () => {
    const pseudoSelectorVisitor = jest.fn();
    const traverser = new Traverser({ PseudoSelector: pseudoSelectorVisitor });
    traverser.visit(AST); 
    const { calls } = pseudoSelectorVisitor.mock;
    expect(calls.length).toBe(4);
    expect(calls[0][0]).toBe(pseudoClassSelector1);
    expect(calls[1][0]).toBe(pseudoElementSelector1);
    expect(calls[2][0]).toBe(pseudoClassSelector2);
    expect(calls[3][0]).toBe(pseudoClassSelector3);
  });

  it('calls `CallExpression` for each `CallExpression`-node', () => {
    const callExpressionVisitor = jest.fn();
    const traverser = new Traverser({ CallExpression: callExpressionVisitor });
    traverser.visit(AST); 
    const { calls } = callExpressionVisitor.mock;
    expect(calls.length).toBe(2);
    expect(calls[0][0]).toBe(callExpression1);
    expect(calls[1][0]).toBe(callExpression2);
  });

  it('calls `PseudoClassSelector` for each `PseudoClassSelector`-node', () => {
    const pseudoClassSelectorVisitor = jest.fn();
    const traverser = new Traverser({ PseudoClassSelector: pseudoClassSelectorVisitor });
    traverser.visit(AST); 
    const { calls } = pseudoClassSelectorVisitor.mock;
    expect(calls.length).toBe(3);
    expect(calls[0][0]).toBe(pseudoClassSelector1);
    expect(calls[1][0]).toBe(pseudoClassSelector2);
    expect(calls[2][0]).toBe(pseudoClassSelector3);
  });

  it('calls `PseudoElementSelector` for each `PseudoElementSelector`-node', () => {
    const pseudoElementSelectorVisitor = jest.fn();
    const traverser = new Traverser({ PseudoElementSelector: pseudoElementSelectorVisitor });
    traverser.visit(AST); 
    const { calls } = pseudoElementSelectorVisitor.mock;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(pseudoElementSelector1);
  });

  it('calls `Selector` for each `Selector`-node', () => {
    const selectorVisitor = jest.fn();
    const traverser = new Traverser({ Selector: selectorVisitor });
    traverser.visit(AST); 
    const { calls } = selectorVisitor.mock;
    expect(calls.length).toBe(3);
    expect(calls[0][0]).toBe(selector1);
    expect(calls[1][0]).toBe(selector2);
    expect(calls[2][0]).toBe(selector3);
  });

  it('calls `SelectorList` for each `SelectorList`-node', () => {
    const selectorListVisitor = jest.fn();
    const traverser = new Traverser({ SelectorList: selectorListVisitor });
    traverser.visit(AST); 
    const { calls } = selectorListVisitor.mock;
    expect(calls.length).toBe(2);
    expect(calls[0][0]).toBe(selectorList1);
    expect(calls[1][0]).toBe(selectorList2);
  });

  it('calls `SimpleSelector` for each `SimpleSelector`-node', () => {
    const simpleSelectorVisitor = jest.fn();
    const traverser = new Traverser({ SimpleSelector: simpleSelectorVisitor });
    traverser.visit(AST); 
    const { calls } = simpleSelectorVisitor.mock;
    expect(calls.length).toBe(12);
    expect(calls[0][0]).toBe(universalSelector1);
    expect(calls[1][0]).toBe(hashSelector1);
    expect(calls[2][0]).toBe(classSelector1);
    expect(calls[3][0]).toBe(attributeSelector1);
    expect(calls[4][0]).toBe(attributeSelectorWithMatcher1);
    expect(calls[5][0]).toBe(pseudoClassSelector1);
    expect(calls[6][0]).toBe(pseudoElementSelector1);
    expect(calls[7][0]).toBe(typeSelector1);
    expect(calls[8][0]).toBe(pseudoClassSelector2);
    expect(calls[9][0]).toBe(pseudoClassSelector3);
    expect(calls[10][0]).toBe(universalSelector2);
    expect(calls[11][0]).toBe(typeSelector2);
  });

  it('calls `SimpleSelectorList` for each `SimpleSelectorList`-node', () => {
    const simpleSelectorListVisitor = jest.fn();
    const traverser = new Traverser({ SimpleSelectorList: simpleSelectorListVisitor });
    traverser.visit(AST); 
    const { calls } = simpleSelectorListVisitor.mock;
    expect(calls.length).toBe(3);
    expect(calls[0][0]).toBe(simpleSelectorList1);
    expect(calls[1][0]).toBe(simpleSelectorList2);
    expect(calls[2][0]).toBe(simpleSelectorList3);
  });

  it('calls `StringLiteral` for each `StringLiteral`-node', () => {
    const stringLiteralVisitor = jest.fn();
    const traverser = new Traverser({ StringLiteral: stringLiteralVisitor });
    traverser.visit(AST); 
    const { calls } = stringLiteralVisitor.mock;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(attributeSelectorWithMatcher1.value.value);
  });

  it('calls `TypeSelector` for each `TypeSelector`-node', () => {
    const typeSelectorVisitor = jest.fn();
    const traverser = new Traverser({ TypeSelector: typeSelectorVisitor });
    traverser.visit(AST); 
    const { calls } = typeSelectorVisitor.mock;
    expect(calls.length).toBe(2);
    expect(calls[0][0]).toBe(typeSelector1);
    expect(calls[1][0]).toBe(typeSelector2);
  });

  it('calls `UniversalSelector` for each `UniversalSelector`-node', () => {
    const universalSelectorVisitor = jest.fn();
    const traverser = new Traverser({ UniversalSelector: universalSelectorVisitor });
    traverser.visit(AST); 
    const { calls } = universalSelectorVisitor.mock;
    expect(calls.length).toBe(2);
    expect(calls[0][0]).toBe(universalSelector1);
    expect(calls[1][0]).toBe(universalSelector2);
  });
});
