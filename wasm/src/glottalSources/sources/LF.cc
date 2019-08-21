#include <emscripten/val.h>
#include <cmath>
#include "../ParameterDescriptor.h"
#include "LF.h"

using namespace emscripten;

LF::LF() noexcept : AbstractSource() {
    this->parameters.set("Oq", ParameterDescriptor(0.6, 0.26, 0.8));
    this->parameters.set("am", ParameterDescriptor(0.76, 0.74,
                                                   [](const auto& p) {
                                                       const float Oq = p.get("Oq").template as<ParameterDescriptor>().getValue();
                                                       return -0.23 * Oq + 1.01;
                                                   }));;

    this->resetParameters();
}

float LF::getSample(float t) {

    const float te = this->parameters["Oq"].getValue();

    if (t < te) {
        const float e0 = this->e0;
        const float wa = this->wa;
        const float a = this->a;

        // tp = te * am
        // Up = e0 * (exp(a * t) * (a * sin(wa * te * am) - wa * cos(wa * te * am)) + wa) / (a * a + wa * wa);

        return e0 * (exp(a * t) * (a * sin(wa * t) - wa * cos(wa * t)) + wa) / (a * a + wa * wa);
    }
    else {
        const float e1 = this->e1;
        const float mtc = this->mtc;
        const float rb = this->rb;

        return e1 * (exp(mtc / rb) * (t - 1 - rb) + exp((te - t) / rb) * rb);
    }

}

void LF::setParameters(val parameters) {
    if (const auto& opt = parameters["Oq"]; isType(opt, "number")) {
        this->parameters["Oq"].setValue(opt.as<float>());
    }
    if (const auto& opt = parameters["am"]; isType(opt, "number")) {
        this->parameters["am"].setValue(opt.as<float>());
    }

    const float te = this->parameters["Oq"].getValue();
    const float p2 = 0.1;

    const float tp = te * this->parameters["am"].getValue();

    this->mtc = te - 1.0;
    this->wa = M_PI / tp;

    this->a = -log(-p2 * sin(wa * te)) / te;

    // Calculate e0 according to target Up = 1
    this->e0 = (a * a + wa * wa) / (exp(a * tp) * (a * sin(wa * tp) - wa * cos(wa * tp)) + wa);

    const float int_a = e0 * ((wa / tan(wa * te) - a) / p2 + wa) / (a * a + wa * wa);

    // If int_a < 0, we should reduce p2
    // If int_a > 0.5 * p2 * (1 - te), we should increase p2
    const float rb0 = p2 * int_a; // Correct if rb << (1 - te)
    this->rb = rb0;

    // Use Newton method to determine rb.
    for (unsigned i = 0; i < 4; ++i) {
        const float kk = 1 - exp(this->mtc / this->rb);
        const float err = this->rb + this->mtc * (1 / kk - 1) - rb0;
        const float rt_derr = 1 - (1 - kk) * (this->mtc / this->rb / kk);

        this->rb -= err / (rt_derr * rt_derr);
    }

    this->e1 = 1 / (p2 * (1 - exp(this->mtc / this->rb)));
}