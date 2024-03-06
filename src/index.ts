import Lexer from "./Lexer";
import Parser from "./Parser";
import fs from "fs";

let code: string = fs.readFileSync('./code/index.pl', 'utf-8');
const lexer = new Lexer(code);

lexer.lexAnalysis();

// console.log(lexer.tokenList);

const parser = new Parser(lexer.tokenList);

const rootNode = parser.parseCode();

parser.run(rootNode);
