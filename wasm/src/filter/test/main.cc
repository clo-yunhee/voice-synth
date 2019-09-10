#include <array>
#include <cassert>
#include <cmath>
#include <iterator>
#include <iostream>
#include "../signal.h"

void test_find();
void test_mpoles();
void test_poly();
void test_polyreduce();
void test_roots();
void test_filtic();
void test_filter_zi();
void test_filter();
void test_conv();
void test_deconv();
void test_residue();
void test_residuez();
void test_formants();

template<typename Scalar>
ArrayXd make(std::initializer_list<Scalar> vs);

template<typename Scalar>
ArrayXi makeInt(std::initializer_list<Scalar> vs);

template<typename Scalar>
ArrayXcd makeCx(std::initializer_list<Scalar> vs);

template<typename ArrayType>
void assertEqual(const ArrayType& a, const ArrayType& b);

#define RUN_TEST(name) do { std::cout << " + " #name "..." << std::flush; test_##name(); std::cout << " Passed." << std::endl; } while (false)
#define SKIP_TEST(name) do { std::cout << " + " #name "... Skipped." << std::endl; } while (false)

int main() {

    std::cout << " === math module test suite ===" << std::endl;

    SKIP_TEST(mpoles);
    SKIP_TEST(poly);
    SKIP_TEST(polyreduce);
    SKIP_TEST(roots);
    SKIP_TEST(filtic);
    SKIP_TEST(filter_zi);
    SKIP_TEST(filter);
    SKIP_TEST(conv);
    SKIP_TEST(deconv);
    SKIP_TEST(residue);
    SKIP_TEST(residuez);
    RUN_TEST(formants);

    return 0;
}

void test_mpoles() {
    mpoles_out st;

    st = mpoles(make({0, 0}), 0.01, false);
    assertEqual(st.multp, makeInt({1, 2}));
}

void test_poly() {
    assertEqual(poly(make<double>({})), make({1}));
    assertEqual(poly(make({1, 2, 3})), make({1, -6, 11, -6}));
}

void test_polyreduce() {
    assertEqual(polyreduce(make({0, 0, 1, 2, 3})), make({1, 2, 3}));
    assertEqual(polyreduce(make({1, 2, 3, 0, 0})), make({1, 2, 3, 0, 0}));
    assertEqual(polyreduce(make({1, 0, 3})), make({1, 0, 3}));
    assertEqual(polyreduce(make({0, 0, 0})), make({0}));
}

void test_roots() {
    assertEqual(roots(poly(make({3, 3, 3, 3}))), makeCx({3, 3, 3, 3}));
    assertEqual(roots(make({1, -6, 11, -6})), makeCx({3, 2, 1}));
    assertEqual(roots(make({1., -1., 0.25})), makeCx({0.5, 0.5}));
}

void test_filtic() {
    assertEqual(filtic(make({0.25, 0.25}), make({1.0, -0.5}), make({1}), make({1})), make({0.75}));
    assertEqual(filtic(make({0.25, -0.25}), make({1.0, 0.5}), make({0}), make({1})), make({-0.25}));
    assertEqual(filtic(make({4, -3}), make({2, -3, 1}), make({0, 1})), make({-0.5, 0.0}));
}

void test_filter_zi() {
    assertEqual(filter_zi(make({1., -1., .5}), make({1, 0, 2})), make({5, -1}));

    assertEqual(
        filter_zi(make({2, 8, 5}), make({1, 1, 8})),
        filter_zi(make({4, 16, 10}), make({2, 2, 16}))
    );
}

void test_filter() {
    filter_out<ArrayXd> st;
    ArrayXd b, a;

    st = filter(make({1, -1}), make({.5, -.5}), make({0,1,2,3,4,5}));
    assertEqual(st.y, make({0,2,4,6,8,10}));

    b = make({1, 0, -1});
    a = make({0.5, -0.5});

    st = filter(b, a, make({0,1,2,3,4,5}), make({1, 2}));
    assertEqual(st.y, make({1, 5, 9, 13, 17, 21}));
    assertEqual(st.zi, make({13, -10}));

    st = filter(b, a, make({4,5,6,3,2,1}), make({13, -10}));
    assertEqual(st.y, make({21, 21, 25, 21, 13, 9}));
    assertEqual(st.zi, make({5, -2}));

    st = filter(make({3, 6, 9, 9}), make({1, 2, 3}), make({1, 0}));
    assertEqual(st.y, make({3, 0}));
    assertEqual(st.zi, make({0, 9, 0}));
}

void test_conv() {
    assertEqual(conv(make({1, 1, 1}), make({1, 1, 1})), make({1,2,3,2,1}));
    assertEqual(conv(make({1, 1, 1}), make({3})), make({3, 3, 3}));
    assertEqual(conv(make({3}), make({1, 1, 1})), make({3, 3, 3}));
    assertEqual(conv(make({2}), make({3})), make({6}));
}

void test_deconv() {
    deconv_out<ArrayXd> st;

    st = deconv(make({3, 6, 9, 9}), make({1, 2, 3}));
    assertEqual(st.b, make({3, 0}));
    assertEqual(st.r, make({0, 0, 0, 9}));

    st = deconv(make({3, 6}), make({1, 2, 3}));
    assertEqual(st.b, make({0}));
    assertEqual(st.r, make({3, 6}));

    st = deconv(make({1, 1}), make({1}));
    assertEqual(st.r, make({0, 0}));
}

void test_residue() {
    residue_out st;

    st = residue(make({1, 1, 1}), make({1, -5, 8, -4}));
    assertEqual(st.r, makeCx({-2, 7, 3}));
    assertEqual(st.p, makeCx({2, 2, 1}));
    assertEqual(st.k, makeCx({0}));
    assertEqual(st.e, makeInt({1, 2, 1}));

    st = residue(make({1, 0, 1}), make({1, 0, 18, 0, 81}));
    assertEqual(st.r, makeCx({complex(0, -5./54.), complex(12./54.), complex(0, 5./54.), complex(12./54.)}));

}

void test_residuez() {
    residuez_out st;

    st = residuez(make({1, -2, 1}), make({1, -1}));
    assertEqual(st.r, makeCx({0}));
    assertEqual(st.p, makeCx({1}));
    assertEqual(st.f, makeCx({1, -1}));
    assertEqual(st.m, makeInt({1}));

    st = residuez(make({1}), make({1., -1., 0.25}));
    assertEqual(st.r, makeCx({0, 4}));
    assertEqual(st.p, makeCx({2, 2}));
    assertEqual(st.f, makeCx<double>({0}));
    assertEqual(st.m, makeInt({1, 2}));
}

void test_formants() {
    constexpr unsigned formantCount = 5;
    constexpr double sampleRate = 48000;
    constexpr std::array<double, 5> frequencies = {700, 2100, 3000, 4200, 4700};
    constexpr std::array<double, 5> bandwidths = {60, 90, 100, 120, 120};

    ArrayXcd poles(2 * formantCount);

    for (unsigned k = 0; k < formantCount; ++k) {
        const double F = frequencies[k];
        const double B = bandwidths[k];

        const double r = exp(-M_PI * B / sampleRate);
        const double phi = 2.0 * M_PI * F / sampleRate;

        const complex pole = std::polar(r, phi);

        poles(k) = pole;
        poles(formantCount + k) = std::conj(pole);
    }

    // Calculate the filter coefficients from poles.

    ArrayXd B = ArrayXd::Ones(1);
    ArrayXd A = real(poly(poles));

    assertEqual(A, make({
        1.0, -9.0455, 37.6194, -94.6808, 159.6451, -188.4028,
        157.5902, -92.2618, 36.1897, -8.5914, 0.9379
    }));

    filter_out<ArrayXd> st_flt = filter(B, A, make({-2,0,1}));

    assertEqual(st_flt.y, make({-2.0, -18.0911, -87.4054}));

    // Calculate parallel second-order sections.

    residuez_out st_rez = residuez(B, A);



}

// Testing utility functions

template<typename Scalar>
ArrayXd make(std::initializer_list<Scalar> vs) {
    const unsigned size = vs.size();
    ArrayXd u(size);
    for (auto it = vs.begin(); it != vs.end(); ++it) {
        const unsigned i = std::distance(vs.begin(), it);
        u(i) = double(*it);
    }
    return u;
}

template<typename Scalar>
ArrayXi makeInt(std::initializer_list<Scalar> vs) {
    const unsigned size = vs.size();
    ArrayXi u(size);
    for (auto it = vs.begin(); it != vs.end(); ++it) {
        const unsigned i = std::distance(vs.begin(), it);
        u(i) = int(*it);
    }
    return u;
}

template<typename Scalar>
ArrayXcd makeCx(std::initializer_list<Scalar> vs) {
    const unsigned size = vs.size();
    ArrayXcd u(size);
    for (auto it = vs.begin(); it != vs.end(); ++it) {
        const unsigned i = std::distance(vs.begin(), it);
        u(i) = complex(*it);
    }
    return u;
}

template<typename ArrayType>
void assertEqual(const ArrayType& a, const ArrayType& b) {

    using Scalar = typename ArrayType::Scalar;

    assert(a.rows() == b.rows());
    assert(a.cols() == b.cols());

    assert((abs(a - b) <= 0.1).all());

}
