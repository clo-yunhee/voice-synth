#pragma once

template<typename ArrayType>
ArrayType filter(const ArrayType& b_, const ArrayType& a_, const ArrayType& x,
                 ArrayType& lasty, ArrayType& lastx) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    ArrayXs b = b_;
    ArrayXs a = a_;

    while (a.size() > 1 && a(0) == 0.0) {
        a = a.segment(1, a.size() - 1);
    }

    if (a(0) != 1.0) {
        b /= a(0);
        a /= a(0);
    }

    unsigned la = a.size();
    unsigned lb = b.size();
    unsigned lx = x.size();

    ArrayXs y(lx);

    for (unsigned k = 0; k < lx; ++k) {
        y(k) = 0.0;

        // Feed-forward part.
        for (int m = 0; m < lb; ++m) {
            if (k < m) {
                y(k) += b(m) * lastx(m);
            }
            else {
                y(k) += b(m) * x(k - m);
            }
        }

        // Feed-back part.
        for (int n = 1; n < la; ++n) {
            if (k < n) {
                y(k) -= a(n) * lasty(n);
            }
            else {
                y(k) += a(n) * y(k - n);
            }
        }
    }

    lastx = x.tail(lb).reverse();
    lasty = y.tail(la).reverse();

    return y;
}
