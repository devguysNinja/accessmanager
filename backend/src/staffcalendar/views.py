from django.shortcuts import render
from rest_framework import generics,status
from rest_framework.response import Response


from .models import MonthlyRoster, ShiftType, WorkDay
from .serializers import BatchCreateSerializer, BatchSerializer, RosterCreateSerializer, RosterSerializer, RosterUpdateSerializer

from users.models import Batch
from utils.utils import get_shift_date

# Create your views here.

class BatchListCreateAPIView(generics.ListCreateAPIView):
	queryset = Batch.objects.all()
	serializer_class = BatchSerializer

	def get_serializer_class(self):
		if self.request.method == 'POST':
			return BatchCreateSerializer
		return BatchSerializer

class RosterListCreateAPIView(generics.ListCreateAPIView):
	queryset = MonthlyRoster.objects.all().select_related("batch")
	serializer_class = RosterSerializer

	def get_serializer_class(self):
		if self.request.method == 'POST':
			return RosterCreateSerializer
		return RosterSerializer

	def create(self, request, *args, **kwargs):
		print("######...: ", request.data)
		modified_request_data = self.modify_request_data(request.data)

		# Pass the modified request data to the serializer
		serializer = self.get_serializer(data=modified_request_data, many=True)
		serializer.is_valid(raise_exception=True)
		self.perform_create(serializer)
		headers = self.get_success_headers(serializer.data)
		return Response(serializer.data, status=201, headers=headers)


	def modify_request_data(self, data):
		copy_data = data.copy()
		modified_data = []
		# Iterate over each payload item
		for item in copy_data:
			# Extract common information
			start_date = item.get("start_date")
			group = item.get("group")
			batch = Batch.objects.filter(name__iexact=group).first().id

			# Iterate over shifts
			for w_day, shift_name in item['shifts'].items():
				work_day = WorkDay.objects.filter(day_symbol=w_day).first()
				shift = ShiftType.objects.filter(name__iexact=shift_name).first()
				print("EXTRACTED SHIFT: ",shift)
				shift_date, week_start_date = get_shift_date(work_day.day_symbol, start_date)
				new_dict = {
					"week_start_date": week_start_date,
					"work_day": work_day.id,
					"shift": shift.id,
					"batch": batch,
					"shift_date":shift_date
				}
				modified_data.append(new_dict)
		return modified_data


class RosterRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
	queryset = MonthlyRoster.objects.all()
	serializer_class = RosterSerializer

	def get_serializer_class(self):
		if self.request.method == 'PUT' or self.request.method == 'PATCH':
			return RosterUpdateSerializer
		return RosterSerializer

	def patch(self, request, *args, **kwargs):
		print("###...UPDATE REQUEST DATA: ", request.data)
		batch_name = request.data.get('batch')
		shift_name = request.data.get('shift')
		work_day_name = request.data.get('work_day')
		try:
			batch = Batch.objects.get(name__iexact=batch_name)
			shift = ShiftType.objects.get(name__iexact=shift_name)
			work_day = WorkDay.objects.get(day_symbol__iexact=work_day_name)
			# Update request data with primary keys
			request.data['batch'] = batch.pk
			request.data['shift'] = shift.pk
			request.data['work_day'] = work_day.pk
		except (Batch.DoesNotExist, ShiftType.DoesNotExist, WorkDay.DoesNotExist) as e:
			return Response({'error': 'Batch, shift, or work day not found'}, status=status.HTTP_400_BAD_REQUEST)

		
		return super().patch(request, *args, **kwargs)
