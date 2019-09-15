#pragma once

template<typename ArrayType>
filter_out<ArrayType> filter(const ArrayType& b_, const ArrayType& a_, const ArrayType& x, const ArrayType& zi) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    ArrayXs b = b_;
    ArrayXs a = a_;

    unsigned la = a.size();
    unsigned lb = b.size();
    unsigned lab = std::max(la, lb);

    b.conservativeResize(lab);
    b.tail(lab - lb).setZero();

    a.conservativeResize(lab);
    a.tail(lab - la).setZero();

    b /= a(0);
    a /= a(0);

    unsigned lz = lab - 1;
    unsigned lx = x.size();

    ArrayXs y(lx);
    ArrayXs zf = zi;

    if (la > 1) {

        for (unsigned i = 0; i < lx; ++i) {
            y(i) = zf(0) + b(0) * x(i);

            if (lz > 0) {
                for (unsigned j = 0; j < lz - 1; ++j) {
                    zf(j) = zf(j + 1) + b(j + 1) * x(i) - a(j + 1) * y(i);
                }

                zf(lz - 1) = b(lz) * x(i) - a(lz) * y(i);
            }
            else {
                zf(0) = b(lz) * x(i) - a(lz) * y(i);
            }
        }

    }
    else if (lz > 0) {

        for (unsigned i = 0; i < lx; ++i) {
            y(i) = zf(0) + b(0) * x(i);

            if (lz > 1) {
                for (unsigned j = 0; j < lz - 1; ++j) {
                    zf(j) = zf(j + 1) + b(j + 1) * x(i);
                }

                zf(lz - 1) = b(lz) * x(i);
            }
            else {
                zf(0) = b(1) * x(i);
            }
        }

    }

    filter_out<ArrayXs> st;
    st.y = y;
    st.zi = zf;

    return st;
}

template<typename ArrayType>
filter_out<ArrayType> filter(const ArrayType& b, const ArrayType& a, const ArrayType& x) {

    unsigned lab = std::max(b.size(), a.size());
    ArrayType zi = ArrayXd::Zero(lab - 1);

    return filter(b, a, x, zi);
}