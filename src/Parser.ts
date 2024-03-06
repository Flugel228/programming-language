import Token from "./Token";
import TokenType, {tokenTypeList} from "./TokenType";
import ExpressionNode from "./AST/ExpressionNode";
import StatementsNode from "./AST/StatementsNode";
import IntNode from "./AST/IntNode";
import VariableNode from "./AST/VariableNode";
import BinOperationNode from "./AST/BinOperationNode";
import UnarOperationNode from "./AST/UnarOperationNode";
import StringNode from "./AST/StringNode";

export default class Parser {
    tokens: Token[];
    pos: number = 0;
    scope: any = {};


    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    match(...expected: TokenType[]): Token | null {
        if (this.pos < this.tokens.length) {
            const currentToken = this.tokens[this.pos];
            if (expected.find(type => type.name === currentToken.type.name)) {
                this.pos += 1;
                return currentToken;
            }
        }
        return null;
    }

    require(...expected: TokenType[]): Token {
        const token = this.match(...expected);
        if (!token) {
            throw new Error(`An error was expected ${expected[0].name} at position ${this.pos}`)
        }
        return token;
    }

    parseVariableOrIntOrString(): ExpressionNode {
        const int = this.match(tokenTypeList.int);
        if (int !== null) {
            return new IntNode(int);
        }
        const variable = this.match(tokenTypeList.variable);
        if (variable !== null) {
            return new VariableNode(variable);
        }
        const string = this.match(tokenTypeList.string); // Добавление обработки строк
        if (string !== null) {
            return new StringNode(string);
        }

        throw new Error(`Expected variable or node at position ${this.pos}`);
    }


    parsePrint(): ExpressionNode {
        const operatorPrint = this.match(tokenTypeList.print);
        if (operatorPrint !== null) {
            return new UnarOperationNode(operatorPrint, this.parseFormula());
        }
        throw new Error(`Expected unary operator print at position ${this.pos}`)
    }

    parseParentheses(): ExpressionNode {
        if (this.match(tokenTypeList.lpar) !== null) {
            const node = this.parseFormula();
            this.require(tokenTypeList.rpar);
            return node;
        } else {
            return this.parseVariableOrIntOrString();
        }
    }

    parseFormula(): ExpressionNode {
        let leftNode = this.parseTerm();
        let operator = this.match(
            tokenTypeList.multiply,
            tokenTypeList.divide,
        );
        while (operator !== null) {
            const rightNode = this.parseTerm();
            leftNode = new BinOperationNode(operator, leftNode, rightNode);
            operator = this.match(
                tokenTypeList.multiply,
                tokenTypeList.divide,
            );
        }

        operator = this.match(
            tokenTypeList.plus,
            tokenTypeList.minus
        );
        while (operator !== null) {
            const rightNode = this.parseTerm();
            leftNode = new BinOperationNode(operator, leftNode, rightNode);
            operator = this.match(
                tokenTypeList.plus,
                tokenTypeList.minus
            );
        }
        return leftNode;
    }

    parseTerm(): ExpressionNode {
        let leftNode = this.parseParentheses();
        let operator = this.match(
            tokenTypeList.multiply,
            tokenTypeList.divide,
        );
        while (operator !== null) {
            const rightNode = this.parseParentheses();
            leftNode = new BinOperationNode(operator, leftNode, rightNode);
            operator = this.match(
                tokenTypeList.multiply,
                tokenTypeList.divide,
            );
        }
        return leftNode;
    }

    parseExpression(): ExpressionNode {
        if (this.match(tokenTypeList.variable) === null) {
            return this.parsePrint();
        }
        this.pos -= 1;
        let variableNode = this.parseVariableOrIntOrString();
        const assignOperator = this.match(tokenTypeList.assign);
        if (assignOperator !== null) {
            const rightFormulaNode = this.parseFormula();
            return new BinOperationNode(assignOperator, variableNode, rightFormulaNode);
        }

        throw new Error(`After the variable, an assignment operator is expected at position ${this.pos}`)
    }

    parseCode(): ExpressionNode {
        const root = new StatementsNode();
        while (this.pos < this.tokens.length) {
            const codeStringNode = this.parseExpression();
            this.require(tokenTypeList.semicolon);
            root.addNode(codeStringNode);
        }
        return root;
    }

    run(node: ExpressionNode): any {
        if (node instanceof IntNode) {
            return parseInt(node.number.text);
        }
        if (node instanceof StringNode) {
            return node.value.text;
        }
        if (node instanceof UnarOperationNode) {
            switch (node.operator.type.name) {
                case tokenTypeList.print.name:
                    console.log(this.run(node.operand))
                    return;
            }
        }
        if (node instanceof BinOperationNode) {
            switch (node.operator.type.name) {
                case tokenTypeList.multiply.name:
                    return this.run(node.leftNode) * this.run(node.rightNode);
                case tokenTypeList.divide.name:
                    return this.run(node.leftNode) / this.run(node.rightNode);
                case tokenTypeList.plus.name:
                    const leftValue = this.run(node.leftNode);
                    const rightValue = this.run(node.rightNode);
                    if (typeof leftValue === 'string' && typeof rightValue === 'string') {
                        const trimmedLeft = leftValue.slice(0, -1);
                        const trimmedRight = rightValue.slice(1);
                        return trimmedLeft + trimmedRight;

                    } else {
                        return leftValue + rightValue;
                    }
                case tokenTypeList.minus.name:
                    return this.run(node.leftNode) - this.run(node.rightNode);
                case tokenTypeList.assign.name:
                    const result = this.run(node.rightNode)
                    const variableNode = <VariableNode>node.leftNode;
                    this.scope[variableNode.variable.text] = result;
                    return result;
            }
        }
        if (node instanceof VariableNode) {
            if (this.scope[node.variable.text]) {
                return this.scope[node.variable.text];
            } else {
                throw new Error(`Variable with this name ${node.variable.text} wasn't detected`)
            }
        }
        if (node instanceof StatementsNode) {
            node.codeStrings.forEach(codeString => {
                this.run(codeString);
            })
            return;
        }
        throw new Error('Error!');
    }
}