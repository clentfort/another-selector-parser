import { Suite } from 'benchmark';
import { default as AnotherSelectorParserParser } from 'another-selector-parser/lib/parser';
import { default as AnotherSelectorParserTokenizer } from 'another-selector-parser/lib/tokenizer';
import { default as PostCSSSelectorParserParser } from 'postcss-selector-parser/dist/parser';

const selectors = {
  'error_attribute_invalid_attribute': '["string as attribute"]',
  'error_attribute_invalid_flag': '[attr=value A]',
  'error_attribute_invalid_matcher': '[attr.value]',
  'error_attribute_invalid_value': '[attr$=45]',
  'error_attribute_unclosed': ':someUnclosed(call',
  'error_negation_unclosed': ':not(a',
  'error_negation_with_combintaor': ':not(a + b)',
  'error_nth_child_invalid_of': ':nth-child(2n+1 off .test)',
  'error_nth_child_invalid_offset2': ':nth-child(2n-a)',
  'error_nth_child_invalid_offset': ':nth-child(2n+1 of .test',
  'error_nth_child_unfinished': ':nth-child(2n~1)',
  'error_pseudo_call_expression_unclosed': '[attr$="value"',
  'error_selector_unfinished': 'span +',
  'error_starts_with_combinator': '+ selector',
};

Object.keys(selectors).forEach(key => {
  const ParserSuite = new Suite;

  const selector = selectors[key];
  const AnotherSelectorParserInput = selector;
  ParserSuite.add(`AnotherSelectorParserParser.${key}`, () => {
    const tokenizer = new AnotherSelectorParserTokenizer(
      AnotherSelectorParserInput
    );
    try {
      (new AnotherSelectorParserParser(tokenizer)).parse();
    } catch (e) {
    }
  });

  const PostCSSSelectorParserInput = { 
    css: selector,
    error: (e) => {
      throw new Error(e);
    }
  };
  ParserSuite.add(`PostCSSSelectorParserParser.${key}`, () => {
    try {
      new PostCSSSelectorParserParser(PostCSSSelectorParserInput);
    } catch (e) {
    }
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
