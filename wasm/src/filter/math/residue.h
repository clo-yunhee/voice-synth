#pragma once

#include <cmath>
#include <numeric>

template<typename ArrayType>
ArrayType rresidue(const ArrayType& r_, const ArrayType& p_, double tol);

template<typename ArrayType>
residue_out residue(const ArrayType& b_, const ArrayType& a_) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    constexpr double tol = 0.001;

    ArrayXs b = polyreduce(b_);
    ArrayXs a = polyreduce(a_);

    b /= a(0);
    a /= a(0);

    unsigned la = a.size();
    unsigned lb = b.size();

    residue_out st;

    if (la == 0 || lb == 0) {
        return st;
    }
    else if (la == 1) {
        st.k = b;
        return st;
    }

    // Find the poles
    ArrayXcd p = roots(a);
    unsigned lp = p.size();
    
    // Sort poles so that multiplicity loop will work
    mpoles_out st_mpoles = mpoles(p, tol, true);

    st.e = st_mpoles.multp;
    p = p(st_mpoles.indx).eval();

    // For each group of pole multiplicity, set the value of each
    // pole to the average of the group. This reduces the error
    // in the resulting poles.

    // p_group = cumsum (e == 1)
    ArrayXi p_group = st_mpoles.multp.unaryExpr([](int x) { return int(x == 1); });
    std::partial_sum(p_group.begin(), p_group.end(), p_group.begin());

    for (unsigned ng = 1; ng <= p_group.size(); ++ng) {
        complex mean = 0.0;
        unsigned numGroup = 0;
        for (unsigned i = 0; i < p_group.size(); ++i) {
            if (p_group(i) == ng) {
                mean += p(i);
                numGroup++;
            }
        }
        mean /= float(numGroup);

        for (unsigned i = 0; i < p_group.size(); ++i) {
            if (p_group(i) == ng) {
                p(i) = mean;
            }
        }
    }

    // Find the direct term if there is one
    if (lb >= la) {
        // Also return the reduced numerator
        deconv_out<ArrayType> st_deconv = deconv(b, a);
        st.k = st_deconv.b.template cast<complex>();
        b = st_deconv.r;

        lb = b.size();
    }
    else {
        st.k = ArrayXcd::Zero(1);
    }

    Scalar small = p.abs().maxCoeff();
    small = std::max(small, 1.0) * std::numeric_limits<Scalar>::epsilon() * 1e4 * std::pow(1.0 + p.size(), 2);

    for (unsigned ip = 0; ip < p.size(); ++ip) {
        complex z = p(ip);
        
        // Determine if the poles are (effectively) zero.
        if (abs(z) < small) {
            p(ip) = 0.0;
        }
    
        // Determine if the poles are (effectively) real, or imaginary.
        if (abs(imag(z)) < small) {
            p(ip) = real(z);
        }
        if (abs(real(z)) < small) {
            p(ip) = imag(z) * complex(0.0, 1.0);
        }
    }

    // The remainder determines the residues. The case of one pole is trivial.
    if (lp == 1) {
        st.r = polyval(b, p);
        st.p = p;
        return st;
    }

    // Determine the order of the denominator and remaining numerator.
    // With the direct term removed, the potential order of the numerator
    // is one less than the order of the denominator.
    unsigned aorder = a.size() - 1;
    unsigned border = aorder - 1;

    // Construct a system of equations relating the individual
    // contributions from each residue to the complete numerator.
    MatrixXcd A = MatrixXcd::Zero(aorder, aorder);
    VectorXcd B = VectorXcd::Zero(aorder);
    B.tail(b.size()) = b;

    ArrayXcd ri(p.size());
    for (unsigned ip = 0; ip < p.size(); ++ip) {
        ri.setZero();
        ri(ip) = 1.0;

        ArrayXcd pnum = rresidue(ri, p, tol);

        A.col(ip).tail(pnum.size()) = pnum;
    }

    // Solve for the residues.
    MatrixXcd D(aorder, aorder);
    for (unsigned i = 0; i < aorder; ++i) {
        D(i, i) = A.row(i).cwiseAbs().maxCoeff();
    }

    MatrixXcd DA = D.colPivHouseholderQr().solve(A);
    VectorXcd BD = B.cwiseQuotient(D.diagonal());

    st.r = DA.colPivHouseholderQr().solve(BD);
    st.p = p;

    return st;
}

template<typename ArrayType>
ArrayType rresidue(const ArrayType& r_, const ArrayType& p_, double tol) {
    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

#define Array2s(x, y) ((ArrayXs(2) << x, y).finished())

    mpoles_out st_mpoles = mpoles(p_, tol, false);

    ArrayXs p = p_(st_mpoles.indx);
    ArrayXs r = r_(st_mpoles.indx);
    ArrayXi e = st_mpoles.multp;

    ArrayXs pden, pnum;

    for (unsigned n = 0; n < p.size(); ++n) {
        ArrayXs pn = Array2s(1, -p(n));

        if (n == 0) {
            pden = pn;
        }
        else {
            pden = conv(pden, pn);
        }
    }

    pnum.setZero(pden.size() - 1);

    std::vector<unsigned> idx = find(abs(r));

    for (unsigned n : idx) {
        ArrayXs p1 = Array2s(1, -p(n));
        ArrayXs pn = ArrayXs::Ones(1);

        for (unsigned j = 0; j < p.size(); ++j) {
            if (j != n) {
                pn = conv(pn, Array2s(1, -p(j)));
            }
        }

        if (e(n) >= 2) {
            for (unsigned j = 0; j < e(n) - 1; ++j) {
                pn = deconv(pn, p1).b;
            }
        }

        pn *= r(n);
        pnum.tail(pn.size()) += pn;
    }

    pnum = polyreduce(pnum);
    pden = polyreduce(pden);

    return pnum;

#undef Array2s

}
