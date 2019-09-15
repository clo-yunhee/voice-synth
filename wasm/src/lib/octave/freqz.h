#pragma once

ArrayXd freqz(const ArrayXd& b_, const ArrayXd& a_, const ArrayXd& frequencies, double sampleRate) {

    ArrayXcd x = exp(complex(0, -1) * 2.0 * M_PI * frequencies / sampleRate);

    unsigned lb = b_.size();
    unsigned la = a_.size();
    unsigned k = std::max(lb, la);

    ArrayXd b = b_;
    ArrayXd a = a_;

    b.conservativeResize(k);
    b.tail(k - lb).setZero();

    a.conservativeResize(k);
    a.tail(k - la).setZero();

    ArrayXcd hb = polyval(b, x);
    ArrayXcd ha = polyval(a, x);

    return abs(hb / ha);

}