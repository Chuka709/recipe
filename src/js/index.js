require("@babel/polyfill");
import doSearch from "./model/Search";
import Search from "./model/Search";

let search = new Search("pasta");
search.doSearch().then(r => console.log(r));
