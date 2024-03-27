import os

from uuid import uuid4
from django.core.exceptions import BadRequest
from django.db import models
from django.contrib.auth.models import AbstractUser
from utils.utils import dummy_email, dummy_unique_str



def upload_image(instance, filename):
    return os.path.join("images", "avatars", str(instance.pk), filename)


def upload_xlsx(instance, filename):
    base, extension = os.path.splitext(filename)
    if base.lower() != "employee_batch" and extension.lower() != "xlsx":
        return BadRequest(
            "Invalid File-type uploaded. File name must be 'employee_batch.xlsx'"
        )
    return f"workbooks/{str(filename)}"
    # return os.path.join( 'workbooks', str(filename )


# Create your models here.
class User(AbstractUser):
    middle_name = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=255, unique=True, default=dummy_email)
    reader_uid = models.CharField(
        max_length=128,
        default=dummy_unique_str,
        unique=True
    )
    password = models.CharField(max_length=255)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Batch(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Batches"

    def __str__(self):
        return self.name


class EmployeeCategory(models.Model):
    cat_name = models.CharField(max_length=125)
    meal_access = models.PositiveSmallIntegerField(default=1)
    drink_access = models.PositiveSmallIntegerField(default=1)
    description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Employees' Categories"

    def __str__(self):
        return f"{self.cat_name}"


class UserProfile(models.Model):
    pkid = models.BigAutoField(primary_key=True, editable=False)
    id = models.UUIDField(default=uuid4, editable=False, unique=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    employee_id = models.CharField(
        max_length=128, default=dummy_unique_str, unique=True
    )
    reader_uid = models.CharField(max_length=128, default=dummy_unique_str, unique=True)
    gender = models.CharField(
        max_length=50,
    )
    profile_image = models.ImageField(upload_to=upload_image, blank=True, null=True)
    category = models.ForeignKey(EmployeeCategory, null=True, on_delete=models.SET_NULL)
    department = models.ForeignKey("Department", null=True, on_delete=models.SET_NULL)
    location = models.ForeignKey("Location", null=True, on_delete=models.SET_NULL)
    employee_status = models.ForeignKey(
        "EmployeeStatus", null=True, on_delete=models.SET_NULL
    )
    batch = models.ForeignKey(
        Batch, related_name="users", null=True, on_delete=models.SET_NULL
    )
    
    class Meta:
        verbose_name_plural = "User Profiles"

    def __str__(self) -> str:
        return self.user.username


class Location(models.Model):
    name = models.CharField(max_length=50, unique=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.name}"


class Department(models.Model):
    dept_name = models.CharField(max_length=55)

    def __str__(self):
        return f"{self.dept_name}"


class EmployeeStatus(models.Model):
    status = models.CharField(max_length=50)
    description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Employees' Status"

    def __str__(self):
        return f"{self.status}"


class EmployeeBatchUpload(models.Model):
    batch_file = models.FileField(upload_to=upload_xlsx, blank=True, null=True)
    date_uploaded = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        verbose_name_plural = "Batch File Upload"


    def __str__(self) -> str:
        return self.uploaded_by.username
