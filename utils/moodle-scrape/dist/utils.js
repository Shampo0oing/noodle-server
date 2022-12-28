class GetDate {
  constructor() {
    const date = new Date();
    this.month = date.getMonth();
    this.year = date.getFullYear();
    this.day = 2;
    this.date = new Date(this.year, this.month, this.day);
    this.epoch = this.date.getTime() / 1000;
  }
  dateToHyphens() {
    return [this.year, this.month + 1, this.day].join("-");
  }
  refreshDate() {
    this.date = new Date(this.year, this.month, this.day);
    this.epoch = this.date.getTime() / 1000;
  }
  addMonth() {
    this.month++;
    this.refreshDate();
    return this.epoch;
  }
  removeMonth() {
    this.month--;
    this.refreshDate();
    return this.epoch;
  }
}
module.exports = { GetDate };
