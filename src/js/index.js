import query from './model/Search';
import { add, multipy as multi } from './view/searchView';

console.log(`Хайлт : ${query}`);
console.log(`Хоёр тооны нийлбэр : ${add(4, 6)}`);
console.log(`Хоёр тооны үржвэр : ${multi(4, 6)}`);