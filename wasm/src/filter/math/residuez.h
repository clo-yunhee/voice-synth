#pragma once

template<typename ArrayType>
residuez_out residuez(const ArrayType& B, const ArrayType& A) {

    residue_out st_residue = residue(B, A);

    ArrayXcd r = st_residue.r;
    ArrayXcd p = st_residue.p;
    ArrayXcd k = st_residue.k;
    ArrayXi e = st_residue.e;
    
    residuez_out st;

    st.p = inverse(p);
    st.r = r * pow(-st.p, e.template cast<double>());

    st.f = conj(k);

    st.m = e;

    return st;
}
