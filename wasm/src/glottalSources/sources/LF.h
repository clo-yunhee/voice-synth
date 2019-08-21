#ifndef LF_H
#define LF_H

#include <emscripten/val.h>
#include "../AbstractSource.h"

class LF : public AbstractSource {
public:
    explicit LF() noexcept;

    void setParameters(emscripten::val parameters) final;

protected:
    float getSample(float t);

private:
    float e0, e1;
    float a, rb;
    float mtc, wa;
};

#endif // LF_H