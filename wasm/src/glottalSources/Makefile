TARGET = glottalSources.js

DEPS = AbstractSource.cc ParameterDescriptor.cc bindings.cc
SOURCES = sources/LF.cc sources/CutoffSawtooth.cc sources/RosenbergC.cc sources/KLGLOTT88.cc

build: $(DEPS)
	@emcc --bind \
        -std=c++17 \
        -s SINGLE_FILE=1 \
        -s MODULARIZE_INSTANCE=1 \
        -s EXPORT_NAME='SourcesModule' \
        -s WASM=1 \
		-s BINARYEN_ASYNC_COMPILATION=0 \
		-s ASSERTIONS=0 \
		-O1 \
		$(DEPS) $(SOURCES) \
		-o ../../build/$(TARGET) \
		--pre-js ../lib/wasm-audio-helper.js \
		--post-js ./processor.js

clean:
	@rm -f ../../build/$(TARGET)
