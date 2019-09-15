#pragma oncep

template<typename ArrayType>
ArrayType poly(const ArrayType& z) {

    using ArrayXs = Array<typename ArrayType::Scalar, Dynamic, 1>;

    if (z.size() == 0) {
        return (ArrayXs(1) << 1.0).finished();
    }

    ArrayXs p = ArrayXs::Zero(z.size() + 1);

    p(0) = -z(0);
    p(1) = 1.0;

    for (unsigned i = 1; i < z.size(); ++i) {
        for (unsigned j = i + 1; j >= 1; --j) {
            p(j) = p(j - 1) - z(i) * p(j);
        }
        p(0) = -z(i) * p(0);
    }

    return p.reverse();

}
