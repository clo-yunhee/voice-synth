#pragma once

template<typename ArrayType>
ArrayType conv(const ArrayType& x, const ArrayType& y) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    int lx = x.size();
    int ly = y.size();

    int lw = lx + ly - 1;

    ArrayXs w = ArrayXs::Zero(lw);

    for (int k = 0; k < lw; ++k) {

        int i = k;

        for (int j = 0; j < ly; ++j) {
            if (i >= 0 && i < lx) {
                w(k) += x(i) * y(j);
            }

            i--;
        }
    }

    return w;

}