#/bin/zsh

INPUT_PATH="source"
OUTPUT_PATH=`pwd`/contracts

pushd ${INPUT_PATH}

SOURCES_FILES=`find . -name "*.sol"`

# sed -e '/\/\/ File:.*\.sol/d'
# sed -e '/.*SPDX-License-Identifier:.*/d'
# sed -e '/pragma solidity/d'

for SOL_PATH in $SOURCES_FILES; do

    echo "truffle-flattener ${SOL_PATH:2} writing..."
    
    echo "// SPDX-License-Identifier: MIT\npragma solidity >=0.6.0 <0.8.0;\n" > ${OUTPUT_PATH}/${SOL_PATH:2}

    truffle-flattener $SOL_PATH \
        | sed -e '/\/\/ File:.*\.sol/d' \
        | sed -e '/.*SPDX-License-Identifier:.*/d' \
        | sed -e '/pragma solidity/d' \
        >> ${OUTPUT_PATH}/${SOL_PATH:2}
done

popd


truffle compile