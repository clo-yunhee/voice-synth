#pragma once

#include <Eigen/Eigenvalues>

template<typename ArrayType>
ArrayXcd roots(const ArrayType& c) {

    using Scalar = typename ArrayType::Scalar;
    using VectorXs = Vector<Scalar, Dynamic>;

    unsigned n = c.size();

    Scalar c_max = abs(c).maxCoeff();
    if (n == 0 || c_max == 0.f) {
        return ArrayXcd::Zero(0);
    }

    // Use double precision for more accurate solving.

    MatrixXd A = MatrixXd::Zero(n - 1, n - 1);
    A.diagonal(-1).setOnes();
    A.row(0) = -c.segment(1, n - 1) / c(0);

    EigenSolver<MatrixXd> es(A, false);
    VectorXcd eigens = A.eigenvalues();

    return eigens;

    /*unsigned eigenCount = eigens.size();

    ArrayXcf r(eigenCount + (n - fm));
    r << eigens, ArrayXs::Zero(n - fm);
    return r;*/
}
