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

#include "octave/find.h"
#include "octave/mpoles.h"
#include "octave/poly.h"
#include "octave/polyreduce.h"
#include "octave/polyval.h"
#include "octave/roots.h"
#include "octave/filtic.h"
#include "octave/filter_zi.h"
#include "octave/filter.h"
#include "octave/conv.h"
#include "octave/deconv.h"
#include "octave/residue.h"
#include "octave/residuez.h"
#include "octave/freqz.h"
#include "octave/psos2tf.h"
