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
        a = a.tail(a.size() - 1).eval();
    }

    b /= a(0);
    a /= a(0);

    unsigned la = a.size();
    unsigned lb = b.size();

    unsigned n = std::max(la, lb);

    b.conservativeResize(n);
    b.tail(n - lb).setZero();

    a.conservativeResize(n);
    a.tail(n - la).setZero();

    MatrixXs A(n - 1, n - 1);
    A.col(0) = -a.tail(n - 1);
    A.diagonal(1).setOnes();

    MatrixXs IminusA = MatrixXs::Identity(n - 1, n - 1) - A;
    MatrixXs B = b.tail(n - 1) - a.tail(n - 1) * b(0);

    // Solve zi = A*zi + B  <=>  (I - A)*zi = B

    //return IminusA.colPivHouseholderQr().solve(B);

    ArrayXs zi = ArrayXs::Zero(n - 1);
    zi(0) = B.sum() / IminusA.col(0).sum();
    Scalar asum = 1.0;
    Scalar csum = 0.0;
    for (unsigned k = 1; k < n - 1; ++k) {
        asum += a(k);
        csum += b(k) - a(k) * b(0);
        zi(k) = asum * zi(0) - csum;
    }

    return zi;

}
