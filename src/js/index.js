require("@babel/polyfill");
import Search from "./model/Search";

let search = new Search('pizza');

search.doSearch()
    .then(r => console.log('Result: ' + r));