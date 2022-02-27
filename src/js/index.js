require("@babel/polyfill");

import Search from "./model/Search";
import Recipe from "./model/Recipe";

import { elements, renderLoader, clearLoader } from "./view/base";
import * as searchView from './view/searchView';

/**
 * Web app төлөв
 * - Хайлтын query, үр дүн
 * - Тухайн үзүүлж байгаа жор
 * - Лайкласан жорууд
 * - Захиалж байгаа жорын найрлагууд
 */

const state = {};

const controlSearch = async () => {
  // 1. Вэбээс хайлтын түлхүүр үгийг гаргаж авна.
  const query = searchView.getInput();

  if (query) {
    // 2. Шинээр хайлтын обьектийг үүсгэж өгнө.
    state.search = new Search(query);

    // 3. Хайлт хийхэд зориулж дэлгэцийн UI-г бэлдэнэ.
    searchView.clearSearchQuery();
    searchView.clearSearchResult();
    renderLoader(elements.searchResultDiv);

    // 4. Хайлтыг гүйцэтгэнэ.
    await state.search.doSearch();

    // 5. Хайлтын үр дүнг дэлгэцэнд үзүүлнэ.
    clearLoader();
    if(state.search.result === undefined) alert('Хайлтаар илэрцгүй...');
    else searchView.renderRecipes(state.search.result);
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.pageButtons.addEventListener("click", (e) => {
  const btn = e.target.closest('.btn-inline');

  if(btn) {
    const gotoPageNum = parseInt(btn.dataset.goto, 10);
    searchView.clearSearchResult();
    searchView.renderRecipes(state.search.result, gotoPageNum);
  }
});

const r = new Recipe(47746);
r.getRecipe();