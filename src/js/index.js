require("@babel/polyfill");

// Models
import Search from "./model/Search";
import Recipe from "./model/Recipe";
import List from "./model/List";
import Likes from "./model/Like";

// Views
import { elements, renderLoader, clearLoader } from "./view/base";
import * as searchView from './view/searchView';
import { renderRecipe, clearRecipe, highlightSelectedRecipe } from "./view/recipeView";
import * as listView from './view/listView';
import * as likesView from './view/likesView';

/**
 * Web app төлөв
 * - Хайлтын query, үр дүн
 * - Тухайн үзүүлж байгаа жор
 * - Лайкласан жорууд
 * - Захиалж байгаа жорын найрлагууд
 */

const state = {};

/**
 * -- MVC Architecture --
 * Хайлтын controller = Model ==> Controller <== View
 */

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

/**
 * Жорын контроллер
 */

const controlRecipe = async () => {
  // 1. URL-аас ID-г салгана.
  const id = window.location.hash.replace('#', '');

  // URL дээр ID байгаа эсэхийг шалгана.
  if(id) {
    // 2. Жорын моделий үүсгэж өгнө.
    state.recipe = new Recipe(id);

    // 3. UI дэлгэцийг цэвэрлэж бэлтгэнэ.
    clearRecipe();
    renderLoader(elements.recipeDiv);
    highlightSelectedRecipe(id);

    // 4. Жороо татаж авчрана.
    await state.recipe.getRecipe();

    // 5. Жорыг гүйцэтгэх хугацаа болон орцыг тооцоолно.
    clearLoader();
    state.recipe.calcTime();
    state.recipe.calcHuniiToo();

    // 6. Жорыг дэлгэцэнд гаргана.
    renderRecipe(state.recipe, state.likes.isLiked(id));
  }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));

window.addEventListener('load', e => {
  // Шинээр лайк моделийг апп дөнгөж ачаалагдахад үүсгэнэ.
  if(!state.likes) state.likes = new Likes();

  // Лайк цэсийг гаргах эсэхийг шийдэх
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());

  // Лайкууд байвал тэдгээрийг цэсэнд нэмж харуулна.
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

/**
 * Найрлаганы контроллер
 */

const controlList = () => {
  // Найрлагын моделийг үүсгэнэ.
  state.list = new List();

  // Өмнө харагдаж байсан найрлагуудыг дэлгэцээс арилгана.
  listView.clearItems();

  // Уг моделруу одоо харагдаж байгаа жорны бүх найрлагыг авч хийнэ.
  state.recipe.ingredients.forEach(i => {
    // Тухайн найрлагыг моделруу хийнэ.
    const item = state.list.addItem(i);

    // Тухайн найрлагыг дэлгэцэнд гарганэ.
    listView.renderItem(item);
  });
};

elements.recipeDiv.addEventListener('click', e => {
  if(e.target.matches('.recipe__btn, .recipe__btn *')) {
    controlList();
  } else if(e.target.matches('.recipe__love, .recipe__love *')) {
    controlLike();
  }
});

/**
 * Like controller
 */

const controlLike = () => {
  // 1. Лайкийн моделийг үүсгэнэ.
  if(!state.likes) state.likes = new Likes();

  // 2. Одоо харагдаж байгаа жорын ID-г олж авах.
  const currentRecipeId = state.recipe.id;

  // 3. Энэ жорыг лайкласан эсэхийг шалгах
  if(state.likes.isLiked(currentRecipeId)) {
    // Лайк хийсэн бол лайкийг нь болиулна.
    state.likes.deleteLike(currentRecipeId);

    // Лайкийн цэснээс устгана.
    likesView.deleteLike(currentRecipeId);

    // Лайк товчны лайкласан байдлыг болиулах
    likesView.toggleLikeBtn(false);
  } else {
    // Лайклаагүй бол лайк хийнэ.
    const newLike = state.likes.addLike(
      currentRecipeId,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.image_url
    );

    // Лайк цэсэнд энэ лайкыг оруулах
    likesView.renderLike(newLike);

    // Лайк товчны лайкласан байдлыг лайкласан болгох
    likesView.toggleLikeBtn(true);
  }

  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
    
};

elements.shoppingList.addEventListener('click', e => {
  // Click хийсэн li элементийн data-itemid attribute-ийг шүүж гаргах авах.
  const id = e.target.closest(".shopping__item").dataset.itemid;

  // Олдсон ID-тэй орцыг моделоос устгана.
  state.list.deleteItem(id);

  // Дэлгэцээс тухайн ID-тэй орцыг олж устгана.
  listView.deleteItem(id);
});