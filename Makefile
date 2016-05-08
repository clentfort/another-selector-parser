FIND := $(patsubst src/%.js,lib/%.js,$(shell find src/$(1) -iname '*.js' -and -not \( -path '*__tests__*' -or -path '*__fixtures__*' \)))

PARSER := $(call FIND,parser)
TOKENIZER := $(call FIND,tokenizer)
UTIL := $(call FIND,util)

FIXTURES := parser tokenizer
FIXTURES := $(foreach fixture,$(FIXTURES),fixtures_$(fixture))

.PHONY: clean fixtures

all: util tokenizer parser
parser: $(PARSER)
tokenizer: $(TOKENIZER)
util: $(UTIL)

lib/%.js: src/%.js .babelrc
	@echo Compiling $<
	@mkdir -p $(@D)
	@babel \
		--out-file $@ \
		$<

fixtures: $(FIXTURES)
$(FIXTURES):
	$(eval COMPONENT := $(patsubst fixtures_%,%,$@))
	@echo Recreating fixtures for $(COMPONENT)
	@./scripts/regenerateFixtures src/$(COMPONENT)/__fixtures__

clean:
	@echo Cleaning up
	@rm -rf lib/
