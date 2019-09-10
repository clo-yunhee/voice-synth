#pragma once

template<typename ArrayType>
ArrayType filtic(const ArrayType& b_, const ArrayType& a_, const ArrayType& y_, const ArrayType& x_) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    ArrayXs b = b_;
    ArrayXs a = a_;

    unsigned la = a.size();
    unsigned lb = b.size();
    unsigned lab = std::max(la, lb);

    // Pad a and b to length lz - 1
    b.conservativeResize(lab);
    b.tail(lab - lb).setZero();

    a.conservativeResize(lab);
    a.tail(lab - la).setZero();

    b /= a(0);
    a /= a(0);

    unsigned lz = lab - 1;

    ArrayXs zf = ArrayXd::Zero(lz);

    // Pad x and y to length lz
    ArrayXs x = x_;
    ArrayXs y = y_;

    x.conservativeResize(lz);
    x.tail(lz - x_.size()).setZero();

    y.conservativeResize(lz);
    y.tail(lz - y_.size()).setZero();

    for (int i = lz - 1; i >= 0; --i) {
        for (unsigned j = i; j < lz - 1; ++j) {
            zf(j) = b(j + 1) * x(i) - a(j + 1) * y(i) + zf(j + 1);
        }
        zf(lz - 1) = b(lz) * x(i) - a(lz) * y(i);
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