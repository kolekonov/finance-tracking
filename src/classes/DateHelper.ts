class DateHelper {
    private static currentDate: Date; 

    constructor() {
        DateHelper.currentDate = new Date();
    }

    getFirstDayInMonth(): Date {
        return new Date(DateHelper.currentDate.getFullYear(), DateHelper.currentDate.getMonth(), 1);
    }

    getLastDayInMonth(): Date {
        return new Date(DateHelper.currentDate.getFullYear(), DateHelper.currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    }
}

const dateHelper = new DateHelper();
export default dateHelper;