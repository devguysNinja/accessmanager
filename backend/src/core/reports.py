from datetime import datetime, timedelta
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A3,A1
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from django.db.models import Count, Q
from django.utils.dateparse import parse_datetime, parse_date
from django.http import HttpResponse

from .models import Transaction


def filter_queryset(request, model):
	queryset = model.objects.all().select_related()

	swipe_count = request.query_params.get("swipe_count")
	if swipe_count is not None:
		queryset = queryset.filter(swipe_count=int(swipe_count))

	reader_uid = request.query_params.get("reader_uid")
	if reader_uid is not None:
		queryset = queryset.filter(reader_uid=reader_uid)

	start_date = request.query_params.get("startDate")
	end_date = request.query_params.get("endDate")
	if start_date is not None:
		start_date_obj = parse_date(start_date)
		if start_date_obj is not None:
			queryset = queryset.filter(date__date__gte=start_date_obj)
	if end_date is not None:
		end_date_obj = parse_date(end_date)
		if end_date_obj is not None:
			queryset = queryset.filter(date__date__lte=end_date_obj)

	employee = request.query_params.get("staff_name")
	if employee is not None:
		queryset = queryset.filter(
			Q(owner__user__username__icontains=employee)
			| Q(owner__user__first_name__icontains=employee)
			| Q(owner__user__last_name__icontains=employee)
		)

	employee_id = request.query_params.get("staff_id")
	if employee_id is not None:
		queryset = queryset.filter(owner__employee_id=employee_id)

	employee_status = request.query_params.get("staff_status")
	if employee_status is not None:
		queryset = queryset.filter(owner__employee_status__status=employee_status)

	location = request.query_params.get("location")
	if location is not None:
		queryset = queryset.filter(owner__location__name=location)

	group = request.query_params.get("group")
	if group is not None:
		queryset = queryset.filter(owner__batch__name=group)

	category = request.query_params.get("category")
	if category is not None:
		queryset = queryset.filter(owner__category__cat_name=category)

	department = request.query_params.get("department")
	if department is not None:
		queryset = queryset.filter(owner__department__dept_name=department)

	grant_type = request.query_params.get("grant_type")
	if grant_type is not None:
		queryset = queryset.filter(grant_type=grant_type)

	access_point = request.query_params.get("access_point")
	print("***** ACCESS POINT:", str(access_point).upper())
	if access_point is not None:
		queryset = queryset.filter(access_point=str(access_point).upper())

	return queryset.order_by("-date")




def export_to_excel(serializer_data):
	# Create a new Excel workbook
	wb = Workbook()
	ws = wb.active

	# Extract headers from serializer data
	headers = list(serializer_data[0].keys())

	# Add column headers
	ws.append(headers)

	# Add data from the serializer data
	for item in serializer_data:
		data = [item[field] for field in headers]
		ws.append(data)

	# Create a response object
	response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
	response['Content-Disposition'] = 'attachment; filename=my_serializer_data.xlsx'

	# Save the workbook to the response
	wb.save(response)

	return response




def export_to_pdf(serializer_data):
	# Create a response object
	response = HttpResponse(content_type='application/pdf')
	response['Content-Disposition'] = 'attachment; filename=my_serializer_data.pdf'

	# Create a PDF document
	doc = SimpleDocTemplate(response, pagesize=A3)
	elements = []

	# Extract headers and data from serializer data
	headers = list(serializer_data[0].keys())
	data = [[item[field] for field in headers] for item in serializer_data]

	# Adjust column widths
	column_widths = [100] * len(headers) # Adjust the width as needed

	# Create a table from the data
	table = Table([headers] + data,)

	# Apply styles to the table
	style = TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.grey),
		('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
		('ALIGN', (0, 0), (-1, -1), 'CENTER'),
		('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
		('BOTTOMPADDING', (0, 0), (-1, 0), 12),
		('BACKGROUND', (0, 1), (-1, -1), colors.beige),
		('GRID', (0, 0), (-1, -1), 1, colors.black)])
	# Adjust font size
	style.add('FONTSIZE', (0, 0), (-1, -1), 7)

	# Adjust alignment
	style.add('ALIGN', (0, 0), (-1, -1), 'LEFT')

	# Adjust padding
	style.add('BOTTOMPADDING', (0, 0), (-1, -1), 6)
	style.add('TOPPADDING', (0, 0), (-1, -1), 6)

	table.setStyle(style)
	elements.append(table)

	# Build the PDF document
	doc.build(elements)
	return response














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
