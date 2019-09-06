#pragma once

template<typename ArrayType>
ArrayType polyreduce(const ArrayType& c) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    // Find first index for which c is nonzero.
    unsigned idx = 0;
    while (idx < c.size() && c(idx) == 0.0) {
        idx++;
    }

    if (idx == c.size()) {
        return c(idx - 1) != 0.0 ? c : ArrayXs::Zero(1);
    }

    return c.tail(c.size() - idx);
}
