#pragma once

#include <Eigen/Core>
#include <complex>
#include <vector>

using namespace Eigen;

using complex = std::complex<double>;

struct mpoles_out {
    ArrayXi multp, indx;
};

template<typename ArrayType>
struct filter_out {
    ArrayType y, zi;
};

template<typename ArrayType>
struct deconv_out {
    ArrayType b, r;
};

struct residue_out {
    ArrayXcd r, p, k;
    ArrayXi e;
};

struct residuez_out {
    ArrayXcd r, p, f;
    ArrayXi m;
};

struct psos2tf_out {
    ArrayXd B, A;
};

// Include implementations

#include "math/find.h"
#include "math/mpoles.h"
#include "math/poly.h"
#include "math/polyreduce.h"
#include "math/polyval.h"
#include "math/roots.h"
#include "math/filtic.h"
#include "math/filter_zi.h"
#include "math/filter.h"
#include "math/conv.h"
#include "math/deconv.h"
#include "math/residue.h"
#include "math/residuez.h"
#include "math/freqz.h"
#include "math/psos2tf.h"
