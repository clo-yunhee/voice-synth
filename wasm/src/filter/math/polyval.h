#pragma once

template<typename PolyType, typename ArrayType>
ArrayType polyval(const PolyType& p, const ArrayType& x) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    ArrayXs y = ArrayXs::Constant(x.size(), p(0));

    for (unsigned i = 1; i < p.size(); ++i) {
        y = y * x + p(i);
    }

    return y;

}
