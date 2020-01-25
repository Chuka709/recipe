require("@babel/polyfill");
import doSearch from "./model/Search";
import Search from "./model/Search";
import { elements, renderLoader, clearLoader } from "./view/base";
import * as searchView from "./view/searchView";
import Recipe from "./model/Recipe";
import {
  renderRecipe,
  clearRecipe,
  highlightSelectedRecipe
} from "./view/recipeView";
import List from "./model/List";
import Like from "./model/Like";
import * as listView from "./view/listView";
import * as likesView from "./view/likeView";
/**
 * Web app төлөв
 * - Хайлтын query, үр дүн
 * - Тухайн үзүүлж байгаа жор
 * - Лайкласан жорууд
 * - Захиалж байгаа жорын найрлагууд
 */
const state = {};

const controlSearch = async () => {
  //1. Вэбээс хайлтын түлхүүр үгийг гаргаж авна.
  const query = searchView.getInput();

  if (query) {
    //2. Шинээр хайлтын объектыг үүсгэж өгнө.
    state.search = new Search(query);
    //3. Хайлт хийхэд зориулж дэлгэцийг UI бэлтгэнэ.
    searchView.clearSearchQuery();
    searchView.clearSearchResult();
    renderLoader(elements.searchResultDiv);
    //4. Хайлтыг гүйцэтгэнэ.
    await state.search.doSearch();
    //5. Хайлтын үр дүнг дэлгэцэнд үзүүлнэ.
    clearLoader();
    if (state.search.result === undefined) {
      alert("Хайлтаар илэрцгүй...    ");
    } else {
      searchView.renderRecipes(state.search.result);
    }
  }
};
elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});
elements.pageButtons.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const gotoPageNumber = parseInt(btn.dataset.goto, 10);
    searchView.clearSearchResult();
    searchView.renderRecipes(state.search.result, gotoPageNumber);
  }
});

/**
 * Жорын контроллер
 */
const controlRecipe = async () => {
  //1. URL-аас id-г салгаж авна
  const id = window.location.hash.replace("#", "");
  //URL дээр id байгаа эсэхийг шалгана
  if (id) {
    //2. Жорын моделийг үүсгэнэ
    state.recipe = new Recipe(id);
    //3. UI буюу дэлгэцийг бэлтгэнэ
    clearRecipe();
    renderLoader(elements.recipeDiv);
    highlightSelectedRecipe(id);
    //4. Жороо татаж авчирна
    await state.recipe.getRecipe();
    //5. Жорыг гүйцэтгэх хугацаа болон орцыг тооцоолно
    clearLoader();
    state.recipe.calcTime();
    state.recipe.calcHuniiToo();
    //6. Жорыг дэлгэцэнд гаргана
    renderRecipe(state.recipe, state.likes.isLiked(id));
    //highlightSelectedRecipe(id);
  }
};
// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);
["hashchange", "load"].forEach(e => window.addEventListener(e, controlRecipe));
window.addEventListener("load", e => {
  if (!state.likes) state.likes = new Like();
  //like цэсийг гаргах эсэхийг шийдэх
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
  //Лайкууд байвал тэдгээрийг Лайк меню-д нэмж харуулна
  state.likes.likes.forEach(like => likesView.renderLike(like));
});
/**
 * Найрлаганы контроллер
 */
const controlList = () => {
  //1. Найрлаганы моделийг үүсгэнэ
  state.list = new List();
  //Хуучин харагдаж байсан найрлагыг цэвэрлэнэ
  listView.clearItems();
  //2. Уг моделруу одоо харагдаж байгаа жорны бүх найрлагыг авч хийнэ
  state.recipe.ingredients.forEach(n => {
    //Тухайн найрлагыг моделруу хийнэ
    const item = state.list.addItem(n);
    //Тухайн найрлагыг дэлгэцэнд харуулна
    listView.renderItem(item);
  });
};
/**
 * Like контроллер
 */
const controlLike = () => {
  //1. Лайкын моделийг үүсгэн
  // if (!state.likes) state.likes = new Like();
  //2. Одоо харагдаж байгаа жорын id-г олох
  const currentRecipeId = state.recipe.id;
  //3. Энэ жорыг лайкласан эсэхийг шалгах
  if (state.likes.isLiked(currentRecipeId)) {
    //4. Лайкласан бол лайкыг болиулах,
    state.likes.deleteLike(currentRecipeId);
    //Лайкласан байдлыг болиулах
    likesView.toggleLikeBtn(false);
    //Лайкын цэснээс усгана
    likesView.deleteLike(currentRecipeId);
  } else {
    //5. лайклаагүй бол лайклах
    const newLike = state.likes.addLike(
      currentRecipeId,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.img_url
    );
    //Лайк цэсэнд оруулах
    likesView.renderLike(newLike);
    //Лайкласан болгох
    likesView.toggleLikeBtn(true);
  }
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
};
elements.recipeDiv.addEventListener("click", e => {
  //.recipe__btn * ===> гэдэг нь энэ класс доторх бүх классад ажиллахыг заана
  if (e.target.matches(".recipe__btn, .recipe__btn *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLike();
  }
});
elements.shoppingList.addEventListener("click", e => {
  //Click хийгдсэн элементийн ID-г салгаж авах
  const id = e.target.closest(".shopping__item").dataset.itemid;
  //Олдсон id-тай орцыг моделиос устгана
  state.list.deleteItem(id);
  //Дэлгэцээс id-тай орцыг устгана
  listView.deleteItem(id);
});
