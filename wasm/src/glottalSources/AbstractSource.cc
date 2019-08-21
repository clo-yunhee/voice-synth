#include <emscripten/bind.h>
#include <cmath>
#include <iostream>
#include "AbstractSource.h"
#include "ParameterDescriptor.h"

using namespace emscripten;

AbstractSource::AbstractSource() noexcept {
    this->index = 0;
    this->lastF0 = 0.0;
}

void AbstractSource::resetParameters() {
    val defaultParameters = val::object();
    for (auto [key, desc] : this->parameters) {
        defaultParameters.set(key, desc.getDefaultValue());
    }

    this->setParameters(defaultParameters);
}

const ParameterDescriptorMap& AbstractSource::getParameters() {
    return this->parameters;
}

void AbstractSource::createPlotData(val array) {
    const unsigned length = array["length"].as<unsigned>();

    float t, y;
    float maxAmplitude = -INFINITY;

    for (unsigned k = 0; k < length; ++k) {
        // Include the end!!
        t = k / float(length - 1);
        y = this->getSample(t);

        if (abs(y) > maxAmplitude) {
            maxAmplitude = abs(y);
        }

        val point = val::object();
        point.set("x", t);
        point.set("y", y);

        array.set(k, point);
    }
}

void AbstractSource::process(uintptr_t outputPtr, unsigned channelCount) {
    float *outputBuffer = reinterpret_cast<float*>(outputPtr);

    if (this->lastF0 <= 0) {
        this->lastF0 = this->frequency;
    }

    float t0 = sampleRate / this->lastF0;

    for (unsigned ch = 0; ch < channelCount; ++ch) {
        float *output = &outputBuffer[ch * kRenderQuantumFrames];

        for (unsigned k = 0; k < kRenderQuantumFrames; ++k) {
            output[k] = this->getSample(this->index / t0);

            this->index++;

            if (this->index >= t0) {
                this->lastF0 = this->frequency;
                t0 = sampleRate / this->lastF0;
                this->index = 0;
            }
        }
    }
}

void AbstractSource::setFrequency(float frequency) {
    this->frequency = frequency;
}

bool isType(val value, const std::string& type) {
    return (value.typeof().as<std::string>() == type);
}