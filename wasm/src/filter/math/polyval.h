#pragma once

template<typename PolyType, typename ArrayType>
ArrayType polyval(const PolyType& p, const ArrayType& x) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    ArrayXs y = ArrayXs::Constant(x.size(), p(p.size() - 1));

    for (unsigned i = p.size() - 2; i >= 1; --i) {
        y = y * x + Scalar(p(i));
    }

    return y;

}
