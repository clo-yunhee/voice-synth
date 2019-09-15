TARGET = vocalTractFilter.js

DEPS = VTFilter.cc bindings.cc

build: $(DEPS)
	@emcc --bind \
	    -I/usr/local/include/eigen3 \
		-I../lib \
        -std=c++17 \
        -s SINGLE_FILE=1 \
        -s MODULARIZE_INSTANCE=1 \
        -s EXPORT_NAME='FilterModule' \
        -s WASM=1 \
		-s BINARYEN_ASYNC_COMPILATION=0 \
		-s ASSERTIONS=0 \
		-O1 \
		$(DEPS) \
		-o ../../build/$(TARGET) \
		--pre-js ../lib/wasm-audio-helper.js \
		--post-js ./processor.js

clean:
	@rm -f ../../build/$(TARGET)
