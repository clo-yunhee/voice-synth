#pragma once

template<typename ArrayType>
ArrayType filtic(const ArrayType& b_, const ArrayType& a_, const ArrayType& y_, const ArrayType& x_) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    unsigned nz = std::max(a_.size(), b_.size()) - 1;

    ArrayXs zf = ArrayXs::Zero(nz);

    // Pad a and b to length nz + 1
    ArrayXs a = (ArrayXs(nz + 1) << a_, ArrayXs::Zero(nz + 1 - a_.size())).finished();
    ArrayXs b = (ArrayXs(nz + 1) << b_, ArrayXs::Zero(nz + 1 - b_.size())).finished();

    // Pad x and y to length nz
    ArrayXs x = (ArrayXs(nz) << x_, ArrayXs::Zero(nz - x_.size())).finished();
    ArrayXs y = (ArrayXs(nz) << y_, ArrayXs::Zero(nz - y_.size())).finished();

    for (int i = nz - 1; i >= 0; --i) {
        for (unsigned j = i; j < nz - 1; ++j) {
            zf(j) = b(j + 1) * x(i) - a(j + 1) * y(i) + zf(j + 1);
        }
        zf(nz - 1) = b(nz) * x(i) - a(nz) * y(i);
    }

    return zf / a(0);

}

template<typename ArrayType>
ArrayType filtic(const ArrayType& b, const ArrayType& a, const ArrayType& y) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    ArrayXs x = ArrayXs::Zero(1);

    return filtic(b, a, y, x);
}