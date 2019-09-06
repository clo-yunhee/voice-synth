#pragma once

template<typename ArrayType>
std::vector<unsigned> find(const ArrayType& m) {
    std::vector<unsigned> idx;

    for (unsigned k = 0; k < m.size(); ++k) {
        if (m(k) != 0.0) {
            idx.push_back(k);
        }
    }

    return idx;
}
