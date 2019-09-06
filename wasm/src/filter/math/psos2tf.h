#pragma once

psos2tf_out psos2tf(const ArrayX3d& As, const ArrayX3d& Bs) {

    ArrayXd B = Bs.row(0);
    ArrayXd A = As.row(0);

    for (unsigned i = 1; i < As.rows(); ++i) {
        ArrayXd Asi = As.row(i);
        ArrayXd Bsi = Bs.row(i);

        B = conv(B, Asi) + conv(A, Bsi);
        A = conv(A, Asi);
    }

    psos2tf_out st;
    st.B = B;
    st.A = A;

    return st;
}
