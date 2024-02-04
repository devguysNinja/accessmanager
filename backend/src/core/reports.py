from datetime import datetime, timedelta
from django.db.models import Count
from .models import Transaction


DAILY = "Daily"
WEEKLY = "Weekly"
MONTHLY = "Monthly"
DATE = "date"


def report(report=None, sort_by=None, period=None):
    today = datetime.now().date()
    _sort_by = None
    if sort_by is not None:
        _sort_by = sort_by
    if sort_by is None:
        _sort_by = f"-{DATE}"
    start_date = ""
    end_date = ""
    if period is not None:
        print("********** GET START DATE", period.get("start_date"))
        start_date = datetime.strptime(period.get("start_date"), "%Y-%m-%d").date()
        end_date = datetime.strptime(period.get("end_date"), "%Y-%m-%d").date()
        if start_date == "" or end_date == "":
            return []
        return Transaction.objects.filter(date__date__range=[start_date, end_date])

    if report is None and sort_by is not None:
        print("&&&&& Report called: ", _sort_by)
        return Transaction.objects.all().order_by(f"{_sort_by}")

    if report is None and sort_by is None:
        print("******  Report called: ", _sort_by)
        return Transaction.objects.all().order_by(f"{_sort_by}")
    if report == DAILY:
        data = Transaction.objects.filter(date__date=today).order_by(f"{_sort_by}")
        return data

    elif report == WEEKLY:
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        data = Transaction.objects.filter(
            date__date__range=[start_of_week, end_of_week]
        ).order_by(f"{_sort_by}")
        return data

    elif report == MONTHLY:
        start_of_month = today.replace(day=1)
        end_of_month = start_of_month.replace(day=28) + timedelta(days=4)
        data = Transaction.objects.filter(
            date__date__range=[start_of_month, end_of_month]
        ).order_by(f"{_sort_by}")
        return data


# def weekly_report():
#     start_of_week = today - timedelta(days=today.weekday())
#     today = datetime.now().date()
#     end_of_week = start_of_week + timedelta(days=6)
#     data = Transaction.objects.filter(date__date__range=[start_of_week, end_of_week])
#     return data
#
#
# def monthly_report():
# today = datetime.now().date()
# start_of_month = today.replace(day=1)
# end_of_month = start_of_month.replace(day=28) + timedelta(days=4)
# data = Transaction.objects.filter(date__date__range=[start_of_month, end_of_month])
# return data
