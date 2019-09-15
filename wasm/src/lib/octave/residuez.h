#pragma once

template<typename ArrayType>
residuez_out residuez(const ArrayType& B, const ArrayType& A) {

    ArrayType Br = B.reverse();
    ArrayType Ar = A.reverse();

    residue_out st_residue = residue(Br, Ar);

    ArrayXcd r = st_residue.r;
    ArrayXcd p = st_residue.p;
    ArrayXcd k = st_residue.k;
    ArrayXi e = st_residue.e;
    
    residuez_out st;

    st.p = p.cwiseInverse();
    st.r = r * pow(-st.p, e.template cast<double>());

    st.f = conj(k);

    st.m = e;

    return st;
}
