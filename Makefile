SRC := $(shell find src/ -iname '*.js' -and -not \( -path '*__tests__*' -or -path '*__fixtures__*' \))
LIB := $(SRC:src/%.js=lib/%.js)

FIXTURES := parser tokenizer
FIXTURES := $(foreach fixture,$(FIXTURES),fixtures_$(fixture))

.PHONY: clean fixtures

all: $(LIB)
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
