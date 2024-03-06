export default class TokenType {
    name: string;
    regex: string;

    constructor(name: string, regex: string) {
        this.name = name;
        this.regex = regex;
    }
}

export const tokenTypeList = {
    'int': new TokenType('int', '[0-9]*'),
    'print': new TokenType('print', 'print'),
    'type': new TokenType('type', '(int|mixed|string)'),
    'variable': new TokenType('variable', '[a-zA-Z]*'),
    'semicolon': new TokenType('semicolon', ';'),
    'space': new TokenType('space', '[ \\n\\t\\r]'),
    'assign': new TokenType('assign', '='),
    'plus': new TokenType('plus', '\\+'),
    'minus': new TokenType('minus', '\\-'),
    'multiply': new TokenType('multiply', '\\*'),
    'divide': new TokenType('divide', '\\/'),
    'lpar': new TokenType('lpar', '\\('),
    'rpar': new TokenType('rpar', '\\)'),
    'string': new TokenType('string', '".*?"'),
}