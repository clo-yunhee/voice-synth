#ifndef CUTOFF_SAWTOOTH_H
#define CUTOFF_SAWTOOTH_H

#include <emscripten/val.h>
#include "../AbstractSource.h"

class CutoffSawtooth : public AbstractSource {
public:
    explicit CutoffSawtooth() noexcept;

    void setParameters(emscripten::val parameters) final;

protected:
    float getSample(float t);
};

#endif // CUTOFF_SAWTOOTH_H