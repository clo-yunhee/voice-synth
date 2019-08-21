#include <emscripten/val.h>
#include <cmath>
#include "../ParameterDescriptor.h"
#include "KLGLOTT88.h"

using namespace emscripten;

KLGLOTT88::KLGLOTT88() noexcept : AbstractSource() {
    this->parameters.set("Oq", ParameterDescriptor(0.6, 0.2, 0.9));

    this->resetParameters();
}

float KLGLOTT88::getSample(float t) {

    const float Oq = this->parameters["Oq"].getValue();

    if (t < Oq) {
        const float tOq2 = (27.0 * t * t) / (4.0 * Oq * Oq);
        const float tOq3 = (27.0 * t * t * t) / (4.0 * Oq * Oq * Oq);

        return (tOq2 - tOq3);
    }
    else {
        return 0;
    }

}

void KLGLOTT88::setParameters(val parameters) {
    if (const auto& opt = parameters["Oq"]; isType(opt, "number")) {
        this->parameters["Oq"].setValue(opt.as<float>());
    }
}