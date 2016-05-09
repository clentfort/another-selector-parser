FIND := $(patsubst src/%.js,dist/%.js,$(shell find src/$(1) -iname '*.js' -and -not \( -path '*__tests__*' -or -path '*__fixtures__*' \)))

PARSER := $(call FIND,parser)
PLUGINS := $(call FIND,plugins)
TOKENIZER := $(call FIND,tokenizer)
TRAVERSER := $(call FIND,traverser)
UTIL := $(call FIND,util)

FIXTURES := parser tokenizer
FIXTURES := $(foreach fixture,$(FIXTURES),fixtures_$(fixture))

.PHONY: clean fixtures

all: parser plugins tokenizer traverser util 
parser: $(PARSER)
plugins: $(PLUGINS)
tokenizer: $(TOKENIZER)
traverser: $(TRAVERSER)
util: $(UTIL)

dist/%.js: src/%.js .babelrc
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
