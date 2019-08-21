#ifndef KLGLOTT88_H
#define KLGLOTT88_H

#include <emscripten/val.h>
#include "../AbstractSource.h"

class KLGLOTT88 : public AbstractSource {
public:
    explicit KLGLOTT88() noexcept;

    void setParameters(emscripten::val parameters) final;

protected:
    float getSample(float t);
};

#endif // KLGLOTT88_H