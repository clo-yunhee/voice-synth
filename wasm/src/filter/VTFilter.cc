#include <emscripten/bind.h>
#include <cmath>
#include <iostream>
#include "VTFilter.h"
#include "signal.h"

using namespace emscripten;
using namespace Eigen;

VTFilter::VTFilter() noexcept {
    this->spectralTilt = -5;
    this->frequencies = {700, 2100, 3000, 4200, 4700};
    this->bandwidths = {60, 90, 100, 120, 120};

    this->lasty = Array2Xd::Zero(2, 1);
    this->calculateFilter();
    this->lasty.resize(2, this->zi.cols());
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

        // Map input and output buffers to Eigen objects.
        Map<const ArrayXf> arrIn(input, kRenderQuantumFrames);
        Map<ArrayXf> arrOut(output, kRenderQuantumFrames);

        // Set the input variables.
        ArrayXd x = arrIn.cast<double>();
        ArrayXd zi = this->zi.row(ch);

        // Apply the filter.
        filter_out<ArrayXd> st = filter(this->B, this->A, x, zi);

        // Set the output variables.
        arrOut = st.y.cast<float>();

        this->zi.row(ch) = st.zi;
        this->lasty.row(ch) = st.y.tail(zi.size()).reverse();
    }

}

void VTFilter::calculateFormantFilter(unsigned i, ArrayXd& B, ArrayXd& A) {

    double TL = this->spectralTilt;

    double fc = this->frequencies[i];
    double bw = this->bandwidths[i];

    // Calculate the gain based on the formant frequency and the spectral tilt.
    //double g = pow(10.0, TL / 20.0) / (log2(fc) - log2(130.0));

    double r = exp(-M_PI * bw / sampleRate);
    double wc = 2 * M_PI * fc / sampleRate;

    double b0 = (1 - r) * sqrt(1 - 2 * r * cos(2 * wc) + (r * r));

    double a1 = -2 * r * cos(wc);
    double a2 = r * r;

    B.resize(1);
    B << b0;

    A.resize(3);
    A << 1, a1, a2;

}

void VTFilter::calculateFilter() {

    // Calculate the filter coefficients for each formant.

    double gain = 12e6;

    this->B = ArrayXd::Constant(1, gain);
    this->A = ArrayXd::Ones(1);

    ArrayXd Bs, As;

    for (unsigned i = 0; i < formantCount; ++i) {
        calculateFormantFilter(i, Bs, As);

        B = conv(B, Bs);
        A = conv(A, As);
    }

    // Initialise filter state

    unsigned lab = std::max(this->B.size(), this->A.size());

    this->zi.resize(2, lab - 1);

    for (unsigned ch = 0; ch < 2; ++ch) {

        ArrayXd lasty = this->lasty.row(ch);

        this->zi.row(ch) = filtic(this->B, this->A, lasty);
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
