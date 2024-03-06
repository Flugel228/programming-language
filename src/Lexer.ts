import Token from "./Token";
import {tokenTypeList} from "./TokenType";

export default class Lexer {
    code: string;
    pos: number = 0;
    tokenList: Token[] = [];
    private static keywords = ['int', 'string', 'mixed'];


    constructor(code: string) {
        this.code = code;
    }

    lexAnalysis(): Token[] {
        while (this.nextToken()) {}
        this.tokenList = this.tokenList.filter(token => (token.type.name !== tokenTypeList.space.name)
            && (token.type.name !== tokenTypeList.type.name));
        return this.tokenList;
    }

    nextToken(): boolean {
        if (this.pos >= this.code.length) {
            return false;
        }
        const tokenTypesValues = Object.values(tokenTypeList);
        for (let i = 0; i < tokenTypesValues.length; i++) {
            const tokenType = tokenTypesValues[i];
            const regex = new RegExp('^' + tokenType.regex);
            const result = this.code.substring(this.pos).match(regex);
            if (result && result[0]) {
                const token = new Token(tokenType, result[0], this.pos);
                this.pos += result[0].length;
                this.tokenList.push(token);
                return true;
            }
        }
        throw new Error(`An error was detected at position ${this.pos}`);
    }
}