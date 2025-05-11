import * as moment from 'moment';

export class DateFormatter {
  static format(date: Date, format: string = 'YYYY-MM-DD') {
    if (!date) {
      return '';
    }

    return moment(date).format(format);
  }

  static relativeTimeFormat(date: Date) {
    return moment(date).startOf('hour').fromNow();
  }

  static toDate(date: string) {
    return moment(date).toDate();
  }

  static isValidDate(date: string): boolean {
    if (!date) return false;

    const dateToCompare = new Date(date);
    return dateToCompare.getFullYear() !== 1;
  }

  static nowDate() {
    return moment().format('YYYY-MM-DD');
  }
}
