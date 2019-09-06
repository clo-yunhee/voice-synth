#pragma once

#include <emscripten/val.h>
#include <string>
#include "ParameterDescriptor.h"

constexpr unsigned kRenderQuantumFrames = 128;
constexpr unsigned kBytesPerChannel = kRenderQuantumFrames * sizeof(float);
constexpr float sampleRate = 48000;

class AbstractSource {
public:
    AbstractSource() noexcept;
    virtual ~AbstractSource() = default;

    void createPlotData(emscripten::val array);
    void process(uintptr_t outputPtr, unsigned channelCount);

    void setFrequency(float frequency);

    void resetParameters();
    const ParameterDescriptorMap& getParameters();

    virtual void setParameters(emscripten::val parameters) = 0;

protected:
    virtual float getSample(float t) = 0;

    float lastF0;
    float frequency;
    unsigned index;

    ParameterDescriptorMap parameters;
};

bool isType(emscripten::val value, const std::string& type);
