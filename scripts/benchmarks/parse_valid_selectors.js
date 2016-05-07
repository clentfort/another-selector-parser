import { Suite } from 'benchmark';
import { default as AnotherSelectorParserParser } from 'another-selector-parser/lib/parser';
import { default as AnotherSelectorParserTokenizer } from 'another-selector-parser/lib/tokenizer';
import { default as PostCSSSelectorParserParser } from 'postcss-selector-parser/dist/parser';

const selectors = {
  'attribute_with_ident_value': '[class=classname]',
  'attribute_with_namespaced_attribute': '[myNamespace|class]',
  'attribute_with_namespaced_empty_attribute': '[|class]',
  'attribute_without_value': '[class]',
  'attribute_with_string_value_and_insensitive_flag': '[class="classname" i]',
  'attribute_with_string_value': '[class="classname"]',
  'class': '.class',
  'cssnext_custom_selector': ':--customSelector',
  'id': '#main',
  'long_simple_selector_list_starting_with_element': 'tagname.class#id1#id2[attribute][attribute="test"]:not([class="class"]):first:not(:nth-child(2n+1))',
  'long_simple_selector_list_starting_with_element_namespaced': 'aNamespace|tagname.class#id1#id2[attribute][attribute="test"]:not([|class="class"]):first:not(:nth-child(2n+1))',
  'negation_multiple': ':not(a, b)',
  'negation_pseudo_class': ':not(:hover)',
  'negation_typeselector': ':not(element)',
  'nth_child': ':nth-child(2n+1)',
  'nth_child_negative_offset': ':nth-child(2n-1)',
  'nth_child_negative_offset_with_whitespace_before_offset': ':nth-child(2n -1)',
  'nth_child_negative_offset_with_whitespace': ':nth-child(2n - 1)',
  'nth_child_negative_offset_with_whitespace_in_offset': ':nth-child(2n- 1)',
  'nth_child_with_of_selector': ':nth-child(2n+1 of .someSelector, anotherSelector)[someAttribute]',
  'nth_child_with_whitespace': ':nth-child(2n + 1)',
  'pseudo_class': ':pseudoClass',
  'pseudo_element': '::pseudoElement',
  'pseudo_function_call': ':someCall(2n - 1)',
  'pseudo_function_call_multiple_paren': ':someCall((call))',
  'selector_list_multiple_rules': 'span, span',
  'selector_list_single_rule_dangling_comma': 'span,',
  'simple_selector_list_with_child_combinator': 'span > span',
  'simple_selector_list_with_descendant_double_dash_combinator': 'span >> span',
  'simple_selector_list_with_descendant_whitespace_combinator': 'span  span',
  'simple_selector_list_with_sibiling_next_combinator': 'span + span',
  'simple_selector_list_with_sibling_following_combinator': 'span ~ span',
  'type': 'span',
  'type_namespaced_any': '*|element',
  'type_namespaced': 'myNamespace|element',
  'universal_namespaced_empty': '|*',
  'universal_namespace': 'myNamespace|*',
};

Object.keys(selectors).forEach(key => {
  const ParserSuite = new Suite;

  const selector = selectors[key];
  const AnotherSelectorParserInput = selector;
  ParserSuite.add(`AnotherSelectorParserParser.${key}`, () => {
    const tokenizer = new AnotherSelectorParserTokenizer(
      AnotherSelectorParserInput
    );
    (new AnotherSelectorParserParser(tokenizer)).parse();
  });

  const PostCSSSelectorParserInput = { css: selector };
  ParserSuite.add(`PostCSSSelectorParserParser.${key}`, () => {
    new PostCSSSelectorParserParser(PostCSSSelectorParserInput);
  });

  ParserSuite.on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
    console.log('');
  })
  .run();
});
