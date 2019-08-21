#include <emscripten/val.h>
#include <cmath>
#include "../ParameterDescriptor.h"
#include "RosenbergC.h"

using namespace emscripten;

RosenbergC::RosenbergC() noexcept : AbstractSource() {
    this->parameters.set("Oq", ParameterDescriptor(0.6, 0.2, 0.8));
    this->parameters.set("am", ParameterDescriptor(0.67, 0.55, 0.9));

    this->resetParameters();
}

float RosenbergC::getSample(float t) {

    const float Oq = this->parameters["Oq"].getValue();
    const float am = this->parameters["am"].getValue();

    const float Tp = Oq * am;
    const float Tn = Oq * (1.0 - am);

    if (t <= Tp) {
        return 0.5 * (1.0 - cos(M_PI * t / Tp));
    }
    else if (t <= Tp + Tn) {
        return cos(M_PI / 2.0 * (t - Tp) / Tn);
    }
    else {
        return 0.0;
    }

}

void RosenbergC::setParameters(val parameters) {
    if (const auto& opt = parameters["Oq"]; isType(opt, "number")) {
        this->parameters["Oq"].setValue(opt.as<float>());
    }
    if (const auto& opt = parameters["am"]; isType(opt, "number")) {
        this->parameters["am"].setValue(opt.as<float>());
    }
}