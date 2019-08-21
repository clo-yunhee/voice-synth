#include "ParameterDescriptor.h"

using namespace emscripten;

ParameterDescriptor::ParameterDescriptor(float defaultValue, RangeFunction minValue, RangeFunction maxValue)
    : value(defaultValue), defaultValue(defaultValue), minValue(minValue), maxValue(maxValue) {
}

ParameterDescriptor::ParameterDescriptor(float defaultValue, RangeFunction minValue, float maxValue)
    : ParameterDescriptor(defaultValue, minValue, [=](auto& p) { return maxValue; }) {
}

ParameterDescriptor::ParameterDescriptor(float defaultValue, float minValue, RangeFunction maxValue)
    : ParameterDescriptor(defaultValue, [=](auto& p) { return minValue; }, maxValue) {
}

ParameterDescriptor::ParameterDescriptor(float defaultValue, float minValue, float maxValue)
    : ParameterDescriptor(defaultValue, [=](auto& p) { return minValue; }, [=](auto& p) { return maxValue; }) {
}

ParameterDescriptor::ParameterDescriptor()
    : ParameterDescriptor(0.5, 0.1, 0.9) {
}

unsigned ParameterDescriptorMap::size() const {
    // select the right size method otherwise we'll recurse forever.
    return std::map<std::string, ParameterDescriptor>::size();
}

val ParameterDescriptorMap::get(const std::string& k) const {
    auto it = this->find(k);
    if (it == this->end()) {
        return val::undefined();
    }
    else {
        return val(it->second);
    }
}

void ParameterDescriptorMap::set(const std::string& k, const ParameterDescriptor& v) {
    (*this)[k] = v;
}

val ParameterDescriptorMap::entries() const {
    val entries = val::array();

    for (auto it = this->begin(); it != this->end(); ++it) {
        val entry = val::array();
        entry.set(0, it->first);

        val param = val::object();
        param.set("value", it->second.getValue());
        param.set("defaultValue", it->second.getDefaultValue());
        param.set("minValue", it->second.getMinValue(*this));
        param.set("maxValue", it->second.getMaxValue(*this));

        entry.set(1, param);

        entries.call<void>("push", entry);
    }

    return entries;
}