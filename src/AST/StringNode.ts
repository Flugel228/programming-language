import Token from "../Token";

export default class StringNode {
    value: Token;
    constructor(token: Token) {
        this.value = token;
    }
}