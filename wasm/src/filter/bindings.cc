#include <emscripten/bind.h>
#include "VTFilter.h"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(vocalTractFilter) {
    class_<VTFilter>("VTFilter")
        .constructor()
        .function("getFrequencyResponse", &VTFilter::getFrequencyResponse)
        .function("setFrequency", &VTFilter::setFrequency)
        .function("setBandwidth", &VTFilter::setBandwidth)
        .function("process", &VTFilter::process, allow_raw_pointers());
}