#pragma once

ArrayXd freqz(const ArrayXd& b_, const ArrayXd& a_, const ArrayXd& frequencies, double sampleRate) {

    ArrayXcd x = exp(complex(0, -1) * 2.0 * M_PI * frequencies / sampleRate);

    unsigned lb = b_.size();
    unsigned la = a_.size();
    unsigned k = std::max(lb, la);

    ArrayXd b = (ArrayXd(k) << b_, ArrayXd::Zero(k - lb)).finished();
    ArrayXd a = (ArrayXd(k) << a_, ArrayXd::Zero(k - la)).finished();

    ArrayXcd hb = polyval(b, x);
    ArrayXcd ha = polyval(a, x);

    return abs(hb / ha);

}