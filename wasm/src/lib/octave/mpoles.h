#pragma once

#include <algorithm>
#include <cmath>
#include <iterator>
#include <numeric>

template<typename ArrayType>
mpoles_out mpoles(const ArrayType& p_, float tol, bool reorder) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    unsigned Np = p_.size();

    // Sort the poles according to their magnitudes, largest first

    ArrayXi ordr = ArrayXi::LinSpaced(Np, 0, Np - 1);

    if (reorder) {
        // Sort with largest magnitude first
        std::sort(ordr.begin(), ordr.end(),
                  [&p_](size_t i1, size_t i2) { return abs(p_(i1)) > abs(p_(i2)); });
    }

    ArrayXs p = p_(ordr);

    // Find pole multiplicity by comparing the relative difference in the poles
    ArrayXi multp = ArrayXi::Zero(Np);
    std::vector<unsigned> indx;

    auto it = std::find(multp.begin(), multp.end(), 0);
    while (it != multp.end()) {
        unsigned n = std::distance(multp.begin(), it);
        ArrayXd dp = (p - p(n)).abs();

        float p0;

        if (p(n) == 0.0) {
            // any(abs(p) > 0 & isfinite(p))
            bool anyTest = false;

            double sum = 0.0;
            unsigned count = 0;

            for (unsigned i = 0; i < p.size(); ++i) {
                bool finiteTest = false;
                if constexpr (std::is_same<Scalar, complex>::value) {
                    finiteTest = std::isfinite(p(i).real()) && std::isfinite(p(i).imag());
                }
                else {
                    finiteTest = std::isfinite(p(i));
                }

                if (abs(p(i)) > 0.0 && finiteTest) {
                    anyTest = true;
                    sum += abs(p(i));
                    count++;
                }
            }

            if (anyTest) {
                p0 = sum / float(count);
            }
            else {
                p0 = 1.f;
            }
        }
        else {
            p0 = abs(p(n));
        }

        std::vector<unsigned> k = find(dp < tol * p0);

        if (!indx.empty()) {
            // k = k(! ismember (k, indx))
            auto rem_it = std::remove_if(k.begin(), k.end(),
                                         [&indx](unsigned k) {
                                             return std::any_of(indx.begin(), indx.end(),
                                                               [&k](unsigned i) { return i == k; });
                                         });
            k.erase(rem_it, k.end());
        }

        // m = 1:numel(k)
        ArrayXi m = ArrayXi::LinSpaced(k.size(), 1, k.size());

        multp(k) = m;

        indx.reserve(indx.size() + k.size());
        indx.insert(indx.end(), k.begin(), k.end());

        it = std::find(multp.begin(), multp.end(), 0);
    }

    // multp = multp(indx)
    // indx = ordr(indx)
    mpoles_out st;
    st.multp = multp(indx);
    st.indx = ordr(indx);

    return st;
}
