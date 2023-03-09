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

  static isValidDate(date: string): boolean {
    const dateToCompare = new Date(date);
    return dateToCompare.getFullYear() !== 1;
  }
}
