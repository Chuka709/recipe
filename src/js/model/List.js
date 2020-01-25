import uniqid from "uniqid";
export default class List {
  constructor() {
    this.items = [];
  }
  addItem(item) {
    let newItem = {
      id: uniqid(),
      item
    };
    this.items.push(newItem);
    return newItem;
  }
  deleteItem(id) {
    //id гэдэг ID-тай орцын индексийг массиваас хайж олно
    const index = this.items.findIndex(el => el.id === id);
    //Уг индекс дээрх элементийг массиваас устгана
    this.items.splice(index, 1);
  }
}
