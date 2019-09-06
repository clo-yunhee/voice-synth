#include <emscripten/bind.h>
#include <cmath>
#include <iostream>
#include "VTFilter.h"
#include "signal.h"

using namespace emscripten;
using namespace Eigen;

VTFilter::VTFilter() noexcept {
    this->frequencies = {700, 2100, 3000, 4200, 4700};
    this->bandwidths = {60, 90, 100, 120, 120};

    this->lastx = ArrayXd::Zero(0);
    this->lasty = ArrayXd::Zero(0);
    this->calculateFilter();
}

void VTFilter::getFrequencyResponse(val frequencies, val response) {

    unsigned length = response["length"].as<unsigned>();

    ArrayXd F(length);
    for (unsigned k = 0; k < length; ++k) {
        F(k) = frequencies[k].as<double>();
    }

    ArrayXd h = freqz(this->B, this->A, F, sampleRate);

    for (unsigned k = 0; k < length; ++k) {
        val point = val::object();
        point.set("x", F(k));
        point.set("y", h(k));

        response.set(k, point);
    }

}

void VTFilter::process(uintptr_t inputPtr, uintptr_t outputPtr, unsigned channelCount) {

    float *inputBuffer = reinterpret_cast<float*>(inputPtr);
    float *outputBuffer = reinterpret_cast<float*>(outputPtr);

    for (unsigned ch = 0; ch < channelCount; ++ch) {
        float *input = &inputBuffer[ch * kRenderQuantumFrames];
        float *output = &outputBuffer[ch * kRenderQuantumFrames];

        // Apply the filter.

        ArrayXd x(kRenderQuantumFrames);
        for (unsigned k = 0; k < kRenderQuantumFrames; ++k) {
            x(k) = input[k];
        }

        ArrayXd y = filter(this->B, this->A, x, this->lasty, this->lastx);

        for (unsigned k = 0; k < kRenderQuantumFrames; ++k) {
            output[k] = y(k);
        }
    }

}

void VTFilter::calculateFilter() {

    // Calculate the poles for the transfer function denominator polynomial.

    ArrayXcd poles(2 * formantCount);

    for (unsigned k = 0; k < formantCount; ++k) {
        const float f = this->frequencies[k];
        const float bw = 200;//this->bandwidths[k];

        const double r = exp(-M_PI * f / sampleRate);
        const double phi = 2.0 * M_PI * bw / sampleRate;

        const complex pole = std::polar(r, phi);

        poles(2*k) = pole;
        poles(2*k+1) = std::conj(pole);
    }

    // Calculate the filter coefficients from poles.

    this->B = ArrayXd::Ones(1);
    this->A = real(poly(poles));

    if (this->lastx.size() != this->B.size()) {
        this->lastx = ArrayXd::Zero(this->B.size());
    }

    if (this->lasty.size() != this->A.size()) {
        this->lasty = ArrayXd::Zero(this->A.size());
    }
}

void VTFilter::setFrequency(unsigned i, float frequency) {
    this->frequencies[i] = frequency;
    this->calculateFilter();
}

void VTFilter::setBandwidth(unsigned i, float bandwidth) {
    this->bandwidths[i] = bandwidth;
    this->calculateFilter();
}

bool isType(val value, const std::string& type) {
    return (value.typeof().as<std::string>() == type);
}
