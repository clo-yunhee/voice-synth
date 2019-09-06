#ifndef VT_FILTER_H
#define VT_FILTER_H

#include <emscripten/val.h>
#include <Eigen/Core>
#include <array>
#include <string>

constexpr unsigned kRenderQuantumFrames = 128;
constexpr unsigned kBytesPerChannel = kRenderQuantumFrames * sizeof(float);
constexpr float sampleRate = 48000;

constexpr unsigned formantCount = 5;

class VTFilter {
public:
    VTFilter() noexcept;
    virtual ~VTFilter() = default;

    void getFrequencyResponse(emscripten::val frequencies, emscripten::val magResponse);

    void setFrequency(unsigned i, float frequency);
    void setBandwidth(unsigned i, float bandwidth);

    void process(uintptr_t inputPtr, uintptr_t outputPtr, unsigned channelCount);

private:
    std::array<float, formantCount> frequencies;
    std::array<float, formantCount> bandwidths;

    Eigen::ArrayXd zi, lastx, lasty;
    Eigen::ArrayXd B, A;

    void calculateFilter();
};

bool isType(emscripten::val value, const std::string& type);

#endif // VT_FILTER_H
