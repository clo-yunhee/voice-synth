#include <emscripten/bind.h>
#include "AbstractSource.h"
#include "ParameterDescriptor.h"
#include "sources/LF.h"
#include "sources/CutoffSawtooth.h"
#include "sources/RosenbergC.h"
#include "sources/KLGLOTT88.h"

using namespace emscripten;

#define SOURCE(name) class_<name, base<AbstractSource>>(#name).constructor()

EMSCRIPTEN_BINDINGS(glottalSources) {
    class_<ParameterDescriptor>("ParameterDescriptor")
        .property("value", &ParameterDescriptor::getValue, &ParameterDescriptor::setValue)
        .property("defaultValue", &ParameterDescriptor::getDefaultValue)
        .function("getMinValue", &ParameterDescriptor::getMinValue)
        .function("getMaxValue", &ParameterDescriptor::getMaxValue);

    class_<ParameterDescriptorMap>("ParameterDescriptorMap")
        .constructor()
        .function("size", &ParameterDescriptorMap::size)
        .function("get", &ParameterDescriptorMap::get)
        .function("set", &ParameterDescriptorMap::set)
        .function("entries", &ParameterDescriptorMap::entries);

    class_<AbstractSource>("AbstractSource")
        .function("createPlotData", &AbstractSource::createPlotData)
        .function("process", &AbstractSource::process, allow_raw_pointers())
        .function("setFrequency", &AbstractSource::setFrequency)
        .function("resetParameters", &AbstractSource::resetParameters)
        .function("setParameters", &AbstractSource::setParameters, pure_virtual())
        .function("getParameters", &AbstractSource::getParameters, pure_virtual());

    SOURCE(LF);
    SOURCE(CutoffSawtooth);
    SOURCE(RosenbergC);
    SOURCE(KLGLOTT88);
}