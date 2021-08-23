/*
 * @Author: your name
 * @Date: 2021-08-21 18:41:30
 * @LastEditTime: 2021-08-21 19:17:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /learn-react/src/components/source_code/index.tsx
 */

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coy as codeStyle } from 'react-syntax-highlighter/dist/esm/styles/prism'
import solidity from 'react-syntax-highlighter/dist/esm/languages/prism/solidity'

SyntaxHighlighter.registerLanguage('solidity', solidity);

export function SourceCodeCard(props: {
    sourceCode: string,
}) {
    return (
        <SyntaxHighlighter language="solidity" style={codeStyle}>
            {props.sourceCode}
        </SyntaxHighlighter>
    );
}