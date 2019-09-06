#pragma once

#include <emscripten/val.h>
#include "../AbstractSource.h"

class RosenbergC : public AbstractSource {
public:
    explicit RosenbergC() noexcept;

    void setParameters(emscripten::val parameters) final;

protected:
    float getSample(float t);
};
