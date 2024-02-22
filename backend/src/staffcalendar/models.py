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


class WorkDay(models.Model):
    day_symbol = models.CharField(max_length=10)
    day_code = models.PositiveSmallIntegerField()

    class Meta:
        unique_together = ("day_symbol","day_code")
        ordering = ["day_code"]

    def __str__(self):
        return f"{self.day_symbol}"


class MonthlyRoster(models.Model):
    # WORK_DAYS_CHOICES = [
    # ("Monday", "Monday"),
    # ("Tuesday", "Tuesday"),
    # ("Wednesday", "Wednesday"),
    # ("Thursday", "Thursday"),
    # ("Friday", "Friday"),
    # ("Saturday", "Saturday"),
    # ("Sunday", "Sunday"),
    # ]
    work_days = models.ManyToManyField(WorkDay)
    shift = models.ForeignKey("ShiftType", null=True, on_delete=models.SET_NULL)
    week_no = models.PositiveIntegerField()
    employees = models.ManyToManyField(UserProfile)
    description = models.CharField(max_length=120)
    # start_date = models.DateField()
    # end_date = models.DateField()

    class Meta:
        verbose_name = "Employees' roster"

    def __str__(self):
        return f"{self.shift.name.capitalize()} | Week-{self.week_no}"
