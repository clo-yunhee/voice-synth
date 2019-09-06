#pragma once

#include <Eigen/QR>
#include <algorithm>

template<typename ArrayType>
ArrayType filter_zi(const ArrayType& b_, const ArrayType& a_) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;
    using MatrixXs = Matrix<Scalar, Dynamic, Dynamic>;

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

    unsigned n = std::max(la, lb);

    if (la < n) {
        a = (ArrayXs(n) << a, ArrayXs::Zero(n - la)).finished();
    }
    else if (lb < n) {
        b = (ArrayXs(n) << b, ArrayXs::Zero(n - lb)).finished();
    }

    MatrixXs A(n - 1, n - 1);
    A.diagonal(1).setOnes();
    A.row(n - 2) = -a.head(n - 1);

    MatrixXs IminusA = MatrixXs::Identity(n - 1, n - 1) - A;
    MatrixXs B = b.segment(1, n - 1) - b(0) * a.segment(1, n - 1);

    // Solve zi = A*zi + B  <=>  (I - A)*zi = B

    ArrayXs zi = ArrayXs::Zero(n - 1);
    zi(0) = B.sum() / IminusA.col(0).sum();
    double asum = 1.0;
    double csum = 1.0;
    for (unsigned k = 1; k < n - 1; ++k) {
        asum += a(k);
        csum += b(k) - a(k) * b(0);
        zi(k) = asum * zi(0) - csum;
    }

    return zi;

}
