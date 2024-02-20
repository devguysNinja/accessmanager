from django.db import models

from users.models import UserProfile

# from users.models import UserProfile


# Create your models here.
class ShiftType(models.Model):
    name = models.CharField(max_length=128, unique=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    # start_date = models.DateField()
    # end_date = models.DateField()
    # user = models.ForeignKey(UserProfile, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return str(self.name)


class MonthlyRoster(models.Model):
    # work_day = models.CharField(max_length=50)
    shift = models.ForeignKey("ShiftType", null=True, on_delete=models.SET_NULL)
    employees = models.ManyToManyField(UserProfile)
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        verbose_name = "Employees' roster"

    def __str__(self):
        return f"{self.shift.name.capitalize()}::StartDate[{self.start_date}]::EndDate[{self.end_date}]"
