import { Suite } from 'benchmark';
import { default as AnotherSelectorParserTokenizer } from 'another-selector-parser/lib/tokenizer';
import { default as PostCSSSelectorParserTokenizer } from 'postcss-selector-parser/dist/tokenize';

const selectors = {
  'comments_multiline_comment': '/**\nnew line1\nnewline 2\nnewline 3**/',
  'comments_multiple_comment': '/* a comment *//* another comment */',
  'comments_single_comment': '/* a comment */',
  'escaped_hex_1': '\\1',
  'escaped_hex_1_followed_by_linebreak_n': '\\1\\nsomeIdent',
  'escaped_hex_1_followed_by_linebreak_r': '\\1\\rsomeIdent',
  'escaped_hex_1_followed_by_linebreak_rn': '\\1\\r\\nsomeIdent',
  'escaped_hex_1_followed_by_non_hex': '\\1moreIdent',
  'escaped_hex_1_followed_by_whitespace': '\\1 moreIdent',
  'escaped_hex_2': '\\01',
  'escaped_hex_3': '\\001',
  'escaped_hex_4': '\\0001',
  'escaped_hex_5': '\\00001',
  'escaped_hex_6': '\\000001',
  'escaped_hex_7': '\\0000011',
  'escaped_n': 'SomeIdent\\nMoreIdent',
  'escaped_r': 'SomeIdent\\vMoreIdent',
  'escaped_t': 'SomeIdent\\tMoreIdent',
  'escaped_v': 'SomeIdent\\vMoreIdent',
  'ident': 'someIdent',
  'ident_starting_with_minus': '-someIdent',
  'ident_with_escape': 'someIdent\\r',
  'location_tracking_columns': 'EndsAt7 EndsAt16',
  'location_tracking_lines': 'OnLine1',
  'numbers_float10': '1.e-1',
  'numbers_float1': '1.0',
  'numbers_float2': '1.',
  'numbers_float3': '.0',
  'numbers_float4': '1e1',
  'numbers_float5': '1e-1',
  'numbers_float6': '1e+1',
  'numbers_float7': '1E1',
  'numbers_float8': '1.E1',
  'numbers_float9': '1.e+1',
  'numbers_integer': '1',
  'string_double_quotes': '"a string in double quotes"',
  'string_double_quotes_with_escape': '"a string in double quotes and some escaped \\"value\\""',
  'string_singlq_quotes': "'a string in single quotes'",
  'string_singlq_quotes_white_escape': "'a string in single quotes and some escaped \\'value\\''",
  'token_bracketL': '[',
  'token_bracketR': ']',
  'token_caret_equal': '^=',
  'token_colon': ':',
  'token_comma': ',',
  'token_dollar_equal': '$=',
  'token_dot': '.',
  'token_greater': '>',
  'token_greater_greater': '>>',
  'token_hash': '#',
  'token_minus': '-',
  'token_parenL': '(',
  'token_parenR': ')',
  'token_percentage': '%',
  'token_pipe_equal': '|=',
  'token_pipe': '|',
  'token_plus': '+',
  'token_star_equal': '|=',
  'token_star': '*',
  'token_tilde_equal': '~=',
  'token_tilde': '~',

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
  const TokenizerSuite = new Suite;

  const selector = selectors[key];
  const AnotherSelectorTokenizerInput = selector;
  TokenizerSuite.add(`AnotherSelectorParserTokenizer.${key}`, () => {
    const tokenizer = new AnotherSelectorParserTokenizer(
      AnotherSelectorTokenizerInput
    );
    const tokens = [];
    let token;
    for (
      token = tokenizer.nextToken();
      token.type !== 'EOF';
      token = tokenizer.nextToken()
    ) {
      tokens.push(token);
    }
    tokens.push(token);
  });

  const PostCSSSelectorTokenizerInput = { 
    css: selector,
    error: (e) => {
      throw new Error(e);
    }
  };
  TokenizerSuite.add(`PostCSSSelectorParserTokenizer.${key}`, () => {
    PostCSSSelectorParserTokenizer(PostCSSSelectorTokenizerInput);
  });

  TokenizerSuite.on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
    console.log('');
  })
  .run();
});
