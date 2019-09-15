#pragma once

template<typename ArrayType>
deconv_out<ArrayType> deconv(const ArrayType& y, const ArrayType& a) {

    using Scalar = typename ArrayType::Scalar;
    using ArrayXs = Array<Scalar, Dynamic, 1>;

    unsigned la = a.size();
    unsigned ly = y.size();

    unsigned lb = ly - la + 1;

    deconv_out<ArrayType> st;

    if (ly > la) {
        ArrayXs x = ArrayXs::Zero(lb);
        x(0) = 1.0;

        filter_out<ArrayType> st_filt = filter(y, a, x);

        st.b = st_filt.y;
        st.r = a(0) * st_filt.zi;
    }
    else if (ly == la) {
        ArrayXs x = ArrayXs::Ones(1);

        filter_out<ArrayType> st_filt = filter(y, a, x);

        st.b = st_filt.y;
        st.r = a(0) * st_filt.zi;
    }
    else {
        st.b = ArrayXs::Zero(1);
        st.r = y;
    }


    if (ly >= la) {
        // Prepad with zeros
        ArrayXs r = ArrayXs::Zero(ly);
        r.tail(la - 1) = st.r.head(la - 1);

        st.r = r;
    }

    return st;

}
