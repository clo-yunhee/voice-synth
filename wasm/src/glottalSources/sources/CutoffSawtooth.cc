#include <emscripten/val.h>
#include <cmath>
#include "../ParameterDescriptor.h"
#include "CutoffSawtooth.h"

using namespace emscripten;

CutoffSawtooth::CutoffSawtooth() noexcept : AbstractSource() {
    this->parameters.set("Oq", ParameterDescriptor(0.6, 0.2, 0.8));

    this->resetParameters();
}

float CutoffSawtooth::getSample(float t) {

    const float Oq = this->parameters["Oq"].getValue();

    if (t < Oq) {
        return t / Oq;
    }
    else {
        return 0.0;
    }

}

void CutoffSawtooth::setParameters(val parameters) {
    if (const auto& opt = parameters["Oq"]; isType(opt, "number")) {
        this->parameters["Oq"].setValue(opt.as<float>());
    }
}