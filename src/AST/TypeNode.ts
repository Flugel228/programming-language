import Token from "../Token";
import ExpressionNode from "./ExpressionNode";

export default class TypeNode extends ExpressionNode {
    typeName: Token;
    variableName: ExpressionNode;
    value: ExpressionNode;

    constructor(typeName: Token, variableName: ExpressionNode, value: ExpressionNode) {
        super();
        this.typeName = typeName;
        this.variableName = variableName;
        this.value = value;
    }
}