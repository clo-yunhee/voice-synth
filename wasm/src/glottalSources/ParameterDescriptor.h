#ifndef PARAMETER_DESCRIPTOR_H
#define PARAMETER_DESCRIPTOR_H

#include <emscripten/val.h>
#include <functional>
#include <map>

class ParameterDescriptorMap;

using RangeFunction = std::function<float(const ParameterDescriptorMap&)>;

class ParameterDescriptor {
public:
    explicit ParameterDescriptor();

    ParameterDescriptor(float defaultValue, RangeFunction minValue, RangeFunction maxValue);
    ParameterDescriptor(float defaultValue, RangeFunction minValue, float maxValue);
    ParameterDescriptor(float defaultValue, float minValue, RangeFunction maxValue);
    ParameterDescriptor(float defaultValue, float minValue, float maxValue);

    float getValue() const { return this->value; }
    void setValue(float value) { this->value = value; }

    float getDefaultValue() const { return this->defaultValue; }
    float getMinValue(const ParameterDescriptorMap& p) const { return this->minValue(p); }
    float getMaxValue(const ParameterDescriptorMap& p) const { return this->maxValue(p); }

private:
    float value;
    float defaultValue;
    RangeFunction minValue;
    RangeFunction maxValue;
};

class ParameterDescriptorMap : public std::map<std::string, ParameterDescriptor> {
public:
    unsigned size() const;
    emscripten::val get(const std::string& k) const;
    void set(const std::string& k, const ParameterDescriptor& v);
    emscripten::val entries() const;
};

#endif // PARAMETER_DESCRIPTOR_H